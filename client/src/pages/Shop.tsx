import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Music, ShoppingCart, Heart, Mail, Check, Loader2, Minus, Plus, X } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Shop() {
  const [newsletter, setNewsletter] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { data: products, isLoading } = trpc.products.list.useQuery();
  const { addItem, items, removeItem, total, itemCount, clearCart } = useCart();
  const createOrderMutation = trpc.orders.create.useMutation();
  const { isAuthenticated } = useAuth();

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

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error("Please login to checkout");
      return;
    }
    
    createOrderMutation.mutate({
      items: items.map(i => ({ productId: i.id, quantity: i.quantity, price: i.price })),
      total
    }, {
      onSuccess: () => {
        toast.success("Order placed successfully! 🎉");
        clearCart();
      },
      onError: (err) => {
        toast.error("Failed to place order: " + err.message);
      }
    });
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
            
            <Sheet>
              <SheetTrigger asChild>
                <button className="relative p-2 hover:bg-accent/10 rounded-full transition">
                  <ShoppingCart className="w-5 h-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-in zoom-in">
                      {itemCount}
                    </span>
                  )}
                </button>
              </SheetTrigger>
              <SheetContent className="w-full sm:w-[400px] flex flex-col">
                <SheetHeader>
                  <SheetTitle>Shopping Cart ({itemCount})</SheetTitle>
                </SheetHeader>
                
                <ScrollArea className="flex-1 my-4">
                  {items.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>Your cart is empty</p>
                    </div>
                  ) : (
                    <div className="space-y-4 pr-4">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-4 items-start bg-card/50 p-3 rounded-lg border border-border/50">
                          <div className="w-16 h-16 bg-muted rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                            {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <Music className="w-6 h-6 opacity-50" />}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>
                            <p className="text-muted-foreground text-sm">${(item.price / 100).toFixed(2)}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs bg-accent/10 px-2 py-1 rounded">Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-muted-foreground hover:text-destructive transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                <SheetFooter className="border-t border-border pt-4">
                  <div className="w-full space-y-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${(total / 100).toFixed(2)}</span>
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600" 
                      disabled={items.length === 0 || createOrderMutation.isPending}
                      onClick={handleCheckout}
                    >
                      {createOrderMutation.isPending ? <Loader2 className="animate-spin" /> : "Checkout"}
                    </Button>
                  </div>
                </SheetFooter>
              </SheetContent>
            </Sheet>
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

      {/* Products Grid */}
      <section className="py-16 md:py-24">
        <div className="container">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-purple-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products?.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden hover:border-accent transition border-border/50 flex flex-col"
                >
                  <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden relative group">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="text-6xl">🎵</div>
                    )}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                        <span className="font-bold text-white border-2 border-white px-4 py-2 rounded transform -rotate-12">SOLD OUT</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <p className="text-xs text-purple-400 font-bold mb-2">{product.category}</p>
                    <h3 className="text-lg font-bold mb-2 line-clamp-1" title={product.name}>{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="space-y-3 pt-4 border-t border-border/50">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-pink-400">
                          ${(product.price / 100).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => addItem({ 
                            id: product.id, 
                            name: product.name, 
                            price: product.price, 
                            imageUrl: product.imageUrl || undefined 
                          })}
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
          )}
        </div>
      </section>
    </div>
  );
}
