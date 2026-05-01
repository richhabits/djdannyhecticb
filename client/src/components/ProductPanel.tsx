import { Music, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  type: "track" | "merchandise" | "link";
  icon?: string;
  url?: string;
  price?: number;
  description?: string;
}

interface ProductPanelProps {
  title?: string;
  products?: Product[];
  onProductClick?: (product: Product) => void;
}

export function ProductPanel({
  title = "NOW PLAYING",
  products = [
    {
      id: "1",
      name: "Morning Vibes Mix (Extended)",
      type: "track",
      url: "https://spotify.com/track/123",
      description: "Full 45-min exclusive mix",
    },
    {
      id: "2",
      name: "Hectic Radio Hoodie",
      type: "merchandise",
      price: 49.99,
      url: "https://shop.example.com",
      description: "Limited edition drop",
    },
    {
      id: "3",
      name: "Discord Community",
      type: "link",
      url: "https://discord.gg/example",
      description: "Join 5K+ members",
    },
  ],
  onProductClick,
}: ProductPanelProps) {
  return (
    <div className="bg-[#0A0A0A] rounded-lg border border-[#333333] p-3 space-y-3">
      <h4 className="text-xs font-bold text-white">{title}</h4>

      <div className="space-y-2">
        {products.map((product) => (
          <button
            key={product.id}
            onClick={() => onProductClick?.(product)}
            className="w-full text-left px-3 py-2 rounded-lg bg-[#2F2F2F] hover:bg-[#3F3F3F] transition border border-[#333333] hover:border-[#FF4444] group"
          >
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded bg-[#FF4444] flex items-center justify-center flex-shrink-0 text-xs">
                {product.type === "track" && <Music className="w-3 h-3 text-white" />}
                {product.type === "merchandise" && (
                  <ShoppingCart className="w-3 h-3 text-white" />
                )}
                {product.type === "link" && <span className="text-white font-bold">🔗</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white group-hover:text-[#FF4444] transition truncate">
                  {product.name}
                </p>
                {product.description && (
                  <p className="text-xs text-[#999999] mt-0.5 truncate">
                    {product.description}
                  </p>
                )}
              </div>
              {product.price && (
                <div className="flex-shrink-0 text-xs font-bold text-[#FF4444]">
                  ${product.price.toFixed(2)}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full h-8 text-xs bg-[#FF4444] text-white hover:bg-[#FF5555] border-0"
      >
        View All Products
      </Button>
    </div>
  );
}
