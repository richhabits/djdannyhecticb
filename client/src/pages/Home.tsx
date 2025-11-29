import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Music, Mic2, Calendar, Radio, Zap, Users, Menu, X, Download } from "lucide-react";
import { useState } from "react";
import { APP_LOGO } from "@/const";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { ShoutForm } from "@/components/ShoutForm";
import { ShoutList } from "@/components/ShoutList";
import { HecticHotline } from "@/components/HecticHotline";
import { LockedInCounter } from "@/components/LockedInCounter";
import { TrackRequests } from "@/components/TrackRequests";
import { NowPlaying } from "@/components/NowPlaying";
import { ShowSchedule } from "@/components/ShowSchedule";
import { SocialLinks } from "@/components/SocialLinks";
import { SocialShareBar } from "@/components/SocialShareBar";
import { MetaTagsComponent } from "@/components/MetaTags";
import { DannyStatus } from "@/components/DannyStatus";
import { HeroVideo } from "@/components/HeroVideo";
import { HecticFeed } from "@/components/HecticFeed";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: activeStream } = trpc.streams.active.useQuery(undefined, { retry: false });

  return (
    <>
      <MetaTagsComponent
        title="DJ Danny Hectic B | Hectic Radio"
        description="Lock in with DJ Danny Hectic B on Hectic Radio. Listen live, request tracks, send shouts, and connect with the crew."
        url="/"
        type="website"
      />
      <div className="min-h-screen bg-background text-foreground">
      {/* Hero Video Section */}
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <HeroVideo
          videoUrl={import.meta.env.VITE_HERO_VIDEO_URL}
          className="absolute inset-0"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-background" />
        <div className="container relative z-10 h-full flex flex-col justify-end pb-12">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white">
              <span className="gradient-text">DJ Danny Hectic B</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-6">
              Building the biggest radio community in the UK. Lock in and vibe with the crew.
            </p>
            <DannyStatus />
          </div>
        </div>
      </section>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-dark backdrop-blur-xl border-b border-border">
        <div className="container flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 smooth-transition">
            <img src={APP_LOGO} alt="DJ Danny Hectic B" className="w-10 h-10 md:w-12 md:h-12 rounded-full" />
            <span className="font-bold text-lg md:text-xl gradient-text">DJ Danny Hectic B</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <Link href="/about" className="text-sm hover:text-accent smooth-transition">About</Link>
            <Link href="/history" className="text-sm hover:text-accent smooth-transition">History</Link>
            <Link href="/mixes" className="text-sm hover:text-accent smooth-transition">Mixes</Link>
            <Link href="/events" className="text-sm hover:text-accent smooth-transition">Events</Link>
            <Link href="/live-studio" className="text-sm hover:text-accent smooth-transition">Live Studio</Link>
            <Link href="/podcasts" className="text-sm hover:text-accent smooth-transition">Podcast</Link>
            {isAuthenticated ? (
              <>
                <Link href="/bookings" className="text-sm hover:text-accent smooth-transition">Bookings</Link>
                <Link href="/dashboard">
                  <Button size="sm" className="gradient-bg">Dashboard</Button>
                </Link>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="sm" className="gradient-bg">Login</Button>
              </a>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-accent/10 rounded-lg smooth-transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border glass-dark">
            <div className="container py-4 space-y-3">
              <Link href="/about" className="block py-2 hover:text-accent smooth-transition" onClick={() => setMobileMenuOpen(false)}>About</Link>
              <Link href="/history" className="block py-2 hover:text-accent smooth-transition" onClick={() => setMobileMenuOpen(false)}>History</Link>
              <Link href="/mixes" className="block py-2 hover:text-accent smooth-transition" onClick={() => setMobileMenuOpen(false)}>Mixes</Link>
              <Link href="/events" className="block py-2 hover:text-accent smooth-transition" onClick={() => setMobileMenuOpen(false)}>Events</Link>
              <Link href="/live-studio" className="block py-2 hover:text-accent smooth-transition" onClick={() => setMobileMenuOpen(false)}>Live Studio</Link>
              <Link href="/podcasts" className="block py-2 hover:text-accent smooth-transition" onClick={() => setMobileMenuOpen(false)}>Podcast</Link>
              {isAuthenticated ? (
                <>
                  <Link href="/bookings" className="block py-2 hover:text-accent smooth-transition" onClick={() => setMobileMenuOpen(false)}>Bookings</Link>
                  <Link href="/dashboard" className="block py-2 hover:text-accent smooth-transition" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                </>
              ) : (
                <a href={getLoginUrl()} className="block py-2 hover:text-accent smooth-transition">Login</a>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-900/20 via-background to-background py-16 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-amber-500/5 to-orange-700/5" />
        <div className="container relative z-10">
          <div className="text-center space-y-6 md:space-y-8 px-4">
            <div className="inline-block">
              <span className="px-4 py-2 rounded-full glass border border-accent/50 text-sm text-accent font-semibold">
                🎵 Cultural Fusion • Professional DJ
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight">
              <span className="gradient-text">DJ Danny Hectic B</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              30+ years shaping UK Garage • House • Grime • Amapiano. From pirate radio to the biggest stages.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 px-4">
              <Link href="/live-studio" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto gradient-bg hover-lift text-base md:text-lg py-6 px-8">
                  <Zap className="w-5 h-5 mr-2" />
                  Watch Live Studio
                </Button>
              </Link>
              <Link href="/mixes" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto hover-lift text-base md:text-lg py-6 px-8">
                  <Music className="w-5 h-5 mr-2" />
                  Explore Mixes
                </Button>
              </Link>
            </div>
            
            {/* Hectic Hotline */}
            <div className="mt-8 md:mt-12 px-4">
              <HecticHotline />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 md:py-24 border-t border-border">
        <div className="container px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-8 md:mb-12"><span className="gradient-text">What's Inside</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <Card className="p-6 md:p-8 glass hover-lift">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center mb-4">
                <Music className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2">Free Mixes</h3>
              <p className="text-sm md:text-base text-muted-foreground">Discover curated mixes and exclusive tracks from the studio.</p>
            </Card>

            <Card className="p-6 md:p-8 glass hover-lift">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center mb-4">
                <Zap className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2">Live Studio</h3>
              <p className="text-sm md:text-base text-muted-foreground">Watch live studio sessions with real-time camera feeds.</p>
            </Card>

            <Card className="p-6 md:p-8 glass hover-lift">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-600/20 to-amber-700/20 flex items-center justify-center mb-4">
                <Mic2 className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2">Podcast</h3>
              <p className="text-sm md:text-base text-muted-foreground">Listen to episodes on all major streaming platforms.</p>
            </Card>

            <Card className="p-6 md:p-8 glass hover-lift">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-700/20 to-orange-500/20 flex items-center justify-center mb-4">
                <Calendar className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2">Events</h3>
              <p className="text-sm md:text-base text-muted-foreground">Check out upcoming performances and special events.</p>
            </Card>

            <Card className="p-6 md:p-8 glass hover-lift">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-600/20 flex items-center justify-center mb-4">
                <Radio className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2">Book DJ Services</h3>
              <p className="text-sm md:text-base text-muted-foreground">Hire DJ Danny for your next event or celebration.</p>
            </Card>

            <Card className="p-6 md:p-8 glass hover-lift">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-600/20 to-orange-700/20 flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2">Community</h3>
              <p className="text-sm md:text-base text-muted-foreground">Connect with fans and stay updated on all the latest.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Mixes Section */}
      <section className="py-12 md:py-24 border-t border-border">
        <div className="container px-4">
          <h2 className="text-3xl md:text-5xl font-bold mb-8 md:mb-12"><span className="gradient-text">Featured Mixes</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            {[
              { title: "Garage Classics Mix", duration: "60 min", icon: "🎵", genre: "Garage" },
              { title: "Soulful House Journey", duration: "75 min", icon: "💫", genre: "Soulful House" },
              { title: "Amapiano Vibes", duration: "55 min", icon: "🎶", genre: "Amapiano" },
            ].map((mix, idx) => (
              <Card key={idx} className="p-6 md:p-8 glass hover-lift cursor-pointer">
                <div className="text-5xl md:text-6xl mb-4">{mix.icon}</div>
                <h3 className="text-xl md:text-2xl font-bold mb-2">{mix.title}</h3>
                <p className="text-sm text-accent font-semibold mb-3">{mix.genre}</p>
                <p className="text-sm text-muted-foreground mb-4">Duration: {mix.duration}</p>
                <Button className="w-full gradient-bg hover-lift">Play Mix</Button>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Link href="/mixes">
              <Button variant="outline" size="lg" className="hover-lift">Explore All Mixes</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Shoutbox Section */}
      <section className="py-12 md:py-24 border-t border-border bg-gradient-to-b from-background to-card/30">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                <span className="gradient-text">Send a Shout</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                Connect with Danny and the Hectic Radio crew. Send your message, request a track, and get locked in!
              </p>
              <div className="flex justify-center mb-4">
                <LockedInCounter />
              </div>
              {activeStream && (
                <p className="text-sm text-muted-foreground text-center">
                  Currently streaming: <span className="font-semibold text-accent">{activeStream.name}</span>
                </p>
              )}
              {!activeStream && (
                <p className="text-sm text-muted-foreground text-center">
                  Stream not configured.
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ShoutForm />
              <ShoutList />
            </div>
            
            {/* Track Requests */}
            <div className="mb-8">
              <TrackRequests />
              <div className="mt-4">
                <SocialShareBar
                  url="/live"
                  title="Hectic Radio - Track Requests"
                  description="Vote for your favorite tracks and see what's trending on Hectic Radio!"
                  className="justify-center"
                />
              </div>
            </div>
            
            {/* Now Playing & Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <NowPlaying />
              <ShowSchedule />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24 bg-gradient-to-r from-orange-900/30 to-amber-900/30 border-t border-border">
        <div className="container max-w-3xl text-center space-y-6 px-4">
          <h2 className="text-3xl md:text-5xl font-bold"><span className="gradient-text">Ready to Book?</span></h2>
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
              <p className="text-sm text-muted-foreground mb-3">Creating unforgettable musical experiences.</p>
              <a
                href="/hectic-contact.vcf"
                download="DJ Danny Hectic B.vcf"
                className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors"
              >
                <Download className="w-4 h-4" />
                Save HECTIC as a contact
              </a>
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
                <li><Link href="/members" className="hover:text-accent">Members</Link></li>
                <li><Link href="/affiliate" className="hover:text-accent">Affiliate</Link></li>
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
              <HecticHotline variant="compact" className="text-sm" />
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 DJ Danny Hectic B. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
