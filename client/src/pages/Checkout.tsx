import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, CreditCard, Lock, CheckCircle2, XCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { MetaTagsComponent } from "@/components/MetaTags";
import { useAuth } from "@/_core/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";

// Initialize Stripe (will be set from env)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

interface CheckoutItem {
  productId: number;
  name: string;
  price: string;
  currency: string;
  quantity: number;
}

interface ShippingAddress {
  address1: string;
  address2?: string;
  city: string;
  postalCode: string;
  country: string;
}

function CheckoutForm({
  items,
  totalAmount,
  shippingRequired,
  setShippingRequired,
  useDigitalOnly,
  setUseDigitalOnly,
  shippingCost,
  setShippingCost,
  shippingAddress,
  setShippingAddress,
}: {
  items: CheckoutItem[];
  totalAmount: number;
  shippingRequired: boolean;
  setShippingRequired: (val: boolean) => void;
  useDigitalOnly: boolean;
  setUseDigitalOnly: (val: boolean) => void;
  shippingCost: number;
  setShippingCost: (val: number) => void;
  shippingAddress: ShippingAddress;
  setShippingAddress: (val: ShippingAddress) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [fanName, setFanName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal">("stripe");
  const [intentCreating, setIntentCreating] = useState(false);
  const [intentCreated, setIntentCreated] = useState(false);

  const createPaymentIntent = trpc.purchases.createPaymentIntent.useMutation({
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
      setIntentCreating(false);
      setIntentCreated(true);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create payment");
      setIntentCreating(false);
    },
  });

  const handleCreateIntent = () => {
    if (intentCreating || intentCreated || !fanName || !email) return;
    setIntentCreating(true);
    createPaymentIntent.mutate({
      productId: items[0].productId,
      fanName,
      email,
      fanId: user?.id,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?purchaseId=${createPaymentIntent.data?.purchaseId}`,
        },
        redirect: "if_required",
      });

      if (error) {
        toast.error(error.message || "Payment failed");
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        toast.success("Payment successful!");
        clearCart();
        navigate(`/checkout/success?purchaseId=${createPaymentIntent.data?.purchaseId}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Payment failed";
      toast.error(message);
      setIsProcessing(false);
    }
  };

  const handlePostcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const postcode = e.target.value;
    setShippingAddress({ ...shippingAddress, postalCode: postcode });

    // Simple postcode validation regex for UK
    const isValidUK = /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}$/i.test(postcode);

    if (isValidUK && shippingAddress.country === "GB") {
      // Calculate shipping based on postcode zone
      // For now, use standard rates; in production, integrate with real postcode API
      const cost = 3.99; // Standard UK rate
      setShippingCost(cost);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="fanName">Name</Label>
          <Input
            id="fanName"
            value={fanName}
            onChange={(e) => setFanName(e.target.value)}
            required
            disabled={isProcessing || intentCreated}
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isProcessing || intentCreated}
          />
        </div>
      </div>

      {/* Shipping Address Section */}
      {shippingRequired && !useDigitalOnly && (
        <div className="space-y-4 p-4 bg-muted rounded-lg">
          <h3 className="font-bold">Shipping Address</h3>
          <div>
            <Label htmlFor="address1">Address Line 1</Label>
            <Input
              id="address1"
              value={shippingAddress.address1}
              onChange={(e) =>
                setShippingAddress({ ...shippingAddress, address1: e.target.value })
              }
              placeholder="Street address"
              disabled={isProcessing || intentCreated}
            />
          </div>
          <div>
            <Label htmlFor="address2">Address Line 2 (Optional)</Label>
            <Input
              id="address2"
              value={shippingAddress.address2 || ""}
              onChange={(e) =>
                setShippingAddress({ ...shippingAddress, address2: e.target.value })
              }
              placeholder="Apartment, suite, etc."
              disabled={isProcessing || intentCreated}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={shippingAddress.city}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, city: e.target.value })
                }
                placeholder="City"
                disabled={isProcessing || intentCreated}
              />
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={shippingAddress.postalCode}
                onChange={handlePostcodeChange}
                placeholder="Postal code"
                disabled={isProcessing || intentCreated}
                className={
                  shippingAddress.postalCode &&
                  !/^[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}$/i.test(
                    shippingAddress.postalCode
                  )
                    ? "border-red-500"
                    : ""
                }
              />
            </div>
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <select
              id="country"
              value={shippingAddress.country}
              onChange={(e) => {
                setShippingAddress({ ...shippingAddress, country: e.target.value });
                // Update shipping cost based on country
                const cost = e.target.value === "GB" ? 3.99 : 15.99;
                setShippingCost(cost);
              }}
              disabled={isProcessing || intentCreated}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="GB">United Kingdom</option>
              <option value="US">United States</option>
              <option value="EU">European Union</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="text-sm text-muted-foreground">
            Shipping cost: £{shippingCost.toFixed(2)} ({shippingAddress.country === "GB" ? "3-5 days" : "7-14 days"})
          </div>
        </div>
      )}

      {/* Digital Only Option */}
      {shippingRequired && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <input
            type="checkbox"
            id="useDigitalOnly"
            checked={useDigitalOnly}
            onChange={(e) => {
              setUseDigitalOnly(e.target.checked);
              if (e.target.checked) {
                setShippingCost(0);
              }
            }}
            disabled={isProcessing || intentCreated}
          />
          <Label htmlFor="useDigitalOnly" className="text-sm cursor-pointer mb-0">
            Use digital delivery only (skip shipping)
          </Label>
        </div>
      )}

      {!clientSecret ? (
        <>
          <Separator />
          <Button
            type="button"
            onClick={handleCreateIntent}
            disabled={!fanName || !email || intentCreating}
            className="w-full"
            size="lg"
          >
            {intentCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Continue to Payment"
            )}
          </Button>
        </>
      ) : (
        <>
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4" />
              <span>Secure payment powered by Stripe</span>
            </div>
            <PaymentElement />
          </div>

          <Button
            type="submit"
            disabled={!stripe || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Pay £{(totalAmount + (shippingRequired && !useDigitalOnly ? shippingCost : 0)).toFixed(2)}
              </>
            )}
          </Button>
        </>
      )}
    </form>
  );
}

