# Monetization System: Implementation Specification

**Date:** 2026-05-02  
**Status:** Spec Complete - Ready for Implementation  
**Target Revenue:** $50K - $200K/month within 12 months

---

## 🎯 Revenue Model Architecture

```
┌─────────────────────────────────────────────────┐
│          MULTI-REVENUE INCOME STREAMS             │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌─────────────┐  ┌──────────────┐             │
│  │SUBSCRIPTIONS│  │   DONATIONS  │             │
│  │  $50-200/mo │  │   $1-100/ea  │             │
│  │  (30% GMV)  │  │   (15% GMV)  │             │
│  └─────────────┘  └──────────────┘             │
│                                                  │
│  ┌─────────────┐  ┌──────────────┐             │
│  │ AFFILIATES  │  │SPONSORSHIPS  │             │
│  │ 5-20% comm  │  │ $1K-$25K/mo  │             │
│  │  (25% GMV)  │  │   (20% GMV)  │             │
│  └─────────────┘  └──────────────┘             │
│                                                  │
│  ┌─────────────┐  ┌──────────────┐             │
│  │   PRODUCTS  │  │ MERCHANDISING│             │
│  │$10-100 ea   │  │ $20-50 items │             │
│  │   (10% GMV) │  │    (10% GMV) │             │
│  └─────────────┘  └──────────────┘             │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Revenue Projections (Year 1)
| Month | Subscriptions | Donations | Affiliates | Sponsorships | Products | Total |
|-------|---|---|---|---|---|---|
| M1-M2 | $2K | $1K | $500 | $2K | $500 | **$6K** |
| M3-M6 | $10K | $5K | $3K | $8K | $2K | **$28K** |
| M7-M12 | $30K | $20K | $15K | $50K | $10K | **$125K** |
| **Year 1** | **$52K** | **$31K** | **$19K** | **$70K** | **$15K** | **$187K** |

---

## 💳 1. Subscription System (5-Tier Model)

### 1.1 Tier Structure
```typescript
type SubscriptionTier = 
  | 'free'           // Default
  | 'hectic_regular' // $5.99/month
  | 'hectic_royalty' // $14.99/month
  | 'inner_circle'   // $29.99/month
  | 'vip_exclusive'; // $99.99/month
```

### 1.2 Tier Benefits Matrix

| Feature | Free | Regular | Royalty | Inner Circle | VIP |
|---------|------|---------|---------|--------------|-----|
| Ad-Free Streams | ❌ | ✅ | ✅ | ✅ | ✅ |
| Priority Chat | ❌ | ✅ | ✅ | ✅ | ✅ |
| Custom Emotes | ❌ | 5 | 15 | 50 | Unlimited |
| Exclusive Content | ❌ | ❌ | ✅ | ✅ | ✅ |
| Monthly Shoutout | ❌ | ❌ | ✅ | ✅ | ✅ |
| Private Messages | ❌ | ❌ | ✅ | ✅ | ✅ |
| Exclusive Discord | ❌ | ❌ | ❌ | ✅ | ✅ |
| 1-on-1 Session | ❌ | ❌ | ❌ | ✅ | 4x/month |
| **Monthly Price** | Free | $5.99 | $14.99 | $29.99 | $99.99 |

### 1.3 Database Schema

```typescript
// New tables needed
enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  PAUSED = 'paused',
}

table subscriptions {
  id: serial PRIMARY KEY
  fanId: integer NOT NULL
  fanName: varchar(255)
  email: varchar(255)
  tier: subscription_tier NOT NULL
  amount: varchar(50)
  currency: varchar(10) DEFAULT 'GBP'
  stripeSubscriptionId: varchar(255) UNIQUE
  stripeCustomerId: varchar(255)
  status: subscription_status DEFAULT 'active'
  startAt: timestamp DEFAULT now()
  endAt: timestamp
  renewsAt: timestamp
  cancelledAt: timestamp
  cancellationReason: text
  metadata: jsonb -- Extra data like promo codes, source
  createdAt: timestamp DEFAULT now()
  updatedAt: timestamp DEFAULT now()
}

