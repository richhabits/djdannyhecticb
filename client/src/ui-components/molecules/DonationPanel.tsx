/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Donation/Tipping Panel with Stripe Integration
 */

import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { trpc } from "../../lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import {
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Heart, AlertCircle } from "lucide-react";
import clsx from "clsx";

const DONATION_TIERS = [
  { amount: 5, label: "$5", emoji: "❤️" },
  { amount: 10, label: "$10", emoji: "💜" },
  { amount: 25, label: "$25", emoji: "🔥" },
  { amount: 50, label: "$50", emoji: "⭐" },
  { amount: 100, label: "$100", emoji: "👑" },
];

interface DonationPanelProps {
  liveSessionId: number;
  streamerName?: string;
}

export function DonationPanel({
  liveSessionId,
  streamerName = "the streamer",
}: DonationPanelProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Create donation
  const createDonationMutation = useMutation({
    mutationFn: (data: {
      amount: number;
      message?: string;
      anonymous?: boolean;
    }) =>
      trpc.live.donations.create.mutate({
        liveSessionId,
        amount: data.amount,
        message: data.message,
        anonymous: data.anonymous,
      }),
    onSuccess: (data) => {
      toast.success("Processing your donation...");
      if (data.clientSecret && stripe) {
        handlePayment(data.clientSecret, data.donation.id);
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to process donation"
      );
      setIsProcessing(false);
    },
  });

  // Confirm donation
  const confirmDonationMutation = useMutation({
    mutationFn: (data: { donationId: number; paymentIntentId: string }) =>
      trpc.live.donations.confirm.mutate(data),
    onSuccess: () => {
      toast.success("Thank you for your donation! 🎉");
      setIsOpen(false);
      setSelectedAmount(null);
      setCustomAmount("");
      setMessage("");
      setIsProcessing(false);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to confirm donation"
      );
      setIsProcessing(false);
    },
  });

  // Get session top donors
  const { data: topDonors } = useQuery({
    queryKey: ["live:donations:sessionTop", liveSessionId],
    queryFn: () =>
      trpc.live.donations.sessionTop.query({
        liveSessionId,
        limit: 5,
      }),
    refetchInterval: 10000,
  });

  // Get user donation history
  const { data: donationHistory } = useQuery({
    queryKey: ["live:donations:history"],
    queryFn: () =>
      trpc.live.donations.history.query({
        limit: 10,
        offset: 0,
      }),
    enabled: isOpen,
  });

  const getAmount = (): number => {
    if (selectedAmount) return selectedAmount;
    return customAmount ? parseInt(customAmount) : 0;
  };

  const handlePayment = async (
    clientSecret: string,
    donationId: number
  ) => {
    if (!stripe || !elements) return;

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      const { paymentIntent, error } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: "Anonymous",
            },
          },
        }
      );

      if (error) {
        throw error;
      }

      if (paymentIntent?.id) {
        confirmDonationMutation.mutate({
          donationId,
          paymentIntentId: paymentIntent.id,
        });
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Payment failed"
      );
      setIsProcessing(false);
    }
  };

  const handleDonate = async () => {
    const amount = getAmount();
    if (amount < 5) {
      toast.error("Minimum donation is $5");
      return;
    }

    if (amount > 10000) {
      toast.error("Maximum donation is $10,000");
      return;
    }

    setIsProcessing(true);
    createDonationMutation.mutate({
      amount,
      message: message || undefined,
      anonymous: isAnonymous,
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Donors Display */}
      {topDonors && topDonors.length > 0 && (
        <div className="bg-gradient-to-r from-amber-600 to-red-600 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Top Supporters
          </h3>
          <div className="space-y-2">
            {topDonors.map((donor, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-white font-medium">
                  #{idx + 1} {donor.userName || "Anonymous"}
                </span>
                <span className="text-yellow-100 font-bold">
                  ${donor.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Donation Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold"
            size="lg"
          >
            <Heart className="mr-2 h-5 w-5" />
            Support {streamerName}
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-md bg-gray-950 border border-gray-800">
          <DialogHeader>
            <DialogTitle>Support {streamerName}</DialogTitle>
            <DialogDescription className="text-gray-400">
              Your donation helps support streaming!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Quick Tiers */}
            <div>
              <label className="text-sm font-semibold block mb-2">
                Quick Amounts
              </label>
              <div className="grid grid-cols-5 gap-2">
                {DONATION_TIERS.map((tier) => (
                  <Button
                    key={tier.amount}
                    variant={
                      selectedAmount === tier.amount ? "default" : "outline"
                    }
                    className={clsx(
                      "flex flex-col items-center p-2 h-auto",
                      selectedAmount === tier.amount
                        ? "bg-purple-600 border-purple-500"
                        : "border-gray-700"
                    )}
                    onClick={() => {
                      setSelectedAmount(tier.amount);
                      setCustomAmount("");
                    }}
                  >
                    <span className="text-lg">{tier.emoji}</span>
                    <span className="text-xs font-bold">{tier.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <label className="text-sm font-semibold block mb-2">
                Custom Amount ($)
              </label>
              <Input
                type="number"
                min="5"
                max="10000"
                step="5"
                placeholder="Enter custom amount"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                className="bg-gray-900 border-gray-700"
              />
            </div>

            {/* Message */}
            <div>
              <label className="text-sm font-semibold block mb-2">
                Message (Optional)
              </label>
              <Textarea
                placeholder="Leave a message with your support..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                rows={3}
                className="bg-gray-900 border-gray-700 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {message.length}/500
              </p>
            </div>

            {/* Anonymous Option */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Donate anonymously</span>
            </label>

            {/* Card Element */}
            <div className="bg-gray-900 border border-gray-700 rounded p-3">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "#fff",
                      "::placeholder": {
                        color: "#6b7280",
                      },
                    },
                    invalid: {
                      color: "#fca5a5",
                    },
                  },
                }}
              />
            </div>

            {/* Amount Summary */}
            <div className="bg-gray-900 rounded p-3 border border-gray-700">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Donation:</span>
                <span className="text-xl font-bold text-green-400">
                  ${getAmount()}
                </span>
              </div>
            </div>

            {/* Donate Button */}
            <Button
              onClick={handleDonate}
              disabled={isProcessing || getAmount() < 5 || !stripe}
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold"
            >
              {isProcessing ? "Processing..." : "Donate Now"}
            </Button>

            {/* Donation History */}
            {donationHistory && donationHistory.length > 0 && (
              <div className="bg-gray-900 rounded p-3 border border-gray-700">
                <h4 className="text-sm font-semibold mb-2">Your Donations</h4>
                <div className="space-y-1 text-xs">
                  {donationHistory.map((donation) => (
                    <div
                      key={donation.id}
                      className="flex justify-between text-gray-400"
                    >
                      <span>${donation.amount}</span>
                      <span>
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
