/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import crypto from "crypto";
import { ENV } from "./env";
import * as db from "../db";
import { auditLog } from "./audit";
import { Request } from "express";

/**
 * PayPal Webhook Event Types
 */
export enum PayPalEventType {
  PAYMENT_CAPTURE_COMPLETED = "PAYMENT.CAPTURE.COMPLETED",
  PAYMENT_CAPTURE_DENIED = "PAYMENT.CAPTURE.DENIED",
  PAYMENT_CAPTURE_REFUNDED = "PAYMENT.CAPTURE.REFUNDED",
  PAYMENT_CAPTURE_REVERSED = "PAYMENT.CAPTURE.REVERSED",
}

/**
 * PayPal Webhook Signature Request Structure
 */
interface PayPalWebhookBody {
  id: string;
  event_type: string;
  create_time: string;
  event_version: string;
  resource_type: string;
  resource: {
    id?: string;
    custom_id?: string;
    status?: string;
    amount?: {
      currency_code: string;
      value: string;
    };
    payer?: {
      email_address?: string;
      name?: {
        given_name?: string;
        surname?: string;
      };
    };
    [key: string]: any;
  };
  links?: Array<{
    rel: string;
    href: string;
  }>;
}

/**
 * Verify PayPal webhook signature
 * Uses PayPal's signature verification algorithm as per their documentation
 */
export async function verifyPayPalWebhookSignature(
  req: Request,
  webhookId: string
): Promise<boolean> {
  const transmissionId = req.headers["paypal-transmission-id"] as string;
  const transmissionTime = req.headers["paypal-transmission-time"] as string;
  const certUrl = req.headers["paypal-cert-url"] as string;
  const authAlgo = req.headers["paypal-auth-algo"] as string;
  const transmissionSig = req.headers["paypal-transmission-sig"] as string;

  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
    console.error("PayPal webhook: Missing signature headers");
    return false;
  }

  try {
    // Construct the expected signature string
    const expectedSignatureString =
      `${transmissionId}|${transmissionTime}|${webhookId}|${crypto
        .createHash("sha256")
        .update(JSON.stringify(req.body))
        .digest("hex")}`;

    // Fetch PayPal's certificate
    const certResponse = await fetch(certUrl);
    if (!certResponse.ok) {
      console.error("PayPal webhook: Failed to fetch certificate");
      return false;
    }

    const cert = await certResponse.text();

    // Verify the signature
    const verifier = crypto.createVerify(authAlgo.toUpperCase());
    verifier.update(expectedSignatureString);
    const isValid = verifier.verify(cert, transmissionSig, "base64");

    return isValid;
  } catch (error) {
    console.error("PayPal webhook signature verification error:", error);
    return false;
  }
}

/**
 * Extract purchase ID from PayPal custom_id field
 */
function extractPurchaseIdFromCustomId(customId: string): number | null {
  if (!customId || !customId.startsWith("purchase_")) {
    return null;
  }
  const id = parseInt(customId.replace("purchase_", ""), 10);
  return !isNaN(id) ? id : null;
}

/**
 * Handle payment.capture.completed webhook
 * Updates order status and creates audit log
 */
export async function handlePaymentCaptureCompleted(
  event: PayPalWebhookBody,
  req: Request
): Promise<void> {
  const { resource } = event;
  const customId = resource.custom_id;
  const transactionId = resource.id;
  const status = resource.status;

  // Extract purchase ID from custom_id
  const purchaseId = extractPurchaseIdFromCustomId(customId);

  if (!purchaseId) {
    console.warn(
      `PayPal webhook: Invalid or missing custom_id in PAYMENT.CAPTURE.COMPLETED event: ${customId}`
    );
    return;
  }

  if (!transactionId) {
    console.warn("PayPal webhook: Missing transaction ID in capture completed event");
    return;
  }

  try {
    // Fetch current purchase for before/after snapshot
    const beforePurchase = await db.getPurchase(purchaseId);
    if (!beforePurchase) {
      console.warn(
        `PayPal webhook: Purchase not found for ID ${purchaseId} in capture completed event`
      );
      return;
    }

    // Update purchase status
    const updatedPurchase = await db.updatePurchase(purchaseId, {
      status: "completed",
      transactionId,
    });

    // Create audit log
    await auditLog(
      { req, user: { id: 0, name: "PayPal Webhook" } },
      {
        action: "payment_capture_completed",
        entityType: "purchase",
        entityId: purchaseId,
        metadata: {
          paypalTransactionId: transactionId,
          captureStatus: status,
          amount: resource.amount?.value,
          currency: resource.amount?.currency_code,
          payerEmail: resource.payer?.email_address,
        },
        beforeSnapshot: beforePurchase,
        afterSnapshot: updatedPurchase,
      }
    );

    console.log(
      `PayPal payment completed: Purchase ${purchaseId}, Transaction ${transactionId}`
    );
  } catch (error) {
    console.error(
      `Error handling payment.capture.completed for purchase ${purchaseId}:`,
      error
    );
    throw error;
  }
}

