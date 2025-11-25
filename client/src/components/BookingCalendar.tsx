import React, { useState, useCallback, useMemo } from 'react';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isPast, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, MapPin, Users, DollarSign, Loader2, Check, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

interface BookingFormData {
  eventName: string;
  eventDate: string;
  eventLocation: string;
  eventType: 'wedding' | 'club' | 'private' | 'corporate' | 'radio' | 'streaming';
  guestCount?: number;
  budget?: string;
  description?: string;
  contactEmail: string;
  contactPhone?: string;
  slots: TimeSlot[];
  musicGenres?: string[];
  specialRequests?: string;
}

const servicePackages = {
  wedding: { name: 'Wedding Premium', price: 1500, duration: '8 hours' },
  club: { name: 'Club Night', price: 500, duration: '4 hours' },
  private: { name: 'Private Party', price: 800, duration: '5 hours' },
  corporate: { name: 'Corporate Event', price: 2000, duration: '6 hours' },
  radio: { name: 'Radio Show Mix', price: 200, duration: '1 hour' },
  streaming: { name: 'Live Stream Set', price: 300, duration: '2 hours' },
};

const musicGenres = ['House', 'Garage', 'Soulful House', 'Funky House', 'Grime', 'Amapiano', 'Hip Hop', 'R&B', 'Dancehall', 'Afrobeats'];

