# Stripe Payment Integration - Complete Guide

## Overview

The djdannyhecticb application now has full Stripe payment integration for donations and support. This guide covers the implementation, configuration, and testing procedures.

## Architecture

### Backend Components

1. **Stripe Webhook Handler** (`server/_core/stripeWebhook.ts`)
   - Verifies webhook signatures
   - Handles payment_intent.succeeded, payment_intent.payment_failed, charge.refunded events
   - Updates donation status in database
   - Awards badges to donors

2. **Payment Intent Creator** (`server/lib/payments.ts`)
   - `createSupportPaymentIntent()` - Creates payment intent for donations
   - `getStripe()` - Initializes Stripe instance with circuit breaker
   - Stores payment intent ID for webhook reconciliation

3. **tRPC Routers**
   - `donationsRouter` - Main donations endpoint with full donation management
   - `supportRouter` - Support/contribution endpoint used by Support page

4. **Express Webhook Endpoint** (`server/routes/payments.ts`)
   - POST `/api/payments/webhook/stripe` - Raw body webhook handler
   - Signature verification using Stripe secret
   - Forwards to webhook handler

### Frontend Components

1. **StripeProvider** (`client/src/contexts/StripeProvider.tsx`)
   - Wraps app with Stripe Elements context
   - Loads Stripe.js with publishable key
   - Gracefully handles missing configuration

2. **DonationFormStripe** (`client/src/components/forms/DonationFormStripe.tsx`)
   - Multi-step form (details → payment → processing → success)
   - CardElement for secure card input
   - tRPC integration for payment intent creation and confirmation
   - Full error handling and validation

3. **Support Page** (`client/src/pages/Support.tsx`)
   - Already integrated with Stripe via SupportPaymentForm component
   - Uses `trpc.support.createPaymentIntent` mutation
   - GBP currency support

### Database

The `donations` table stores:
- `id` - Primary key
- `liveSessionId` - Optional link to live session
- `userId` - Donor user ID
- `amount` - Donation amount
- `currency` - Currency code (USD, GBP, etc.)
- `message` - Optional donor message
- `stripePaymentId` - Payment intent ID (unique index)
- `stripeChargeId` - Charge ID (unique index)
- `status` - pending, completed, failed, refunded
- `tipJar` - Whether it's a tip jar donation
- `anonymous` - Whether donation is anonymous
- `createdAt`, `updatedAt` - Timestamps

## Configuration

### Environment Variables

Set these in `.env`:

```env
# Stripe Keys (required for payment processing)
STRIPE_SECRET_KEY=sk_test_...          # Secret key (backend only)
STRIPE_PUBLISHABLE_KEY=pk_test_...     # Publishable key (backend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... # Frontend key (VITE_ prefix)
STRIPE_WEBHOOK_SECRET=whsec_...        # Webhook signing secret
```

### Getting Stripe Keys

1. **Create Stripe Account**: https://dashboard.stripe.com/
2. **Get API Keys**:
   - Go to Developers → API Keys
   - Copy Test/Live keys from the display
3. **Set Webhook Secret**:
   - Go to Developers → Webhooks
   - Create or view webhook endpoint for `https://yourdomain.com/api/payments/webhook/stripe`
   - Copy the "Signing secret"

### Webhook Configuration

In Stripe Dashboard:
1. Go to **Developers → Webhooks**
2. Create webhook endpoint pointing to: `https://yourdomain.com/api/payments/webhook/stripe`
3. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - (Optional) `dispute.created`
4. Copy the signing secret and add to `.env` as `STRIPE_WEBHOOK_SECRET`

## Implementation Details

### Payment Flow

1. **Frontend - Details Submission**
   ```
   User fills donation form (name, email, amount, message)
   → Frontend calls trpc.donations.createPaymentIntent
   → Backend creates Stripe PaymentIntent
   → Backend creates donation record with status="pending"
   → Returns clientSecret to frontend
   ```

