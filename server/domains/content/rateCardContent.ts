/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

export interface RateCategory {
  name: string;
  description: string;
  tiers: RateTier[];
}

export interface RateTier {
  name: string;
  priceRange: string;
  included: string[];
  notes?: string;
}

export const RATE_CARD = {
  header: {
    title: "DJ Danny Hectic B - Rate Card 2024/2025",
    subtitle: "Professional DJ Services Pricing",
    tagline: "Premium Quality. Hectic Energy. Guaranteed Hype.",
  },

  categories: [
    {
      name: "Club & Nightlife",
      description: "Premium club residencies and one-off bookings",
      tiers: [
        {
          name: "London Premium Venues",
          priceRange: "£1,200 - £1,500",
          included: [
            "4-6 hour DJ set",
            "Professional sound system coordination",
            "Equipment setup and breakdown",
            "Premium lighting integration",
            "Live MC (if requested)",
            "Setlist customization",
          ],
          notes: "Top-tier London venues (Ministry of Sound, fabric, etc.)",
        },
        {
          name: "London Standard Venues",
          priceRange: "£800 - £1,000",
          included: [
            "3-4 hour DJ set",
            "Sound system coordination",
            "Basic technical support",
            "Equipment setup and breakdown",
            "Setlist customization",
            "Professional presence",
          ],
          notes: "Local clubs, lounges, bars with established sound systems",
        },
        {
          name: "UK Regional Bookings",
          priceRange: "£600 - £800",
          included: [
            "3-4 hour DJ set",
            "Travel included (up to 100 miles from London)",
            "Equipment coordination",
            "Professional MC services",
            "Full setup and breakdown",
            "Setlist customization",
          ],
          notes: "Manchester, Birmingham, Liverpool, Brighton, Bristol, etc.",
        },
      ],
    },
    {
      name: "Private Events",
      description: "Weddings, birthdays, corporate parties, and private celebrations",
      tiers: [
        {
          name: "Private Home Events",
          priceRange: "£800 - £1,200",
          included: [
            "3-4 hour DJ set",
            "Portable high-quality sound system",
            "Professional equipment (turntables/CDJs + mixer)",
            "Lighting effects",
            "Full setup and breakdown",
            "Setlist customization & guest requests",
            "Professional appearance and etiquette",
          ],
          notes: "House parties, garden events, intimate celebrations",
        },
        {
          name: "Hotel & Venue Events",
          priceRange: "£1,500 - £2,500",
          included: [
            "4-6 hour DJ set",
            "Professional sound system installation",
            "Premium lighting and visual effects",
            "MC services with professional commentary",
            "Full technical coordination",
            "Equipment setup, soundcheck, and breakdown",
            "Setlist customization for multiple segments",
            "Post-event audio pack (if requested)",
          ],
          notes: "Wedding receptions, corporate galas, large celebrations",
        },
      ],
    },
    {
      name: "Corporate & Brand",
      description: "Corporate events, product launches, brand activations",
      tiers: [
        {
          name: "Standard Corporate Package",
          priceRange: "£2,000 - £3,000",
          included: [
            "3-4 hour DJ set",
            "Sound system and equipment provision",
            "Lighting and visual effects",
            "Professional MC services",
            "Brand music curation",
            "Full technical support",
            "Equipment setup and breakdown",
          ],
          notes: "Office parties, team building, product launches, networking events",
        },
        {
          name: "Premium Corporate Package",
          priceRange: "£3,500 - £5,000",
          included: [
            "4-6 hour DJ set",
            "Premium sound system with surround capability",
            "Advanced lighting and visual effects",
            "Professional MC with brand scripting",
            "Custom music curation aligned with brand",
            "Multiple DJ sets (different segments/areas)",
            "Full technical production management",
            "Post-event media/photos with Danny",
          ],
          notes: "Large-scale events, brand activations, executive functions",
        },
      ],
    },
    {
      name: "Festivals & Outdoor",
      description: "Festival bookings, outdoor events, large-scale productions",
      tiers: [
        {
          name: "Festival Booking",
          priceRange: "Negotiate per opportunity",
          included: [
            "Custom duration (2-4 hours typical)",
            "Coordinated with festival sound system",
            "Professional stage presence",
            "Technical rider fulfillment",
            "Promotion and social media cross-posting",
            "VIP meet-and-greet (if applicable)",
          ],
          notes: "Case-by-case basis depending on festival size and scope",
        },
      ],
    },
    {
      name: "Radio & Broadcasting",
      description: "Radio show appearances, podcast features, live broadcasts",
      tiers: [
        {
          name: "Radio Appearance",
          priceRange: "Negotiate per opportunity",
          included: [
            "Live radio set (1-3 hours)",
            "Interview and promotion",
            "Exclusive music premieres",
            "Social media promotion",
            "Recording for future use",
          ],
          notes: "Hectic Radio, commercial stations, independent broadcasters",
        },
      ],
    },
  ] as RateCategory[],

  whatsIncluded: {
    title: "What's Always Included",
    items: [
      "Professional DJ expertise and song selection",
      "High-energy, crowd-pleasing performance",
      "Full equipment setup and technical support",
      "Professional appearance and conduct",
      "Punctuality and reliability",
      "Flexibility with setlists and requests",
    ],
  },

  notIncluded: {
    title: "Additional Charges Apply For",
    items: [
      "Extended hours (£150-250/hour)",
      "Travel beyond standard distance (£0.50 per mile or negotiated)",
      "Specialist equipment rental (lasers, projection, etc.)",
      "Live band integration or special production",
      "Exclusive/premium content licensing",
      "Same-day/rush bookings (50% surcharge)",
    ],
  },

  terms: {
    title: "Booking & Payment Terms",
    sections: [
      {
        heading: "Booking Process",
        content:
          "1. Inquiry & availability check\n2. Quote provided with detailed breakdown\n3. 25% non-refundable deposit to secure date\n4. Balance due 7 days before event\n5. Final confirmation meeting 48 hours before event",
      },
      {
        heading: "Cancellation Policy",
        content:
          "• 30+ days notice: Full refund minus admin fee (£50)\n• 14-30 days: 50% of booking fee retained\n• 7-14 days: 75% of booking fee retained\n• Less than 7 days: Full booking fee retained (force majeure exceptions apply)",
      },
      {
        heading: "Payment Methods",
        content: "Bank transfer, Stripe (credit/debit card), PayPal, or cash on day (by arrangement)",
      },
      {
        heading: "Technical Requirements",
        content:
          "Venues must provide: Safe power supply (min 2x 13A sockets), adequate space for equipment, basic sound system or setup area, WiFi (optional but helpful)",
      },
    ],
  },

  contact: {
    title: "Ready to Book?",
    subtitle: "Let's create an unforgettable event",
    email: "contact@djdannyhecticb.com",
    phone: "+44 (0) XXXX XXXXXX", // Update with actual number
    instagram: "@djdannyhecticb",
    website: "www.djdannyhecticb.com",
    cta: "Get in touch for a custom quote tailored to your event",
  },

  footer: {
    disclaimer:
      "All rates are subject to change. Pricing current as of 2024. Requests outside standard packages will be quoted individually. Professional liability insurance included.",
    lastUpdated: new Date().toISOString().split("T")[0],
  },
};

