# Monetization System - Quick Start Guide

**Objective:** Get subscriptions, affiliates, and revenue tracking live in 24 hours.

---

## 1. Environment Setup (5 minutes)

### Create Stripe Test Account
```bash
# Go to https://stripe.com/register
# Select: "Subscriber"
# Verify email and complete onboarding

# After activation, get test keys from:
# Dashboard > Developers > API Keys

# Add to .env:
STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_test_YOUR_KEY
```

### Verify Environment
```bash
cd /Users/romeovalentine/djdannyhecticb

# Check current env variables
echo $STRIPE_SECRET_KEY
echo $STRIPE_PUBLIC_KEY

# Test database connection
pnpm db:push
```

---

## 2. Verify Backend is Running (10 minutes)

### Database
```bash
# Apply migrations
pnpm db:push

# Verify tables created
# Should see: subscriptions, affiliates, sponsors, digital_products, etc.
```

### API Routes
```bash
# Start development server
pnpm dev

# In another terminal, test subscription endpoint:
curl http://localhost:3000/api/trpc/subscription.getPlans
# Should return: {"result":{"data":{...plans...}}}

# Test affiliate endpoint:
curl http://localhost:3000/api/trpc/affiliate.list
# Should return affiliate list or empty array
```

### Verify Stripe Integration
```bash
# Test Stripe connection
node -e "
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
stripe.accounts.retrieve().then(
  () => console.log('✅ Stripe connected'),
  (err) => console.log('❌ Stripe error:', err.message)
);
"
```

---

## 3. Create Frontend Components (4-6 hours)

### Component 1: SubscriptionSelector.tsx
```typescript
// src/components/subscription/SubscriptionSelector.tsx

import { trpc } from '@/utils/trpc';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function SubscriptionSelector() {
  const { data: plans, isLoading } = trpc.subscription.getPlans.useQuery();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  if (isLoading) return <div>Loading plans...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {plans?.map((plan) => (
        <Card key={plan.plan} className="p-6">
          <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
          <p className="text-2xl font-bold text-green-600 mb-4">
            £{plan.monthlyPrice}/mo
          </p>
          
          <ul className="text-sm mb-6 space-y-2">
            {plan.features?.slice(0, 3).map((feature) => (
              <li key={feature} className="flex items-center">
                ✓ {feature}
              </li>
            ))}
          </ul>

          <Button
            onClick={() => setSelectedPlan(plan.plan)}
            variant={selectedPlan === plan.plan ? 'default' : 'outline'}
            className="w-full"
          >
            {plan.plan === 'free' ? 'Current' : 'Select'}
          </Button>
        </Card>
      ))}
    </div>
  );
}
```

### Component 2: CheckoutForm.tsx
```typescript
// src/components/subscription/CheckoutForm.tsx

import { trpc } from '@/utils/trpc';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';

const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || '');

function CheckoutFormContent({ plan }: { plan: string }) {
  const [loading, setLoading] = useState(false);
  const stripe_ = useStripe();
  const elements = useElements();
  const createPayment = trpc.subscription.createPaymentIntent.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create payment intent
      const { clientSecret } = await createPayment.mutateAsync({
        plan,
        billingCycle: 'monthly',
      });

      // Confirm payment
      const { error } = await stripe_?.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements!.getElement(CardElement)!,
          billing_details: { name: 'Customer' },
        },
      }) || {};

      if (error) {
        throw new Error(error.message);
      }

      alert('✅ Subscription created!');
    } catch (error) {
      alert('❌ Payment failed: ' + (error as any).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardElement />
      <Button disabled={loading} type="submit">
        {loading ? 'Processing...' : `Subscribe - £${plan}`}
      </Button>
    </form>
  );
}

export function CheckoutForm({ plan }: { plan: string }) {
  return (
    <Elements stripe={stripe}>
      <CheckoutFormContent plan={plan} />
    </Elements>
  );
}
```

