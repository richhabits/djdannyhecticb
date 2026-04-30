/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { ENV } from "./env";

/**
 * Printfull API integration for on-demand merchandise
 * Documentation: https://printfull.com/api/documentation
 */

const PRINTFULL_API_URL = "https://api.printfull.com/v2";

export interface PrintfullProduct {
  id: number;
  name: string;
  category: string;
  category_id: number;
  image: string;
  variants: PrintfullVariant[];
  price: number;
}

export interface PrintfullVariant {
  id: number;
  name: string;
  color?: string;
  size?: string;
  price: number;
}

export interface PrintfullDesignFile {
  id: number;
  url: string;
  thumbnail: string;
  name: string;
}

export interface PrintfullOrder {
  id: number;
  status: string;
  tracking_number?: string;
  tracking_url?: string;
  items: PrintfullOrderItem[];
}

export interface PrintfullOrderItem {
  product_id: number;
  variant_id: number;
  quantity: number;
  design_id?: number;
  product_name: string;
}

/**
 * Initialize Printfull API client
 */
function getPrintfullHeaders(): Record<string, string> {
  if (!ENV.printfullApiKey) {
    throw new Error("Printfull API key not configured");
  }

  return {
    "Authorization": `Bearer ${ENV.printfullApiKey}`,
    "Content-Type": "application/json",
  };
}

/**
 * Fetch all available Printfull products and variants
 */
export async function fetchPrintfullProducts(): Promise<PrintfullProduct[]> {
  try {
    const response = await fetch(`${PRINTFULL_API_URL}/products`, {
      method: "GET",
      headers: getPrintfullHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Printfull API error: ${response.statusText}`);
    }

    const data = await response.json() as any;
    return data.data || [];
  } catch (error) {
    console.error("[Printfull] Error fetching products:", error);
    throw error;
  }
}

/**
 * Create a design file in Printfull from an image URL
 */
export async function createDesignFile(imageUrl: string, name: string = "DJ Danny Design"): Promise<PrintfullDesignFile> {
  try {
    const response = await fetch(`${PRINTFULL_API_URL}/designs`, {
      method: "POST",
      headers: getPrintfullHeaders(),
      body: JSON.stringify({
        title: name,
        width: 1200,
        height: 1200,
        pages: [
          {
            design_type: "image",
            placement: "back",
            images: [
              {
                url: imageUrl,
                angle: 0,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Printfull design creation error: ${response.statusText}`);
    }

    const data = await response.json() as any;
    return data.data;
  } catch (error) {
    console.error("[Printfull] Error creating design:", error);
    throw error;
  }
}

export interface EstimateItem {
  product_id: number;
  variant_id: number;
  quantity: number;
  design_id?: number;
}

export interface ShippingEstimate {
  standard: number;
  express: number;
  international: number;
}

/**
 * Estimate shipping costs for an order
 */
export async function estimateOrder(
  items: EstimateItem[],
  recipientAddress: {
    country: string;
    city?: string;
    postcode?: string;
  }
): Promise<ShippingEstimate> {
  try {
    const response = await fetch(`${PRINTFULL_API_URL}/orders/estimate`, {
      method: "POST",
      headers: getPrintfullHeaders(),
      body: JSON.stringify({
        recipient: {
          address1: "123 Main St",
          city: recipientAddress.city || "London",
          country_code: recipientAddress.country,
          postal_code: recipientAddress.postcode || "EC1A 1AA",
        },
        items,
      }),
    });

    if (!response.ok) {
      throw new Error(`Printfull estimate error: ${response.statusText}`);
    }

    const data = await response.json() as any;
    const shippingMethods = data.data?.shipping || {};

    return {
      standard: shippingMethods.standard?.price || 0,
      express: shippingMethods.express?.price || 0,
      international: shippingMethods.international?.price || 0,
    };
  } catch (error) {
    console.error("[Printfull] Error estimating order:", error);
    // Return default values on error
    return {
      standard: 5.99,
      express: 12.99,
      international: 24.99,
    };
  }
}

export interface CreateOrderInput {
  items: PrintfullOrderItem[];
  shippingAddress: {
    address1: string;
    address2?: string;
    city: string;
    postalCode: string;
    country: string;
    name: string;
    email: string;
    phone?: string;
  };
  shippingMethod: "standard" | "express" | "international";
}

/**
 * Create an order on Printfull
 */
export async function createPrintfullOrder(input: CreateOrderInput): Promise<PrintfullOrder> {
  try {
    const response = await fetch(`${PRINTFULL_API_URL}/orders`, {
      method: "POST",
      headers: getPrintfullHeaders(),
      body: JSON.stringify({
        recipient: {
          address1: input.shippingAddress.address1,
          address2: input.shippingAddress.address2,
          city: input.shippingAddress.city,
          postal_code: input.shippingAddress.postalCode,
          country_code: input.shippingAddress.country,
          name: input.shippingAddress.name,
          email: input.shippingAddress.email,
          phone: input.shippingAddress.phone,
        },
        items: input.items,
        shipping: {
          method: input.shippingMethod,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Printfull order creation error: ${response.statusText}`);
    }

    const data = await response.json() as any;
    return data.data;
  } catch (error) {
    console.error("[Printfull] Error creating order:", error);
    throw error;
  }
}

/**
 * Get order status and tracking information
 */
export async function getPrintfullOrder(orderId: number): Promise<PrintfullOrder> {
  try {
    const response = await fetch(`${PRINTFULL_API_URL}/orders/${orderId}`, {
      method: "GET",
      headers: getPrintfullHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Printfull order fetch error: ${response.statusText}`);
    }

    const data = await response.json() as any;
    return data.data;
  } catch (error) {
    console.error("[Printfull] Error fetching order:", error);
    throw error;
  }
}

/**
 * Cancel a Printfull order
 */
export async function cancelPrintfullOrder(orderId: number): Promise<boolean> {
  try {
    const response = await fetch(`${PRINTFULL_API_URL}/orders/${orderId}/cancel`, {
      method: "POST",
      headers: getPrintfullHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Printfull cancel error: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("[Printfull] Error cancelling order:", error);
    return false;
  }
}