/**
 * Handle payment.capture.denied webhook
 * Marks payment as failed
 */
export async function handlePaymentCaptureDenied(
  event: PayPalWebhookBody,
  req: Request
): Promise<void> {
  const { resource } = event;
  const customId = resource.custom_id;
  const transactionId = resource.id;
  const status = resource.status;

  const purchaseId = extractPurchaseIdFromCustomId(customId);

  if (!purchaseId) {
    console.warn(
      `PayPal webhook: Invalid or missing custom_id in PAYMENT.CAPTURE.DENIED event: ${customId}`
    );
    return;
  }

  try {
    const beforePurchase = await db.getPurchase(purchaseId);
    if (!beforePurchase) {
      console.warn(
        `PayPal webhook: Purchase not found for ID ${purchaseId} in capture denied event`
      );
      return;
    }

    const updatedPurchase = await db.updatePurchase(purchaseId, {
      status: "failed",
      transactionId,
    });

    // Create audit log
    await auditLog(
      { req, user: { id: 0, name: "PayPal Webhook" } },
      {
        action: "payment_capture_denied",
        entityType: "purchase",
        entityId: purchaseId,
        metadata: {
          paypalTransactionId: transactionId,
          captureStatus: status,
          amount: resource.amount?.value,
          currency: resource.amount?.currency_code,
        },
        beforeSnapshot: beforePurchase,
        afterSnapshot: updatedPurchase,
      }
    );

    console.log(
      `PayPal payment denied: Purchase ${purchaseId}, Transaction ${transactionId}`
    );
  } catch (error) {
    console.error(
      `Error handling payment.capture.denied for purchase ${purchaseId}:`,
      error
    );
    throw error;
  }
}

/**
 * Handle payment.capture.refunded webhook
 * Creates refund record and updates purchase status
 */
export async function handlePaymentCaptureRefunded(
  event: PayPalWebhookBody,
  req: Request
): Promise<void> {
  const { resource } = event;
  const customId = resource.custom_id;
  const refundId = resource.id;
  const linkingId = resource.links?.find((l) => l.rel === "up")?.href;

  const purchaseId = extractPurchaseIdFromCustomId(customId);

  if (!purchaseId) {
    console.warn(
      `PayPal webhook: Invalid or missing custom_id in PAYMENT.CAPTURE.REFUNDED event: ${customId}`
    );
    return;
  }

  try {
    const beforePurchase = await db.getPurchase(purchaseId);
    if (!beforePurchase) {
      console.warn(
        `PayPal webhook: Purchase not found for ID ${purchaseId} in refund event`
      );
      return;
    }

    // Update purchase status to refunded
    const updatedPurchase = await db.updatePurchase(purchaseId, {
      status: "refunded",
      transactionId: refundId,
    });

    // Create refund request record if table exists
    if (db.createRefundRequest) {
      try {
        await db.createRefundRequest({
          purchaseId,
          reason: "PayPal refund processed",
          status: "approved",
          refundAmount: parseFloat(resource.amount?.value || "0"),
          transactionId: refundId,
        });
      } catch (error) {
        console.warn("Failed to create refund request record:", error);
      }
    }

    // Create audit log
    await auditLog(
      { req, user: { id: 0, name: "PayPal Webhook" } },
      {
        action: "payment_capture_refunded",
        entityType: "purchase",
        entityId: purchaseId,
        metadata: {
          paypalRefundId: refundId,
          refundAmount: resource.amount?.value,
          currency: resource.amount?.currency_code,
        },
        beforeSnapshot: beforePurchase,
        afterSnapshot: updatedPurchase,
      }
    );

    console.log(
      `PayPal refund processed: Purchase ${purchaseId}, Refund ${refundId}`
    );
  } catch (error) {
    console.error(
      `Error handling payment.capture.refunded for purchase ${purchaseId}:`,
      error
    );
    throw error;
  }
}

/**
 * Handle payment.capture.reversed webhook
 * Handles chargebacks and reversals
 */
