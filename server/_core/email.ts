/**
 * Email Service Integration
 * Supports Mailchimp, SendGrid, and custom SMTP
 */

import { ENV } from "./env";

// Email template types
interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

interface EmailRecipient {
  email: string;
  name?: string;
  tags?: string[];
  customFields?: Record<string, string>;
}

interface SendEmailOptions {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  html: string;
  text?: string;
  from?: { email: string; name: string };
  replyTo?: string;
  tags?: string[];
  trackOpens?: boolean;
  trackClicks?: boolean;
}

// ============================================
// SENDGRID INTEGRATION
// ============================================

interface SendGridConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

export async function sendWithSendGrid(
  options: SendEmailOptions,
  config?: SendGridConfig
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = config?.apiKey || process.env.SENDGRID_API_KEY;
  
  if (!apiKey) {
    console.warn("[Email] SendGrid API key not configured");
    return { success: false, error: "SendGrid not configured" };
  }

  const recipients = Array.isArray(options.to) ? options.to : [options.to];
  
  const payload = {
    personalizations: recipients.map(recipient => ({
      to: [{ email: recipient.email, name: recipient.name }],
      dynamic_template_data: recipient.customFields,
    })),
    from: {
      email: options.from?.email || config?.fromEmail || "hello@djdannyhecticb.com",
      name: options.from?.name || config?.fromName || "DJ Danny Hectic B",
    },
    reply_to: options.replyTo ? { email: options.replyTo } : undefined,
    subject: options.subject,
    content: [
      { type: "text/plain", value: options.text || stripHtml(options.html) },
      { type: "text/html", value: options.html },
    ],
    tracking_settings: {
      click_tracking: { enable: options.trackClicks !== false },
      open_tracking: { enable: options.trackOpens !== false },
    },
    categories: options.tags,
  };

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok || response.status === 202) {
      const messageId = response.headers.get("X-Message-Id") || undefined;
      return { success: true, messageId };
    }

    const error = await response.text();
    console.error("[Email] SendGrid error:", error);
    return { success: false, error };
  } catch (error) {
    console.error("[Email] SendGrid error:", error);
    return { success: false, error: String(error) };
  }
}

// ============================================
// MAILCHIMP INTEGRATION
// ============================================

interface MailchimpConfig {
  apiKey: string;
  serverPrefix: string; // e.g., "us1", "us2", etc.
  listId: string;
}

interface MailchimpSubscriber {
  email: string;
  firstName?: string;
  lastName?: string;
  tags?: string[];
  mergeFields?: Record<string, string>;
  status?: "subscribed" | "pending" | "unsubscribed" | "cleaned";
}

