import { useParams, useLocation } from "wouter";
import { Loader2, ArrowLeft, Download, Truck, Lock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/BackButton";
import { MetaTagsComponent } from "@/components/MetaTags";
import { useCart } from "@/contexts/CartContext";

export default function ProductDetail() {
  const params = useParams();
  const productId = parseInt(params.id || "0");
  const [, navigate] = useLocation();
  const { addItem } = useCart();

  const { data: product, isLoading } = trpc.products.get.useQuery({ id: productId });
  const { data: related } = trpc.products.list.useQuery({ activeOnly: true });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white pt-32">
        <div className="max-w-6xl mx-auto px-6">
          <BackButton />
          <div className="text-center mt-12">
            <h1 className="text-4xl font-black uppercase mb-4">Product Not Found</h1>
            <Button onClick={() => navigate("/shop")}>Back to Shop</Button>
          </div>
        </div>
      </div>
    );
  }

  const getCategory = (type: string) => {
    if (type === "drop" || type === "soundpack" || type === "preset" || type === "course") return "Digital";
    if (type === "vinyl") return "Vinyl";
    if (type === "merch") return "Merch";
    return "Other";
  };

  const relatedProducts = related
    ?.filter((p) => p.type === product.type && p.id !== product.id)
    .slice(0, 3) || [];

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency,
      thumbnailUrl: product.thumbnailUrl,
      type: product.type,
    });
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    navigate(`/checkout?productId=${product.id}`);
  };

  return (
    <>
      <MetaTagsComponent
        title={`${product.name} | HECTIC EMPIRE SUPPLY`}
        description={product.description || `Buy ${product.name}`}
        url={`/products/${product.id}`}
      />
      <div className="min-h-screen bg-black text-white pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <BackButton />

          <div className="grid md:grid-cols-2 gap-12 mt-12">
            {/* Product Image */}
            <div>
              <div className="aspect-square bg-white/5 border-2 border-white overflow-hidden">
                <img
                  src={
                    product.thumbnailUrl ||
                    "https://images.unsplash.com/photo-1603048588665-791ca8aea616?q=80&w=2670&auto=format&fit=crop"
                  }
                  alt={product.name}
                  className="w-full h-full object-cover grayscale contrast-125"
                />
              </div>

              {/* Embedded Players */}
              <div className="mt-8 space-y-6">
                {product.soundcloudUrl && (
                  <div>
                    <p className="text-xs font-bold uppercase text-white/60 mb-3">Listen on SoundCloud</p>
                    <iframe
                      width="100%"
                      height="120"
                      scrolling="no"
                      frameBorder="no"
                      src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(product.soundcloudUrl)}&color=ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&visual=true`}
                      className="border border-white"
                    />
                  </div>
                )}

                {product.spotifyUrl && (
                  <div>
                    <p className="text-xs font-bold uppercase text-white/60 mb-3">Listen on Spotify</p>
                    <div className="border-2 border-white p-4">
                      <iframe
                        src={`https://open.spotify.com/embed/track/${product.spotifyUrl.split("/").pop()}`}
                        width="100%"
                        height="152"
                        frameBorder="0"
                        allowTransparency={true}
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="mb-8">
                <p className="text-xs font-bold uppercase text-white/60 mb-2">{getCategory(product.type)}</p>
                <h1 className="text-6xl md:text-7xl font-black uppercase leading-none mb-6">{product.name}</h1>

                <div className="flex items-baseline gap-4 mb-8">
                  <span className="text-4xl font-black">{product.currency} {product.price}</span>
                  {product.stock === 0 && (
                    <span className="text-sm font-bold uppercase text-red-500 border border-red-500 px-3 py-1">
                      Sold Out
                    </span>
                  )}
                </div>

                {product.description && <p className="text-lg text-white/80 mb-6 leading-relaxed">{product.description}</p>}

                {/* Badges */}
                <div className="flex flex-wrap gap-3 mb-8">
                  {(product.type === "drop" || product.type === "soundpack" || product.type === "preset" || product.type === "course") && (
                    <div className="flex items-center gap-2 border border-white/40 px-3 py-2 text-xs font-bold uppercase">
                      <Download className="w-4 h-4" />
                      Digital Download
                    </div>
                  )}
                  {product.shippingRequired && (
                    <div className="flex items-center gap-2 border border-white/40 px-3 py-2 text-xs font-bold uppercase">
                      <Truck className="w-4 h-4" />
                      Ships UK
                    </div>
                  )}
                  {product.downloadUrl && (
                    <div className="flex items-center gap-2 border border-white/40 px-3 py-2 text-xs font-bold uppercase">
                      <Lock className="w-4 h-4" />
                      Secure Purchase
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mt-auto">
                <div className="flex gap-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={!product.isActive}
                    className="flex-1 tape-strip bg-transparent text-white border-white rounded-none font-bold uppercase px-6 py-4 hover:bg-white hover:text-black transition-all"
                  >
                    Add to Cart
                  </Button>
                  <Button
                    onClick={handleBuyNow}
                    disabled={!product.isActive}
                    className="flex-1 tape-strip bg-white text-black border-white rounded-none font-bold uppercase px-6 py-4 hover:bg-accent hover:text-white transition-all"
                  >
                    {product.isActive ? "Buy Now" : "Unavailable"}
                  </Button>
                </div>

                {product.beatportUrl && (
                  <a href={product.beatportUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full tape-strip bg-orange-600 text-white border-orange-600 rounded-none font-bold uppercase px-6 py-4 hover:bg-orange-700 transition-all">
                      Buy on Beatport
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-20 pt-12 border-t border-white/20">
              <h2 className="text-4xl font-black uppercase mb-8">Related Products</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/products/${p.id}`)}
                    className="group text-left border border-white/20 hover:border-white transition-colors"
                  >
                    <div className="aspect-square bg-white/5 overflow-hidden mb-4">
                      <img
                        src={p.thumbnailUrl || "https://images.unsplash.com/photo-1603048588665-791ca8aea616?q=80&w=2670&auto=format&fit=crop"}
                        alt={p.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 contrast-125 group-hover:scale-105 transition-all"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-xs font-bold uppercase text-white/60 mb-1">{getCategory(p.type)}</p>
                      <h3 className="font-black uppercase text-lg line-clamp-2 mb-2">{p.name}</h3>
                      <p className="font-bold">{p.currency} {p.price}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
