/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Stripe Elements Provider - Wraps the app with Stripe context
 */

import React, { ReactNode } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

let stripePromise: ReturnType<typeof loadStripe> | null = null;

const getStripe = () => {
  if (!publishableKey) {
    console.warn('Stripe publishable key not configured');
    return null;
  }

  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

interface StripeProviderProps {
  children: ReactNode;
}

export function StripeProvider({ children }: StripeProviderProps) {
  const stripePromise = getStripe();

  if (!stripePromise) {
    // If Stripe is not configured, just render children without Elements wrapper
    return <>{children}</>;
  }

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
}
