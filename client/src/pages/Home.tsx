import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Music, Mic2, Calendar, Radio, Zap, Users } from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl">DJ Danny Hectic B</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/about" className="text-sm hover:text-accent transition">About</Link>
            <Link href="/history" className="text-sm hover:text-accent transition">History</Link>
            <Link href="/mixes" className="text-sm hover:text-accent transition">Mixes</Link>
            <Link href="/events" className="text-sm hover:text-accent transition">Events</Link>
            <Link href="/live-studio" className="text-sm hover:text-accent transition">Live Studio</Link>
            <Link href="/podcasts" className="text-sm hover:text-accent transition">Podcast</Link>
            {isAuthenticated ? (
              <>
                <Link href="/bookings" className="text-sm hover:text-accent transition">Bookings</Link>
                <Link href="/dashboard" className="text-sm hover:text-accent transition">Dashboard</Link>
              </>
            ) : (
              <a href={getLoginUrl()} className="text-sm hover:text-accent transition">Login</a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-900/20 via-background to-background py-20 md:py-32">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center space-y-6">
            <div className="inline-block">
              <span className="px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/50 text-sm text-purple-300">
                🎵 Welcome to the Beat
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              DJ Danny Hectic B
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience electrifying beats, live studio sessions, and exclusive mixes. Book your next event or tune in to the latest podcast episodes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/live-studio">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Zap className="w-4 h-4 mr-2" />
                  Watch Live Studio
                </Button>
              </Link>
              <Link href="/mixes">
                <Button size="lg" variant="outline">
                  <Music className="w-4 h-4 mr-2" />
                  Explore Mixes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24 border-t border-border">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What's Inside</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 hover:border-accent transition">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                <Music className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Free Mixes</h3>
              <p className="text-muted-foreground">Discover curated mixes and exclusive tracks from the studio.</p>
            </Card>

            <Card className="p-6 hover:border-accent transition">
              <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Live Studio</h3>
              <p className="text-muted-foreground">Watch live studio sessions with real-time camera feeds.</p>
            </Card>

            <Card className="p-6 hover:border-accent transition">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                <Mic2 className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Podcast</h3>
              <p className="text-muted-foreground">Listen to episodes on all major streaming platforms.</p>
            </Card>

            <Card className="p-6 hover:border-accent transition">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Events</h3>
              <p className="text-muted-foreground">Check out upcoming performances and special events.</p>
            </Card>

            <Card className="p-6 hover:border-accent transition">
              <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center mb-4">
                <Radio className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Book DJ Services</h3>
              <p className="text-muted-foreground">Hire DJ Danny for your next event or celebration.</p>
            </Card>

            <Card className="p-6 hover:border-accent transition">
              <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Community</h3>
              <p className="text-muted-foreground">Connect with fans and stay updated on all the latest.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* Featured Mixes Section */}
      <section className="py-16 md:py-24 border-t border-border">
        <div className="container">
          <h2 className="text-4xl font-bold mb-12">Featured Mixes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { title: "Garage Classics Mix", duration: "60 min", icon: "🎵", genre: "Garage" },
              { title: "Soulful House Journey", duration: "75 min", icon: "💫", genre: "Soulful House" },
              { title: "Amapiano Vibes", duration: "55 min", icon: "🎶", genre: "Amapiano" },
            ].map((mix, idx) => (
              <Card key={idx} className="p-6 hover:border-accent transition cursor-pointer">
                <div className="text-6xl mb-4">{mix.icon}</div>
                <h3 className="text-xl font-bold mb-2">{mix.title}</h3>
                <p className="text-sm text-purple-400 font-semibold mb-3">{mix.genre}</p>
                <p className="text-sm text-muted-foreground mb-4">Duration: {mix.duration}</p>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600">Play Mix</Button>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Link href="/mixes">
              <Button variant="outline">Explore All Mixes</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-t border-border">
        <div className="container max-w-3xl text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Book?</h2>
          <p className="text-lg text-muted-foreground">
            Get DJ Danny Hectic B for your next event. Professional, energetic, and unforgettable performances.
          </p>
          {isAuthenticated ? (
            <Link href="/bookings">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
                Create Booking Request
              </Button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
                Sign In to Book
              </Button>
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card/50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">DJ Danny Hectic B</h4>
              <p className="text-sm text-muted-foreground">Creating unforgettable musical experiences.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold">Quick Links</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li><Link href="/mixes" className="hover:text-accent">Mixes</Link></li>
                <li><Link href="/events" className="hover:text-accent">Events</Link></li>
                <li><Link href="/podcasts" className="hover:text-accent">Podcast</Link></li>
                <li><Link href="/testimonials" className="hover:text-accent">Reviews</Link></li>
                <li><Link href="/gallery" className="hover:text-accent">Gallery</Link></li>
                <li><Link href="/blog" className="hover:text-accent">Blog</Link></li>
                <li><Link href="/tutorials" className="hover:text-accent">Tutorials</Link></li>
                <li><Link href="/shop" className="hover:text-accent">Shop</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-accent">Instagram</a></li>
                <li><a href="#" className="hover:text-accent">Spotify</a></li>
                <li><a href="#" className="hover:text-accent">SoundCloud</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/contact" className="hover:text-accent">Contact Us</Link></li>
                <li><a href="mailto:contact@djdannyhectic.com" className="hover:text-accent">Email</a></li>
                <li><a href="tel:+15551234567" className="hover:text-accent">Phone</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 DJ Danny Hectic B. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
