/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */


/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Music, Calendar, Mic2, Radio } from "lucide-react";
import { Link } from "wouter";
import { MetaTagsComponent } from "@/components/MetaTags";
import { cn } from "@/lib/utils";

const packages = [
  {
    name: "Club Night",
    price: "£500",
    duration: "4 hours",
    icon: Music,
    features: [
      "4-hour DJ set",
      "Professional sound system",
      "Basic lighting",
      "Setup & breakdown",
      "Travel within 30 miles",
    ],
    popular: false,
  },
  {
    name: "Private Event",
    price: "£800",
    duration: "5 hours",
    icon: Calendar,
    features: [
      "5-hour DJ set",
      "Professional sound system",
      "Enhanced lighting",
      "Setup & breakdown",
      "Travel within 50 miles",
      "Custom playlist consultation",
    ],
    popular: true,
  },
  {
    name: "Festival/Showcase",
    price: "£1,200",
    duration: "6 hours",
    icon: Radio,
    features: [
      "6-hour DJ set",
      "Premium sound system",
      "Full lighting production",
      "Setup & breakdown",
      "Travel included",
      "Custom playlist consultation",
      "Pre-event consultation",
      "Dedicated support",
    ],
    popular: false,
  },
  {
    name: "Radio Show Guest",
    price: "£300",
    duration: "1 hour",
    icon: Mic2,
    features: [
      "1-hour guest mix",
      "Interview segment",
      "Track selection consultation",
      "Promotion on socials",
    ],
    popular: false,
  },
];

export default function Pricing() {
  return (
    <>
      <MetaTagsComponent
        title="Pricing & Packages | DJ Danny Hectic B"
        description="Professional DJ services pricing and packages for clubs, private events, festivals, and radio shows."
        url="/pricing"
      />
      <div className="min-h-screen bg-background text-foreground pt-14">
        {/* Hero Section */}
        <section className="border-b border-foreground px-4 py-12 md:py-20">
          <div className="container max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-black uppercase mb-6 tracking-tighter">
              Pricing & Packages
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional DJ services tailored to your event. All packages include professional equipment and setup.
            </p>
          </div>
        </section>

        {/* Packages Grid */}
        <section className="py-12 md:py-20 px-4">
          <div className="container max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {packages.map((pkg) => {
                const Icon = pkg.icon;
                return (
                  <Card
                    key={pkg.name}
                    className={cn(
                      "relative flex flex-col",
                      pkg.popular && "border-2 border-accent shadow-lg"
                    )}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-background px-4 py-1 text-xs font-bold uppercase">
                        Most Popular
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="w-6 h-6 text-accent" />
                        <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black">{pkg.price}</span>
                        <span className="text-muted-foreground">/{pkg.duration}</span>
                      </div>
                      <CardDescription>{pkg.duration} of professional DJ services</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <ul className="space-y-3 mb-6 flex-1">
                        {pkg.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Link href="/book-danny">
                        <Button
                          className={cn(
                            "w-full",
                            pkg.popular && "bg-accent hover:bg-accent/90"
                          )}
                          size="lg"
                        >
                          Book Now
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Additional Info */}
        <section className="py-12 md:py-20 px-4 border-t border-foreground bg-muted/10">
          <div className="container max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black uppercase mb-8 text-center">
              Additional Services
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Extended Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Need more time? Additional hours available at £150/hour.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Travel Beyond Standard</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Events beyond standard travel distance: £1.50 per mile.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Custom Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Special equipment, custom playlists, or unique requirements? Contact us for a custom quote.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Rush Booking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Bookings within 48 hours may incur a 20% rush fee.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 md:py-20 px-4 border-t border-foreground">
          <div className="container max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-black uppercase mb-6">
              Ready to Book?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Get in touch to discuss your event and secure your date.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book-danny">
                <Button size="lg" className="w-full sm:w-auto">
                  Book Now
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

