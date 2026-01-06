/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

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

function SupportPaymentForm({ amount, onSuccess }: {
  amount: string;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [, navigate] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
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
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [location] = useLocation();

  const createPaymentIntent = trpc.support.createPaymentIntent.useMutation({
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
      setShowPayment(true);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to initiate payment");
    },
  });

  // Check for success parameter
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1] || "");
    if (params.get("success") === "true") {
      toast.success("Payment successful! Thank you for your support.");
      setAmount("");
      setMessage("");
      setShowPayment(false);
      setClientSecret(null);
    }
  }, [location]);

  const PRESETS = ["3.00", "5.00", "10.00", "20.00", "50.00"];

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Create payment intent immediately
    createPaymentIntent.mutate({
      amount,
      currency: "GBP",
      fanName: name,
      email: email || user?.email,
      message,
      fanId: user?.id,
    });
  };

  const handleBack = () => {
    setShowPayment(false);
    setClientSecret(null);
  };

  return (
    <>
      <MetaTagsComponent
        title="Support Hectic Radio"
        description="Help keep the music playing by supporting Hectic Radio and DJ Danny Hectic B."
      />

      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
              SUPPORT THE <span className="text-primary gradient-text">MOVEMENT</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your contributions help keep Hectic Radio ad-free and independent.
              Every donation goes directly into server costs, music licensing, and new equipment.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="hover-card border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                  <Coffee className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Buy Me A Coffee</h3>
                <p className="text-muted-foreground text-sm">
                  Small contributions help fuel late night mixing sessions.
                </p>
              </CardContent>
            </Card>
            <Card className="hover-card border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                  <Server className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Server Costs</h3>
                <p className="text-muted-foreground text-sm">
                  Help cover the monthly hosting and streaming bandwidth bills.
                </p>
              </CardContent>
            </Card>
            <Card className="hover-card border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Equipment Fund</h3>
                <p className="text-muted-foreground text-sm">
                  Contribute towards new decks, software, and studio gear.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="max-w-xl mx-auto">
            <Card className="border-primary/20 shadow-2xl shadow-primary/5 bg-card/90 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary fill-primary" />
                  Make a Contribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!showPayment ? (
                  <form onSubmit={handleContinueToPayment} className="space-y-6">
                    {/* Amount Selection */}
                    <div className="space-y-4">
                      <label className="text-sm font-semibold block">Select Amount</label>
                      <div className="grid grid-cols-3 gap-3">
                        {PRESETS.map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setAmount(val)}
                            className={cn(
                              "h-12 rounded-md font-bold transition-all border-2",
                              amount === val
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-primary/50 bg-background"
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
                      disabled={!amount || !name || !email || parseFloat(amount) <= 0 || createPaymentIntent.isPending}
                      className="w-full h-12 text-lg font-semibold gradient-bg"
                    >
                      {createPaymentIntent.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Preparing Secure Payment...
                        </>
                      ) : (
                        "Continue to Payment"
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      Your contribution helps keep Hectic Radio running. Thank you for your support!
                    </p>
                  </form>
                ) : (
                  <div className="space-y-6">
                    {import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY && clientSecret ? (
                      <Elements
                        stripe={stripePromise}
                        options={{
                          clientSecret,
                          appearance: {
                            theme: "stripe",
                          },
                        }}
                      >
                        <SupportPaymentForm
                          amount={amount}
                          onSuccess={() => {
                            setShowPayment(false);
                            setAmount("");
                            setMessage("");
                            setClientSecret(null);
                          }}
                        />
                      </Elements>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                        <p className="text-muted-foreground">Initializing payment gateway...</p>
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
    </>
  );
}
