import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Music, Calendar, User, ArrowRight, Search } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState("");

  const blogPosts = [
    {
      id: 1,
      title: "The Evolution of UK Garage: From Pirate Radio to Mainstream",
      excerpt: "Explore how UK garage music evolved from underground pirate radio stations to becoming a global phenomenon.",
      category: "Music History",
      date: "Nov 15, 2024",
      author: "DJ Danny Hectic B",
      readTime: "8 min read",
      image: "📻",
      content: "UK garage has come a long way since its humble beginnings on pirate radio stations...",
    },
    {
      id: 2,
      title: "5 Essential DJ Mixing Techniques for House Music",
      excerpt: "Master the fundamental mixing techniques that will elevate your house music sets to the next level.",
      category: "DJ Tips",
      date: "Nov 12, 2024",
      author: "DJ Danny Hectic B",
      readTime: "6 min read",
      image: "🎧",
      content: "Whether you're a beginner or experienced DJ, these mixing techniques will improve your sets...",
    },
    {
      id: 3,
      title: "How to Build Your DJ Brand in 2024",
      excerpt: "Strategies for building a strong personal brand as a DJ in today's competitive music industry.",
      category: "Business",
      date: "Nov 10, 2024",
      author: "DJ Danny Hectic B",
      readTime: "10 min read",
      image: "🎯",
      content: "Building a successful DJ brand requires more than just technical skills...",
    },
    {
      id: 4,
      title: "Soulful House: The Art of Emotional Connection Through Music",
      excerpt: "Discover how soulful house music creates deep emotional connections with audiences.",
      category: "Music Production",
      date: "Nov 8, 2024",
      author: "DJ Danny Hectic B",
      readTime: "7 min read",
      image: "💫",
      content: "Soulful house is more than just a genre; it's a feeling, an emotion...",
    },
    {
      id: 5,
      title: "Event Recap: Twice as Nice Festival 2024",
      excerpt: "Highlights from the legendary Twice as Nice Festival featuring performances from top UK garage DJs.",
      category: "Event Recap",
      date: "Nov 5, 2024",
      author: "DJ Danny Hectic B",
      readTime: "5 min read",
      image: "🎪",
      content: "The 2024 Twice as Nice Festival was absolutely incredible...",
    },
    {
      id: 6,
      title: "Equipment Guide: Essential Gear for Professional DJs",
      excerpt: "A comprehensive guide to the equipment you need to start your DJ journey professionally.",
      category: "Equipment",
      date: "Nov 1, 2024",
      author: "DJ Danny Hectic B",
      readTime: "12 min read",
      image: "🎛️",
      content: "Starting your DJ career requires the right equipment. Here's what you need...",
    },
    {
      id: 7,
      title: "Amapiano: The South African Sound Taking Over the World",
      excerpt: "Explore the rise of Amapiano and how this South African genre is influencing global music.",
      category: "Music Trends",
      date: "Oct 28, 2024",
      author: "DJ Danny Hectic B",
      readTime: "9 min read",
      image: "🌍",
      content: "Amapiano has taken the world by storm, and for good reason...",
    },
    {
      id: 8,
      title: "The Art of Reading Your Crowd: A DJ's Guide",
      excerpt: "Learn how to read your audience and adapt your music selection in real-time.",
      category: "DJ Tips",
      date: "Oct 25, 2024",
      author: "DJ Danny Hectic B",
      readTime: "6 min read",
      image: "👥",
      content: "One of the most important skills a DJ can develop is the ability to read the crowd...",
    },
  ];

  const categories = ['All', 'DJ Tips', 'Music History', 'Music Production', 'Business', 'Event Recap', 'Equipment', 'Music Trends'];
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
            <Link href="/mixes" className="text-sm hover:text-accent">Mixes</Link>
            <Link href="/bookings" className="text-sm hover:text-accent">Bookings</Link>
            <Link href="/blog" className="text-sm hover:text-accent font-semibold text-accent">Blog</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-orange-900/20 to-background border-b border-border">
        <div className="container">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">DJ Blog & Insights</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Music tips, industry insights, and behind-the-scenes stories from DJ Danny Hectic B.
          </p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 border-b border-border">
        <div className="container space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
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

      {/* Blog Posts Grid */}
      <section className="py-16 md:py-24">
        <div className="container">
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <Card
                  key={post.id}
                  className="overflow-hidden hover:border-accent transition border-border/50 flex flex-col cursor-pointer group"
                >
                  {/* Image */}
                  <div className="bg-gradient-to-br from-orange-900/20 to-amber-900/20 p-8 text-6xl flex items-center justify-center h-40 group-hover:scale-105 transition-transform">
                    {post.image}
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <p className="text-xs text-orange-400 font-bold mb-2">{post.category}</p>
                    <h3 className="text-lg font-bold mb-3 group-hover:text-accent transition">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 flex-1">
                      {post.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="space-y-3 pt-4 border-t border-border/50">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {post.date}
                        </div>
                        <span>{post.readTime}</span>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-orange-600 to-amber-600 group-hover:from-orange-700 group-hover:to-amber-700">
                        Read More
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No articles found matching your search.</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 md:py-24 border-t border-border bg-gradient-to-r from-orange-900/20 to-amber-900/20">
        <div className="container max-w-2xl text-center space-y-6">
          <h2 className="text-4xl font-bold">Get DJ Tips in Your Inbox</h2>
          <p className="text-lg text-muted-foreground">
            Subscribe to get the latest blog posts, DJ tips, and exclusive insights delivered weekly.
          </p>
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="Enter your email..."
              className="flex-1 px-4 py-3 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <Button className="bg-gradient-to-r from-orange-600 to-amber-600">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      {/* Related Resources */}
      <section className="py-16 md:py-24 border-t border-border">
        <div className="container">
          <h2 className="text-4xl font-bold mb-12">More Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Free DJ Guides", description: "Download comprehensive guides on mixing, production, and more.", icon: "📚" },
              { title: "Video Tutorials", description: "Watch step-by-step tutorials on DJ techniques and equipment.", icon: "🎬" },
              { title: "Community Forum", description: "Connect with other DJs and share your experiences.", icon: "💬" },
            ].map((resource, idx) => (
              <Card key={idx} className="p-8 text-center hover:border-accent transition">
                <div className="text-5xl mb-4">{resource.icon}</div>
                <h3 className="text-xl font-bold mb-2">{resource.title}</h3>
                <p className="text-muted-foreground mb-4">{resource.description}</p>
                <Button variant="outline">Explore</Button>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
