/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { Button } from "@/components/ui/button";
import { Phone, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const HOTLINE_NUMBER = "07957 432842";
const HOTLINE_E164 = "+447957432842";
const HOTLINE_WHATSAPP = "447957432842";
const WHATSAPP_MESSAGE = encodeURIComponent("Yo Danny, I'm locked in on Hectic Radio!");

interface HecticHotlineProps {
  variant?: "default" | "compact";
  className?: string;
}

export function HecticHotline({ variant = "default", className }: HecticHotlineProps) {
  const whatsappUrl = `https://wa.me/${HOTLINE_WHATSAPP}?text=${WHATSAPP_MESSAGE}`;
  const callUrl = `tel:${HOTLINE_E164}`;

  if (variant === "compact") {
    return (
      <div className={cn("flex flex-col sm:flex-row items-center gap-2", className)}>
        <span className="text-sm font-medium text-foreground">
          Hectic Hotline: <span className="text-accent font-bold">{HOTLINE_NUMBER}</span>
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gradient-bg hover-lift"
            asChild
          >
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-4 h-4 mr-1" />
              WhatsApp
            </a>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="hover-lift"
            asChild
          >
            <a href={callUrl}>
              <Phone className="w-4 h-4 mr-1" />
              Call
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="text-center">
        <h3 className="text-2xl md:text-3xl font-bold mb-2">
          <span className="gradient-text">Hectic Hotline</span>
        </h3>
        <p className="text-xl md:text-2xl font-semibold text-foreground">
          {HOTLINE_NUMBER}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Call or WhatsApp Danny directly
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          size="lg"
          className="gradient-bg hover-lift flex-1 sm:flex-initial"
          asChild
        >
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-5 h-5 mr-2" />
            Chat on WhatsApp
          </a>
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="hover-lift flex-1 sm:flex-initial"
          asChild
        >
          <a href={callUrl}>
            <Phone className="w-5 h-5 mr-2" />
            Call Now
          </a>
        </Button>
      </div>
    </div>
  );
}

