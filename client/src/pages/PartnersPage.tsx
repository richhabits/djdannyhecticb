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
import { Handshake, Users, Music, Radio, Sparkles } from "lucide-react";

export default function PartnersPage() {
  const [formData, setFormData] = useState({
    name: "",
    brandName: "",
    email: "",
    links: {} as Record<string, string>,
    collabType: "guest_mix" as const,
    pitch: "",
  });

  const { data: partners } = trpc.partners.list.useQuery({ activeOnly: true });
  const createRequest = trpc.partners.requests.create.useMutation({
    onSuccess: () => {
      toast.success("Partnership request submitted! We'll review and get back to you.");
      setFormData({
        name: "",
        brandName: "",
        email: "",
        links: {},
        collabType: "guest_mix",
        pitch: "",
      });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to submit request";
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRequest.mutate(formData);
  };

  return (
    <>
      <MetaTagsComponent
        title="Partners & Collaborations - Hectic Radio"
        description="Partner with Danny Hectic B and Hectic Radio for guest mixes, co-hosted events, brand drops, and more"
        url="/partners"
      />
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Partners & Collaborations</h1>
          <p className="text-muted-foreground text-lg">
            Let's work together to create something Hectic
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Handshake className="h-5 w-5" />
                Collaboration Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Music className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold">Guest Mixes</h3>
                  <p className="text-sm text-muted-foreground">Feature your mix on Hectic Radio</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold">Co-Hosted Events</h3>
                  <p className="text-sm text-muted-foreground">Collaborate on live events and takeovers</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold">Brand Drops</h3>
                  <p className="text-sm text-muted-foreground">Integrate DreamSpire, RichHabits, or merch</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Radio className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold">Hectic Radio Takeovers</h3>
                  <p className="text-sm text-muted-foreground">Take over the airwaves for a special show</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Apply to Partner</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <Label htmlFor="brandName">Brand/Organization Name</Label>
                  <Input
                    id="brandName"
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  />
                </div>
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
                  <Label htmlFor="collabType">Collaboration Type *</Label>
                  <Select
                    value={formData.collabType}
                    onValueChange={(value: any) => setFormData({ ...formData, collabType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guest_mix">Guest Mix</SelectItem>
                      <SelectItem value="co_host">Co-Hosted Event</SelectItem>
                      <SelectItem value="brand_drop">Brand Drop</SelectItem>
                      <SelectItem value="takeover">Radio Takeover</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="pitch">Your Pitch *</Label>
                  <Textarea
                    id="pitch"
                    value={formData.pitch}
                    onChange={(e) => setFormData({ ...formData, pitch: e.target.value })}
                    rows={4}
                    required
                    placeholder="Tell us about your idea, your brand, and why we should collaborate..."
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createRequest.isPending}>
                  {createRequest.isPending ? "Submitting..." : "Submit Partnership Request"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {partners && partners.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Our Partners</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {partners.map((partner) => (
                <Card key={partner.id}>
                  <CardContent className="p-6 text-center">
                    {partner.logoUrl && (
                      <img src={partner.logoUrl} alt={partner.brandName || partner.name} className="h-16 mx-auto mb-4" />
                    )}
                    <h3 className="font-semibold">{partner.brandName || partner.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{partner.type}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