### Component 3: AffiliateDashboard.tsx
```typescript
// src/components/affiliate/AffiliateDashboard.tsx

import { trpc } from '@/utils/trpc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function AffiliateDashboard() {
  const { data: profile } = trpc.affiliate.getAffiliateProfile.useQuery();
  const { data: links } = trpc.affiliate.getLinks.useQuery();
  const { data: analytics } = trpc.affiliate.getAnalytics.useQuery();
  const generateLink = trpc.affiliate.generateLink.useMutation();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('✅ Copied!');
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-500">Total Earned</p>
          <p className="text-2xl font-bold">
            £{profile?.totalEarnings || '0.00'}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Conversions</p>
          <p className="text-2xl font-bold">{analytics?.conversions || 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Rate</p>
          <p className="text-2xl font-bold">
            {((analytics?.conversionRate || 0) * 100).toFixed(1)}%
          </p>
        </Card>
      </div>

      {/* Links */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Your Affiliate Links</h3>
        <div className="space-y-3">
          {links?.map((link) => (
            <div key={link.id} className="flex items-center justify-between">
              <code className="text-sm bg-gray-100 p-2 rounded">
                {link.url}
              </code>
              <Button
                size="sm"
                onClick={() => copyToClipboard(link.url)}
              >
                Copy
              </Button>
            </div>
          ))}
        </div>
        <Button
          className="mt-4"
          onClick={() => generateLink.mutate({ label: 'New Link' })}
        >
          Generate New Link
        </Button>
      </Card>
    </div>
  );
}
```

### Component 4: RevenueChart.tsx
```typescript
// src/components/revenue/RevenueChart.tsx

import { trpc } from '@/utils/trpc';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';

export function RevenueChart() {
  const { data: revenue } = trpc.revenue.getTotalRevenue.useQuery();

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4">Monthly Revenue</h3>
      
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold">
            £{revenue?.totalRevenue?.toFixed(2) || '0.00'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">MRR</p>
          <p className="text-2xl font-bold">
            £{revenue?.mrr?.toFixed(2) || '0.00'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">ARR</p>
          <p className="text-2xl font-bold">
            £{revenue?.arr?.toFixed(2) || '0.00'}
          </p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Subscriptions</span>
          <span className="font-bold">
            £{revenue?.bySource?.subscriptions?.toFixed(2) || '0.00'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Affiliates</span>
          <span className="font-bold">
            £{revenue?.bySource?.affiliates?.toFixed(2) || '0.00'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Digital Products</span>
          <span className="font-bold">
            £{revenue?.bySource?.digitalProducts?.toFixed(2) || '0.00'}
          </span>
        </div>
      </div>
    </Card>
  );
}
```

---

## 4. Integration Points (2-3 hours)

### Add Components to Pages

```typescript
// src/pages/dashboard.tsx
import { SubscriptionSelector } from '@/components/subscription/SubscriptionSelector';
import { AffiliateDashboard } from '@/components/affiliate/AffiliateDashboard';
import { RevenueChart } from '@/components/revenue/RevenueChart';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Subscription Tiers</h2>
        <SubscriptionSelector />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Affiliate Program</h2>
        <AffiliateDashboard />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Revenue Analytics</h2>
        <RevenueChart />
      </section>
    </div>
  );
}
```

### Add Navigation Links

```typescript
// src/components/navigation.tsx
export const navItems = [
  // ... existing items
  {
    label: 'Subscribe',
    href: '/subscribe',
    icon: 'gift',
  },
  {
    label: 'Affiliate',
    href: '/affiliate',
    icon: 'share2',
  },
  {
    label: 'Dashboard',
    href: '/admin/revenue',
    icon: 'chart-line',
    requiresAdmin: true,
  },
];
```

---

## 5. Testing (2-3 hours)

### Manual Testing Checklist

