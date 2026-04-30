/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { ENV } from "./env";

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface ContactData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

/**
 * Initialize email service client based on provider
 */
async function getEmailClient() {
  const provider = ENV.emailServiceProvider;

  if (provider === "resend") {
    const { Resend } = await import("resend");
    return new Resend(ENV.emailApiKey);
  }

  // Default: SendGrid
  const sgMail = await import("@sendgrid/mail");
  sgMail.default.setApiKey(ENV.emailApiKey);
  return sgMail.default;
}

/**
 * Send email via configured service (Resend or SendGrid)
 */
export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  try {
    const provider = ENV.emailServiceProvider;

    if (!provider || !ENV.emailApiKey) {
      console.warn("[Email] Email service not configured (no provider or API key)");
      return false;
    }

    if (provider === "resend") {
      const client = await getEmailClient();
      const { data, error } = await (client as any).emails.send({
        from: params.from || `noreply@${ENV.emailFromDomain}`,
        to: params.to,
        subject: params.subject,
        html: params.html,
      });

      if (error) {
        console.error("[Email] Resend error:", error);
        return false;
      }
      console.log("[Email] Sent via Resend:", data);
      return true;
    }

    // SendGrid
    const client = await getEmailClient();
    await (client as any).send({
      from: params.from || ENV.emailFromAddress,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    console.log("[Email] Sent via SendGrid to:", params.to);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send email:", error);
    return false;
  }
}

/**
 * Send contact form confirmation email to user
 */
export async function sendContactConfirmation(contact: ContactData): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: #fff; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { background: #000; color: #fff; padding: 20px; text-align: center; font-size: 12px; }
          .info-block { margin: 15px 0; }
          .label { font-weight: bold; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Contact Received</h1>
          </div>
          <div class="content">
            <p>Hi ${contact.name},</p>
            <p>Thanks for reaching out! We've received your message and will get back to you soon.</p>
            <div class="info-block">
              <div class="label">Your Details:</div>
              <p>
                Name: ${contact.name}<br>
                Email: ${contact.email}<br>
                ${contact.phone ? `Phone: ${contact.phone}<br>` : ''}
              </p>
            </div>
            <div class="info-block">
              <div class="label">Your Message:</div>
              <p>${contact.message.replace(/\n/g, '<br>')}</p>
            </div>
            <p>We aim to respond within 24 hours. Keep an eye on your inbox!</p>
          </div>
          <div class="footer">
            <p>DJ Danny Hectic B | Hectic Radio</p>
            <p>&copy; 2024. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: contact.email,
    subject: "We received your message - DJ Danny Hectic B",
    html,
  });
}

/**
 * Send contact form notification to admin
 */
export async function sendContactNotification(contact: ContactData, ipAddress?: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: #fff; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .info-block { margin: 15px 0; padding: 10px; background: #fff; border-left: 4px solid #ffd700; }
          .label { font-weight: bold; color: #666; }
          .footer { background: #000; color: #fff; padding: 20px; text-align: center; font-size: 12px; }
          .urgent { color: #d32f2f; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Contact Form Submission</h1>
          </div>
          <div class="content">
            <div class="info-block">
              <div class="label">From:</div>
              <p>
                ${contact.name}<br>
                <a href="mailto:${contact.email}">${contact.email}</a><br>
                ${contact.phone ? `Phone: <a href="tel:${contact.phone}">${contact.phone}</a>` : 'No phone provided'}
              </p>
            </div>
            <div class="info-block">
              <div class="label">Message:</div>
              <p>${contact.message.replace(/\n/g, '<br>')}</p>
            </div>
            ${ipAddress ? `<div class="info-block"><div class="label">IP Address:</div><p>${ipAddress}</p></div>` : ''}
            <p><strong>Status:</strong> New (Unread)</p>
          </div>
          <div class="footer">
            <p>Reply to this contact immediately at <a href="mailto:${contact.email}">${contact.email}</a></p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: ENV.notificationsEmail,
    subject: `New Contact: ${contact.name}`,
    html,
  });
}
