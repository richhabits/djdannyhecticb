import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Lock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Stripe payment form (requires Stripe.js to be loaded)
// In production, you would use @stripe/react-stripe-js

interface PaymentProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image?: string;
  type: "one_time" | "subscription";
  interval?: "month" | "year";
}

interface PaymentFormProps {
  product: PaymentProduct;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

// Simulated payment processing (replace with real Stripe integration)
export function StripePaymentForm({ product, onSuccess, onError, className }: PaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal" | "apple_pay">("card");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  });
  const [step, setStep] = useState<"form" | "processing" | "success" | "error">("form");

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStep("processing");

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate success (90% success rate for demo)
    if (Math.random() > 0.1) {
      setStep("success");
      const paymentId = `pay_${Date.now()}`;
      onSuccess?.(paymentId);
      toast.success("Payment successful!");
    } else {
      setStep("error");
      onError?.("Payment failed. Please try again.");
      toast.error("Payment failed. Please try again.");
    }

    setLoading(false);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  if (step === "success") {
    return (
      <Card className={cn("p-8 text-center", className)}>
        <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">Payment Successful!</h3>
        <p className="text-muted-foreground mb-4">
          Thank you for your purchase. You'll receive a confirmation email shortly.
        </p>
        <Button onClick={() => setStep("form")}>Make Another Purchase</Button>
      </Card>
    );
  }

  if (step === "error") {
    return (
      <Card className={cn("p-8 text-center", className)}>
        <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">Payment Failed</h3>
        <p className="text-muted-foreground mb-4">
          There was an issue processing your payment. Please try again.
        </p>
        <Button onClick={() => setStep("form")}>Try Again</Button>
      </Card>
    );
  }

  return (
    <Card className={cn("p-6 glass", className)}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product summary */}
        <div className="flex items-center gap-4 pb-4 border-b border-border">
          {product.image && (
            <img 
              src={product.image} 
              alt={product.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-sm text-muted-foreground">{product.description}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">{formatCurrency(product.price, product.currency)}</p>
            {product.type === "subscription" && (
              <p className="text-xs text-muted-foreground">per {product.interval}</p>
            )}
          </div>
        </div>

        {/* Payment method selection */}
        <div className="space-y-3">
          <Label>Payment Method</Label>
          <RadioGroup
            value={paymentMethod}
            onValueChange={(v) => setPaymentMethod(v as any)}
            className="grid grid-cols-3 gap-3"
          >
            <div>
              <RadioGroupItem value="card" id="card" className="peer sr-only" />
              <Label
                htmlFor="card"
                className="flex flex-col items-center justify-center rounded-lg border-2 border-border p-4 hover:bg-accent/10 peer-data-[state=checked]:border-accent cursor-pointer"
              >
                <CreditCard className="w-6 h-6 mb-2" />
                <span className="text-xs">Card</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="paypal" id="paypal" className="peer sr-only" />
              <Label
                htmlFor="paypal"
                className="flex flex-col items-center justify-center rounded-lg border-2 border-border p-4 hover:bg-accent/10 peer-data-[state=checked]:border-accent cursor-pointer"
              >
                <span className="text-lg font-bold text-blue-600">P</span>
                <span className="text-xs">PayPal</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="apple_pay" id="apple_pay" className="peer sr-only" />
              <Label
                htmlFor="apple_pay"
                className="flex flex-col items-center justify-center rounded-lg border-2 border-border p-4 hover:bg-accent/10 peer-data-[state=checked]:border-accent cursor-pointer"
              >
                <span className="text-lg">🍎</span>
                <span className="text-xs">Apple Pay</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Card details */}
        {paymentMethod === "card" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="card-name">Cardholder Name</Label>
              <Input
                id="card-name"
                placeholder="John Doe"
                value={cardDetails.name}
                onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="card-number">Card Number</Label>
              <div className="relative">
                <Input
                  id="card-number"
                  placeholder="4242 4242 4242 4242"
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails({ 
                    ...cardDetails, 
                    number: formatCardNumber(e.target.value) 
                  })}
                  maxLength={19}
                  required
                />
                <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  value={cardDetails.expiry}
                  onChange={(e) => setCardDetails({ 
                    ...cardDetails, 
                    expiry: formatExpiry(e.target.value) 
                  })}
                  maxLength={5}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  placeholder="123"
                  value={cardDetails.cvc}
                  onChange={(e) => setCardDetails({ 
                    ...cardDetails, 
                    cvc: e.target.value.replace(/\D/g, "").slice(0, 4) 
                  })}
                  maxLength={4}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {paymentMethod === "paypal" && (
          <div className="text-center py-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              You will be redirected to PayPal to complete your payment
            </p>
          </div>
        )}

        {paymentMethod === "apple_pay" && (
          <div className="text-center py-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Click below to pay with Apple Pay
            </p>
          </div>
        )}

        {/* Security notice */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="w-4 h-4" />
          <span>Your payment info is encrypted and secure</span>
        </div>

        {/* Submit button */}
        <Button 
          type="submit" 
          className="w-full gradient-bg"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ${formatCurrency(product.price, product.currency)}`
          )}
        </Button>
      </form>
    </Card>
  );
}

// Quick payment button (one-click payments for saved cards)
export function QuickPayButton({ 
  amount, 
  currency = "GBP",
  label = "Pay Now",
  onPayment 
}: { 
  amount: number; 
  currency?: string;
  label?: string;
  onPayment: () => Promise<boolean>;
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const success = await onPayment();
    setLoading(false);
    
    if (success) {
      toast.success("Payment successful!");
    } else {
      toast.error("Payment failed");
    }
  };

  return (
    <Button 
      onClick={handleClick} 
      disabled={loading}
      className="gradient-bg"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <Lock className="w-4 h-4 mr-2" />
          {label} {new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency,
          }).format(amount)}
        </>
      )}
    </Button>
  );
}

// Subscription pricing table
export function PricingTable({ 
  plans,
  onSelectPlan 
}: { 
  plans: PaymentProduct[];
  onSelectPlan: (plan: PaymentProduct) => void;
}) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => (
        <Card 
          key={plan.id}
          className={cn(
            "p-6 relative transition-all cursor-pointer hover-lift",
            selectedPlan === plan.id && "ring-2 ring-accent"
          )}
          onClick={() => {
            setSelectedPlan(plan.id);
            onSelectPlan(plan);
          }}
        >
          {plan.id === "pro" && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-white text-xs font-medium rounded-full">
              Most Popular
            </div>
          )}
          
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold">{plan.name}</h3>
            <div>
              <span className="text-4xl font-bold">
                {new Intl.NumberFormat("en-GB", {
                  style: "currency",
                  currency: plan.currency,
                }).format(plan.price)}
              </span>
              {plan.type === "subscription" && (
                <span className="text-muted-foreground">/{plan.interval}</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{plan.description}</p>
            
            <Button 
              className={cn(
                "w-full",
                selectedPlan === plan.id ? "gradient-bg" : "variant-outline"
              )}
            >
              {selectedPlan === plan.id ? "Selected" : "Select Plan"}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default StripePaymentForm;
