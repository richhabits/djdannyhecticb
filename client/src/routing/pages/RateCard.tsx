/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetaTagsComponent } from "@/components/MetaTags";
import { Download, Mail, Phone, Instagram, Globe, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const RATE_DATA = {
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
          notes: "Top-tier London venues",
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
          notes: "Local clubs, lounges, bars",
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
          notes: "Manchester, Birmingham, Liverpool, Brighton, Bristol",
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
          notes: "House parties, garden events",
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
          notes: "Wedding receptions, corporate galas",
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
          notes: "Office parties, team building, product launches",
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
          notes: "Large-scale events, brand activations",
        },
      ],
    },
  ],

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

  additionalCharges: {
    title: "Additional Charges Apply For",
    items: [
      "Extended hours (£150-250/hour)",
      "Travel beyond standard distance (£0.50 per mile)",
      "Specialist equipment rental (lasers, projection)",
      "Live band integration or special production",
      "Same-day/rush bookings (50% surcharge)",
    ],
  },

  contact: {
    title: "Ready to Book?",
    subtitle: "Let's create an unforgettable event",
    email: "contact@djdannyhecticb.com",
    instagram: "@djdannyhecticb",
    website: "www.djdannyhecticb.com",
    cta: "Get in touch for a custom quote tailored to your event",
  },
};

export default function RateCard() {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch("/api/rate-card-pdf", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to download PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "DJ-Danny-Hectic-B-Rate-Card-2024.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Rate card downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <MetaTagsComponent
        title="Rate Card | DJ Danny Hectic B"
        description="DJ Danny Hectic B professional pricing and booking rates for clubs, private events, corporate functions, and more."
        image="/og-image.jpg"
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              {RATE_DATA.header.title}
            </h1>
            <p className="text-xl text-gray-600 mb-2">{RATE_DATA.header.subtitle}</p>
            <p className="text-lg text-red-600 italic font-semibold">{RATE_DATA.header.tagline}</p>

            {/* Download Button */}
            <div className="mt-8">
              <Button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Download className="w-5 h-5 mr-2" />
                {isDownloading ? "Downloading..." : "Download PDF"}
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-12">
            {/* Categories */}
            {RATE_DATA.categories.map((category, idx) => (
              <div key={idx} className="space-y-6">
                <div className="border-l-4 border-red-600 pl-6 py-2">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h2>
                  <p className="text-gray-600">{category.description}</p>
                </div>

                {/* Tiers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {category.tiers.map((tier, tierIdx) => (
                    <Card key={tierIdx} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                      <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
                        <CardTitle className="text-xl text-gray-900">{tier.name}</CardTitle>
                        {tier.notes && <CardDescription className="text-sm mt-2">{tier.notes}</CardDescription>}
                        <div className="text-2xl font-bold text-red-600 mt-4">{tier.priceRange}</div>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900">What's Included:</h4>
                          <ul className="space-y-2">
                            {tier.included.map((item, itemIdx) => (
                              <li key={itemIdx} className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700 text-sm">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}

            {/* What's Included */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  {RATE_DATA.whatsIncluded.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {RATE_DATA.whatsIncluded.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-green-600 font-bold mt-1">✓</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Additional Charges */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-amber-50 to-orange-50">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                  {RATE_DATA.additionalCharges.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {RATE_DATA.additionalCharges.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-orange-600 font-bold mt-1">→</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Contact Section */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-lg p-8 sm:p-12 text-center">
              <h2 className="text-3xl font-bold mb-3">{RATE_DATA.contact.title}</h2>
              <p className="text-gray-300 mb-8">{RATE_DATA.contact.subtitle}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                {/* Email */}
                <div className="flex items-center justify-center gap-3">
                  <Mail className="w-5 h-5 text-red-500" />
                  <a
                    href={`mailto:${RATE_DATA.contact.email}`}
                    className="hover:text-red-500 transition-colors"
                  >
                    {RATE_DATA.contact.email}
                  </a>
                </div>

                {/* Instagram */}
                <div className="flex items-center justify-center gap-3">
                  <Instagram className="w-5 h-5 text-red-500" />
                  <a
                    href={`https://instagram.com/${RATE_DATA.contact.instagram.substring(1)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-red-500 transition-colors"
                  >
                    {RATE_DATA.contact.instagram}
                  </a>
                </div>

                {/* Website */}
                <div className="flex items-center justify-center gap-3 sm:col-span-2">
                  <Globe className="w-5 h-5 text-red-500" />
                  <a
                    href={`https://${RATE_DATA.contact.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-red-500 transition-colors"
                  >
                    {RATE_DATA.contact.website}
                  </a>
                </div>
              </div>

              <p className="text-red-400 text-sm font-semibold italic mb-6">{RATE_DATA.contact.cta}</p>

              <Button
                asChild
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <a href="/contact">Get in Touch</a>
              </Button>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-12 text-center text-sm text-gray-600 border-t pt-8">
            <p>
              All rates are subject to change. Pricing current as of 2024. Requests outside standard packages will be
              quoted individually.
            </p>
            <p className="mt-2">Professional liability insurance included with all bookings.</p>
          </div>
        </div>
      </div>
    </>
  );
}
