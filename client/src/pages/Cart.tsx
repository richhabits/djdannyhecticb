import { useCart } from "@/contexts/CartContext";
import { Link, useLocation } from "wouter";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { BackButton } from "@/components/BackButton";

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();
  const [, navigate] = useLocation();

  const handleCheckout = () => {
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-black text-white pt-20 sm:pt-24 md:pt-28 pb-20 px-4 sm:px-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <BackButton />

        <section className="mb-8 sm:mb-12">
          <div className="tape-strip bg-accent text-white border-white mb-4 sm:mb-6 inline-block text-xs">
            SHOPPING_CART
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tight leading-[0.85] italic">
            YOUR<br />CART
          </h1>
        </section>

        {items.length === 0 ? (
          <section className="border-2 border-white p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-accent mx-auto mb-6" />
            <h2 className="text-3xl font-black uppercase mb-4">Cart is Empty</h2>
            <p className="text-white/60 font-mono mb-8">Add some items before checking out</p>
            <Link href="/shop">
              <button className="tape-strip bg-white text-black border-black px-8 py-3 hover:bg-accent hover:text-white transition-all duration-150">
                BACK_TO_SHOP
              </button>
            </Link>
          </section>
        ) : (
          <>
            {/* Cart Items */}
            <section className="mb-8 sm:mb-12 border-2 border-white divide-y divide-white">
              {items.map((item) => (
                <div key={item.productId} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-6 flex-1">
                    {item.thumbnailUrl && (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.name}
                        className="w-24 h-24 object-cover border border-white grayscale"
                      />
                    )}
                    <div>
                      <h3 className="font-black uppercase text-lg">{item.name}</h3>
                      <p className="text-xs text-white/60 font-mono mb-2">{item.type}</p>
                      <p className="text-accent font-bold">{item.currency} {item.price}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Quantity Controls */}
                    <div className="flex items-center border-2 border-white">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-2 hover:bg-white/10 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 font-bold min-w-[50px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-2 hover:bg-white/10 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-2 hover:bg-red-500/20 transition-colors"
                      title="Remove from cart"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </section>

            {/* Summary */}
            <section className="max-w-2xl ml-auto mb-12 border-2 border-white p-8">
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-lg">
                  <span>Subtotal</span>
                  <span className="font-bold">£{total.toFixed(2)}</span>
                </div>
                <div className="border-t border-white/20 pt-4 flex justify-between text-2xl font-black">
                  <span>TOTAL</span>
                  <span className="text-accent">£{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  className="tape-strip bg-white text-black border-black w-full px-8 py-4 hover:bg-accent hover:text-white transition-all duration-150 text-lg font-bold"
                >
                  PROCEED_TO_CHECKOUT
                </button>
                <Link href="/shop">
                  <button className="tape-strip bg-black text-white border-white w-full px-8 py-4 hover:bg-white/10 transition-all duration-150 text-lg font-bold">
                    CONTINUE_SHOPPING
                  </button>
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