export function formatRateCard(): string {
  const { header, categories, whatsIncluded, notIncluded, terms, contact, footer } = RATE_CARD;

  let content = "";

  // Header
  content += `${header.title}\n`;
  content += `${header.subtitle}\n`;
  content += `${header.tagline}\n\n`;

  // Categories
  for (const category of categories) {
    content += `\n## ${category.name}\n`;
    content += `${category.description}\n\n`;

    for (const tier of category.tiers) {
      content += `### ${tier.name}\n`;
      content += `**${tier.priceRange}**\n`;
      if (tier.notes) content += `*${tier.notes}*\n\n`;
      content += `Included:\n`;
      for (const item of tier.included) {
        content += `- ${item}\n`;
      }
      content += "\n";
    }
  }

  // What's Included
  content += `\n## ${whatsIncluded.title}\n`;
  for (const item of whatsIncluded.items) {
    content += `- ${item}\n`;
  }

  // Additional Charges
  content += `\n## ${notIncluded.title}\n`;
  for (const item of notIncluded.items) {
    content += `- ${item}\n`;
  }

  // Terms
  content += `\n## ${terms.title}\n`;
  for (const section of terms.sections) {
    content += `\n### ${section.heading}\n`;
    content += `${section.content}\n`;
  }

  // Contact
  content += `\n## ${contact.title}\n`;
  content += `${contact.subtitle}\n\n`;
  content += `Email: ${contact.email}\n`;
  content += `Phone: ${contact.phone}\n`;
  content += `Instagram: ${contact.instagram}\n`;
  content += `Website: ${contact.website}\n\n`;
  content += `${contact.cta}\n`;

  // Footer
  content += `\n---\n`;
  content += `${footer.disclaimer}\n`;
  content += `Last Updated: ${footer.lastUpdated}\n`;

  return content;
}
