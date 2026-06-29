/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { sendEmail } from "@/server/_core/email";
import { ENV } from "@/server/_core/env";
import type { Booking } from "@/drizzle/schema";
import type { ClientUpload as Upload } from "@/drizzle/portal-schema";

function wrapEmail(title: string, bodyHtml: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: #ffa500; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .info-block { margin: 15px 0; padding: 10px; background: #fff; border-left: 4px solid #ffa500; }
          .label { font-weight: bold; color: #666; }
          .footer { background: #000; color: #fff; padding: 20px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>${title}</h1></div>
          <div class="content">${bodyHtml}</div>
          <div class="footer"><p>DJ Danny Hectic B / Hectic Radio</p></div>
        </div>
      </body>
    </html>
  `;
}

export async function sendBookingSubmittedEmail(booking: Booking, clientEmail: string, clientName: string): Promise<boolean> {
  const html = wrapEmail("New Booking Enquiry", `
    <div class="info-block"><div class="label">From:</div><p>${clientName} (${clientEmail})</p></div>
    <div class="info-block"><div class="label">Event Type:</div><p>${booking.eventType}</p></div>
    <div class="info-block"><div class="label">Event Date:</div><p>${booking.eventDate.toDateString()}</p></div>
    <div class="info-block"><div class="label">Location:</div><p>${booking.location}</p></div>
    ${booking.budget ? `<div class="info-block"><div class="label">Budget:</div><p>£${booking.budget}</p></div>` : ""}
    ${booking.requirements ? `<div class="info-block"><div class="label">Requirements:</div><p>${booking.requirements}</p></div>` : ""}
  `);

  return sendEmail({
    to: ENV.notificationsEmail,
    subject: `New Booking Enquiry: ${booking.eventType} (${clientName})`,
    html,
  });
}

export async function sendBookingStatusEmail(booking: Booking, clientEmail: string): Promise<boolean> {
  const statusLabel = booking.status === "confirmed" ? "Confirmed" : "Completed";
  const html = wrapEmail(`Booking ${statusLabel}`, `
    <div class="info-block"><div class="label">Event Type:</div><p>${booking.eventType}</p></div>
    <div class="info-block"><div class="label">Event Date:</div><p>${booking.eventDate.toDateString()}</p></div>
    <div class="info-block"><div class="label">Status:</div><p>${statusLabel}</p></div>
    ${booking.notes ? `<div class="info-block"><div class="label">Notes:</div><p>${booking.notes}</p></div>` : ""}
  `);

  return sendEmail({
    to: clientEmail,
    subject: `Your booking has been ${statusLabel.toLowerCase()}`,
    html,
  });
}

export async function sendUploadStatusEmail(upload: Upload, clientEmail: string): Promise<boolean> {
  const approved = upload.status === "approved";
  const html = wrapEmail(`Upload ${approved ? "Approved" : "Rejected"}`, `
    <div class="info-block"><div class="label">File:</div><p>${upload.title || upload.fileName}</p></div>
    <div class="info-block"><div class="label">Status:</div><p>${approved ? "Approved" : "Rejected"}</p></div>
  `);

  return sendEmail({
    to: clientEmail,
    subject: `Your upload was ${approved ? "approved" : "rejected"}`,
    html,
  });
}