2. **Frontend - Card Submission**
   ```
   User enters card details
   → Frontend confirms payment with Stripe using clientSecret
   → Stripe processes payment
   → Returns paymentIntent with status="succeeded"
   ```

3. **Stripe Webhook**
   ```
   Stripe sends payment_intent.succeeded webhook
   → Backend verifies signature
   → Updates donation status="completed"
   → Awards donation badges if applicable
   ```

4. **Frontend - Confirmation**
   ```
   Frontend calls trpc.donations.confirmDonation
   → Confirms donation in database
   → Shows success message
   → Resets form
   ```

### Badge Awards

Donors are automatically awarded badges based on donation amount:
- `donation_100`: $100+ donations
- `donation_500`: $500+ donations
- `donation_1000`: $1000+ donations

Badges are stored in the `user_badges` table with metadata about the donation.

## Testing

### Stripe Test Keys

Stripe provides test keys that don't process real payments:

**Test Cards:**
- Success: `4242 4242 4242 4242`
- Requires authentication: `4000 0025 0000 3155`
- Decline: `4000 0000 0000 0002`
- Decline (insufficient funds): `4000 0000 0000 9995`

**Testing Parameters:**
- **Expiry**: Any future date (e.g., 12/25)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

### Test Scenarios

#### 1. Successful Donation
```bash
# Start the development server
npm run dev

# Navigate to Support page or integration point
# Fill in donation form:
# - Name: "Test Donor"
# - Email: "test@example.com"
# - Amount: 10
# - Click "Continue to Payment"

# Enter card details:
# - Card: 4242 4242 4242 4242
# - Expiry: 12/25
# - CVC: 123

# Verify in database:
SELECT * FROM donations WHERE status='completed';
```

#### 2. Failed Payment
```bash
# Use card: 4000 0000 0000 0002
# Error should appear: "Your card was declined"
# Donation should be created with status='failed'
```

#### 3. Webhook Verification
```bash
# Monitor server logs during payment
# Should see: "Payment succeeded for donation {id}"

# Test webhook locally:
curl -X POST http://localhost:3000/api/payments/webhook/stripe \
  -H "stripe-signature: test_sig" \
  -H "Content-Type: application/json" \
  -d '{"type":"payment_intent.succeeded","data":{"object":{"id":"pi_test","charges":{"data":[{"id":"ch_test"}]}}}}'
```

### Manual Testing Checklist

- [ ] Form validates correctly (required fields, amount ranges)
- [ ] Payment intent is created successfully
- [ ] Card element accepts valid test card
- [ ] Successful payment shows success message
- [ ] Failed payment shows error message and allows retry
- [ ] Donation record created in database with correct amount
- [ ] Webhook updates donation status to "completed"
- [ ] Badges are awarded for qualifying donation amounts
- [ ] User is redirected after successful payment
- [ ] Form resets after successful payment

### Automated Testing

Create test file `server/donations.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { createSupportPaymentIntent } from "./lib/payments";

describe("Stripe Integration", () => {
  it("should create payment intent with valid amount", async () => {
    const result = await createSupportPaymentIntent({
      amount: 10000, // $100.00 in cents
      currency: "USD",
      fanName: "Test Donor",
      email: "test@example.com",
    });

    expect(result).toHaveProperty("clientSecret");
    expect(result).toHaveProperty("paymentIntentId");
  });

  it("should reject invalid amounts", async () => {
    expect(() =>
      createSupportPaymentIntent({
        amount: 0,
        currency: "USD",
        fanName: "Test",
        email: "test@example.com",
      })
    ).rejects.toThrow();
  });
});
```

## Monitoring & Debugging

### Logs to Monitor

Check server logs for:
```
[PAYMENT] Creating payment intent for $X
[PAYMENT] Payment succeeded for donation {id}
[WEBHOOK] Signature verified successfully
[WEBHOOK] Processing payment_intent.succeeded
```

### Common Issues

**Issue: "Stripe is not configured"**
- Check `.env` file has `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`
- Verify variables are spelled correctly
- Ensure values are not empty strings

