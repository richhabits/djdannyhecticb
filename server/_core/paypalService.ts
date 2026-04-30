/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { ENV } from "./env";

interface PayPalToken {
  scope: string;
  access_token: string;
  token_type: string;
  app_id: string;
  expires_in: number;
}

interface PayPalOrder {
  id: string;
  status: string;
  payer?: {
    email_address?: string;
    name?: {
      given_name: string;
      surname: string;
    };
  };
}

let tokenCache: {
  token: string;
  expiresAt: number;
} | null = null;

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token;
  }

  if (!ENV.paypalClientId || !ENV.paypalClientSecret) {
    throw new Error("PayPal credentials not configured");
  }

  const auth = Buffer.from(`${ENV.paypalClientId}:${ENV.paypalClientSecret}`).toString("base64");

  try {
    const response = await fetch(
      `${ENV.paypalMode === "live"
        ? "https://api.paypal.com"
        : "https://api.sandbox.paypal.com"
      }/v1/oauth2/token`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      }
    );

    if (!response.ok) {
      throw new Error(`PayPal auth failed: ${response.statusText}`);
    }

    const data = (await response.json()) as PayPalToken;

    // Cache the token for 95% of its lifetime
    tokenCache = {
      token: data.access_token,
      expiresAt: Date.now() + data.expires_in * 950,
    };

    return data.access_token;
  } catch (error) {
    console.error("PayPal token fetch error:", error);
    throw error;
  }
}

export async function createPayPalOrder(params: {
  amount: string; // e.g., "49.99"
  currency: string; // e.g., "GBP"
  description: string;
  items?: Array<{ name: string; sku: string; quantity: number; unit_amount: { currency_code: string; value: string } }>;
}) {
  const token = await getAccessToken();
  const baseUrl = ENV.paypalMode === "live" ? "https://api.paypal.com" : "https://api.sandbox.paypal.com";

  const orderPayload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: `order-${Date.now()}`,
        amount: {
          currency_code: params.currency,
          value: params.amount,
        },
        description: params.description,
        items: params.items || [
          {
            name: params.description,
            quantity: "1",
            unit_amount: {
              currency_code: params.currency,
              value: params.amount,
            },
          },
        ],
      },
    ],
    application_context: {
      brand_name: "DJ Danny Hectic B",
      locale: "en-GB",
      user_action: "PAY_NOW",
      return_url: `${process.env.VITE_API_URL || "http://localhost:3000"}/checkout/success`,
      cancel_url: `${process.env.VITE_API_URL || "http://localhost:3000"}/checkout`,
    },
  };

  try {
    const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`PayPal order creation failed: ${JSON.stringify(error)}`);
    }

    const order = (await response.json()) as PayPalOrder;
    return order;
  } catch (error) {
    console.error("PayPal order creation error:", error);
    throw error;
  }
}

export async function capturePayPalOrder(orderId: string) {
  const token = await getAccessToken();
  const baseUrl = ENV.paypalMode === "live" ? "https://api.paypal.com" : "https://api.sandbox.paypal.com";

  try {
    const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`PayPal capture failed: ${JSON.stringify(error)}`);
    }

    const captureResult = await response.json();
    return captureResult;
  } catch (error) {
    console.error("PayPal capture error:", error);
    throw error;
  }
}

export async function getPayPalOrderDetails(orderId: string) {
  const token = await getAccessToken();
  const baseUrl = ENV.paypalMode === "live" ? "https://api.paypal.com" : "https://api.sandbox.paypal.com";

  try {
    const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get PayPal order details: ${response.statusText}`);
    }

    const order = (await response.json()) as PayPalOrder;
    return order;
  } catch (error) {
    console.error("PayPal order details error:", error);
    throw error;
  }
}
