/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

/**
 * Booking utility functions for client-side use
 */

export interface BookingData {
  name: string;
  email: string;
  phone?: string;
  organisation?: string;
  eventType: "club" | "radio" | "private" | "brand" | "other";
  eventDate: string;
  eventTime: string;
  location: string;
  budgetRange?: string;
  setLength?: string;
  streamingRequired: boolean;
  extraNotes?: string;
}

/**
 * Build a booking summary in "Danny style"
 */
export function buildBookingSummary(booking: BookingData): string {
  const eventTypeLabels: Record<string, string> = {
    club: "Club Night",
    radio: "Radio Show",
    private: "Private Event",
    brand: "Brand Event",
    other: "Other Event",
  };
  
  let summary = `Yo! Here's your booking summary:\n\n`;
  summary += `📅 Event: ${eventTypeLabels[booking.eventType] || booking.eventType}\n`;
  summary += `📆 Date: ${booking.eventDate} at ${booking.eventTime}\n`;
  summary += `📍 Location: ${booking.location}\n`;
  
  if (booking.organisation) {
    summary += `🏢 Organisation: ${booking.organisation}\n`;
  }
  
  if (booking.setLength) {
    summary += `⏱️ Set Length: ${booking.setLength}\n`;
  }
  
  if (booking.budgetRange) {
    summary += `💰 Budget: ${booking.budgetRange}\n`;
  }
  
  if (booking.streamingRequired) {
    summary += `📻 Streaming: Yes\n`;
  }
  
  if (booking.extraNotes) {
    summary += `\n📝 Notes: ${booking.extraNotes}\n`;
  }
  
  summary += `\nContact: ${booking.name} (${booking.email})`;
  if (booking.phone) {
    summary += ` - ${booking.phone}`;
  }
  
  summary += `\n\nOnce you confirm, I'll get back to you ASAP. Lock in! 🔥`;
  
  return summary;
}

