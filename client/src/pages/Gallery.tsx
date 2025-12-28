import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Music, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const galleryItems = [
    {
      id: 1,
      title: "Twice as Nice Event 2023",
      category: "Events",
      image: "🎤",
      description: "Headlining performance at legendary Twice as Nice promotion",
    },
    {
      id: 2,
      title: "Studio Session",
      category: "Studio",
      image: "🎧",
      description: "Behind-the-scenes mixing and production",
    },
    {
      id: 3,
      title: "Garage Nation Festival",
      category: "Festivals",
      image: "🎪",
      description: "Performing at the iconic Garage Nation festival",
    },
    {
      id: 4,
      title: "Club Residency",
      category: "Clubs",
      image: "🎵",
      description: "Weekly residency at top London nightclub",
    },
    {
      id: 5,
      title: "Live Streaming",
      category: "Live",
      image: "📹",
      description: "Live streaming session with thousands of viewers",
    },
    {
      id: 6,
      title: "Garage Fever Showcase",
      category: "Events",
      image: "🔥",
      description: "Exclusive performance at Garage Fever showcase",
    },
    {
      id: 7,
      title: "Equipment Setup",
      category: "Studio",
      image: "🎛️",
      description: "Professional DJ setup and equipment",
    },
    {
      id: 8,
      title: "Festival Performance",
      category: "Festivals",
      image: "🎸",
      description: "Epic performance at summer music festival",
    },
    {
      id: 9,
      title: "Crowd Energy",
      category: "Events",
      image: "👥",
      description: "Amazing crowd energy at major event",
    },
    {
      id: 10,
      title: "Vinyl Collection",
      category: "Studio",
      image: "💿",
      description: "Extensive vinyl collection and rare records",
    },
    {
      id: 11,
      title: "Awards & Recognition",
      category: "Awards",
      image: "🏆",
      description: "Industry recognition and awards",
    },
    {
      id: 12,
      title: "Collaboration",
      category: "Events",
      image: "🤝",
      description: "Collaboration with other legendary DJs",
    },
  ];

  const categories = ['All', 'Events', 'Studio', 'Clubs', 'Festivals', 'Live', 'Awards'];
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredItems = activeCategory === 'All' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  const handlePrevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? filteredItems.length - 1 : selectedImage - 1);
    }
  };

  const handleNextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === filteredItems.length - 1 ? 0 : selectedImage + 1);
    }
  };

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
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Gallery</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Explore moments from DJ Danny Hectic B's incredible journey through music and performances.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 border-b border-border">
        <div className="container">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2 rounded-full font-semibold transition ${
                  activeCategory === category
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white'
                    : 'bg-card border border-border hover:border-accent'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setSelectedImage(idx)}
                className="group overflow-hidden rounded-xl hover:scale-105 transition-transform"
              >
                <Card className="h-64 flex flex-col items-center justify-center bg-gradient-to-br from-orange-900/20 to-amber-900/20 hover:border-accent transition cursor-pointer">
                  <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">
                    {item.image}
                  </div>
                  <h3 className="font-bold text-lg text-center px-4">{item.title}</h3>
                  <p className="text-xs text-orange-400 font-semibold mt-2">
                    {item.category}
                  </p>
                </Card>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full space-y-6">
            {/* Close Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedImage(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Image Display */}
            <div className="flex items-center justify-center">
              <div className="text-9xl">
                {filteredItems[selectedImage].image}
              </div>
            </div>

            {/* Image Info */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">
                {filteredItems[selectedImage].title}
              </h2>
              <p className="text-gray-400">
                {filteredItems[selectedImage].description}
              </p>
              <p className="text-sm text-orange-400 font-semibold">
                {filteredItems[selectedImage].category}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevImage}
                className="p-3 hover:bg-white/10 rounded-lg transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <p className="text-sm text-gray-400">
                {selectedImage + 1} / {filteredItems.length}
              </p>
              <button
                onClick={handleNextImage}
                className="p-3 hover:bg-white/10 rounded-lg transition"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-24 border-t border-border bg-gradient-to-r from-orange-900/20 to-amber-900/20">
        <div className="container max-w-3xl text-center space-y-6">
          <h2 className="text-4xl font-bold">Want to Be Part of the Story?</h2>
          <p className="text-lg text-muted-foreground">
            Book DJ Danny Hectic B for your next event and create unforgettable memories.
          </p>
          <Link href="/bookings">
            <Button className="bg-gradient-to-r from-orange-600 to-amber-600 px-8 py-6 text-lg">
              Book Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
