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

import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { format, addMonths, isSameDay } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface BookingCalendarProps {
    onSelect: (date: Date) => void;
    selected?: Date;
}

export function BookingCalendar({ onSelect, selected }: BookingCalendarProps) {
    const [month, setMonth] = useState<Date>(new Date());

    // Fetch events for the current and next month to show availability
    const { data: events } = trpc.events.all.useQuery();
    const { data: bookings } = trpc.bookings.list.useQuery();

    const unavailableDates = [
        ...(events?.map(e => new Date(e.eventDate)) || []),
        ...(bookings?.filter(b => b.status === 'confirmed').map(b => new Date(b.eventDate)) || [])
    ];

    const isUnavailable = (date: Date) => {
        return unavailableDates.some(d => isSameDay(d, date));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Select Available Date *</label>
                <div className="flex gap-2">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider px-1">
                        <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5" /> Booked
                    </Badge>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider px-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5" /> Available
                    </Badge>
                </div>
            </div>

            <div className="p-3 rounded-xl border border-orange-500/20 bg-card/30 backdrop-blur-sm">
                <Calendar
                    mode="single"
                    selected={selected}
                    onSelect={(date) => date && onSelect(date)}
                    disabled={(date) => date < new Date() || isUnavailable(date)}
                    className="rounded-md"
                    modifiers={{
                        booked: (date) => isUnavailable(date),
                    }}
                    modifiersClassNames={{
                        booked: "bg-red-500/20 text-red-400 line-through opacity-50",
                    }}
                />
            </div>

            {selected && (
                <p className="text-sm text-accent font-medium">
                    Selected: {format(selected, "PPP")}
                </p>
            )}
        </div>
    );
}
