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

// Initialize Stripe (will be set from env)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

function CheckoutForm({ productId, productName, amount, currency }: { productId: number; productName: string; amount: string; currency: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [fanName, setFanName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal">("stripe");

  const createPaymentIntent = trpc.purchases.createPaymentIntent.useMutation({
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create payment");
    },
  });

  useEffect(() => {
    if (fanName && email) {
      createPaymentIntent.mutate({
        productId,
        fanName,
        email,
        fanId: user?.id,
      });
    }
  }, [productId, fanName, email, user?.id]);

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
        navigate(`/checkout/success?purchaseId=${createPaymentIntent.data?.purchaseId}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Payment failed");
      setIsProcessing(false);
    }
  };

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

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
            disabled={isProcessing}
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
            disabled={isProcessing}
          />
        </div>
      </div>

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
            Pay {amount}
          </>
        )}
      </Button>
    </form>
  );
}

export default function Checkout() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] || "");
  const productId = parseInt(params.get("productId") || "0");
  const { data: product, isLoading } = trpc.products.get.useQuery({ id: productId }, { enabled: productId > 0 });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!product) {
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

  const amount = parseFloat(product.price.replace(/[£$€,]/g, ""));

  return (
    <>
      <MetaTagsComponent
        title={`Checkout - ${product.name} | HECTIC EMPIRE`}
        description={`Complete your purchase of ${product.name}`}
        url={`/checkout?productId=${productId}`}
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
                <div className="flex items-center gap-4">
                  {product.thumbnailUrl && (
                    <img
                      src={product.thumbnailUrl}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div>
                    <h3 className="font-bold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.type}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold">{product.price}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{product.price}</span>
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
                      clientSecret: undefined, // Will be set in CheckoutForm
                      appearance: {
                        theme: "stripe",
                      },
                    }}
                  >
                    <CheckoutForm
                      productId={product.id}
                      productName={product.name}
                      amount={product.price}
                      currency={product.currency}
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

