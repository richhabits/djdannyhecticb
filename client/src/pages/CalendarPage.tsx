import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookingCalendar, exportToGoogleCalendar, exportToAppleCalendar } from "@/components/BookingCalendar";
import { MetaTagsComponent } from "@/components/MetaTags";
import { ArrowLeft, Calendar, Download } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleExportGoogle = () => {
    if (!selectedDate) return;
    exportToGoogleCalendar({
      title: "DJ Danny Hectic B - Booking Inquiry",
      date: selectedDate,
      description: "Booking inquiry for DJ services",
    });
  };

  const handleExportApple = () => {
    if (!selectedDate) return;
    exportToAppleCalendar({
      title: "DJ Danny Hectic B - Booking Inquiry",
      date: selectedDate,
      description: "Booking inquiry for DJ services",
    });
  };

  return (
    <>
      <MetaTagsComponent
        title="Booking Calendar | DJ Danny Hectic B"
        description="Check availability and book DJ Danny Hectic B for your event"
        url="/calendar"
      />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50">
          <div className="container flex items-center justify-between h-16">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              <span className="font-semibold">Booking Calendar</span>
            </div>
            <Link href="/bookings">
              <Button variant="outline" size="sm">Book Now</Button>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="container py-12">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <BookingCalendar
                onSelectDate={(date, slot) => {
                  setSelectedDate(date);
                }}
              />
            </div>
            
            <div className="space-y-6">
              <Card className="p-6 glass">
                <h3 className="font-bold text-lg mb-4">Export to Calendar</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add your booking inquiry to your personal calendar as a reminder.
                </p>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={handleExportGoogle}
                    disabled={!selectedDate}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Add to Google Calendar
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={handleExportApple}
                    disabled={!selectedDate}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Add to Apple Calendar
                  </Button>
                </div>
                {selectedDate && (
                  <p className="text-sm text-accent mt-4">
                    Selected: {format(selectedDate, "MMMM d, yyyy")}
                  </p>
                )}
              </Card>

              <Card className="p-6 glass">
                <h3 className="font-bold text-lg mb-4">Booking Info</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-medium">Response Time</p>
                    <p className="text-muted-foreground">Within 24 hours</p>
                  </div>
                  <div>
                    <p className="font-medium">Minimum Notice</p>
                    <p className="text-muted-foreground">2 weeks in advance</p>
                  </div>
                  <div>
                    <p className="font-medium">Deposit Required</p>
                    <p className="text-muted-foreground">50% to secure date</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
