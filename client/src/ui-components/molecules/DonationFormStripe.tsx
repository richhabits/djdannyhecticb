/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Donation Form with Stripe Payment Integration
 */

import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface DonationFormStripeProps {
  onSuccess?: () => void;
  successMessage?: string;
  sessionId?: number; // Optional live session ID
}

type FormStep = 'details' | 'payment' | 'processing' | 'success';

export function DonationFormStripe({
  onSuccess,
  successMessage = 'Thank you for your generous support!',
  sessionId,
}: DonationFormStripeProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [step, setStep] = useState<FormStep>('details');
  const [formData, setFormData] = useState({
    donorName: '',
    email: '',
    amount: '',
    message: '',
    anonymous: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');

  // tRPC mutations
  const createPaymentIntent = trpc.donations.createPaymentIntent.useMutation();
  const confirmDonation = trpc.donations.confirmDonation.useMutation();

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.donorName.trim()) {
      newErrors.donorName = 'Name is required';
    } else if (formData.donorName.length < 2) {
      newErrors.donorName = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount < 1) {
        newErrors.amount = 'Amount must be at least $1';
      } else if (amount > 100000) {
        newErrors.amount = 'Amount must not exceed $100,000';
      }
    }

    if (formData.message && formData.message.length > 500) {
      newErrors.message = 'Message must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle proceeding to payment
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors above');
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert amount to cents
      const amountInCents = Math.round(parseFloat(formData.amount) * 100);

      // Create payment intent
      const result = await createPaymentIntent.mutateAsync({
        amount: amountInCents,
        currency: 'USD',
        donorName: formData.donorName,
        email: formData.email,
        message: formData.message || undefined,
      });

      if (result.success && result.clientSecret) {
        setPaymentIntentId(result.paymentIntentId);
        setStep('payment');
        toast.success('Ready to enter payment details');
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create payment intent';
      toast.error(message);
      console.error('Payment intent error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle payment submission
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error('Stripe not initialized');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast.error('Card element not found');
      return;
    }

    setIsSubmitting(true);
    setStep('processing');

    try {
      const clientSecret = createPaymentIntent.data?.clientSecret;
      if (!clientSecret) {
        throw new Error('Payment intent not ready');
      }

      // Confirm payment with Stripe using the newer API
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: formData.donorName,
            email: formData.email,
          },
        },
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
        setStep('payment');
        setIsSubmitting(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded, confirm donation in database
        await confirmDonation.mutateAsync({
          paymentIntentId: paymentIntent.id,
          donorName: formData.donorName,
          amount: parseFloat(formData.amount),
          message: formData.message || undefined,
          anonymous: formData.anonymous,
        });

        setStep('success');
        toast.success(successMessage);

        // Reset form after 3 seconds
        setTimeout(() => {
          setFormData({
            donorName: '',
            email: '',
            amount: '',
            message: '',
            anonymous: false,
          });
          setPaymentIntentId('');
          setStep('details');
          onSuccess?.();
        }, 3000);
      } else if (paymentIntent?.status === 'requires_action') {
        toast.error('Payment requires additional confirmation');
        setStep('payment');
      } else {
        toast.error('Payment processing failed');
        setStep('payment');
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Payment processing failed';
      toast.error(message);
      console.error('Payment error:', error);
      setStep('payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: Details form
  if (step === 'details') {
    return (
      <form onSubmit={handleProceedToPayment} className="space-y-6 max-w-md">
        <div>
          <h2 className="text-2xl font-bold">Support the Stream</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Your contribution helps keep the stream running smoothly.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Your Name *</label>
          <input
            type="text"
            value={formData.donorName}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, donorName: e.target.value }));
              if (errors.donorName) {
                setErrors((prev) => {
                  const { donorName, ...rest } = prev;
                  return rest;
                });
              }
            }}
            placeholder="e.g., John Doe"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.donorName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.donorName && (
            <p className="text-red-500 text-sm mt-1">{errors.donorName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email Address *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, email: e.target.value }));
              if (errors.email) {
                setErrors((prev) => {
                  const { email, ...rest } = prev;
                  return rest;
                });
              }
            }}
            placeholder="you@example.com"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Donation Amount (USD) *</label>
          <div className="relative">
            <span className="absolute left-4 top-2 text-lg">$</span>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, amount: e.target.value }));
                if (errors.amount) {
                  setErrors((prev) => {
                    const { amount, ...rest } = prev;
                    return rest;
                  });
                }
              }}
              placeholder="50"
              min="1"
              max="100000"
              step="0.01"
              className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
          <p className="text-xs text-muted-foreground mt-1">Min $1, Max $100,000</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Message (Optional)</label>
          <textarea
            value={formData.message}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, message: e.target.value }));
              if (errors.message) {
                setErrors((prev) => {
                  const { message, ...rest } = prev;
                  return rest;
                });
              }
            }}
            placeholder="Send a shout-out or message..."
            maxLength={500}
            rows={3}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
              errors.message ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}
            <p className="text-xs text-muted-foreground ml-auto">
              {formData.message.length}/500
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="anonymous"
            checked={formData.anonymous}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, anonymous: e.target.checked }))
            }
            className="rounded"
          />
          <label htmlFor="anonymous" className="text-sm">
            Keep my donation anonymous
          </label>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 text-lg"
        >
          {isSubmitting ? 'Processing...' : `Continue to Payment ($${formData.amount || '0'})`}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Your donation is secure and processed via Stripe. No spam, we promise!
        </p>
      </form>
    );
  }

  // Step 2: Payment form
  if (step === 'payment') {
    return (
      <form onSubmit={handlePaymentSubmit} className="space-y-6 max-w-md">
        <div>
          <h2 className="text-2xl font-bold">Enter Payment Details</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Donation: ${formData.amount} from {formData.donorName}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Card Details *</label>
          <div className="px-4 py-3 border border-gray-300 rounded-lg bg-white">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#fa755a',
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            💡 Use Stripe test card: <code className="font-mono">4242 4242 4242 4242</code>
            <br />
            Expiry: Any future date, CVC: Any 3 digits
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep('details')}
            disabled={isSubmitting}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !stripe}
            className="flex-1"
          >
            {isSubmitting ? 'Processing...' : `Complete Donation ($${formData.amount})`}
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Secure payment powered by Stripe
        </p>
      </form>
    );
  }

  // Step 3: Processing
  if (step === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 max-w-md py-12">
        <div className="animate-spin">
          <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
        <p className="text-lg font-medium">Processing your donation...</p>
        <p className="text-sm text-muted-foreground">Please don't close this window</p>
      </div>
    );
  }

  // Step 4: Success
  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 max-w-md py-12 text-center">
        <div className="text-5xl">🎉</div>
        <h3 className="text-2xl font-bold">Thank You!</h3>
        <p className="text-muted-foreground">{successMessage}</p>
        <p className="text-sm text-muted-foreground">
          Donation of ${formData.amount} from {formData.donorName} received
        </p>
        {formData.message && (
          <p className="text-sm italic text-gray-600 bg-gray-50 p-3 rounded">
            "{formData.message}"
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-8">
          Redirecting in a moment...
        </p>
      </div>
    );
  }

  return null;
}
