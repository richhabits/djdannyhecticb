import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { MetaTagsComponent } from "@/components/MetaTags";
import { trpc } from "@/lib/trpc";

export default function Shop() {
  const [newsletter, setNewsletter] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [, navigate] = useLocation();

  const { data: products = [], isLoading } = trpc.products.list.useQuery({ activeOnly: true });

  // Map product types to categories for filtering
  const getCategory = (type: string) => {
    if (type === "drop" || type === "soundpack" || type === "preset" || type === "course") return "Digital";
    return "Other";
  };

  const filteredProducts = activeCategory === "All"
    ? products
    : products.filter(p => getCategory(p.type) === activeCategory);

  const handleBuyNow = (productId: number) => {
    navigate(`/checkout?productId=${productId}`);
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
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No products available</p>
            </div>
          ) : (
            filteredProducts.map((p) => (
              <div key={p.id} className="bg-background group relative flex flex-col h-full md:border-r border-b border-foreground last:border-0 hover:bg-muted/20 transition-colors duration-0">
                <div className="aspect-square relative overflow-hidden border-b border-foreground">
                  <img
                    src={p.thumbnailUrl || "https://images.unsplash.com/photo-1603048588665-791ca8aea616?q=80&w=2670&auto=format&fit=crop"}
                    alt={p.name}
                    className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-0 group-hover:grayscale-0"
                  />
                  {!p.isActive && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <span className="text-3xl font-black uppercase border border-foreground px-4 py-2 bg-background">Unavailable</span>
                    </div>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase text-muted-foreground mb-1">{getCategory(p.type)}</p>
                    <h3 className="text-2xl font-black uppercase leading-none mb-2">{p.name}</h3>
                    <p className="text-xl font-bold">{p.currency} {p.price}</p>
                    {p.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{p.description}</p>
                    )}
                  </div>

                  <Button
                    onClick={() => handleBuyNow(p.id)}
                    disabled={!p.isActive}
                    className="w-full rounded-none border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background uppercase font-bold text-lg h-12"
                  >
                    {p.isActive ? "Buy Now" : "Unavailable"}
                  </Button>
                </div>
              </div>
            ))
          )}
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
