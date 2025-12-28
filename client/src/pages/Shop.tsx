import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { MetaTagsComponent } from "@/components/MetaTags";

export default function Shop() {
  const [newsletter, setNewsletter] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const products = [
    {
      id: 1,
      name: "HB VOL. 1 (VINYL)",
      category: "Vinyl",
      price: "£25.99",
      image: "https://images.unsplash.com/photo-1603048588665-791ca8aea616?q=80&w=2670&auto=format&fit=crop",
      inStock: true,
      tag: "BESTSELLER"
    },
    {
      id: 2,
      name: "HB VOL. 1 (WAV/MP3)",
      category: "Digital",
      price: "£9.99",
      image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2670&auto=format&fit=crop",
      inStock: true,
      tag: "INSTANT"
    },
    {
      id: 3,
      name: "EMPIRE HOODIE BLK",
      category: "Merch",
      price: "£49.99",
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=2670&auto=format&fit=crop",
      inStock: true,
      tag: "NEW SEASON"
    },
    {
      id: 4,
      name: "STUDIO SESSIONS PACK",
      category: "Digital",
      price: "£29.99",
      image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2670&auto=format&fit=crop",
      inStock: true,
      tag: "PRO AUDIO"
    },
    {
      id: 5,
      name: "HECTIC CAP ORANGE",
      category: "Merch",
      price: "£24.99",
      image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=2670&auto=format&fit=crop",
      inStock: true,
      tag: null
    },
    {
      id: 6,
      name: "HB VOL. 2 (PRE-ORDER)",
      category: "Vinyl",
      price: "£25.99",
      image: "https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?q=80&w=2676&auto=format&fit=crop",
      inStock: false,
      tag: "COMING SOON"
    },
  ];

  const filteredProducts = activeCategory === "All"
    ? products
    : products.filter(p => p.category === activeCategory);

  const handleAddToCart = (productName: string) => {
    toast.success(`${productName} ADDED`);
  };

  return (
    <>
      <MetaTagsComponent
        title="SHOP | HECTIC EMPIRE SUPPLY"
        description="Official Hectic Radio Merchandise. Vinyl, Digital, Apparel."
        url="/shop"
      />
      <div className="min-h-screen bg-background text-foreground font-mono pt-14">
        {/* Brutalist Header */}
        <section className="border-b border-foreground px-4 py-8 md:px-6 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="text-6xl md:text-9xl font-black uppercase leading-[0.8] tracking-tighter">
              Empire<br />Supply
            </h1>
          </div>
          <div className="md:text-right">
            <p className="text-sm font-bold uppercase tracking-widest mb-2 text-muted-foreground">Status</p>
            <p className="text-xl font-bold uppercase">Online Store v2.0</p>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="sticky top-14 z-40 bg-background border-b border-foreground whitespace-nowrap overflow-x-auto flex divide-x divide-foreground">
          {['All', 'Vinyl', 'Digital', 'Merch'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-6 py-4 uppercase font-bold text-sm tracking-wider hover:bg-foreground hover:text-background transition-colors duration-0",
                activeCategory === cat ? "bg-foreground text-background" : ""
              )}
            >
              {cat}
            </button>
          ))}
        </section>

        {/* Product Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:gap-[1px] bg-foreground border-b border-foreground">
          {filteredProducts.map((p) => (
            <div key={p.id} className="bg-background group relative flex flex-col h-full md:border-r border-b border-foreground last:border-0 hover:bg-muted/20 transition-colors duration-0">
              <div className="aspect-square relative overflow-hidden border-b border-foreground">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-0 group-hover:grayscale-0" />
                {!p.inStock && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <span className="text-3xl font-black uppercase border border-foreground px-4 py-2 bg-background">Sold Out</span>
                  </div>
                )}
                {p.tag && (
                  <span className="absolute top-0 left-0 bg-foreground text-background text-xs font-bold px-2 py-1 uppercase">{p.tag}</span>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-1">{p.category}</p>
                  <h3 className="text-2xl font-black uppercase leading-none mb-2">{p.name}</h3>
                  <p className="text-xl font-bold">{p.price}</p>
                </div>

                <Button
                  onClick={() => handleAddToCart(p.name)}
                  disabled={!p.inStock}
                  className="w-full rounded-none border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background uppercase font-bold text-lg h-12"
                >
                  {p.inStock ? "Add To Cart" : "Unavailable"}
                </Button>
              </div>
            </div>
          ))}
        </section>

        {/* Raw Newsletter footer */}
        <section className="p-4 md:p-12 border-b border-foreground">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-black uppercase mb-4">Mailing List</h2>
            <p className="font-mono text-sm mb-6 max-w-md">
              Enter your frequency code (email) to receive drop notifications and encrypted discount keys.
            </p>
            <form className="flex gap-0 border border-foreground max-w-md" onSubmit={(e) => { e.preventDefault(); toast.success("Connected."); setNewsletter(""); }}>
              <input
                type="email"
                value={newsletter}
                onChange={(e) => setNewsletter(e.target.value)}
                placeholder="EMAIL_ADDRESS"
                className="bg-transparent border-none focus:ring-0 w-full px-4 font-mono uppercase placeholder:text-muted-foreground"
              />
              <button type="submit" className="bg-foreground text-background px-6 py-4 font-bold uppercase hover:bg-accent hover:text-foreground">
                <ArrowRight />
              </button>
            </form>
          </div>
        </section>
      </div>
    </>
  );
}
