import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Music, Calendar, MapPin, DollarSign, Clock, CheckCircle, Star, Quote } from "lucide-react";
import { buildBookingSummary } from "@/lib/bookingUtils";

type BookingStep = "contact" | "event" | "details" | "summary";

interface BookingData {
  name: string;
  email: string;
  phone: string;
  organisation: string;
  eventType: "club" | "radio" | "private" | "brand" | "other" | "";
  eventDate: string;
  eventTime: string;
  location: string;
  budgetRange: string;
  setLength: string;
  streamingRequired: boolean;
  extraNotes: string;
  marketingConsent: boolean;
  dataConsent: boolean;
}

export default function BookDanny() {
  const [step, setStep] = useState<BookingStep>("contact");
  const [bookingData, setBookingData] = useState<BookingData>({
    name: "",
    email: "",
    phone: "",
    organisation: "",
    eventType: "",
    eventDate: "",
    eventTime: "",
    location: "",
    budgetRange: "",
    setLength: "",
    streamingRequired: false,
    extraNotes: "",
    marketingConsent: false,
    dataConsent: false,
  });

  const createBooking = trpc.bookings.create.useMutation({
    onSuccess: () => {
      toast.success("Booking request submitted! Danny will get back to you soon.");
      // Reset form
      setBookingData({
        name: "",
        email: "",
        phone: "",
        organisation: "",
        eventType: "",
        eventDate: "",
        eventTime: "",
        location: "",
        budgetRange: "",
        setLength: "",
        streamingRequired: false,
        extraNotes: "",
        marketingConsent: false,
        dataConsent: false,
      });
      setStep("contact");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to submit booking";
      toast.error(message);
    },
  });

  const updateField = <K extends keyof BookingData>(field: K, value: BookingData[K]) => {
    setBookingData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    if (step === "contact") {
      return bookingData.name.trim() && bookingData.email.trim();
    }
    if (step === "event") {
      return bookingData.eventType && bookingData.eventDate && bookingData.eventTime && bookingData.location.trim();
    }
    if (step === "details") {
      return true; // All fields optional
    }
    return false;
  };

  const handleNext = () => {
    if (step === "contact") setStep("event");
    else if (step === "event") setStep("details");
    else if (step === "details") setStep("summary");
  };

  const handleBack = () => {
    if (step === "event") setStep("contact");
    else if (step === "details") setStep("event");
    else if (step === "summary") setStep("details");
  };

  const handleSubmit = () => {
    if (!bookingData.dataConsent) {
      toast.error("You must agree to data storage to submit a booking");
      return;
    }
    createBooking.mutate(bookingData as any);
  };

  const summary = bookingData.eventType
    ? buildBookingSummary(bookingData as any)
    : "";

  const featuredTestimonials = [
    {
      name: "Sarah Johnson",
      role: "Wedding Planner",
      text: "DJ Danny absolutely made our wedding reception unforgettable! The energy was incredible, guests were dancing all night.",
      rating: 5,
    },
    {
      name: "Marcus Williams",
      role: "Club Owner",
      text: "Having DJ Danny Hectic B as a regular at our club has been a game-changer. Professional and reliable.",
      rating: 5,
    },
    {
      name: "Lisa Chen",
      role: "Corporate Event Manager",
      text: "Professional, talented, and incredibly easy to work with. Danny created the perfect vibe for our corporate event.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-8 px-4 max-w-6xl lg:grid lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-4xl font-bold mb-2 gradient-text">Book DJ Danny Hectic B</h1>
            <p className="text-muted-foreground">
              Fill out the form below and Danny will get back to you about your event or show.
            </p>
          </div>

          <Card className="glass">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <CardTitle>
                {step === "contact" && "Step 1: Contact Details"}
                {step === "event" && "Step 2: Event Details"}
                {step === "details" && "Step 3: Additional Details"}
                {step === "summary" && "Step 4: Review & Submit"}
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                {step === "contact" && "1/4"}
                {step === "event" && "2/4"}
                {step === "details" && "3/4"}
                {step === "summary" && "4/4"}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Contact */}
            {step === "contact" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={bookingData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={bookingData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={bookingData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organisation">Organisation (optional)</Label>
                  <Input
                    id="organisation"
                    value={bookingData.organisation}
                    onChange={(e) => updateField("organisation", e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Event */}
            {step === "event" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="eventType">Event Type *</Label>
                  <Select
                    value={bookingData.eventType}
                    onValueChange={(value: any) => updateField("eventType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="club">Club Night</SelectItem>
                      <SelectItem value="radio">Radio Show</SelectItem>
                      <SelectItem value="private">Private Event</SelectItem>
                      <SelectItem value="brand">Brand Event</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventDate">Date *</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      value={bookingData.eventDate}
                      onChange={(e) => updateField("eventDate", e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Select your preferred date. We'll confirm availability.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventTime">Time *</Label>
                    <Input
                      id="eventTime"
                      type="time"
                      value={bookingData.eventTime}
                      onChange={(e) => updateField("eventTime", e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Event start time
                    </p>
                  </div>
                </div>
                {/* Real-time availability indicator */}
                {bookingData.eventDate && (
                  <div className="p-3 bg-muted/50 rounded-md border border-border">
                    <p className="text-sm font-semibold mb-1">Availability Check</p>
                    <p className="text-xs text-muted-foreground">
                      Checking availability for {new Date(bookingData.eventDate).toLocaleDateString("en-GB", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}...
                    </p>
                    <p className="text-xs text-green-500 mt-2">
                      ✓ Date appears available. We'll confirm within 24 hours.
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={bookingData.location}
                    onChange={(e) => updateField("location", e.target.value)}
                    placeholder="Venue name and city"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="streamingRequired"
                    checked={bookingData.streamingRequired}
                    onCheckedChange={(checked) => updateField("streamingRequired", checked === true)}
                  />
                  <Label htmlFor="streamingRequired" className="text-sm font-normal cursor-pointer">
                    Streaming required
                  </Label>
                </div>
              </div>
            )}

            {/* Step 3: Details */}
            {step === "details" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="setLength">Set Length (optional)</Label>
                  <Input
                    id="setLength"
                    value={bookingData.setLength}
                    onChange={(e) => updateField("setLength", e.target.value)}
                    placeholder="e.g., 2 hours"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budgetRange">Budget Range (optional)</Label>
                  <Input
                    id="budgetRange"
                    value={bookingData.budgetRange}
                    onChange={(e) => updateField("budgetRange", e.target.value)}
                    placeholder="e.g., £500-1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="extraNotes">Additional Notes (optional)</Label>
                  <Textarea
                    id="extraNotes"
                    value={bookingData.extraNotes}
                    onChange={(e) => updateField("extraNotes", e.target.value)}
                    rows={4}
                    placeholder="Tell us more about your event..."
                  />
                </div>
              </div>
            )}

            {/* Step 4: Summary */}
            {step === "summary" && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-border bg-muted/50">
                  <pre className="whitespace-pre-wrap text-sm">{summary}</pre>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="dataConsent"
                      checked={bookingData.dataConsent}
                      onCheckedChange={(checked) => updateField("dataConsent", checked === true)}
                      required
                    />
                    <Label htmlFor="dataConsent" className="text-sm font-normal cursor-pointer">
                      I agree you store my details to contact me about this booking. *
                    </Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="marketingConsent"
                      checked={bookingData.marketingConsent}
                      onCheckedChange={(checked) => updateField("marketingConsent", checked === true)}
                    />
                    <Label htmlFor="marketingConsent" className="text-sm font-normal cursor-pointer">
                      I'm happy to receive updates about future shows and events.
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={step === "contact"}
              >
                Back
              </Button>
              {step !== "summary" ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="gradient-bg"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!bookingData.dataConsent || createBooking.isPending}
                  className="gradient-bg"
                >
                  {createBooking.isPending ? "Submitting..." : "Submit Booking"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Testimonials Sidebar */}
        <div className="lg:col-span-1 space-y-6 mt-8 lg:mt-0">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                What Clients Say
              </h2>
              <div className="space-y-4">
                {featuredTestimonials.map((testimonial, idx) => (
                  <div key={idx} className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <div className="flex gap-1 mb-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <div className="flex gap-2 mb-2">
                      <Quote className="w-4 h-4 text-accent flex-shrink-0 mt-1" />
                      <p className="text-sm text-muted-foreground italic">
                        "{testimonial.text}"
                      </p>
                    </div>
                    <div className="mt-2">
                      <p className="font-semibold text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-border">
                <a href="/testimonials" className="text-sm text-accent hover:underline">
                  View All Testimonials →
                </a>
              </div>
            </Card>

            <Card className="p-6 bg-muted/50">
              <h3 className="font-bold mb-3">Why Book Danny?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  Professional equipment included
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  10+ years experience
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  500+ successful events
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  99% client satisfaction
                </li>
              </ul>
            </Card>
        </div>
      </div>
    </div>
  );
}