export async function addToMailchimpList(
  subscriber: MailchimpSubscriber,
  config?: MailchimpConfig
): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = config?.apiKey || process.env.MAILCHIMP_API_KEY;
  const serverPrefix = config?.serverPrefix || process.env.MAILCHIMP_SERVER_PREFIX;
  const listId = config?.listId || process.env.MAILCHIMP_LIST_ID;

  if (!apiKey || !serverPrefix || !listId) {
    console.warn("[Email] Mailchimp not configured");
    return { success: false, error: "Mailchimp not configured" };
  }

  const payload = {
    email_address: subscriber.email,
    status: subscriber.status || "pending", // Double opt-in by default
    merge_fields: {
      FNAME: subscriber.firstName || "",
      LNAME: subscriber.lastName || "",
      ...subscriber.mergeFields,
    },
    tags: subscriber.tags || [],
  };

  try {
    const response = await fetch(
      `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${listId}/members`,
      {
        method: "POST",
        headers: {
          Authorization: `apikey ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (response.ok) {
      return { success: true, id: data.id };
    }

    // Handle "already subscribed" as success
    if (data.title === "Member Exists") {
      return { success: true, id: data.id, error: "Already subscribed" };
    }

    console.error("[Email] Mailchimp error:", data);
    return { success: false, error: data.detail || data.title };
  } catch (error) {
    console.error("[Email] Mailchimp error:", error);
    return { success: false, error: String(error) };
  }
}

export async function updateMailchimpSubscriber(
  email: string,
  updates: Partial<MailchimpSubscriber>,
  config?: MailchimpConfig
): Promise<{ success: boolean; error?: string }> {
  const apiKey = config?.apiKey || process.env.MAILCHIMP_API_KEY;
  const serverPrefix = config?.serverPrefix || process.env.MAILCHIMP_SERVER_PREFIX;
  const listId = config?.listId || process.env.MAILCHIMP_LIST_ID;

  if (!apiKey || !serverPrefix || !listId) {
    return { success: false, error: "Mailchimp not configured" };
  }

  const subscriberHash = await md5(email.toLowerCase());

  try {
    const response = await fetch(
      `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${listId}/members/${subscriberHash}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `apikey ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          merge_fields: {
            FNAME: updates.firstName,
            LNAME: updates.lastName,
            ...updates.mergeFields,
          },
          tags: updates.tags,
        }),
      }
    );

    if (response.ok) {
      return { success: true };
    }

    const data = await response.json();
    return { success: false, error: data.detail || data.title };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function addTagsToSubscriber(
  email: string,
  tags: string[],
  config?: MailchimpConfig
): Promise<{ success: boolean; error?: string }> {
  const apiKey = config?.apiKey || process.env.MAILCHIMP_API_KEY;
  const serverPrefix = config?.serverPrefix || process.env.MAILCHIMP_SERVER_PREFIX;
  const listId = config?.listId || process.env.MAILCHIMP_LIST_ID;

  if (!apiKey || !serverPrefix || !listId) {
    return { success: false, error: "Mailchimp not configured" };
  }

  const subscriberHash = await md5(email.toLowerCase());

  try {
    const response = await fetch(
      `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${listId}/members/${subscriberHash}/tags`,
      {
        method: "POST",
        headers: {
          Authorization: `apikey ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tags: tags.map(name => ({ name, status: "active" })),
        }),
      }
    );

    if (response.ok || response.status === 204) {
      return { success: true };
    }

    const data = await response.json();
    return { success: false, error: data.detail || data.title };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// ============================================
// EMAIL TEMPLATES
// ============================================

