/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Subscription Tiers Page
 * - 5 plans: Free, Subscriber, VIP, Premium, Family
 * - Tier comparison table
 * - Feature breakdown
 * - Payment integration
 */

import React, { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Zap } from "lucide-react";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || "");

interface SubscriptionPlan {
  plan: string;
  name: string;
  monthlyPrice: string | number;
  yearlyPrice?: string | number;
  features: string[];
}

const PricingComparison: React.FC<{ plans: SubscriptionPlan[] }> = ({ plans }) => {
  const allFeatures = [
    "Ad-free experience",
    "Custom username color",
    "Early notifications",
    "Private chat room",
    "Subscriber-only events",
    "Merchandise discounts",
    "Coaching calls",
    "Exclusive content",
    "Custom badge",
    "Family members (up to 4)",
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="p-4 text-left font-semibold">Features</th>
            {plans.map((plan) => (
              <th key={plan.plan} className="p-4 text-center font-semibold">
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allFeatures.map((feature) => (
            <tr key={feature} className="border-b hover:bg-slate-50">
              <td className="p-4 text-left">{feature}</td>
              {plans.map((plan) => (
                <td key={`${plan.plan}-${feature}`} className="p-4 text-center">
                  {plan.features.includes(feature.toLowerCase()) ? (
                    <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="mx-auto h-5 w-5 text-gray-300" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const PaymentForm: React.FC<{
  plan: SubscriptionPlan;
  billingCycle: "monthly" | "yearly";
  onSuccess: () => void;
}> = ({ plan, billingCycle, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentMutation = trpc.subscriptions.createPaymentIntent.useMutation();
  const confirmMutation = trpc.subscriptions.confirmSubscription.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      // Create payment intent
      const intentResult = await createPaymentMutation.mutateAsync({
        plan: plan.plan as any,
        billingCycle,
      });

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card element not found");

      // Confirm payment
      const paymentResult = await stripe.confirmCardPayment(intentResult.clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (paymentResult.error) {
        setError(paymentResult.error.message || "Payment failed");
        return;
      }

      if (paymentResult.paymentIntent?.status === "succeeded") {
        // Confirm subscription
        await confirmMutation.mutateAsync({
          paymentIntentId: paymentResult.paymentIntent.id,
          plan: plan.plan as any,
          billingCycle,
        });

        onSuccess();
      }
    } catch (err) {
      setError((err as any).message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const price = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardElement
        options={{
          style: {
            base: {
              fontSize: "16px",
              color: "#424770",
              "::placeholder": {
                color: "#aab7c4",
              },
            },
            invalid: {
              color: "#9e2146",
            },
          },
        }}
      />
      {error && <div className="text-sm text-red-600">{error}</div>}
      <Button
        type="submit"
        disabled={loading || !stripe}
        className="w-full"
      >
        {loading ? "Processing..." : `Pay $${price}/${billingCycle === "yearly" ? "year" : "month"}`}
      </Button>
    </form>
  );
};

const Subscribe: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  const plansQuery = trpc.subscriptions.getPlans.useQuery();
  const currentSubQuery = trpc.subscriptions.getCurrentSubscription.useQuery();

  useEffect(() => {
    if (plansQuery.data) {
      setPlans(plansQuery.data as any);
    }
  }, [plansQuery.data]);

  if (!plans.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading subscription plans...</p>
      </div>
    );
  }

  const currentPlan = currentSubQuery.data?.plan;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <h1 className="mb-4 text-5xl font-bold">Choose Your Plan</h1>
          <p className="mb-8 text-xl text-slate-300">
            Unlock exclusive features and support the show
          </p>

          {/* Billing Toggle */}
          <div className="mb-12 flex justify-center gap-4">
            <Button
              variant={billingCycle === "monthly" ? "default" : "outline"}
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly
            </Button>
            <Button
              variant={billingCycle === "yearly" ? "default" : "outline"}
              onClick={() => setBillingCycle("yearly")}
            >
              Yearly (Save 15%)
            </Button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mb-16 grid gap-8 md:grid-cols-5">
          {plans.map((plan) => {
            const price = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
            const isCurrentPlan = currentPlan === plan.plan;

            return (
              <Card
                key={plan.plan}
                className={`relative flex flex-col ${
                  plan.plan === "premium"
                    ? "border-2 border-yellow-500 md:scale-105"
                    : "border-slate-700"
                } ${isCurrentPlan ? "ring-2 ring-blue-500" : ""}`}
              >
                {plan.plan === "premium" && (
                  <Badge className="absolute right-4 top-4 bg-yellow-500">Popular</Badge>
                )}
                {isCurrentPlan && (
                  <Badge className="absolute right-4 top-4 bg-blue-500">Current</Badge>
                )}

                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-white">${price}</span>
                    <span className="text-slate-400">/{billingCycle === "yearly" ? "year" : "month"}</span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-3 text-sm">
                    {plan.features.slice(0, 3).map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <Zap className="h-4 w-4 flex-shrink-0 text-yellow-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="mt-6 w-full"
                    variant={isCurrentPlan ? "outline" : "default"}
                    disabled={isCurrentPlan}
                    onClick={() => {
                      setSelectedPlan(plan.plan);
                      setShowPayment(true);
                    }}
                  >
                    {isCurrentPlan ? "Current Plan" : "Subscribe"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Comparison Table */}
        <div className="mb-16">
          <h2 className="mb-8 text-3xl font-bold">Feature Comparison</h2>
          <Card className="border-slate-700 bg-slate-900">
            <CardContent className="pt-6">
              <PricingComparison plans={plans} />
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="mb-8 text-3xl font-bold">Frequently Asked Questions</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-slate-700 bg-slate-900">
              <CardHeader>
                <CardTitle className="text-lg">Can I change my plan?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">Yes, you can upgrade or downgrade anytime. Changes take effect immediately.</p>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-900">
              <CardHeader>
                <CardTitle className="text-lg">Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">Start with our Free plan to explore features, then upgrade whenever you're ready.</p>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-900">
              <CardHeader>
                <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">Absolutely! Cancel anytime with no questions asked. No long-term commitments.</p>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-900">
              <CardHeader>
                <CardTitle className="text-lg">Do you offer refunds?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">We offer 30-day refunds if you're not satisfied. Contact support for details.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && selectedPlan && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Complete Your Subscription</CardTitle>
              <Button
                variant="ghost"
                className="absolute right-4 top-4"
                onClick={() => setShowPayment(false)}
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise}>
                <PaymentForm
                  plan={plans.find((p) => p.plan === selectedPlan)!}
                  billingCycle={billingCycle}
                  onSuccess={() => {
                    setShowPayment(false);
                    currentSubQuery.refetch();
                  }}
                />
              </Elements>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Subscribe;