export default function Checkout() {
  const [location] = useLocation();
  const { items: cartItems } = useCart();
  const params = new URLSearchParams(location.split("?")[1] || "");
  const productId = parseInt(params.get("productId") || "0");

  const { data: product, isLoading } = trpc.products.get.useQuery(
    { id: productId },
    { enabled: productId > 0 }
  );

  const isFromCart = productId === 0 && cartItems.length > 0;

  const [shippingRequired, setShippingRequired] = useState(cartItems.some(item => item.productId > 0) || productId > 0);
  const [useDigitalOnly, setUseDigitalOnly] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    address1: "",
    city: "",
    postalCode: "",
    country: "GB",
  });

  if (productId > 0 && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (productId > 0 && !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <h2 className="text-2xl font-bold mb-2">Product not found</h2>
          <Link href="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!isFromCart && !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <h2 className="text-2xl font-bold mb-2">Cart is empty</h2>
          <Link href="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  const checkoutItems: CheckoutItem[] = isFromCart
    ? cartItems
    : product
    ? [
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          currency: product.currency,
          quantity: 1,
        },
      ]
    : [];

  const totalAmount = checkoutItems.reduce((sum, item) => {
    const price = parseFloat(item.price.replace(/[£$€,]/g, ""));
    return sum + price * item.quantity;
  }, 0);

  const title = isFromCart ? "Cart Checkout" : product?.name || "Checkout";

  return (
    <>
      <MetaTagsComponent
        title={`Checkout - ${title} | HECTIC EMPIRE`}
        description={`Complete your purchase`}
        url="/checkout"
      />
      <div className="min-h-screen bg-background pt-14">
        <div className="container max-w-4xl py-12">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {checkoutItems.map((item) => (
                  <div key={item.productId}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.currency} {item.price}</p>
                      </div>
                      {item.quantity > 1 && (
                        <span className="text-sm text-muted-foreground">x {item.quantity}</span>
                      )}
                    </div>
                    {checkoutItems.length > 1 && <Separator className="my-2" />}
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold">£{totalAmount.toFixed(2)}</span>
                </div>
                {shippingRequired && !useDigitalOnly && (
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-bold">£{shippingCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>£{(totalAmount + (shippingRequired && !useDigitalOnly ? shippingCost : 0)).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>Complete your purchase securely</CardDescription>
              </CardHeader>
              <CardContent>
                {import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? (
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret: undefined,
                      appearance: {
                        theme: "stripe",
                      },
                    }}
                  >
                    <CheckoutForm
                      items={checkoutItems}
                      totalAmount={totalAmount}
                      shippingRequired={shippingRequired}
                      setShippingRequired={setShippingRequired}
                      useDigitalOnly={useDigitalOnly}
                      setUseDigitalOnly={setUseDigitalOnly}
                      shippingCost={shippingCost}
                      setShippingCost={setShippingCost}
                      shippingAddress={shippingAddress}
                      setShippingAddress={setShippingAddress}
                    />
                  </Elements>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Payment processing is not configured.</p>
                    <Link href="/shop">
                      <Button variant="outline">Back to Shop</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

