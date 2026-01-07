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

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { MetaTagsComponent } from "@/components/MetaTags";
import { Calendar, MapPin, Mail, Phone, Building } from "lucide-react";

export default function BookingsPage() {
  const [formData, setFormData] = useState({
    name: "",
    org: "",
    email: "",
    phone: "",
    type: "club" as const,
    location: "",
    date: "",
    time: "",
    budgetMin: "",
    budgetMax: "",
    source: "",
  });

  const createBooking = trpc.bookingsPhase7.create.useMutation({
    onSuccess: () => {
      toast.success("Booking request submitted! We'll get back to you soon.");
      setFormData({
        name: "",
        org: "",
        email: "",
        phone: "",
        type: "club",
        location: "",
        date: "",
        time: "",
        budgetMin: "",
        budgetMax: "",
        source: "",
      });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to submit booking";
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBooking.mutate(formData);
  };

  return (
    <>
      <MetaTagsComponent
        title="Book DJ Danny Hectic B - Events & Performances"
        description="Book DJ Danny Hectic B for your club, radio show, private party, corporate event, or podcast"
        url="/bookings"
      />
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Book Danny Hectic B</h1>
          <p className="text-muted-foreground text-lg">
            Ready to bring the Hectic energy to your event? Fill out the form below and we'll get back to you.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Booking Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Your Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="org">Organization</Label>
                  <Input
                    id="org"
                    value={formData.org}
                    onChange={(e) => setFormData({ ...formData, org: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="type">Event Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="club">Club Night</SelectItem>
                    <SelectItem value="radio">Radio Show</SelectItem>
                    <SelectItem value="private">Private Party</SelectItem>
                    <SelectItem value="corporate">Corporate Event</SelectItem>
                    <SelectItem value="podcast">Podcast/Guest Feature</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Event Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time">Event Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budgetMin">Budget Range (Min)</Label>
                  <Input
                    id="budgetMin"
                    value={formData.budgetMin}
                    onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                    placeholder="e.g. £500"
                  />
                </div>
                <div>
                  <Label htmlFor="budgetMax">Budget Range (Max)</Label>
                  <Input
                    id="budgetMax"
                    value={formData.budgetMax}
                    onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                    placeholder="e.g. £2000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="source">How did you find us?</Label>
                <Input
                  id="source"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder="Instagram, friend, etc."
                />
              </div>

              <Button type="submit" className="w-full" disabled={createBooking.isPending}>
                {createBooking.isPending ? "Submitting..." : "Submit Booking Request"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

