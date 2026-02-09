import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { cn } from "@/lib/utils";
import { MetaTagsComponent } from "@/components/MetaTags";
import { Heart, Coffee, Zap, Server, Loader2, CreditCard, Lock } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useLocation } from "wouter";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

function SupportPaymentForm({ amount, name, email, message, onSuccess }: {
  amount: string;
  name: string;
  email?: string;
  message?: string;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [, navigate] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { user } = useAuth();

  const createPaymentIntent = trpc.support.createPaymentIntent.useMutation({
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create payment");
    },
  });

  useEffect(() => {
    if (name && amount && parseFloat(amount) > 0) {
      createPaymentIntent.mutate({
        amount,
        currency: "GBP",
        fanName: name,
        email: email || user?.email,
        message,
        fanId: user?.id,
      });
    }
  }, [name, amount, email, message, user?.id, user?.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/support?success=true`,
        },
        redirect: "if_required",
      });

      if (error) {
        toast.error(error.message || "Payment failed");
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        toast.success(`Thank you! Your support of £${amount} has been received.`);
        onSuccess();
        setTimeout(() => {
          navigate("/support?success=true");
        }, 1500);
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
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="w-4 h-4" />
          <span>Secure payment powered by Stripe</span>
        </div>
        <PaymentElement />
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full h-12 text-lg font-semibold gradient-bg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pay £{amount}
          </>
        )}
      </Button>
    </form>
  );
}

export default function Support() {
  const { user } = useAuth();
  const [amount, setAmount] = useState<string>("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [showPayment, setShowPayment] = useState(false);
  const [location] = useLocation();

  // Check for success parameter
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1] || "");
    if (params.get("success") === "true") {
      toast.success("Payment successful! Thank you for your support.");
      setAmount("");
      setMessage("");
      setShowPayment(false);
    }
  }, [location]);

  const PRESETS = ["3.00", "5.00", "10.00", "20.00", "50.00"];

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!name) {
      toast.error("Please enter your name");
      return;
    }
    setShowPayment(true);
  };

  const handleBack = () => {
    setShowPayment(false);
  };

  return (
    <>
      <MetaTagsComponent
        title="Support DJ Danny Hectic B | Keep It Locked"
        description="Support the Hectic Radio movement. Your contributions help maintain the station and keep the music flowing."
        url="/support"
      />
      <div className="min-h-screen bg-background text-foreground pt-14">
        <div className="container py-12 px-4 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 gradient-text">Support Hectic Radio</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Help keep the underground frequency alive. Your support maintains the station, equipment, and brings you the best in UK Garage & House music.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Info Cards */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-card/50 border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    Why Support?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Hectic Radio operates independently. Your contributions directly support:
                  </p>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <Server className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>Server hosting and bandwidth</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>Equipment maintenance and upgrades</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Coffee className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>Music licensing and acquisition</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-muted/50 border-border">
                <CardHeader>
                  <CardTitle className="text-sm">Top Supporter</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Anonymous</span>
                    <span className="text-lg font-bold text-accent">£0.00</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Donation Form */}
            <div className="lg:col-span-2">
              <Card className="bg-card/50 border-border">
                <CardHeader>
                  <CardTitle>{showPayment ? "Payment Details" : "Make a Contribution"}</CardTitle>
                </CardHeader>
                <CardContent>
                  {!showPayment ? (
                    <form onSubmit={handleContinueToPayment} className="space-y-6">
                      {/* Amount Selection */}
                      <div className="space-y-4">
                        <label className="text-sm font-semibold block">Select Amount (GBP)</label>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                          {PRESETS.map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setAmount(val)}
                              className={cn(
                                "py-3 border-2 rounded-lg font-semibold transition-all",
                                amount === val
                                  ? "bg-accent text-foreground border-accent"
                                  : "bg-background border-border hover:border-accent"
                              )}
                            >
                              £{val}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 border-2 border-border rounded-lg p-3 focus-within:border-accent">
                          <span className="text-lg font-bold">£</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter custom amount"
                            className="border-0 focus-visible:ring-0 text-lg font-semibold"
                            required
                          />
                        </div>
                      </div>

                      {/* Name */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold block">Your Name *</label>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your name"
                          required
                          className="h-12"
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold block">Email *</label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          required
                          className="h-12"
                        />
                      </div>

                      {/* Message */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold block">Message (Optional)</label>
                        <Textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Leave a message of support..."
                          rows={4}
                          className="resize-none"
                        />
                      </div>

                      {/* Continue Button */}
                      <Button
                        type="submit"
                        disabled={!amount || !name || !email || parseFloat(amount) <= 0}
                        className="w-full h-12 text-lg font-semibold gradient-bg"
                      >
                        Continue to Payment
                      </Button>

                      <p className="text-xs text-muted-foreground text-center">
                        Your contribution helps keep Hectic Radio running. Thank you for your support!
                      </p>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      {import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? (
                        <Elements
                          stripe={stripePromise}
                          options={{
                            clientSecret: undefined, // Will be set in SupportPaymentForm
                            appearance: {
                              theme: "stripe",
                            },
                          }}
                        >
                          <SupportPaymentForm
                            amount={amount}
                            name={name}
                            email={email}
                            message={message}
                            onSuccess={() => {
                              setShowPayment(false);
                              setAmount("");
                              setMessage("");
                            }}
                          />
                        </Elements>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground mb-4">Payment processing is not configured.</p>
                          <Button variant="outline" onClick={handleBack}>Back</Button>
                        </div>
                      )}
                      <Button variant="outline" onClick={handleBack} className="w-full">
                        Back to Details
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