table subscription_invoices {
  id: serial PRIMARY KEY
  subscriptionId: integer NOT NULL
  stripeInvoiceId: varchar(255)
  amount: numeric(10, 2)
  currency: varchar(10)
  status: varchar(50) -- paid, draft, open, voided, uncollectible
  pdfUrl: varchar(512)
  dueAt: timestamp
  paidAt: timestamp
  createdAt: timestamp DEFAULT now()
}

table subscription_events {
  id: serial PRIMARY KEY
  subscriptionId: integer
  eventType: varchar(100) -- created, updated, payment_succeeded, cancelled
  metadata: jsonb
  createdAt: timestamp DEFAULT now()
}
```

### 1.4 Stripe Integration Flow

```
User selects tier
    ↓
→ Stripe Checkout Session
    ↓
User authorizes payment
    ↓
Stripe webhook: checkout.session.completed
    ↓
Create subscription in DB + tRPC mutation
    ↓
Grant perks (emotes, chat priority)
    ↓
Monthly: Stripe webhook: invoice.payment_succeeded
    ↓
Auto-renew subscription
```

### 1.5 Implementation Tasks

**Backend (tRPC procedures):**
```typescript
// Queries
subscription.getCurrent() // Get user's active subscription
subscription.getHistory() // Get past subscriptions
subscription.getTierBenefits() // Get features for tier
subscription.isFeatureUnlocked(feature) // Check access

// Mutations
subscription.createCheckout(tier) // Generate Stripe session
subscription.cancel() // Cancel subscription
subscription.upgrade(newTier) // Upgrade/downgrade
subscription.pause() // Pause subscription
subscription.resume() // Resume paused subscription
subscription.applyPromoCode(code) // Apply discount
```

**Frontend (React components):**
```typescript
// Components
<SubscriptionSelector /> // Tier comparison table
<SubscriptionCheckout tier={tier} /> // Stripe form
<SubscriptionStatus /> // Current tier display
<UpgradePrompt /> // Upsell for free users
<BenefitBadge tier={tier} /> // Display perks
```

**Webhooks (Stripe):**
```typescript
// Handle these webhook events:
- checkout.session.completed
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed
- charge.dispute.created
```

---

## 🎁 2. Affiliate Program (Commission-Based)

### 2.1 Commission Structure
```typescript
type CommissionRate = 
  | 5    // Tier 0: <$100/month
  | 10   // Tier 1: $100-$500/month
  | 15   // Tier 2: $500-$2000/month
  | 20;  // Tier 3: $2000+/month
```

### 2.2 Database Schema

```typescript
table affiliates {
  id: serial PRIMARY KEY
  userId: integer NOT NULL UNIQUE
  name: varchar(255)
  email: varchar(255)
  stripeAccountId: varchar(255) // For payouts
  commissionRate: integer DEFAULT 5 -- 5-20%
  trackingId: varchar(50) UNIQUE -- For URLs
  bankAccountVerified: boolean DEFAULT false
  totalEarned: numeric(10, 2) DEFAULT 0
  totalPaid: numeric(10, 2) DEFAULT 0
  status: enum('active', 'paused', 'suspended')
  createdAt: timestamp DEFAULT now()
  updatedAt: timestamp DEFAULT now()
}

table affiliate_referrals {
  id: serial PRIMARY KEY
  affiliateId: integer NOT NULL
  referredUserId: integer
  referralCode: varchar(50) UNIQUE
  source: varchar(100) -- 'link', 'qr', 'social'
  status: enum('pending', 'converted', 'expired')
  conversionValue: numeric(10, 2)
  commission: numeric(10, 2) GENERATED
  commissionRate: integer
  paidOut: boolean DEFAULT false
  expiresAt: timestamp -- 90 days
  createdAt: timestamp DEFAULT now()
}