export async function handlePaymentCaptureReversed(
  event: PayPalWebhookBody,
  req: Request
): Promise<void> {
  const { resource } = event;
  const customId = resource.custom_id;
  const reversalId = resource.id;

  const purchaseId = extractPurchaseIdFromCustomId(customId);

  if (!purchaseId) {
    console.warn(
      `PayPal webhook: Invalid or missing custom_id in PAYMENT.CAPTURE.REVERSED event: ${customId}`
    );
    return;
  }

  try {
    const beforePurchase = await db.getPurchase(purchaseId);
    if (!beforePurchase) {
      console.warn(
        `PayPal webhook: Purchase not found for ID ${purchaseId} in reversal event`
      );
      return;
    }

    // Update purchase status to reversed/chargeback
    const updatedPurchase = await db.updatePurchase(purchaseId, {
      status: "refunded",
      transactionId: reversalId,
    });

    // Create refund request record for chargeback tracking
    if (db.createRefundRequest) {
      try {
        await db.createRefundRequest({
          purchaseId,
          reason: "PayPal reversal/chargeback",
          status: "approved",
          refundAmount: parseFloat(resource.amount?.value || "0"),
          transactionId: reversalId,
        });
      } catch (error) {
        console.warn("Failed to create refund request record for reversal:", error);
      }
    }

    // Create audit log
    await auditLog(
      { req, user: { id: 0, name: "PayPal Webhook" } },
      {
        action: "payment_capture_reversed",
        entityType: "purchase",
        entityId: purchaseId,
        metadata: {
          paypalReversalId: reversalId,
          reversalAmount: resource.amount?.value,
          currency: resource.amount?.currency_code,
          reason: "Chargeback/Reversal",
        },
        beforeSnapshot: beforePurchase,
        afterSnapshot: updatedPurchase,
      }
    );

    console.log(
      `PayPal payment reversed: Purchase ${purchaseId}, Reversal ${reversalId}`
    );
  } catch (error) {
    console.error(
      `Error handling payment.capture.reversed for purchase ${purchaseId}:`,
      error
    );
    throw error;
  }
}

/**
 * Main webhook handler that routes to specific event handlers
 */
export async function handlePayPalWebhook(
  event: PayPalWebhookBody,
  req: Request
): Promise<void> {
  const { event_type } = event;

  console.log(`Processing PayPal webhook event: ${event_type} (ID: ${event.id})`);

  switch (event_type) {
    case PayPalEventType.PAYMENT_CAPTURE_COMPLETED:
      await handlePaymentCaptureCompleted(event, req);
      break;

    case PayPalEventType.PAYMENT_CAPTURE_DENIED:
      await handlePaymentCaptureDenied(event, req);
      break;

    case PayPalEventType.PAYMENT_CAPTURE_REFUNDED:
      await handlePaymentCaptureRefunded(event, req);
      break;

    case PayPalEventType.PAYMENT_CAPTURE_REVERSED:
      await handlePaymentCaptureReversed(event, req);
      break;

    default:
      console.log(`Unhandled PayPal webhook event type: ${event_type}`);
  }
}

/**
 * Get PayPal webhook ID from environment (should be configured during webhook setup)
 * This is used for signature verification
 */
export function getPayPalWebhookId(): string {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    throw new Error(
      "PAYPAL_WEBHOOK_ID environment variable not configured. Register webhook in PayPal dashboard."
    );
  }
  return webhookId;
}

/**
 * Simulate a PayPal webhook event for testing
 * Only works in development/sandbox mode
 */
export function createTestWebhookEvent(
  eventType: PayPalEventType,
  purchaseId: number,
  transactionId: string = "txn_test_" + Date.now()
): PayPalWebhookBody {
  return {
    id: "webhook_" + Date.now(),
    event_type: eventType,
    create_time: new Date().toISOString(),
    event_version: "1.0",
    resource_type: "capture",
    resource: {
      id: transactionId,
      custom_id: `purchase_${purchaseId}`,
      status:
        eventType === PayPalEventType.PAYMENT_CAPTURE_COMPLETED
          ? "COMPLETED"
          : eventType === PayPalEventType.PAYMENT_CAPTURE_DENIED
            ? "DECLINED"
            : "REFUNDED",
      amount: {
        currency_code: "GBP",
        value: "49.99",
      },
      payer: {
        email_address: "test@example.com",
        name: {
          given_name: "Test",
          surname: "User",
        },
      },
    },
  };
}
