# Stripe Integration - Quick Start Guide

## 5-Minute Setup

### Step 1: Get Stripe Test Keys
1. Go to https://dashboard.stripe.com/
2. Sign in or create account
3. Go to **Developers → API Keys** (top-left)
4. Copy **Publishable key** (pk_test_...) and **Secret key** (sk_test_...)
5. Go to **Developers → Webhooks** and create endpoint
6. Point to: `http://localhost:3000/api/payments/webhook/stripe` (for dev)
7. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
8. Copy **Signing secret** (whsec_...)

### Step 2: Configure Environment
Edit `.env` and set:
```env
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
```

### Step 3: Start Development Server
```bash
npm run dev
```

### Step 4: Test Payment Flow

**Option A: Support Page (Already Integrated)**
1. Open http://localhost:3000/support
2. Select amount and fill details
3. Use test card: `4242 4242 4242 4242`
4. Expiry: `12/25`, CVC: `123`
5. Click donate

**Option B: Use DonationFormStripe Component**
```tsx
import { DonationFormStripe } from '@/components/forms/DonationFormStripe';

export function DonationPage() {
  return (
    <DonationFormStripe
      onSuccess={() => console.log('Donation successful!')}
      successMessage="Thanks for supporting the stream!"
    />
  );
}
```

### Step 5: Verify Success
1. Check browser console for success message
2. Check server logs for: `Payment succeeded for donation {id}`
3. Query database:
   ```sql
   SELECT * FROM donations WHERE status='completed' ORDER BY created_at DESC LIMIT 1;
   ```
4. Should see 1 completed donation

## Common Test Cases

### Successful Payment
- Card: `4242 4242 4242 4242`
- Result: Payment succeeds

### Card Declined
- Card: `4000 0000 0000 0002`
- Result: Payment fails with "Card declined" error

### Requires Authentication
- Card: `4000 0025 0000 3155`
- Result: Shows 3D Secure challenge

### Insufficient Funds
- Card: `4000 0000 0000 9995`
- Result: Payment fails with "Insufficient funds"

## File Quick Reference

**Frontend Components:**
- `/client/src/contexts/StripeProvider.tsx` - Stripe context wrapper
- `/client/src/components/forms/DonationFormStripe.tsx` - Donation form
- `/client/src/pages/Support.tsx` - Support page (already integrated)
- `/client/src/App.tsx` - App entry point (StripeProvider added)

**Backend Routes:**
- `/server/routers/donationsRouter.ts` - Donations tRPC router
  - `donations.createPaymentIntent`
  - `donations.confirmDonation`
  - `donations.getUserDonations`
  - `donations.getAllDonations`
  - `donations.getStats`
  - `donations.getTopDonors`

- `/server/routers/supportRouter.ts` - Support tRPC router
  - `support.createPaymentIntent`

**Backend Webhooks:**
- `/server/routes/payments.ts` - Express route for `POST /api/payments/webhook/stripe`
- `/server/_core/stripeWebhook.ts` - Webhook handler logic
- `/server/lib/payments.ts` - Payment intent creation

**Database:**
- `/drizzle/engagement-schema.ts` - Donations and badges tables
- Tables: `donations`, `user_badges`

## Debugging Tips

### "Stripe not configured" error
- Check `.env` has all 4 Stripe variables set
- Verify values are not empty or malformed
- Restart dev server after changing `.env`

### Card element not showing
- Check browser console for errors
- Verify `VITE_STRIPE_PUBLISHABLE_KEY` is set
- Ensure StripeProvider wraps the component
- Check that Stripe.js loaded successfully

### Webhook not firing
- Check server logs for webhook processing
- Verify webhook URL matches (with http://localhost:3000 for local)
- For Stripe CLI testing: `stripe listen --forward-to localhost:3000/api/payments/webhook/stripe`
- Check Stripe dashboard **Developers → Webhooks → Events**

### Payment intent not created
- Check server logs for `createPaymentIntent` errors
- Verify database connection is working
- Check that donation record is created before webhook arrives

## Monitoring Payment Status

```bash
# Watch for successful payments
tail -f server.log | grep "Payment succeeded"

# Monitor all webhook events
tail -f server.log | grep "WEBHOOK"

# Check failed payments
SELECT * FROM donations WHERE status='failed';

# View donation statistics
SELECT 
  COUNT(*) as total,
  SUM(amount) as revenue,
  AVG(amount) as avg_amount
FROM donations 
WHERE status='completed';
```

## Security Checklist

- [ ] Never commit real Stripe keys to git
- [ ] Always verify webhook signatures (already done)
- [ ] Use HTTPS in production
- [ ] Don't expose secret key to frontend
- [ ] Validate amounts on backend
- [ ] Log all payment events
- [ ] Monitor for fraud patterns
- [ ] Test refund workflow

## Next Steps

1. **Read Full Guide**: See `STRIPE_INTEGRATION_GUIDE.md` for complete details
2. **Test Webhooks**: Use Stripe CLI for local webhook testing
3. **Deploy**: Follow production deployment section in full guide
4. **Monitor**: Set up alerts in Stripe dashboard for failed payments
5. **Enhance**: Add email notifications, refund UI, recurring donations

## Support

For issues:
1. Check Stripe dashboard for webhook failures
2. Check server logs for errors
3. Read `STRIPE_INTEGRATION_GUIDE.md` troubleshooting section
4. Test with Stripe CLI for webhook debugging
5. Review Stripe API docs: https://stripe.com/docs

---

**Ready to test?** Run `npm run dev` and navigate to `/support`!
