/**
 * Technical Rider / Requirements Page
 * Shows technical requirements for bookings
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetaTagsComponent } from "@/components/MetaTags";
import { Music, Mic, Monitor, Headphones, Zap, Wifi } from "lucide-react";

export default function Rider() {
  return (
    <>
      <MetaTagsComponent
        title="Technical Rider - DJ Danny Hectic B"
        description="Technical requirements and rider for DJ Danny Hectic B bookings"
        url="/rider"
      />
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Technical Rider</h1>
          <p className="text-muted-foreground">
            Technical requirements for DJ Danny Hectic B performances
          </p>
        </div>

        <div className="space-y-6">
          {/* Audio Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Audio Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">DJ Equipment</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Professional DJ mixer (Pioneer DJM-900NXS2 or equivalent)</li>
                  <li>2x CDJ-2000NXS2 or equivalent CD players</li>
                  <li>Or DJ controller (Pioneer DDJ-1000 or equivalent)</li>
                  <li>Laptop stand (if using controller)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Sound System</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Professional PA system suitable for venue capacity</li>
                  <li>Subwoofers for bass frequencies</li>
                  <li>Monitor speakers (2x floor monitors or in-ear monitors)</li>
                  <li>Sound engineer for sound check and live mixing</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Microphone Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Microphone Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Wireless handheld microphone (Shure SM58 or equivalent)</li>
                <li>Backup wired microphone</li>
                <li>Microphone stand</li>
                <li>Sound check time for microphone levels</li>
              </ul>
            </CardContent>
          </Card>

          {/* Stage Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Stage Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>DJ booth/table (minimum 6ft x 3ft)</li>
                <li>Stable, level surface</li>
                <li>Adequate lighting for DJ area</li>
                <li>Power outlets (2x dedicated circuits, 220V)</li>
                <li>Backup power source recommended</li>
              </ul>
            </CardContent>
          </Card>

          {/* Additional Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Additional Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Internet & Connectivity</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Stable WiFi connection for streaming (if required)</li>
                  <li>Ethernet connection preferred for live streams</li>
                  <li>Minimum upload speed: 5 Mbps</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Hospitality</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Green room or private area for preparation</li>
                  <li>Refreshments (water, soft drinks)</li>
                  <li>Meal provided for events over 4 hours</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Timing</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Sound check: 2 hours before performance</li>
                  <li>Setup time: 1 hour before performance</li>
                  <li>Breakdown time: 30 minutes after performance</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Questions?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                For questions about technical requirements or to discuss custom setups, please contact us.
              </p>
              <a href="/contact" className="text-primary hover:underline">
                Contact Us →
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