```
[ ] Subscription Flow
    [ ] Can view plans
    [ ] Can start checkout
    [ ] Test card accepted (4242 4242 4242 4242)
    [ ] Subscription created in DB
    [ ] User can see active subscription

[ ] Affiliate Flow
    [ ] Can apply to program
    [ ] Can generate affiliate link
    [ ] Can view statistics
    [ ] Commission calculated correctly
    [ ] Can request payout

[ ] Revenue Dashboard
    [ ] Shows total revenue
    [ ] MRR calculated correctly
    [ ] Revenue by source breaks down
    [ ] Charts render properly

[ ] Stripe Webhooks
    [ ] Subscription created → user notified
    [ ] Payment succeeded → receipt sent
    [ ] Payment failed → retry logic works
    [ ] Chargeback → handled correctly
```

### Stripe Test Cards
```
Success:           4242 4242 4242 4242
Decline:           4000 0000 0000 0002
Requires Auth:     4000 0025 0000 3155
Expired Card:      4000 0000 0000 0069
```

---

## 6. Deployment (1-2 hours)

### Pre-Launch Checklist

```bash
# 1. Verify all tests pass
pnpm test

# 2. Type check
pnpm check

# 3. Build frontend
pnpm build

# 4. Test webhook endpoint
curl -X POST http://localhost:3000/api/stripe/webhook \
  -H "stripe-signature: test" \
  -H "Content-Type: application/json" \
  -d '{"type":"charge.succeeded"}'

# 5. Deploy to Vercel
pnpm deploy

# 6. Update production Stripe keys
# Dashboard > Developers > API Keys > Copy live keys
# Update .env.production with live keys

# 7. Configure Stripe webhook (Production)
# Go to Stripe Dashboard > Developers > Webhooks
# Add: https://yourdomain.com/api/stripe/webhook
# Select events: checkout.session.completed, etc.
```

---

## 7. Go Live! 🚀

### Day 1: Soft Launch
- [ ] Enable subscriptions for 10% of users
- [ ] Monitor metrics
- [ ] Check for errors in logs
- [ ] Gather feedback

### Week 1: Full Launch
- [ ] Open to all users
- [ ] Run affiliate recruitment campaign
- [ ] Set up sponsorship sales
- [ ] Monitor MRR

### Week 2: Optimization
- [ ] A/B test pricing tiers
- [ ] Improve conversion rate
- [ ] Analyze churn reasons
- [ ] Adjust tier benefits

### Month 1 Goal
- [ ] 50+ subscribers ($300/mo MRR)
- [ ] 10+ affiliates
- [ ] $10K+ revenue tracked

---

## Troubleshooting

### "Payment intent creation failed"
```
Check:
1. Stripe keys are correct (.env)
2. User email is valid
3. Stripe account in test mode
4. API key has correct permissions
```

### "Webhook not processing"
```
Check:
1. Webhook endpoint returning 200 OK
2. Webhook secret matches (.env)
3. Stripe sending correct signature
4. Server logs show received event
```

### "Affiliate commission not calculated"
```
Check:
1. Affiliate status is 'active' (not 'pending')
2. Conversion has correct affiliateId
3. Commission rate set (5-20%)
4. Conversion within valid date range
```

---

## Quick Commands

```bash
# Start development
pnpm dev

# Test specific endpoint
pnpm test subscription

# Check database
pnpm db:push
pnpm db:studio

# Build for production
pnpm build

# Deploy
pnpm deploy
```

---

## Support Resources

- **Stripe Docs:** https://stripe.com/docs
- **tRPC Docs:** https://trpc.io/docs
- **Drizzle Docs:** https://orm.drizzle.team/docs/overview
- **Spec Document:** /MONETIZATION_IMPLEMENTATION_SPEC.md
- **Full Report:** /MONETIZATION_IMPLEMENTATION_REPORT.md

---

**Status:** Ready to implement  
**Estimated Time:** 24 hours (8 hours dev, 16 hours testing)  
**Target Launch:** This week
