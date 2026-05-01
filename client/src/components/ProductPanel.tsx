import { Music, ShoppingCart, Link as LinkIcon } from "lucide-react";
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

const typeEmojis = {
  track: "🎵",
  merchandise: "👕",
  link: "🔗",
};

const typeLabels = {
  track: "Tracks",
  merchandise: "Merchandise",
  link: "Links",
};

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
  // Group products by type
  const groupedProducts = products.reduce(
    (acc, product) => {
      if (!acc[product.type]) acc[product.type] = [];
      acc[product.type].push(product);
      return acc;
    },
    {} as Record<string, Product[]>
  );

  const typeOrder: (keyof typeof typeLabels)[] = ["track", "merchandise", "link"];

  return (
    <div className="bg-dark-surface rounded-lg border border-border-primary p-2 md:p-md lg:p-lg space-y-2 md:space-y-md lg:space-y-lg">
      <h4 className="text-xs md:text-body lg:text-lg font-bold text-white">{title}</h4>

      <div className="space-y-2 md:space-y-lg lg:space-y-lg">
        {typeOrder.map((type) => {
          if (!groupedProducts[type]) return null;

          return (
            <div key={type}>
              <h5 className="text-xs md:text-caption lg:text-sm font-bold text-text-secondary mb-1 md:mb-sm lg:mb-sm">
                {typeEmojis[type]} {typeLabels[type]}
              </h5>

              {/* Responsive grid: 1 col mobile, 2 col tablet, 3 col wide */}
              <div className="grid grid-cols-1 tablet:grid-cols-2 wide:grid-cols-3 gap-1.5 md:gap-md lg:gap-lg">
                {groupedProducts[type].map((product) => (
                  <a
                    key={product.id}
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.preventDefault();
                      onProductClick?.(product);
                    }}
                    className="group bg-dark-surface rounded-lg p-2 md:p-md lg:p-lg border border-border-primary hover:border-accent-red hover:shadow-lg transition-all duration-base cursor-pointer min-h-[44px] flex flex-col justify-center"
                  >
                    <span className="text-xl md:text-2xl lg:text-3xl mb-1 md:mb-sm lg:mb-sm block group-hover:scale-110 transition-transform duration-base">
                      {typeEmojis[type]}
                    </span>
                    <p className="text-xs md:text-caption lg:text-sm font-semibold group-hover:text-accent-red transition-colors duration-base line-clamp-2">
                      {product.name}
                    </p>
                    {product.description && (
                      <p className="text-xs md:text-micro lg:text-xs text-text-tertiary mt-0.5 md:mt-xs lg:mt-xs line-clamp-1 hidden md:block">
                        {product.description}
                      </p>
                    )}
                    {product.price && (
                      <p className="text-xs md:text-caption lg:text-sm font-bold text-accent-red mt-1 md:mt-md lg:mt-md">
                        ${product.price.toFixed(2)}
                      </p>
                    )}
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Button
        size="sm"
        className="w-full h-9 md:h-10 lg:h-11 text-xs md:text-body lg:text-base font-semibold bg-accent-red text-white hover:bg-red-600 border-0 transition-all duration-base hover:shadow-lg"
      >
        View All Products
      </Button>
    </div>
  );
}
