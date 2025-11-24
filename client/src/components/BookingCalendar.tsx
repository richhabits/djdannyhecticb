import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Calendar, ChevronLeft, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, isPast } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BookingCalendarProps {
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date | null;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export function BookingCalendar({
  onDateSelect,
  selectedDate,
  minDate = new Date(),
  maxDate,
  className,
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  // Calculate date range for API call (current month + 1 month ahead)
  const startDate = startOfMonth(currentMonth);
  const endDate = endOfMonth(addMonths(currentMonth, 1));

  const { data: availableDates, isLoading } = trpc.calendar.getAvailableDates.useQuery(
    { startDate, endDate },
    { enabled: true }
  );

  const availableDatesSet = new Set(
    availableDates?.map(d => new Date(d).toISOString().split('T')[0]) || []
  );

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handleDateClick = (date: Date) => {
    if (isPast(date) && !isToday(date)) {
      toast.error("Cannot select past dates");
      return;
    }

    const dateStr = date.toISOString().split('T')[0];
    if (!availableDatesSet.has(dateStr)) {
      toast.error("This date is not available");
      return;
    }

    onDateSelect?.(date);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const isDateAvailable = (date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    return availableDatesSet.has(dateStr);
  };

  const isDateSelected = (date: Date): boolean => {
    return selectedDate ? isSameDay(date, selectedDate) : false;
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get first day of week for the month
  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array(firstDayOfWeek).fill(null);

  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold">Select Date</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevMonth}
              disabled={isLoading}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              disabled={isLoading}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <XCircle className="w-3 h-3 text-red-500" />
            <span>Unavailable</span>
          </div>
        </div>

        {/* Calendar Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
          </div>
        ) : (
          <div className="space-y-2">
            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {emptyDays.map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square" />
              ))}
              {daysInMonth.map((date) => {
                const dateStr = date.toISOString().split('T')[0];
                const available = isDateAvailable(date);
                const selected = isDateSelected(date);
                const isPastDate = isPast(date) && !isToday(date);
                const today = isToday(date);

                return (
                  <button
                    key={dateStr}
                    onClick={() => handleDateClick(date)}
                    onMouseEnter={() => setHoveredDate(date)}
                    onMouseLeave={() => setHoveredDate(null)}
                    disabled={!available || isPastDate}
                    className={cn(
                      "aspect-square rounded-lg text-sm font-medium transition-all",
                      "hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50",
                      today && "ring-2 ring-purple-500",
                      selected && "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
                      !selected && available && !isPastDate && "hover:bg-purple-100 dark:hover:bg-purple-900",
                      !available && "bg-muted text-muted-foreground",
                      isPastDate && "opacity-30"
                    )}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <span>{format(date, 'd')}</span>
                      {available && !isPastDate && (
                        <CheckCircle2 className="w-3 h-3 mt-0.5 text-green-500" />
                      )}
                      {!available && (
                        <XCircle className="w-3 h-3 mt-0.5 text-red-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected date info */}
        {selectedDate && (
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Selected: <span className="font-medium text-foreground">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
