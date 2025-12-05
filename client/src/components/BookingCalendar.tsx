import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { format, isSameDay, startOfMonth, endOfMonth } from "date-fns";
import { Calendar as CalendarIcon, Clock, X } from "lucide-react";

export function BookingCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const startDate = startOfMonth(selectedDate || new Date());
  const endDate = endOfMonth(selectedDate || new Date());

  const { data: availability } = trpc.bookingCalendar.availability.useQuery({
    startDate,
    endDate,
  });

  const getDateAvailability = (date: Date) => {
    return availability?.find((avail) => isSameDay(new Date(avail.date), date));
  };

  const isDateBlocked = (date: Date) => {
    const avail = getDateAvailability(date);
    return avail?.isBlocked || false;
  };

  const isDateAvailable = (date: Date) => {
    const avail = getDateAvailability(date);
    return avail?.isAvailable && !avail.isBlocked;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <CalendarIcon className="w-5 h-5" />
        <h2 className="text-2xl font-bold">Booking Availability</h2>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < new Date() || isDateBlocked(date)}
            className="rounded-md border"
          />
        </div>
        
        <div>
          {selectedDate && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </h3>
                {isDateBlocked(selectedDate) ? (
                  <div className="flex items-center gap-2 text-destructive">
                    <X className="w-4 h-4" />
                    <span>Not Available</span>
                  </div>
                ) : isDateAvailable(selectedDate) ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Clock className="w-4 h-4" />
                    <span>Available</span>
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    Check availability for this date
                  </div>
                )}
              </div>
              
              {selectedDate && !isDateBlocked(selectedDate) && (
                <Button className="w-full" size="lg">
                  Book This Date
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
