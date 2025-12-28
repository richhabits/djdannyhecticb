import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Music, Star, Quote, Users } from "lucide-react";
import { Link } from "wouter";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Wedding Planner",
      event: "Summer Wedding Reception",
      rating: 5,
      text: "DJ Danny absolutely made our wedding reception unforgettable! The energy was incredible, guests were dancing all night, and he perfectly read the crowd. Highly recommend!",
      image: "👰",
    },
    {
      name: "Marcus Williams",
      role: "Club Owner",
      event: "Weekly Friday Night",
      rating: 5,
      text: "Having DJ Danny Hectic B as a regular at our club has been a game-changer. His garage and house sets bring the best crowd, and he's always professional and reliable.",
      image: "🎧",
    },
    {
      name: "Lisa Chen",
      role: "Corporate Event Manager",
      event: "Tech Company Launch Party",
      rating: 5,
      text: "Professional, talented, and incredibly easy to work with. Danny created the perfect vibe for our corporate event. Our CEO even asked for his contact info!",
      image: "💼",
    },
    {
      name: "James Brown",
      role: "Festival Organizer",
      event: "Summer Music Festival",
      rating: 5,
      text: "Danny's performance at our festival was one of the highlights of the year. His technical skills and music selection were impeccable. Already booked him for next year!",
      image: "🎪",
    },
    {
      name: "Emma Davis",
      role: "Private Event Host",
      event: "Birthday Celebration",
      rating: 5,
      text: "Amazing DJ! He took requests, mixed seamlessly, and kept the energy high throughout the night. Everyone's still talking about how great the music was!",
      image: "🎉",
    },
    {
      name: "David Thompson",
      role: "Bar Manager",
      event: "Weekly Residency",
      rating: 5,
      text: "Consistent quality, great selection, and always on time. DJ Danny is a true professional. Our customers specifically request nights when he's spinning.",
      image: "🍸",
    },
    {
      name: "Rachel Green",
      role: "Event Coordinator",
      event: "Charity Gala",
      rating: 5,
      text: "Exceeded all expectations! Danny's professionalism and musical expertise elevated our charity event. We raised more funds than ever before!",
      image: "🎭",
    },
    {
      name: "Tom Wilson",
      role: "Venue Manager",
      event: "New Year's Eve Party",
      rating: 5,
      text: "Best DJ we've ever had! The crowd was electric, the transitions were smooth, and he handled the high-energy atmosphere perfectly. Booking him again!",
      image: "🎆",
    },
  ];

  const stats = [
    { label: "Client Satisfaction", value: "99%", icon: "😊" },
    { label: "Events Completed", value: "1000+", icon: "🎉" },
    { label: "5-Star Reviews", value: "500+", icon: "⭐" },
    { label: "Years of Experience", value: "30+", icon: "🏆" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <Music className="w-6 h-6" />
            <span className="font-bold">DJ Danny Hectic B</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/about" className="text-sm hover:text-accent">About</Link>
            <Link href="/history" className="text-sm hover:text-accent">History</Link>
            <Link href="/bookings" className="text-sm hover:text-accent">Bookings</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-orange-900/20 to-background border-b border-border">
        <div className="container">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">What Clients Say</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Join hundreds of satisfied clients who've experienced DJ Danny Hectic B's incredible performances.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <Card key={idx} className="p-6 text-center">
                <div className="text-4xl mb-4">{stat.icon}</div>
                <p className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </p>
                <p className="text-muted-foreground">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-16 md:py-24 border-t border-border">
        <div className="container">
          <h2 className="text-4xl font-bold mb-12 text-center">Client Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, idx) => (
              <Card
                key={idx}
                className="p-8 hover:border-accent transition border-border/50 flex flex-col"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Quote */}
                <div className="flex gap-3 mb-6">
                  <Quote className="w-6 h-6 text-orange-400 flex-shrink-0" />
                  <p className="text-lg text-muted-foreground italic flex-1">
                    "{testimonial.text}"
                  </p>
                </div>

                {/* Author */}
                <div className="mt-auto pt-6 border-t border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{testimonial.image}</div>
                    <div>
                      <p className="font-bold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      <p className="text-xs text-orange-400 font-semibold mt-1">
                        {testimonial.event}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 border-t border-border bg-gradient-to-r from-orange-900/20 to-amber-900/20">
        <div className="container max-w-3xl text-center space-y-6">
          <h2 className="text-4xl font-bold">Ready to Create Your Event's Story?</h2>
          <p className="text-lg text-muted-foreground">
            Join our growing list of satisfied clients. Book DJ Danny Hectic B for your next event.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/bookings">
              <Button className="bg-gradient-to-r from-orange-600 to-amber-600 px-8 py-6 text-lg">
                Book Now
              </Button>
            </Link>
            <Link href="/live-studio">
              <Button variant="outline" className="px-8 py-6 text-lg">
                Watch Live
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 border-t border-border">
        <div className="container max-w-3xl">
          <h2 className="text-4xl font-bold mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "How far in advance should I book?",
                a: "We recommend booking 2-3 months in advance for major events, but we can accommodate last-minute bookings depending on availability.",
              },
              {
                q: "What's your cancellation policy?",
                a: "Cancellations made 30+ days before the event receive a full refund. Cancellations within 30 days are subject to a 50% fee.",
              },
              {
                q: "Do you provide your own equipment?",
                a: "Yes! We bring professional-grade turntables, mixers, and sound systems. We can also work with your venue's existing equipment if preferred.",
              },
              {
                q: "Can you play requests?",
                a: "Absolutely! We love taking requests and reading the crowd. Feel free to suggest tracks, and we'll work them into the set.",
              },
              {
                q: "What's your typical set length?",
                a: "Standard bookings are 4-6 hours, but we can customize based on your event needs. Longer sets available upon request.",
              },
              {
                q: "Do you have experience with my event type?",
                a: "We've performed at weddings, corporate events, clubs, festivals, private parties, and more. Check our testimonials for examples!",
              },
            ].map((faq, idx) => (
              <details key={idx} className="group border border-border rounded-lg">
                <summary className="flex cursor-pointer items-center justify-between p-6 font-semibold hover:bg-card/50">
                  {faq.q}
                  <span className="transition group-open:rotate-180">▼</span>
                </summary>
                <div className="px-6 pb-6 text-muted-foreground border-t border-border">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