table affiliate_payouts {
  id: serial PRIMARY KEY
  affiliateId: integer NOT NULL
  amount: numeric(10, 2)
  currency: varchar(10)
  stripePayoutId: varchar(255)
  status: enum('pending', 'in_transit', 'paid', 'failed')
  periodStart: timestamp
  periodEnd: timestamp
  notes: text
  createdAt: timestamp DEFAULT now()
  paidAt: timestamp
}

table affiliate_stats {
  id: serial PRIMARY KEY
  affiliateId: integer NOT NULL
  month: date NOT NULL UNIQUE
  referralCount: integer DEFAULT 0
  conversionCount: integer DEFAULT 0
  conversionRate: numeric(5, 2) DEFAULT 0
  totalCommission: numeric(10, 2) DEFAULT 0
  UNIQUE(affiliateId, month)
}
```

### 2.3 Affiliate Dashboard Features
```typescript
interface AffiliateUI {
  dashboard: {
    totalEarned: number;
    pendingCommission: number;
    nextPayout: date;
    conversionRate: number;
    topPerformingLink: string;
  };
  
  referralLinks: {
    generate(): string; // Create unique tracking link
    list: ReferralLink[];
    copyToClipboard(link);
    generateQR(link);
    getSocialShareText(link);
  };
  
  analytics: {
    referralsBySource: Chart;
    conversionsByDate: Chart;
    earningsByProduct: Chart;
    topReferrals: ReferralList;
  };
  
  payouts: {
    history: PayoutList;
    nextPayoutDate: date;
    bankDetails: {
      accountHolderName;
      lastFourDigits;
      bankName;
    };
    initiatePayoutRequest();
  };
}
```

### 2.4 Commission Calculation
```typescript
// Dynamic tier-based commissions
function getCommissionRate(monthlyEarnings: number): number {
  if (monthlyEarnings < 100) return 5;
  if (monthlyEarnings < 500) return 10;
  if (monthlyEarnings < 2000) return 15;
  return 20;
}

// Monthly payout calculation
function calculateMonthlyPayout(
  affiliateId: number,
  month: Date
): PayoutDetails {
  const referrals = getReferralsForMonth(affiliateId, month);
  const conversions = referrals.filter(r => r.status === 'converted');
  
  let totalCommission = 0;
  for (const conversion of conversions) {
    const rate = getCommissionRate(totalCommission);
    const commission = conversion.conversionValue * (rate / 100);
    totalCommission += commission;
  }
  
  return {
    affiliateId,
    month,
    referrals: referrals.length,
    conversions: conversions.length,
    totalCommission,
    conversionRate: (conversions.length / referrals.length) * 100,
  };
}
```

---

## 🏢 3. Sponsorships & Brand Partnerships

### 3.1 Sponsorship Tiers
```typescript
enum SponsorshipLevel {
  BRONZE = 1000,     // $1K/month: Logo, mentions
  SILVER = 5000,     // $5K/month: + 1 sponsored segment
  GOLD = 10000,      // $10K/month: + custom content
  PLATINUM = 25000,  // $25K/month: Full integration
}
```

### 3.2 Sponsorship Features
- Logo display on homepage/stream
- Brand mentions in intros
- Exclusive discount codes (tracked)
- Custom branded segments (pre/post-stream)
- Access to stream metrics & audience data
- Co-branded content creation

### 3.3 Database Schema
```typescript
table sponsors {
  id: serial PRIMARY KEY
  name: varchar(255)
  email: varchar(255)
  website: varchar(512)
  logoUrl: varchar(512)
  level: sponsorship_level
  monthlyAmount: numeric(10, 2)
  startDate: timestamp
  endDate: timestamp
  status: enum('active', 'paused', 'expired')
  notes: text
  createdAt: timestamp DEFAULT now()
}