export const emailTemplates = {
  welcome: (name: string): EmailTemplate => ({
    subject: "Welcome to Hectic Radio! 🎵",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; }
          .logo { width: 80px; height: 80px; border-radius: 50%; }
          h1 { color: #f97316; margin: 0; }
          .cta { display: inline-block; background: linear-gradient(to right, #f97316, #fb923c); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 40px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://djdannyhecticb.com/logo-icon.png" alt="DJ Danny Hectic B" class="logo" />
            <h1>Welcome to the Crew!</h1>
          </div>
          <p>Hey ${name}! 👋</p>
          <p>Thanks for joining the Hectic Radio family! You're now part of a community of music lovers who appreciate the best in UK Garage, House, Grime, and Amapiano.</p>
          <p>Here's what you can look forward to:</p>
          <ul>
            <li>🎧 Exclusive mixes and releases</li>
            <li>📅 Early access to event tickets</li>
            <li>🎤 Behind-the-scenes content</li>
            <li>🎁 Special member rewards</li>
          </ul>
          <p style="text-align: center;">
            <a href="https://djdannyhecticb.com/live" class="cta">Listen Live Now</a>
          </p>
          <p>Stay locked in! 🔥</p>
          <p>— DJ Danny Hectic B</p>
          <div class="footer">
            <p>© 2024 DJ Danny Hectic B. All rights reserved.</p>
            <p><a href="https://djdannyhecticb.com/unsubscribe">Unsubscribe</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  bookingConfirmation: (data: {
    name: string;
    eventDate: string;
    eventType: string;
    location: string;
  }): EmailTemplate => ({
    subject: "Booking Request Received! 🎧",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; }
          h1 { color: #f97316; }
          .details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .details dt { font-weight: bold; color: #666; }
          .details dd { margin: 0 0 10px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 40px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Request Received!</h1>
          </div>
          <p>Hey ${data.name}! 👋</p>
          <p>Thanks for your booking request! I've received your inquiry and will get back to you within 24 hours.</p>
          <div class="details">
            <dl>
              <dt>Event Type</dt>
              <dd>${data.eventType}</dd>
              <dt>Date</dt>
              <dd>${data.eventDate}</dd>
              <dt>Location</dt>
              <dd>${data.location}</dd>
            </dl>
          </div>
          <p>In the meantime, check out some of my recent sets:</p>
          <p>🎵 <a href="https://djdannyhecticb.com/mixes">Latest Mixes</a></p>
          <p>Looking forward to making your event unforgettable!</p>
          <p>— DJ Danny Hectic B</p>
          <div class="footer">
            <p>© 2024 DJ Danny Hectic B. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  newMixAlert: (data: {
    name: string;
    mixTitle: string;
    mixUrl: string;
    genre: string;
  }): EmailTemplate => ({
    subject: `New Mix Alert: ${data.mixTitle} 🔥`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; }
          h1 { color: #f97316; }
          .cta { display: inline-block; background: linear-gradient(to right, #f97316, #fb923c); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 40px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔊 New Mix Just Dropped!</h1>
          </div>
          <p>Hey ${data.name}!</p>
          <p>A fresh new ${data.genre} mix is waiting for you:</p>
          <h2 style="text-align: center;">${data.mixTitle}</h2>
          <p style="text-align: center;">
            <a href="${data.mixUrl}" class="cta">Listen Now</a>
          </p>
          <p>Enjoy the vibes! 🎧</p>
          <p>— DJ Danny Hectic B</p>
          <div class="footer">
            <p>© 2024 DJ Danny Hectic B. All rights reserved.</p>
            <p><a href="https://djdannyhecticb.com/unsubscribe">Unsubscribe</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

async function md5(text: string): Promise<string> {
  const crypto = await import("crypto");
  return crypto.createHash("md5").update(text).digest("hex");
}

// ============================================
// UNIFIED EMAIL SERVICE
// ============================================

export class EmailService {
  private provider: "sendgrid" | "mailchimp" | "console";

  constructor() {
    if (process.env.SENDGRID_API_KEY) {
      this.provider = "sendgrid";
    } else if (process.env.MAILCHIMP_API_KEY) {
      this.provider = "mailchimp";
    } else {
      this.provider = "console";
      console.warn("[Email] No email provider configured, emails will be logged to console");
    }
  }

  async send(options: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
    if (this.provider === "console") {
      console.log("[Email] Would send:", options);
      return { success: true };
    }

    if (this.provider === "sendgrid") {
      return sendWithSendGrid(options);
    }

    return { success: false, error: "No email provider available" };
  }

  async subscribeToNewsletter(
    email: string,
    name?: string,
    tags?: string[]
  ): Promise<{ success: boolean; error?: string }> {
    // Add to Mailchimp if configured
    if (process.env.MAILCHIMP_API_KEY) {
      const nameParts = name?.split(" ") || [];
      return addToMailchimpList({
        email,
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(" "),
        tags,
      });
    }

    // Fallback: just log
    console.log("[Email] Newsletter signup:", { email, name, tags });
    return { success: true };
  }

  async sendWelcomeEmail(email: string, name: string): Promise<{ success: boolean }> {
    const template = emailTemplates.welcome(name);
    return this.send({
      to: { email, name },
      subject: template.subject,
      html: template.html,
      tags: ["welcome"],
    });
  }

  async sendBookingConfirmation(
    email: string,
    data: Parameters<typeof emailTemplates.bookingConfirmation>[0]
  ): Promise<{ success: boolean }> {
    const template = emailTemplates.bookingConfirmation(data);
    return this.send({
      to: { email, name: data.name },
      subject: template.subject,
      html: template.html,
      tags: ["booking"],
    });
  }

  async sendNewMixAlert(
    email: string,
    data: Parameters<typeof emailTemplates.newMixAlert>[0]
  ): Promise<{ success: boolean }> {
    const template = emailTemplates.newMixAlert(data);
    return this.send({
      to: { email, name: data.name },
      subject: template.subject,
      html: template.html,
      tags: ["mix-alert"],
    });
  }
}

// Singleton instance
export const emailService = new EmailService();

export default emailService;
