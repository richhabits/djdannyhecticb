import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, isBefore, startOfDay } from "date-fns";

type AvailabilityStatus = "available" | "busy" | "tentative" | "unavailable";

interface BookingSlot {
  date: Date;
  status: AvailabilityStatus;
  event?: {
    title: string;
    location: string;
    time: string;
  };
}

// Mock availability data (in production, fetch from API)
const generateMockAvailability = (startDate: Date): BookingSlot[] => {
  const slots: BookingSlot[] = [];
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(startDate),
    end: endOfMonth(startDate),
  });

  daysInMonth.forEach(day => {
    const dayOfWeek = day.getDay();
    const random = Math.random();
    
    // Weekends more likely to be busy
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      if (random > 0.6) {
        slots.push({
          date: day,
          status: "busy",
          event: {
            title: random > 0.8 ? "Club Night" : "Private Event",
            location: random > 0.7 ? "London" : "Birmingham",
            time: "22:00 - 04:00",
          },
        });
      } else if (random > 0.3) {
        slots.push({ date: day, status: "tentative" });
      } else {
        slots.push({ date: day, status: "available" });
      }
    } else {
      // Weekdays more likely available
      if (random > 0.85) {
        slots.push({
          date: day,
          status: "busy",
          event: {
            title: "Radio Show",
            location: "Hectic Studio",
            time: "19:00 - 22:00",
          },
        });
      } else if (random > 0.7) {
        slots.push({ date: day, status: "tentative" });
      } else {
        slots.push({ date: day, status: "available" });
      }
    }
  });

  return slots;
};

const statusColors: Record<AvailabilityStatus, string> = {
  available: "bg-green-500/20 text-green-500 border-green-500/50",
  busy: "bg-red-500/20 text-red-500 border-red-500/50",
  tentative: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50",
  unavailable: "bg-gray-500/20 text-gray-500 border-gray-500/50",
};

const statusLabels: Record<AvailabilityStatus, string> = {
  available: "Available",
  busy: "Booked",
  tentative: "Tentative",
  unavailable: "Unavailable",
};

interface BookingCalendarProps {
  onSelectDate?: (date: Date, slot: BookingSlot) => void;
  className?: string;
}

export function BookingCalendar({ onSelectDate, className }: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  const availability = useMemo(() => {
    return generateMockAvailability(currentMonth);
  }, [currentMonth]);

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getSlotForDay = (day: Date): BookingSlot | undefined => {
    return availability.find(slot => isSameDay(slot.date, day));
  };

  const handleSelectDate = (day: Date) => {
    const slot = getSlotForDay(day);
    if (slot && slot.status !== "unavailable" && !isBefore(day, startOfDay(new Date()))) {
      setSelectedDate(day);
      onSelectDate?.(day, slot);
    }
  };

  const selectedSlot = selectedDate ? getSlotForDay(selectedDate) : null;
  const hoveredSlot = hoveredDate ? getSlotForDay(hoveredDate) : null;

  return (
    <Card className={cn("p-6 glass", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold">Booking Calendar</h3>
          <p className="text-sm text-muted-foreground">Check availability and book your date</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-semibold min-w-32 text-center">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
        
        {/* Empty cells for days before the 1st */}
        {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        
        {daysInMonth.map(day => {
          const slot = getSlotForDay(day);
          const isPast = isBefore(day, startOfDay(new Date()));
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isHovered = hoveredDate && isSameDay(day, hoveredDate);
          
          return (
            <button
              key={day.toISOString()}
              onClick={() => handleSelectDate(day)}
              onMouseEnter={() => setHoveredDate(day)}
              onMouseLeave={() => setHoveredDate(null)}
              disabled={isPast || slot?.status === "unavailable"}
              className={cn(
                "aspect-square rounded-lg border transition-all relative group",
                isPast && "opacity-40 cursor-not-allowed",
                !isPast && slot?.status && statusColors[slot.status],
                !isPast && !slot && "bg-green-500/20 text-green-500 border-green-500/50",
                isToday(day) && "ring-2 ring-accent ring-offset-2 ring-offset-background",
                isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                !isPast && "hover:scale-105 cursor-pointer"
              )}
            >
              <span className="text-sm font-medium">{format(day, "d")}</span>
              {slot?.event && (
                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-current" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-border">
        {Object.entries(statusLabels).map(([status, label]) => (
          <div key={status} className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", statusColors[status as AvailabilityStatus].split(" ")[0])} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Selected/Hovered date info */}
      {(selectedSlot || hoveredSlot) && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent" />
            <span className="font-semibold">
              {format(selectedDate || hoveredDate!, "EEEE, MMMM d, yyyy")}
            </span>
          </div>
          
          {(selectedSlot || hoveredSlot)?.event ? (
            <div className="bg-card/50 rounded-lg p-4 space-y-2">
              <p className="font-semibold">{(selectedSlot || hoveredSlot)?.event?.title}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {(selectedSlot || hoveredSlot)?.event?.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {(selectedSlot || hoveredSlot)?.event?.location}
                </span>
              </div>
            </div>
          ) : (selectedSlot || hoveredSlot)?.status === "available" ? (
            <div className="flex items-center gap-2 text-green-500">
              <Check className="w-5 h-5" />
              <span>This date is available for booking!</span>
            </div>
          ) : (selectedSlot || hoveredSlot)?.status === "tentative" ? (
            <div className="flex items-center gap-2 text-yellow-500">
              <Clock className="w-5 h-5" />
              <span>This date is tentatively available - contact for confirmation</span>
            </div>
          ) : null}

          {(selectedSlot || hoveredSlot)?.status === "available" && selectedDate && (
            <Button className="w-full gradient-bg">
              Request This Date
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

// Widget version for embedding
export function BookingCalendarWidget({ className }: { className?: string }) {
  return (
    <div className={className}>
      <BookingCalendar
        onSelectDate={(date, slot) => {
          console.log("Selected:", date, slot);
        }}
      />
    </div>
  );
}

// Export to Google Calendar
export function exportToGoogleCalendar(event: {
  title: string;
  date: Date;
  endDate?: Date;
  location?: string;
  description?: string;
}) {
  const formatDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  
  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", event.title);
  url.searchParams.set("dates", `${formatDate(event.date)}/${formatDate(event.endDate || new Date(event.date.getTime() + 3600000))}`);
  if (event.location) url.searchParams.set("location", event.location);
  if (event.description) url.searchParams.set("details", event.description);
  
  window.open(url.toString(), "_blank");
}

// Export to Apple Calendar (ICS file)
export function exportToAppleCalendar(event: {
  title: string;
  date: Date;
  endDate?: Date;
  location?: string;
  description?: string;
}) {
  const formatDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//DJ Danny Hectic B//Booking Calendar//EN",
    "BEGIN:VEVENT",
    `DTSTART:${formatDate(event.date)}`,
    `DTEND:${formatDate(event.endDate || new Date(event.date.getTime() + 3600000))}`,
    `SUMMARY:${event.title}`,
    event.location ? `LOCATION:${event.location}` : "",
    event.description ? `DESCRIPTION:${event.description}` : "",
    `UID:${Date.now()}@djdannyhecticb.com`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
  
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${event.title.replace(/\s+/g, "_")}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}

export default BookingCalendar;