**Issue: "Webhook signature verification failed"**
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Check webhook endpoint URL is correct
- Ensure raw body is being used (not parsed JSON)

**Issue: "Payment intent not found in webhook"**
- Check database connection
- Verify `donations` table exists and has proper schema
- Check for race conditions (webhook arriving before donation record)

**Issue: Card element not displaying**
- Verify `StripeProvider` is wrapping the component
- Check `VITE_STRIPE_PUBLISHABLE_KEY` is set
- Check browser console for Stripe.js loading errors

### Debugging Payment Flow

Enable verbose logging in frontend:

```typescript
// In DonationFormStripe.tsx
const handlePaymentSubmit = async (e: React.FormEvent) => {
  console.log("1. Starting payment submission");
  console.log("2. Payment intent data:", createPaymentIntent.data);
  console.log("3. Confirming card payment...");
  const { error, paymentIntent } = await stripe.confirmCardPayment(...);
  console.log("4. Result:", { error, paymentIntent });
};
```

Monitor webhooks:
```bash
# Watch server logs for webhook events
tail -f logs/server.log | grep WEBHOOK

# Or use Stripe CLI for local testing
stripe listen --forward-to localhost:3000/api/payments/webhook/stripe
```

## Production Deployment

### Pre-Launch Checklist

- [ ] Switch to live Stripe keys in production environment
- [ ] Test with live test card 4242 4242 4242 4242
- [ ] Configure webhook endpoint to production URL
- [ ] Enable email notifications for payments
- [ ] Set up monitoring/alerting for failed payments
- [ ] Test refund flow with Stripe dashboard
- [ ] Document support contact info for payment issues
- [ ] Add privacy notice about payment data handling
- [ ] Test on staging environment before going live

### Security Considerations

1. **Never expose secret keys** in frontend code
2. **Always verify webhook signatures** on backend
3. **Use HTTPS** for webhook endpoint
4. **Validate all inputs** from frontend
5. **Store sensitive data** according to PCI compliance
6. **Log payment events** for audit trail
7. **Use idempotency keys** for API requests

### Monitoring in Production

1. **Set up Stripe alerts**:
   - Go to Settings → Webhooks → Event Dashboard
   - Configure failure notifications

2. **Monitor donation metrics**:
   ```sql
   SELECT 
     COUNT(*) as total_donations,
     SUM(amount) as total_revenue,
     COUNT(DISTINCT user_id) as unique_donors,
     AVG(amount) as avg_donation
   FROM donations
   WHERE status = 'completed'
   AND created_at > NOW() - INTERVAL '24 hours';
   ```

3. **Alert on failures**:
   ```sql
   SELECT COUNT(*) as failed_payments
   FROM donations
   WHERE status = 'failed'
   AND created_at > NOW() - INTERVAL '1 hour';
   ```

## Support & Troubleshooting

For more information:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe React Integration](https://stripe.com/docs/stripe-js/react)

## File References

**Backend:**
- Server entry: `/server/_core/index.ts` (lines 177-178)
- Payment routes: `/server/routes/payments.ts`
- Webhook handler: `/server/_core/stripeWebhook.ts`
- Payment lib: `/server/lib/payments.ts`
- Donations router: `/server/routers/donationsRouter.ts`
- Support router: `/server/routers/supportRouter.ts`

**Frontend:**
- StripeProvider: `/client/src/contexts/StripeProvider.tsx`
- DonationFormStripe: `/client/src/components/forms/DonationFormStripe.tsx`
- Support page: `/client/src/pages/Support.tsx`
- App.tsx: `/client/src/App.tsx` (StripeProvider wrapper added)

**Database:**
- Schema: `/drizzle/engagement-schema.ts`
- Donations table: Lines 160-187

## Changelog

- 2024-05-01: Initial Stripe integration completed
  - Webhook handling
  - Payment intent creation
  - Badge awarding
  - tRPC routers
  - Frontend components
  - Testing guide
