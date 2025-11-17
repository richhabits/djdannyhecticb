import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Music, ShoppingCart, Heart, Mail, Check } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function Shop() {
  const [newsletter, setNewsletter] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const products = [
    {
      id: 1,
      name: "Hectic Beats Vol. 1 (Vinyl)",
      category: "Vinyl",
      price: "$25.99",
      image: "🎵",
      description: "Exclusive garage and house mix on 180g vinyl",
      inStock: true,
    },
    {
      id: 2,
      name: "Hectic Beats Vol. 1 (Digital)",
      category: "Digital Download",
      price: "$9.99",
      image: "💿",
      description: "High-quality MP3 and FLAC download",
      inStock: true,
    },
    {
      id: 3,
      name: "DJ Danny Hectic B T-Shirt",
      category: "Merchandise",
      price: "$19.99",
      image: "👕",
      description: "Premium cotton t-shirt with logo",
      inStock: true,
    },
    {
      id: 4,
      name: "Garage Nation Hoodie",
      category: "Merchandise",
      price: "$49.99",
      image: "🧥",
      description: "Limited edition collaboration hoodie",
      inStock: true,
    },
    {
      id: 5,
      name: "DJ Danny Mix Tape Collection",
      category: "Digital Download",
      price: "$29.99",
      image: "📼",
      description: "5 exclusive mixes (20+ hours of music)",
      inStock: true,
    },
    {
      id: 6,
      name: "Hectic Beats Vol. 2 (Vinyl)",
      category: "Vinyl",
      price: "$25.99",
      image: "🎶",
      description: "Latest soulful house and amapiano mix",
      inStock: false,
    },
    {
      id: 7,
      name: "DJ Danny Baseball Cap",
      category: "Merchandise",
      price: "$24.99",
      image: "🧢",
      description: "Embroidered logo cap",
      inStock: true,
    },
    {
      id: 8,
      name: "Exclusive Studio Session (Video)",
      category: "Digital Download",
      price: "$14.99",
      image: "🎬",
      description: "Behind-the-scenes studio recording",
      inStock: true,
    },
  ];

  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletter.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    setSubscribed(true);
    toast.success("Welcome to the newsletter! 🎉");
    setNewsletter("");
    setTimeout(() => setSubscribed(false), 3000);
  };

  const handleAddToCart = (productName: string) => {
    toast.success(`${productName} added to cart! 🛒`);
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
            <Link href="/mixes" className="text-sm hover:text-accent">Mixes</Link>
            <Link href="/bookings" className="text-sm hover:text-accent">Bookings</Link>
            <button className="relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-purple-900/20 to-background border-b border-border">
        <div className="container">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">DJ Danny Shop</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Exclusive mixes, merchandise, and digital content from DJ Danny Hectic B.
          </p>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="container max-w-2xl">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-white">Get Exclusive Updates</h2>
            <p className="text-white/90">
              Subscribe to our newsletter for new releases, exclusive mixes, and special offers.
            </p>
            <form onSubmit={handleNewsletterSignup} className="flex gap-3">
              <input
                type="email"
                value={newsletter}
                onChange={(e) => setNewsletter(e.target.value)}
                placeholder="Enter your email..."
                className="flex-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <Button
                type="submit"
                className="bg-white text-purple-600 hover:bg-white/90"
              >
                {subscribed ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Subscribed!
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Subscribe
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-4">Featured Products</h2>
            <div className="flex gap-3 flex-wrap">
              {['All', 'Vinyl', 'Digital Download', 'Merchandise'].map((category) => (
                <Button
                  key={category}
                  variant={category === 'All' ? 'default' : 'outline'}
                  className={category === 'All' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:border-accent transition border-border/50 flex flex-col"
              >
                {/* Product Image */}
                <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-8 text-6xl flex items-center justify-center h-48">
                  {product.image}
                </div>

                {/* Product Info */}
                <div className="p-6 flex flex-col flex-1">
                  <p className="text-xs text-purple-400 font-bold mb-2">{product.category}</p>
                  <h3 className="text-lg font-bold mb-2">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">
                    {product.description}
                  </p>

                  {/* Price & Status */}
                  <div className="space-y-3 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-pink-400">
                        {product.price}
                      </span>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        product.inStock
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {product.inStock ? 'In Stock' : 'Coming Soon'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAddToCart(product.name)}
                        disabled={!product.inStock}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                      <Button variant="outline" size="icon">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Shop With Us */}
      <section className="py-16 md:py-24 border-t border-border bg-card/50">
        <div className="container">
          <h2 className="text-4xl font-bold mb-12 text-center">Why Shop With Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '🎵',
                title: 'Exclusive Content',
                description: 'Get access to exclusive mixes and studio sessions not available anywhere else.',
              },
              {
                icon: '🚚',
                title: 'Fast Shipping',
                description: 'Orders ship within 24 hours. Vinyl arrives in protective packaging.',
              },
              {
                icon: '💯',
                title: 'Quality Guaranteed',
                description: 'Premium materials and professional production on all physical products.',
              },
            ].map((item, idx) => (
              <Card key={idx} className="p-8 text-center">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 border-t border-border bg-gradient-to-r from-purple-900/20 to-pink-900/20">
        <div className="container max-w-3xl text-center space-y-6">
          <h2 className="text-4xl font-bold">Support the Music</h2>
          <p className="text-lg text-muted-foreground">
            Every purchase supports the creation of new mixes and live performances. Thank you for your support!
          </p>
          <Link href="/bookings">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6 text-lg">
              Book DJ Danny
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
