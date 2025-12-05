import { Resend } from 'resend';
import { ENV } from './env';

let resend: Resend | null = null;

/**
 * Initialize Resend client
 */
export function getResend(): Resend | null {
  if (!ENV.resendApiKey) {
    console.warn('[Email] Not configured - RESEND_API_KEY missing');
    return null;
  }

  if (!resend) {
    resend = new Resend(ENV.resendApiKey);
  }

  return resend;
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmation(params: {
  to: string;
  name: string;
  eventType: string;
  eventDate: string;
  location: string;
  bookingId: number;
}) {
  const client = getResend();
  if (!client) {
    console.log('[Email] Skipping booking confirmation - not configured');
    return null;
  }

  const { data, error } = await client.emails.send({
    from: ENV.emailFrom || 'DJ Danny Hectic B <noreply@djdannyhecticb.com>',
    to: params.to,
    replyTo: ENV.emailReplyTo,
    subject: '🎧 Booking Received - DJ Danny Hectic B',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px;">DJ Danny Hectic B</h1>
          <p style="color: white; margin: 10px 0 0; font-size: 16px;">Booking Confirmed</p>
        </div>
        
        <div style="background: white; padding: 40px 30px;">
          <p style="font-size: 18px; color: #333;">Hey ${params.name}! 👋</p>
          
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            Thanks for your booking request! We've received your details and will get back to you within 24 hours.
          </p>
          
          <div style="background: #f8f9fa; border-left: 4px solid #ff6b35; padding: 20px; margin: 30px 0;">
            <h3 style="margin: 0 0 15px; color: #333;">Booking Details</h3>
            <p style="margin: 8px 0; color: #666;"><strong>Booking ID:</strong> #${params.bookingId}</p>
            <p style="margin: 8px 0; color: #666;"><strong>Event Type:</strong> ${params.eventType}</p>
            <p style="margin: 8px 0; color: #666;"><strong>Date:</strong> ${params.eventDate}</p>
            <p style="margin: 8px 0; color: #666;"><strong>Location:</strong> ${params.location}</p>
          </div>
          
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            In the meantime, check out my latest mixes and follow me on social media to stay locked in! 🔥
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://djdannyhecticb.com/mixes" style="display: inline-block; background: #ff6b35; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Browse Mixes
            </a>
          </div>
        </div>
        
        <div style="background: #1a1a1a; padding: 30px; text-align: center; color: #999;">
          <p style="margin: 0 0 10px; font-size: 14px;">DJ Danny Hectic B</p>
          <p style="margin: 0; font-size: 12px;">Hectic Radio • UK Garage Pioneer</p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error('[Email] Failed to send booking confirmation:', error);
    return null;
  }

  return data;
}

/**
 * Send shout approval notification
 */
export async function sendShoutApproval(params: {
  to?: string;
  name: string;
  message: string;
  phone?: string;
  whatsappOptIn: boolean;
}) {
  if (!params.to && !params.phone) {
    console.log('[Email] Skipping shout approval - no contact info');
    return null;
  }

  const client = getResend();
  if (!client || !params.to) {
    console.log('[Email] Skipping shout approval email - not configured or no email');
    return null;
  }

  const { data, error } = await client.emails.send({
    from: ENV.emailFrom || 'DJ Danny Hectic B <noreply@djdannyhecticb.com>',
    to: params.to,
    replyTo: ENV.emailReplyTo,
    subject: '🎉 Your Shout is Live!',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px;">🔥 You're Locked In! 🔥</h1>
        </div>
        
        <div style="background: white; padding: 40px 30px;">
          <p style="font-size: 18px; color: #333;">Yo ${params.name}! 💥</p>
          
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            Your shout just went live on the site! Big up for sending love to Hectic Radio. 
          </p>
          
          <div style="background: #f8f9fa; border-left: 4px solid #ff6b35; padding: 20px; margin: 30px 0;">
            <p style="margin: 0; color: #666; font-style: italic;">"${params.message}"</p>
          </div>
          
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            Keep tuned in and keep spreading the vibes! 🎧
          </p>
          
          ${params.whatsappOptIn ? `
          <p style="font-size: 14px; color: #999; margin-top: 30px;">
            P.S. - Since you opted in, I might hit you up on WhatsApp for exclusive content and live session alerts! 📱
          </p>
          ` : ''}
        </div>
        
        <div style="background: #1a1a1a; padding: 30px; text-align: center; color: #999;">
          <p style="margin: 0 0 10px; font-size: 14px;">Stay Locked In 🔒</p>
          <p style="margin: 0; font-size: 12px;">DJ Danny Hectic B • Hectic Radio</p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error('[Email] Failed to send shout approval:', error);
    return null;
  }

  return data;
}

/**
 * Send newsletter subscription welcome email
 */
export async function sendNewsletterWelcome(params: {
  to: string;
  name?: string;
}) {
  const client = getResend();
  if (!client) {
    console.log('[Email] Skipping newsletter welcome - not configured');
    return null;
  }

  const { data, error } = await client.emails.send({
    from: ENV.emailFrom || 'DJ Danny Hectic B <noreply@djdannyhecticb.com>',
    to: params.to,
    replyTo: ENV.emailReplyTo,
    subject: '🎧 Welcome to the Hectic Family!',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px;">Welcome to Hectic Radio! 🔥</h1>
        </div>
        
        <div style="background: white; padding: 40px 30px;">
          <p style="font-size: 18px; color: #333;">${params.name ? `Hey ${params.name}!` : 'Hey there!'} 👋</p>
          
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            Big up for joining the Hectic family! You're now locked in to receive:
          </p>
          
          <ul style="font-size: 16px; color: #666; line-height: 2;">
            <li>🎵 Fresh mix drops and exclusive content</li>
            <li>📅 Event announcements and live session alerts</li>
            <li>💎 Behind-the-scenes access and stories</li>
            <li>🎁 Special giveaways and competitions</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://djdannyhecticb.com" style="display: inline-block; background: #ff6b35; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Explore the Site
            </a>
          </div>
          
          <p style="font-size: 14px; color: #999; margin-top: 30px; text-align: center;">
            Stay tuned, stay locked in! 🔒
          </p>
        </div>
        
        <div style="background: #1a1a1a; padding: 30px; text-align: center; color: #999;">
          <p style="margin: 0 0 10px; font-size: 14px;">DJ Danny Hectic B</p>
          <p style="margin: 0; font-size: 12px;">Hectic Radio • UK Garage Pioneer</p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error('[Email] Failed to send newsletter welcome:', error);
    return null;
  }

  return data;
}

/**
 * Send purchase confirmation with download link
 */
export async function sendPurchaseConfirmation(params: {
  to: string;
  name: string;
  productName: string;
  downloadUrl?: string;
  amount: string;
  purchaseId: number;
}) {
  const client = getResend();
  if (!client) {
    console.log('[Email] Skipping purchase confirmation - not configured');
    return null;
  }

  const { data, error } = await client.emails.send({
    from: ENV.emailFrom || 'DJ Danny Hectic B <noreply@djdannyhecticb.com>',
    to: params.to,
    replyTo: ENV.emailReplyTo,
    subject: `📦 Your Purchase: ${params.productName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px;">Purchase Confirmed! 🎉</h1>
        </div>
        
        <div style="background: white; padding: 40px 30px;">
          <p style="font-size: 18px; color: #333;">Yo ${params.name}! 💥</p>
          
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            Big thanks for supporting the music! Your purchase is confirmed and ready.
          </p>
          
          <div style="background: #f8f9fa; border-left: 4px solid #ff6b35; padding: 20px; margin: 30px 0;">
            <h3 style="margin: 0 0 15px; color: #333;">Order Details</h3>
            <p style="margin: 8px 0; color: #666;"><strong>Order ID:</strong> #${params.purchaseId}</p>
            <p style="margin: 8px 0; color: #666;"><strong>Product:</strong> ${params.productName}</p>
            <p style="margin: 8px 0; color: #666;"><strong>Amount:</strong> £${params.amount}</p>
          </div>
          
          ${params.downloadUrl ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${params.downloadUrl}" style="display: inline-block; background: #ff6b35; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              ⬇️ Download Now
            </a>
          </div>
          ` : `
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            Your download link will be sent separately once it's ready. Check your inbox!
          </p>
          `}
          
          <p style="font-size: 14px; color: #999; margin-top: 30px;">
            Need help? Hit reply to this email and I'll sort you out. 🤝
          </p>
        </div>
        
        <div style="background: #1a1a1a; padding: 30px; text-align: center; color: #999;">
          <p style="margin: 0 0 10px; font-size: 14px;">DJ Danny Hectic B</p>
          <p style="margin: 0; font-size: 12px;">Hectic Radio • UK Garage Pioneer</p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error('[Email] Failed to send purchase confirmation:', error);
    return null;
  }

  return data;
}

/**
 * Send admin notification for new booking
 */
export async function sendAdminBookingNotification(params: {
  name: string;
  email: string;
  phone?: string;
  eventType: string;
  eventDate: string;
  location: string;
  bookingId: number;
  extraNotes?: string;
}) {
  const client = getResend();
  if (!client || !ENV.emailReplyTo) {
    console.log('[Email] Skipping admin notification - not configured');
    return null;
  }

  const { data, error } = await client.emails.send({
    from: ENV.emailFrom || 'DJ Danny Hectic B <noreply@djdannyhecticb.com>',
    to: ENV.emailReplyTo,
    subject: `🚨 New Booking: ${params.eventType} on ${params.eventDate}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a1a1a; padding: 30px 20px;">
          <h2 style="color: #ff6b35; margin: 0;">New Booking Request</h2>
          <p style="color: #999; margin: 10px 0 0;">Booking ID: #${params.bookingId}</p>
        </div>
        
        <div style="background: white; padding: 30px;">
          <h3 style="margin: 0 0 20px; color: #333;">Client Details</h3>
          <p style="margin: 8px 0; color: #666;"><strong>Name:</strong> ${params.name}</p>
          <p style="margin: 8px 0; color: #666;"><strong>Email:</strong> ${params.email}</p>
          ${params.phone ? `<p style="margin: 8px 0; color: #666;"><strong>Phone:</strong> ${params.phone}</p>` : ''}
          
          <h3 style="margin: 30px 0 20px; color: #333;">Event Details</h3>
          <p style="margin: 8px 0; color: #666;"><strong>Type:</strong> ${params.eventType}</p>
          <p style="margin: 8px 0; color: #666;"><strong>Date:</strong> ${params.eventDate}</p>
          <p style="margin: 8px 0; color: #666;"><strong>Location:</strong> ${params.location}</p>
          
          ${params.extraNotes ? `
          <h3 style="margin: 30px 0 20px; color: #333;">Additional Notes</h3>
          <p style="margin: 0; color: #666;">${params.extraNotes}</p>
          ` : ''}
          
          <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #eee;">
            <a href="https://djdannyhecticb.com/admin/bookings" style="display: inline-block; background: #ff6b35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              View in Dashboard
            </a>
          </div>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error('[Email] Failed to send admin notification:', error);
    return null;
  }

  return data;
}
