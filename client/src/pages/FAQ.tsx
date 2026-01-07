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

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MetaTagsComponent } from "@/components/MetaTags";

const faqs = [
  {
    category: "Booking & Events",
    questions: [
      {
        q: "How far in advance should I book?",
        a: "We recommend booking at least 2-4 weeks in advance to secure your preferred date. However, we can accommodate last-minute bookings (within 48 hours) subject to availability and a rush fee.",
      },
      {
        q: "What's included in the booking price?",
        a: "All packages include professional DJ equipment, sound system, basic lighting, setup and breakdown, and travel within the standard distance. Extended hours, additional travel, and special requests may incur extra charges.",
      },
      {
        q: "Do you provide your own equipment?",
        a: "Yes, we bring professional-grade DJ equipment, sound systems, and lighting. If the venue has existing equipment, we can discuss using it, but we recommend our professional setup for the best experience.",
      },
      {
        q: "What happens if I need to cancel?",
        a: "Cancellations made more than 14 days before the event receive a full refund. Cancellations 7-14 days before receive a 50% refund. Cancellations within 7 days are non-refundable.",
      },
    ],
  },
  {
    category: "Music & Playlists",
    questions: [
      {
        q: "Can I request specific songs?",
        a: "Absolutely! We encourage you to share your favorite tracks, must-play songs, and any do-not-play lists. We'll incorporate your requests while maintaining the flow and energy of the event.",
      },
      {
        q: "What genres do you play?",
        a: "We specialize in a wide range of electronic music including house, techno, drum & bass, garage, and more. We adapt to your event's vibe and audience preferences.",
      },
      {
        q: "Do you take song requests during the event?",
        a: "Yes! We welcome requests from guests during the event. We'll do our best to accommodate requests that fit the current vibe and energy.",
      },
    ],
  },
  {
    category: "Technical",
    questions: [
      {
        q: "What equipment do you use?",
        a: "We use professional DJ equipment including Pioneer CDJs, professional mixers, high-quality sound systems, and lighting equipment. All equipment is regularly maintained and tested.",
      },
      {
        q: "Do you need specific power requirements?",
        a: "We typically need standard power outlets (220V/240V). For larger events, we may require dedicated circuits. We'll discuss power requirements during the booking consultation.",
      },
      {
        q: "How long does setup take?",
        a: "Setup typically takes 1-2 hours depending on the package and venue. We arrive early to ensure everything is ready before your event starts.",
      },
    ],
  },
  {
    category: "Payment & Pricing",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept bank transfers, credit/debit cards via Stripe, and PayPal. A deposit is required to secure your booking, with the balance due before or on the event date.",
      },
      {
        q: "Are there any hidden fees?",
        a: "No hidden fees! All pricing is transparent. Additional charges only apply for extended hours, extra travel distance, or special custom requests, which are discussed upfront.",
      },
      {
        q: "Do you offer discounts for multiple events?",
        a: "Yes! We offer package deals for multiple bookings. Contact us to discuss bulk booking discounts.",
      },
    ],
  },
  {
    category: "General",
    questions: [
      {
        q: "Do you have public liability insurance?",
        a: "Yes, we carry full public liability insurance. Certificates can be provided upon request.",
      },
      {
        q: "Can you provide references or testimonials?",
        a: "Absolutely! Check out our testimonials page or contact us for references from previous clients.",
      },
      {
        q: "Do you play at weddings?",
        a: "Yes! We provide DJ services for weddings, private parties, corporate events, clubs, festivals, and more. Contact us to discuss your specific event.",
      },
    ],
  },
];

export default function FAQ() {
  return (
    <>
      <MetaTagsComponent
        title="FAQ | DJ Danny Hectic B"
        description="Frequently asked questions about DJ services, bookings, pricing, and more."
        url="/faq"
      />
      <div className="min-h-screen bg-background text-foreground pt-14">
        {/* Hero Section */}
        <section className="border-b border-foreground px-4 py-12 md:py-20">
          <div className="container max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-black uppercase mb-6 tracking-tighter">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about booking DJ Danny Hectic B for your event.
            </p>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-12 md:py-20 px-4">
          <div className="container max-w-4xl mx-auto">
            {faqs.map((category) => (
              <div key={category.category} className="mb-12">
                <h2 className="text-3xl font-black uppercase mb-6 border-b border-foreground pb-4">
                  {category.category}
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, idx) => (
                    <AccordionItem key={idx} value={`${category.category}-${idx}`}>
                      <AccordionTrigger className="text-left font-bold">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </section>

        {/* Still Have Questions */}
        <section className="py-12 md:py-20 px-4 border-t border-foreground bg-muted/10">
          <div className="container max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-black uppercase mb-6">
              Still Have Questions?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Can't find what you're looking for? Get in touch and we'll be happy to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/contact" className="inline-block">
                <button className="px-6 py-3 bg-foreground text-background hover:bg-accent hover:text-foreground uppercase font-bold transition-colors">
                  Contact Us
                </button>
              </a>
              <a href="/book-danny" className="inline-block">
                <button className="px-6 py-3 border border-foreground hover:bg-foreground hover:text-background uppercase font-bold transition-colors">
                  Book Now
                </button>
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

