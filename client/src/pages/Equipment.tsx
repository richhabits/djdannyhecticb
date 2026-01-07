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

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetaTagsComponent } from "@/components/MetaTags";
import { Music, Headphones, Radio, Mic2, Disc, Settings } from "lucide-react";

const equipmentCategories = [
  {
    name: "DJ Controllers",
    icon: Music,
    items: [
      {
        name: "Pioneer DJ CDJ-3000",
        description: "Professional multi-player with large touchscreen display",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2670",
      },
      {
        name: "Pioneer DJ DJM-900NXS2",
        description: "4-channel professional mixer with advanced effects",
        image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2670",
      },
      {
        name: "Pioneer DJ RMX-1000",
        description: "Professional remix station for live remixing",
        image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2670",
      },
    ],
  },
  {
    name: "Audio Equipment",
    icon: Headphones,
    items: [
      {
        name: "Yamaha HS8 Studio Monitors",
        description: "8-inch powered studio monitors for accurate sound reproduction",
        image: "https://images.unsplash.com/photo-1603048588665-791ca8aea616?q=80&w=2670",
      },
      {
        name: "Audio-Technica ATH-M50x",
        description: "Professional studio monitoring headphones",
        image: "https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?q=80&w=2676",
      },
      {
        name: "Focusrite Scarlett 18i20",
        description: "18-in/20-out USB audio interface",
        image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=2670",
      },
    ],
  },
  {
    name: "Lighting & Visuals",
    icon: Radio,
    items: [
      {
        name: "Chauvet DJ Intimidator Spot 350",
        description: "Moving head LED light with 350W output",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2670",
      },
      {
        name: "ADJ Mega Par Profile",
        description: "RGBW LED par light for stage and club lighting",
        image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2670",
      },
    ],
  },
  {
    name: "Microphones",
    icon: Mic2,
    items: [
      {
        name: "Shure SM58",
        description: "Industry-standard dynamic vocal microphone",
        image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2670",
      },
      {
        name: "Rode NT1-A",
        description: "Large-diaphragm condenser microphone for studio recording",
        image: "https://images.unsplash.com/photo-1603048588665-791ca8aea616?q=80&w=2670",
      },
    ],
  },
  {
    name: "Vinyl Collection",
    icon: Disc,
    items: [
      {
        name: "Technics SL-1200MK7",
        description: "Professional direct-drive turntable",
        image: "https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?q=80&w=2676",
      },
      {
        name: "Extensive Vinyl Library",
        description: "Thousands of rare and classic garage, house, and UKG records",
        image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=2670",
      },
    ],
  },
  {
    name: "Software & Production",
    icon: Settings,
    items: [
      {
        name: "Ableton Live 11 Suite",
        description: "Professional DAW for production and live performance",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2670",
      },
      {
        name: "Serato DJ Pro",
        description: "Professional DJ software with advanced features",
        image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2670",
      },
      {
        name: "Native Instruments Komplete",
        description: "Comprehensive collection of virtual instruments and effects",
        image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2670",
      },
    ],
  },
];

export default function Equipment() {
  return (
    <>
      <MetaTagsComponent
        title="Equipment & Gear | DJ Danny Hectic B"
        description="Professional DJ equipment, audio gear, lighting, and production setup used by DJ Danny Hectic B."
        url="/equipment"
      />
      <div className="min-h-screen bg-background text-foreground pt-14">
        {/* Hero Section */}
        <section className="border-b border-foreground px-4 py-12 md:py-20">
          <div className="container max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-black uppercase mb-6 tracking-tighter">
              Equipment & Gear
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional-grade equipment and gear used for live performances, studio work, and production.
            </p>
          </div>
        </section>

        {/* Equipment Categories */}
        <section className="py-12 md:py-20 px-4">
          <div className="container max-w-6xl mx-auto">
            {equipmentCategories.map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.name} className="mb-16">
                  <div className="flex items-center gap-3 mb-8">
                    <Icon className="w-8 h-8 text-accent" />
                    <h2 className="text-3xl md:text-4xl font-black uppercase">
                      {category.name}
                    </h2>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {category.items.map((item, idx) => (
                      <Card key={idx} className="overflow-hidden">
                        <div className="aspect-video bg-black relative">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all"
                          />
                        </div>
                        <CardHeader>
                          <CardTitle>{item.name}</CardTitle>
                          <CardDescription>{item.description}</CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Setup Info */}
        <section className="py-12 md:py-20 px-4 border-t border-foreground bg-muted/10">
          <div className="container max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black uppercase mb-8 text-center">
              Professional Setup
            </h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-lg text-muted-foreground mb-4">
                  All equipment is professionally maintained and regularly updated to ensure the highest quality performance. 
                  The setup is optimized for both live club performances and studio production work.
                </p>
                <p className="text-lg text-muted-foreground">
                  For custom setup requirements or equipment specifications for your event, please contact us during the booking process.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}