table sponsor_placements {
  id: serial PRIMARY KEY
  sponsorId: integer
  placementType: enum('logo', 'stream_intro', 'branded_segment', 'exclusive_content')
  position: integer
  isActive: boolean DEFAULT true
  customData: jsonb
  createdAt: timestamp DEFAULT now()
}
```

---

## 🛍️ 4. Digital Products Store

### 4.1 Product Types
```typescript
enum ProductType {
  SOUNDPACK = 'soundpack',      // DJ sample packs
  PRESET = 'preset',            // Production presets
  COURSE = 'course',            // Educational content
  EXCLUSIVE_MIX = 'exclusive_mix', // Exclusive recordings
  MERCHANDISE = 'merchandise',   // Physical goods
  BUNDLE = 'bundle',            // Multi-product combo
}
```

### 4.2 Product Database Schema
```typescript
table digital_products {
  id: serial PRIMARY KEY
  name: varchar(255)
  description: text
  type: product_type
  price: numeric(10, 2)
  currency: varchar(10) DEFAULT 'GBP'
  thumbnailUrl: varchar(512)
  downloadUrl: varchar(512) -- Pre-signed S3 URL
  fileSize: integer -- bytes
  fileFormat: varchar(50) -- wav, mp3, zip, pdf
  drmEnabled: boolean DEFAULT false -- Digital rights management
  licenseType: enum('personal', 'commercial', 'educational')
  licenseUrl: varchar(512)
  isActive: boolean DEFAULT true
  releaseDate: timestamp
  viewCount: integer DEFAULT 0
  purchaseCount: integer DEFAULT 0
  rating: numeric(3, 2)
  totalReviews: integer DEFAULT 0
  createdAt: timestamp DEFAULT now()
  updatedAt: timestamp DEFAULT now()
}

table product_bundles {
  id: serial PRIMARY KEY
  name: varchar(255)
  bundlePrice: numeric(10, 2)
  bundleSavings: numeric(10, 2) -- Original - bundle price
  isActive: boolean DEFAULT true
}

table bundle_items {
  id: serial PRIMARY KEY
  bundleId: integer NOT NULL
  productId: integer NOT NULL
  quantity: integer DEFAULT 1
  UNIQUE(bundleId, productId)
}

table product_purchases {
  id: serial PRIMARY KEY
  fanId: integer
  fanEmail: varchar(255)
  productId: integer NOT NULL
  bundleId: integer -- if bundle purchase
  amount: numeric(10, 2)
  currency: varchar(10)
  licensedTo: varchar(255) -- Buyer name
  licenseKey: varchar(100) UNIQUE -- For DRM
  downloadUrl: varchar(512) -- Expires in 30 days
  expiresAt: timestamp
  ipAddress: varchar(45) -- For license validation
  status: enum('completed', 'refunded', 'expired')
  createdAt: timestamp DEFAULT now()
}
```

---

## 📊 5. Revenue Analytics & Reporting

### 5.1 Dashboard Metrics
```typescript
interface RevenueMetrics {
  // Totals
  totalRevenue: number;
  monthlyRevenue: number;
  dailyRevenue: number;
  
  // By source
  revenueBySource: {
    subscriptions: number;
    donations: number;
    affiliates: number;
    sponsorships: number;
    products: number;
  };
  
  // Performance
  conversionRate: number; // subscriptions / visitors
  averageOrderValue: number;
  customerLifetimeValue: number;
  
  // Growth
  monthOverMonthGrowth: number;
  yearOverYearGrowth: number;
  
  // Customers
  totalSubscribers: number;
  activeSubscribers: number;
  churnRate: number;
  newCustomers: number;
}
```

### 5.2 Reporting Features
```typescript
// Monthly revenue breakdown
generateMonthlyReport(month: Date) => {
  subscriptions: { count, revenue, churn },
  donations: { count, avgAmount, topDonors },
  affiliates: { payouts, commissions, topAffiliate },
  sponsorships: { active, revenue, impressions },
  products: { sold, revenue, topProduct },
  taxes: { estimated, byRegion },
  payouts: { scheduled, completed },
}

// Cohort analysis (retention by signup date)
getCohortAnalysis(startMonth, endMonth) => {
  month: [
    {cohort, churnByMonth, ltv, ...}
  ]
}

// Forecast revenue
forecastRevenue(months: 3) => {
  subscriptions: [...],
  donations: [...],
  products: [...],
}
```

---

## 💰 6. Payment Processing

### 6.1 Stripe Configuration
```typescript
// Environment setup
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

