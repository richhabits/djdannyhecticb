import { Router, Request, Response } from "express";
import Stripe from "stripe";
import { broadcastStreamEvent } from "./streamEventsRouter";

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

interface StripeChargeEvent {
  id: string;
  amount: number;
  currency: string;
  metadata?: {
    donor_name?: string;
    message?: string;
  };
}

router.post("/webhook", async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;

  if (!webhookSecret) {
    console.warn("Stripe webhook secret not configured");
    return res.status(400).json({ error: "Webhook secret not configured" });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    ) as Stripe.Event;

    // Handle charge.succeeded events
    if (event.type === "charge.succeeded") {
      const charge = event.data.object as StripeChargeEvent;

      const donorName = charge.metadata?.donor_name || `Donor_${charge.id.slice(0, 8)}`;
      const message = charge.metadata?.message || "";
      const amountInDollars = charge.amount / 100; // Convert from cents

      console.log(`💰 Donation received: ${donorName} - $${amountInDollars}`);

      // Broadcast to live viewers
      broadcastStreamEvent({
        id: `stripe_${charge.id}`,
        type: "donation",
        username: donorName,
        amount: amountInDollars,
        message,
        timestamp: new Date(),
      });
    }

    // Handle customer.subscription.created events
    if (event.type === "customer.subscription.created") {
      const subscription = event.data.object as Stripe.Subscription;

      const customer = await stripe.customers.retrieve(subscription.customer as string);
      const subscriberName = (customer as any).metadata?.username || (customer as any).email || "Subscriber";

      console.log(`🎁 New subscriber: ${subscriberName}`);

      // Map Stripe price to tier
      let tier: "bronze" | "silver" | "gold" | "platinum" = "gold";
      const priceId = subscription.items.data[0]?.price.id;

      if (process.env.STRIPE_PRICE_BRONZE === priceId) tier = "bronze";
      if (process.env.STRIPE_PRICE_SILVER === priceId) tier = "silver";
      if (process.env.STRIPE_PRICE_GOLD === priceId) tier = "gold";
      if (process.env.STRIPE_PRICE_PLATINUM === priceId) tier = "platinum";

      broadcastStreamEvent({
        id: `stripe_sub_${subscription.id}`,
        type: "subscribe",
        username: subscriberName,
        tier,
        months: 1,
        timestamp: new Date(),
      });
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    res.status(400).send(`Webhook Error: ${error}`);
  }
});

export default router;