export default function BookingCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    eventName: '',
    eventDate: '',
    eventLocation: '',
    eventType: 'private',
    contactEmail: '',
    slots: [],
    musicGenres: [],
  });
  
  // Fetch availability data
  const { data: availability, isLoading: loadingAvailability, refetch: refetchAvailability } = trpc.bookingCalendar.getAvailability.useQuery({
    startDate: format(startOfMonth(currentMonth), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(currentMonth), 'yyyy-MM-dd'),
  }, {
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    cacheTime: 10 * 60 * 1000,
  });

  // Check slot availability
  const checkSlotMutation = trpc.bookingCalendar.checkSlotAvailability.useMutation();
  
  // Create booking mutation
  const createBookingMutation = trpc.bookingCalendar.createBooking.useMutation({
    onSuccess: (data) => {
      if (data.payment?.clientSecret) {
        // Redirect to Stripe payment
        handleStripePayment(data.payment.clientSecret);
      } else {
        toast.success('Booking created successfully!');
        setBookingDialogOpen(false);
        refetchAvailability();
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create booking');
    },
  });

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Get availability for a specific date
  const getDateAvailability = useCallback((date: Date) => {
    if (!availability) return { isAvailable: false, hasBookings: false };
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayAvailability = availability.availability?.filter((a: any) => a.date === dateStr) || [];
    const dayBookings = availability.bookedSlots?.filter((b: any) => b.date === dateStr) || [];
    const blockedDate = availability.blockedDates?.some((b: any) => 
      dateStr >= b.startDate && dateStr <= b.endDate
    );
    
    return {
      isAvailable: dayAvailability.length > 0 && !blockedDate,
      hasBookings: dayBookings.length > 0,
      slots: dayAvailability,
      bookings: dayBookings,
    };
  }, [availability]);

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    if (isPast(date) && !isToday(date)) {
      toast.error('Cannot book past dates');
      return;
    }
    
    setSelectedDate(date);
    const dateAvailability = getDateAvailability(date);
    
    if (!dateAvailability.isAvailable) {
      toast.error('This date is not available for booking');
      return;
    }
    
    // Show available time slots for the selected date
    setFormData(prev => ({
      ...prev,
      eventDate: format(date, 'yyyy-MM-dd'),
    }));
  };

  // Handle Stripe payment
  const handleStripePayment = async (clientSecret: string) => {
    const stripe = await stripePromise;
    if (!stripe) return;
    
    // This would typically redirect to a payment page or open a modal
    toast.info('Redirecting to payment...');
    // Implementation would use Stripe's confirmCardPayment or redirect to checkout
  };

  // Navigate months
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => 
      direction === 'prev' 
        ? new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
        : new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  // Submit booking
  const handleBookingSubmit = async () => {
    if (!formData.eventName || !formData.eventDate || !formData.eventLocation || !formData.contactEmail) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (selectedSlots.length === 0) {
      toast.error('Please select at least one time slot');
      return;
    }
    
    const bookingData = {
      ...formData,
      slots: selectedSlots,
    };
    
    createBookingMutation.mutate(bookingData);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-6 h-6" />
            Book DJ Danny Hectic B
          </CardTitle>
          <CardDescription>
            Select your event date and time to check availability
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {format(currentMonth, 'MMMM yyyy')}
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingAvailability ? (
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-sm font-medium text-muted-foreground">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar days */}
                  <div className="grid grid-cols-7 gap-2">
                    {/* Empty cells for alignment */}
                    {Array.from({ length: calendarDays[0].getDay() }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    
                    {/* Calendar days */}
                    {calendarDays.map(date => {
                      const dateAvailability = getDateAvailability(date);
                      const isSelected = selectedDate && isSameDay(date, selectedDate);
                      const isPastDate = isPast(date) && !isToday(date);
                      
                      return (
                        <button
                          key={date.toISOString()}
                          onClick={() => handleDateSelect(date)}
                          disabled={isPastDate || !dateAvailability.isAvailable}
                          className={`
                            relative p-3 border rounded-lg transition-all
                            ${isSelected ? 'border-primary bg-primary/10' : 'border-border'}
                            ${isPastDate ? 'opacity-50 cursor-not-allowed' : ''}
                            ${!dateAvailability.isAvailable && !isPastDate ? 'bg-gray-100 cursor-not-allowed' : ''}
                            ${dateAvailability.isAvailable && !isPastDate ? 'hover:border-primary hover:bg-primary/5 cursor-pointer' : ''}
                            ${isToday(date) ? 'ring-2 ring-primary ring-offset-2' : ''}
                          `}
                        >
                          <div className="text-sm font-medium">{format(date, 'd')}</div>
                          
                          {/* Availability indicators */}
                          <div className="flex gap-1 mt-1 justify-center">
                            {dateAvailability.isAvailable && (
                              <div className="w-2 h-2 rounded-full bg-green-500" title="Available" />
                            )}
                            {dateAvailability.hasBookings && (
                              <div className="w-2 h-2 rounded-full bg-orange-500" title="Partially booked" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
              
              {/* Legend */}
              <div className="mt-6 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span>Partially Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-300" />
                  <span>Unavailable</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Details */}
        <div className="space-y-4">
          {selectedDate ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Available time slots */}
                    <div>
                      <h4 className="font-medium mb-2">Available Time Slots</h4>
                      <div className="space-y-2">
                        {getDateAvailability(selectedDate).slots?.map((slot: any, idx: number) => (
                          <Button
                            key={idx}
                            variant={selectedSlots.some(s => 
                              s.date === slot.date && 
                              s.startTime === slot.startTime
                            ) ? "default" : "outline"}
                            className="w-full justify-between"
                            onClick={() => {
                              const newSlot = {
                                date: slot.date,
                                startTime: slot.startTime,
                                endTime: slot.endTime,
                                available: true,
                              };
                              
                              setSelectedSlots(prev => {
                                const exists = prev.some(s => 
                                  s.date === slot.date && 
                                  s.startTime === slot.startTime
                                );
                                
                                if (exists) {
                                  return prev.filter(s => 
                                    !(s.date === slot.date && s.startTime === slot.startTime)
                                  );
                                } else {
                                  return [...prev, newSlot];
                                }
                              });
                            }}
                          >
                            <span className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {slot.startTime} - {slot.endTime}
                            </span>
                            {selectedSlots.some(s => 
                              s.date === slot.date && 
                              s.startTime === slot.startTime
                            ) && <Check className="w-4 h-4" />}
                          </Button>
                        )) || (
                          <p className="text-sm text-muted-foreground">
                            No time slots available for this date
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Existing bookings */}
                    {getDateAvailability(selectedDate).bookings?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Already Booked</h4>
                        <div className="space-y-1">
                          {getDateAvailability(selectedDate).bookings.map((booking: any, idx: number) => (
                            <div key={idx} className="text-sm text-muted-foreground">
                              {booking.startTime} - {booking.endTime}: {booking.eventName}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedSlots.length > 0 && (
                      <Button 
                        onClick={() => setBookingDialogOpen(true)}
                        className="w-full"
                      >
                        Continue Booking ({selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''})
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Service Packages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(servicePackages).map(([key, pkg]) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <div>
                          <div className="font-medium">{pkg.name}</div>
                          <div className="text-muted-foreground">{pkg.duration}</div>
                        </div>
                        <Badge variant="secondary">£{pkg.price}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Select a date to view available time slots</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Your Booking</DialogTitle>
            <DialogDescription>
              Fill in your event details to confirm your booking
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Selected slots summary */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Selected: {selectedDate && format(selectedDate, 'MMMM d, yyyy')} - {selectedSlots.length} time slot(s)
              </AlertDescription>
            </Alert>

            {/* Event details */}
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eventName">Event Name *</Label>
                  <Input
                    id="eventName"
                    value={formData.eventName}
                    onChange={(e) => setFormData(prev => ({ ...prev, eventName: e.target.value }))}
                    placeholder="John's Birthday Party"
                  />
                </div>
                <div>
                  <Label htmlFor="eventType">Event Type *</Label>
                  <Select
                    value={formData.eventType}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, eventType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(servicePackages).map(([key, pkg]) => (
                        <SelectItem key={key} value={key}>
                          {pkg.name} - £{pkg.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="eventLocation">Event Location *</Label>
                <Input
                  id="eventLocation"
                  value={formData.eventLocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, eventLocation: e.target.value }))}
                  placeholder="123 Party Street, London, SW1A 1AA"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="guestCount">Number of Guests</Label>
                  <Input
                    id="guestCount"
                    type="number"
                    value={formData.guestCount || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, guestCount: parseInt(e.target.value) }))}
                    placeholder="100"
                  />
                </div>
                <div>
                  <Label htmlFor="budget">Budget</Label>
                  <Input
                    id="budget"
                    value={formData.budget || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                    placeholder="£1500-2000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactEmail">Email Address *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="contactPhone">Phone Number</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={formData.contactPhone || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    placeholder="+44 7123 456789"
                  />
                </div>
              </div>

              <div>
                <Label>Music Genres</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {musicGenres.map(genre => (
                    <Badge
                      key={genre}
                      variant={formData.musicGenres?.includes(genre) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          musicGenres: prev.musicGenres?.includes(genre)
                            ? prev.musicGenres.filter(g => g !== genre)
                            : [...(prev.musicGenres || []), genre],
                        }));
                      }}
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Additional Information</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Tell us more about your event..."
                  rows={4}
                />
              </div>
            </div>

            {/* Price summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Price Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{servicePackages[formData.eventType].name}</span>
                    <span className="font-medium">£{servicePackages[formData.eventType].price}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Duration</span>
                    <span>{servicePackages[formData.eventType].duration}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Time Slots</span>
                    <span>{selectedSlots.length}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>£{servicePackages[formData.eventType].price}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBookingSubmit}
              disabled={createBookingMutation.isLoading}
            >
              {createBookingMutation.isLoading && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Proceed to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}