// Tax compliance
STRIPE_TAX_ID=txr_1234... // UK VAT
```

### 6.2 Payment Methods
- **Subscriptions:** Stripe Billing (automatic renewal)
- **One-time purchases:** Stripe Checkout (products, donations)
- **Payouts:** Stripe Connect (affiliates, creators)

### 6.3 Tax Handling
```typescript
// VAT calculation for UK
const VAT_RATE = 0.20; // 20% for UK

function calculateTax(amount: number, country: string): number {
  if (country === 'GB') return amount * VAT_RATE;
  if (country === 'EU') return amount * 0.19; // Average EU rate
  return 0; // No tax for non-EU
}

// Invoicing
generateInvoice(payment) => {
  subtotal: payment.amount,
  tax: calculateTax(...),
  total: payment.amount + tax,
  invoiceNumber: `INV-${date}-${sequence}`,
  dueDate: date + 30days,
}
```

---

## 🔒 Security & Compliance

### 6.1 PCI Compliance
- No credit card storage (use Stripe)
- Use Stripe Payment Element (hosted fields)
- Encrypt sensitive data at rest

### 6.2 Fraud Prevention
```typescript
// Detect suspicious patterns
function detectFraud(payment): boolean {
  const suspicious = [
    payment.amount > dailyAverageAmount * 5, // 5x average
    payment.country !== userCountry,
    payment.ipAddress !== usualIpRange,
    payment.cardIssuanceCountry !== billingCountry,
    payment.attempt === 4 && allFailed, // Multiple failures
  ];
  
  return suspicious.filter(Boolean).length >= 2;
}
```

### 6.3 Refund Policy
```typescript
// Auto-refund logic
refundRules: {
  digital_products: {
    within: '30 minutes', // After download
    condition: 'unused',
  },
  subscriptions: {
    within: '7 days',
    condition: 'no_benefits_used',
  },
  donations: {
    within: '24 hours',
    condition: 'any_reason',
  },
}
```

---

## 📱 Implementation Roadmap

### Phase 1 (Weeks 1-2): Foundation
- [ ] Database schema & migrations
- [ ] Stripe account setup
- [ ] tRPC API endpoints
- [ ] Subscription checkout flow
- [ ] Webhook handlers

### Phase 2 (Weeks 2-3): Features
- [ ] Affiliate program
- [ ] Sponsorship management
- [ ] Digital products store
- [ ] Revenue dashboard
- [ ] Reporting features

### Phase 3 (Weeks 3-4): Polish & Testing
- [ ] Email notifications (receipt, renewal, etc)
- [ ] Fraud detection implementation
- [ ] Tax calculation verification
- [ ] Load testing (1000s of payments)
- [ ] Compliance audit

### Phase 4 (Week 4): Deployment
- [ ] Production Stripe keys
- [ ] Monitor webhook processing
- [ ] Track revenue metrics
- [ ] A/B test pricing tiers

---

## ✅ Success Criteria

- [ ] 50+ subscriptions within 30 days
- [ ] 10+ active affiliates within 60 days
- [ ] $10K+ monthly recurring revenue (MRR) within 90 days
- [ ] 99.9% payment success rate
- [ ] <1% fraud/chargeback rate
- [ ] All webhooks processed within 30 seconds
- [ ] Revenue reporting accurate within 24 hours

---

## 📞 Dependencies & Integration Points

**Requires:**
- Stripe account (payment processor)
- Email service (receipt, notifications)
- Analytics database (reporting)
- User authentication system

**Integrates with:**
- Subscription gating (access control)
- Notification system (alerts)
- User profiles (affiliate tracking)
- Analytics dashboard (reporting)

---

## 🎬 Next Steps

1. Review and approve monetization model
2. Set up Stripe account & configure webhooks
3. Create database migrations
4. Implement core tRPC procedures
5. Build UI components
6. Integrate with existing authentication
7. Load test payment processing
8. Launch with soft rollout (10% users)
