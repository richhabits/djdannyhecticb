#!/usr/bin/env node

/**
 * PayPal Webhook Test Utility
 *
 * This script simulates PayPal webhook events for testing without needing
 * the PayPal sandbox simulator. It creates test events and logs the results.
 *
 * Usage:
 *   npm run test:paypal-webhook
 *   npm run test:paypal-webhook -- --event PAYMENT.CAPTURE.COMPLETED --purchase-id 123
 */

import { createTestWebhookEvent, PayPalEventType } from "../_core/paypalHandler";
import * as db from "../db";

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed: Record<string, string> = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const key = args[i].substring(2);
      parsed[key] = args[i + 1] || "true";
      i++;
    }
  }

  return {
    event: (parsed.event || "PAYMENT.CAPTURE.COMPLETED") as PayPalEventType,
    purchaseId: parseInt(parsed["purchase-id"] || "1", 10),
    transactionId: parsed["transaction-id"],
    apiUrl: parsed["api-url"] || "http://localhost:3000",
  };
}

async function simulateWebhookEvent(
  apiUrl: string,
  event: PayPalEventType,
  purchaseId: number,
  transactionId?: string
) {
  const testEvent = createTestWebhookEvent(event, purchaseId, transactionId);

  console.log("\n📦 PayPal Webhook Test Simulation\n");
  console.log(`Event Type: ${event}`);
  console.log(`Purchase ID: ${purchaseId}`);
  console.log(`Transaction ID: ${testEvent.resource.id}`);
  console.log(`API URL: ${apiUrl}\n`);

  console.log("Sending webhook to endpoint...\n");

  try {
    const response = await fetch(`${apiUrl}/api/payments/webhook/paypal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Note: Real PayPal webhooks include signature headers
        // This test request won't have them, so it will fail signature verification
        // For testing, you may need to temporarily disable verification
        "paypal-transmission-id": "test-transmission-" + Date.now(),
        "paypal-transmission-time": new Date().toISOString(),
      },
      body: JSON.stringify(testEvent),
    });

    const responseBody = await response.json();

    console.log(`✅ Response Status: ${response.status}`);
    console.log(`Response Body:`, JSON.stringify(responseBody, null, 2));

    if (!response.ok) {
      console.log(
        "\n⚠️  Note: If you see a signature verification error, that's expected."
      );
      console.log("Real webhooks from PayPal include valid signatures.");
      console.log("\nFor testing with signature verification enabled:");
      console.log("1. Use PayPal's webhook simulator in Developer Dashboard");
      console.log("2. Or temporarily disable verification in development\n");
    }

    // Try to verify the database update
    console.log("\nChecking database updates...\n");
    const purchase = await db.getPurchase(purchaseId);

    if (!purchase) {
      console.log(`❌ Purchase ${purchaseId} not found in database`);
      console.log("\nTo test properly:");
      console.log("1. Create a purchase first via the payment API");
      console.log("2. Note the purchase ID");
      console.log(`3. Run: npm run test:paypal-webhook -- --purchase-id ${purchaseId}`);
      return;
    }

    console.log(`✅ Purchase found:`);
    console.log(`   ID: ${purchase.id}`);
    console.log(`   Status: ${purchase.status}`);
    console.log(`   Amount: ${purchase.amount} ${purchase.currency}`);
    console.log(`   Provider: ${purchase.paymentProvider}`);
    console.log(`   Transaction ID: ${purchase.transactionId || "N/A"}`);

    // Verify status was updated based on event type
    const expectedStatus = getExpectedStatus(event);
    if (purchase.status === expectedStatus) {
      console.log(`\n✅ Database updated correctly! Status is now "${expectedStatus}"`);
    } else {
      console.log(
        `\n⚠️  Expected status "${expectedStatus}" but got "${purchase.status}"`
      );
    }
  } catch (error) {
    console.error(`❌ Error during webhook test:`, error);
  }
}

function getExpectedStatus(
  event: PayPalEventType
): "completed" | "failed" | "refunded" {
  switch (event) {
    case PayPalEventType.PAYMENT_CAPTURE_COMPLETED:
      return "completed";
    case PayPalEventType.PAYMENT_CAPTURE_DENIED:
      return "failed";
    case PayPalEventType.PAYMENT_CAPTURE_REFUNDED:
    case PayPalEventType.PAYMENT_CAPTURE_REVERSED:
      return "refunded";
    default:
      return "completed";
  }
}

async function main() {
  const args = parseArgs();

  console.log("🚀 Starting PayPal Webhook Test\n");

  // Check if database is available
  const database = await db.getDb();
  if (!database) {
    console.error("❌ Database not available. Check DATABASE_URL environment variable.");
    process.exit(1);
  }

  console.log("✅ Database connected\n");

  // Run the webhook simulation
  await simulateWebhookEvent(args.apiUrl, args.event, args.purchaseId, args.transactionId);

  console.log(
    "\n📚 For detailed information, see docs/PAYPAL_INTEGRATION.md\n"
  );
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
