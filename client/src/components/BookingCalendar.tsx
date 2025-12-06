/**
 * Real-time Booking Calendar Component
 * Shows availability and allows booking selection
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin } from "lucide-react";
import { format, addDays, isSameDay, isPast, startOfDay } from "date-fns";
import { trpc } from "@/lib/trpc";

interface BookingSlot {
  id: number;
  startTime: Date;
  endTime: Date;
  available: boolean;
  eventId?: number;
}

interface BookingCalendarProps {
  onSlotSelect?: (slot: BookingSlot) => void;
  minDaysAhead?: number;
  maxDaysAhead?: number;
}

export function BookingCalendar({
  onSlotSelect,
  minDaysAhead = 7,
  maxDaysAhead = 60,
}: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(new Date(), minDaysAhead));
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);

  // Fetch existing bookings for the selected date range
  const { data: bookings } = trpc.events.bookings.list.useQuery(
    {
      startDate: selectedDate.toISOString(),
      endDate: addDays(selectedDate, 7).toISOString(),
    },
    { enabled: !!selectedDate }
  );

  // Generate time slots for the selected date
  const generateTimeSlots = (date: Date): BookingSlot[] => {
    const slots: BookingSlot[] = [];
    const startHour = 10; // 10 AM
    const endHour = 22; // 10 PM
    const slotDuration = 2; // 2 hours

    for (let hour = startHour; hour < endHour; hour += slotDuration) {
      const startTime = new Date(date);
      startTime.setHours(hour, 0, 0, 0);
      const endTime = new Date(startTime);
      endTime.setHours(hour + slotDuration, 0, 0, 0);

      // Check if slot conflicts with existing bookings
      const isBooked = bookings?.some((booking) => {
        const bookingStart = new Date(booking.startTime);
        const bookingEnd = new Date(booking.endTime);
        return (
          (startTime >= bookingStart && startTime < bookingEnd) ||
          (endTime > bookingStart && endTime <= bookingEnd) ||
          (startTime <= bookingStart && endTime >= bookingEnd)
        );
      });

      slots.push({
        id: slots.length,
        startTime,
        endTime,
        available: !isBooked && !isPast(startTime),
      });
    }

    return slots;
  };

  const timeSlots = generateTimeSlots(selectedDate);
  const availableSlots = timeSlots.filter((slot) => slot.available);

  const handleSlotSelect = (slot: BookingSlot) => {
    setSelectedSlot(slot);
    onSlotSelect?.(slot);
  };

  const formatTime = (date: Date) => format(date, "h:mm a");
  const formatDate = (date: Date) => format(date, "EEEE, MMMM d, yyyy");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Select Booking Time
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Select Date</label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Array.from({ length: maxDaysAhead - minDaysAhead }).map((_, i) => {
              const date = addDays(new Date(), minDaysAhead + i);
              const isSelected = isSameDay(date, selectedDate);
              const isDisabled = isPast(startOfDay(date));

              return (
                <Button
                  key={i}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => !isDisabled && setSelectedDate(date)}
                  disabled={isDisabled}
                  className="min-w-[100px]"
                >
                  <div className="text-center">
                    <div className="text-xs">{format(date, "EEE")}</div>
                    <div className="text-lg font-semibold">{format(date, "d")}</div>
                    <div className="text-xs">{format(date, "MMM")}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Info */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="font-semibold mb-2">{formatDate(selectedDate)}</div>
          <div className="text-sm text-muted-foreground">
            {availableSlots.length} available time slots
          </div>
        </div>

        {/* Time Slots */}
        <div>
          <label className="text-sm font-medium mb-2 block">Available Times</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {timeSlots.map((slot) => (
              <Button
                key={slot.id}
                variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                onClick={() => slot.available && handleSlotSelect(slot)}
                disabled={!slot.available}
                className="flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
              </Button>
            ))}
          </div>
        </div>

        {selectedSlot && (
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="font-semibold mb-2">Selected Slot</div>
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(selectedSlot.startTime)}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
