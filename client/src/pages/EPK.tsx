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
import { Card } from "@/components/ui/card";
import { Music, Download } from "lucide-react";
import { Link } from "wouter";

export default function EPK() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 glass-dark backdrop-blur-xl border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Music className="w-6 h-6 text-accent" />
            <span className="font-bold">DJ Danny Hectic B</span>
          </Link>
        </div>
      </header>
      <section className="py-20">
        <div className="container max-w-4xl text-center">
          <h1 className="text-6xl font-bold mb-6">
            <span className="gradient-text">Electronic Press Kit</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Professional media assets and information for promoters and media.
          </p>
          <Button size="lg" className="gradient-bg">
            <Download className="w-5 h-5 mr-2" />
            Download EPK
          </Button>
        </div>
      </section>
    </div>
  );
}
