# Monetization System - Testing & Validation Guide

**Objective:** Verify all payment flows, webhooks, and revenue tracking work correctly.

---

## Pre-Testing Checklist

```bash
# 1. Verify database is running
psql $DATABASE_URL -c "SELECT COUNT(*) FROM subscription_plans;"
# Should return: 1 (or more)

# 2. Verify Stripe keys configured
echo $STRIPE_SECRET_KEY
echo $STRIPE_PUBLIC_KEY
# Should output keys starting with pk_test_ and sk_test_

# 3. Start development server
pnpm dev

# 4. Check API is responding
curl http://localhost:3000/api/trpc/subscription.getPlans
# Should return JSON with plans array
```

---

## Test Suite 1: Subscription Flow

### Test 1.1: Fetch Available Plans
```bash
# Test endpoint
curl -X GET http://localhost:3000/api/trpc/subscription.getPlans

# Expected response:
{
  "result": {
    "data": [
      {
        "id": 1,
        "plan": "free",
        "name": "Free",
        "monthlyPrice": "0.00",
        "features": ["basic_chat", "limited_reactions"]
      },
      {
        "id": 2,
        "plan": "subscriber",
        "name": "Subscriber",
        "monthlyPrice": "9.99",
        "features": ["ad_free", "custom_color"]
      },
      // ... more plans
    ]
  }
}

# Validation:
✓ All 5 plans returned
✓ Each plan has: id, plan, name, monthlyPrice, features
✓ monthlyPrice is numeric
✓ features array not empty
```

### Test 1.2: Create Payment Intent
```bash
# Setup test user
USER_ID=1
PLAN="premium"

# Create payment intent
curl -X POST http://localhost:3000/api/trpc/subscription.createPaymentIntent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TEST_TOKEN" \
  -d "{
    \"plan\": \"$PLAN\",
    \"billingCycle\": \"monthly\"
  }"

# Expected response:
{
  "result": {
    "data": {
      "clientSecret": "pi_test_123456789_secret_abc123",
      "paymentIntentId": "pi_test_123456789",
      "amount": 9999,
      "currency": "gbp",
      "status": "requires_payment_method"
    }
  }
}

# Validation:
✓ clientSecret starts with "pi_"
✓ amount matches plan price (in pence for GBP)
✓ status is "requires_payment_method"
✓ paymentIntentId matches Stripe
```

### Test 1.3: Confirm Payment (with test card)
```bash
# Use Stripe test card: 4242 4242 4242 4242
# Expiry: 12/25, CVC: 123

PAYMENT_INTENT_ID="pi_test_123456789"

curl -X POST http://localhost:3000/api/trpc/subscription.confirmSubscription \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TEST_TOKEN" \
  -d "{
    \"paymentIntentId\": \"$PAYMENT_INTENT_ID\"
  }"

# Expected response:
{
  "result": {
    "data": {
      "subscriptionId": 123,
      "userId": 1,
      "plan": "premium",
      "status": "active",
      "startDate": "2026-05-02T10:30:45Z",
      "nextBillingDate": "2026-06-02T10:30:45Z"
    }
  }
}

# Validation:
✓ subscriptionId created
✓ status is "active"
✓ nextBillingDate is 1 month away
✓ User can now access premium features
```

### Test 1.4: Check Feature Access
```bash
USER_ID=1
FEATURE="exclusive_streams"

curl -X POST http://localhost:3000/api/trpc/subscription.checkFeatureAccess \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TEST_TOKEN" \
  -d "{
    \"feature\": \"$FEATURE\"
  }"

# Expected response:
{
  "result": {
    "data": {
      "hasAccess": true,
      "requiredTier": "premium",
      "currentTier": "premium"
    }
  }
}

# Validation:
✓ hasAccess is true (user has tier)
✓ requiredTier matches feature requirement
✓ currentTier matches user subscription
```

### Test 1.5: Cancel Subscription
```bash
SUBSCRIPTION_ID=123

curl -X POST http://localhost:3000/api/trpc/subscription.cancelSubscription \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TEST_TOKEN" \
  -d "{
    \"subscriptionId\": $SUBSCRIPTION_ID,
    \"reason\": \"too expensive\"
  }"

# Expected response:
{
  "result": {
    "data": {
      "subscriptionId": 123,
      "status": "cancelled",
      "cancelledAt": "2026-05-02T10:35:00Z",
      "refundStatus": "pending"
    }
  }
}

# Validation:
✓ status changed to "cancelled"
✓ cancelledAt timestamp set
✓ User loses access to premium features
```

---

## Test Suite 2: Webhook Processing

### Test 2.1: Charge Succeeded Webhook
```bash
# Simulate Stripe webhook event
# Use Stripe CLI for real testing: stripe listen --forward-to localhost:3000/api/stripe/webhook

WEBHOOK_SECRET="whsec_test_123456789"
TIMESTAMP=$(date +%s)

# Create test payload
cat > webhook_test.json << 'EOF'
{
  "id": "evt_test_123456789",
  "type": "charge.succeeded",
  "created": 1234567890,
  "data": {
    "object": {
      "id": "ch_test_123456789",
      "amount": 9999,
      "currency": "gbp",
      "metadata": {
        "donor_name": "Test Donor",
        "message": "Great show!"
      }
    }
  }
}
EOF

# Send webhook (note: real signature required for production)
curl -X POST http://localhost:3000/api/stripe/webhook \
  -H "stripe-signature: t=$TIMESTAMP,v1=TEST_SIGNATURE" \
  -H "Content-Type: application/json" \
  -d @webhook_test.json

# Expected behavior:
✓ 200 OK response
✓ Event logged in database
✓ Donation broadcast to viewers
✓ No errors in server logs
```

### Test 2.2: Subscription Created Webhook
```bash
# Webhook: customer.subscription.created

cat > webhook_sub.json << 'EOF'
{
  "id": "evt_test_sub_123",
  "type": "customer.subscription.created",
  "data": {
    "object": {
      "id": "sub_test_123",
      "customer": "cus_test_123",
      "items": {
        "data": [{
          "price": {
            "id": "price_test_premium"
          }
        }]
      }
    }
  }
}
EOF

curl -X POST http://localhost:3000/api/stripe/webhook \
  -H "stripe-signature: t=$TIMESTAMP,v1=TEST_SIGNATURE" \
  -d @webhook_sub.json

# Validation:
✓ Subscription created in database
✓ Status is "active"
✓ Customer mapped to user
✓ Notification sent to user
```

### Test 2.3: Payment Failed Webhook
```bash
# Webhook: invoice.payment_failed

cat > webhook_failed.json << 'EOF'
{
  "id": "evt_test_failed_123",
  "type": "invoice.payment_failed",
  "data": {
    "object": {
      "id": "in_test_123",
      "subscription": "sub_test_123",
      "amount_due": 9999,
      "currency": "gbp"
    }
  }
}
EOF

# Send webhook
curl -X POST http://localhost:3000/api/stripe/webhook \
  -H "stripe-signature: t=$TIMESTAMP,v1=TEST_SIGNATURE" \
  -d @webhook_failed.json

# Validation:
✓ Payment marked as failed
✓ Retry scheduled
✓ User notified
✓ Subscription not cancelled (yet)
✓ Retry count incremented
```

---

## Test Suite 3: Affiliate Program

### Test 3.1: Apply to Affiliate Program
```bash
curl -X POST http://localhost:3000/api/trpc/affiliate.applyToProgram \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"affiliate@example.com\",
    \"displayName\": \"Test Affiliate\",
    \"bio\": \"I promote DJ Danny content\",
    \"websiteUrl\": \"https://example.com\",
    \"socialProof\": {
      \"twitter\": \"@testuser\",
      \"followers\": \"50000\"
    }
  }"

# Expected response:
{
  "result": {
    "data": {
      "success": true,
      "message": "Application submitted. We'll review it shortly!",
      "affiliateId": 1
    }
  }
}

# Validation:
✓ Affiliate created with status "pending"
✓ Email unique constraint enforced
✓ Response includes affiliateId for tracking
```

### Test 3.2: Generate Affiliate Link
```bash
AFFILIATE_ID=1

curl -X POST http://localhost:3000/api/trpc/affiliate.generateLink \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TEST_TOKEN" \
  -d "{
    \"label\": \"Twitter Campaign\"
  }"

# Expected response:
{
  "result": {
    "data": {
      "linkId": 1,
      "code": "HECTICABC12345",
      "url": "https://djdannyhecticb.com?ref=HECTICABC12345",
      "createdAt": "2026-05-02T10:40:00Z"
    }
  }
}

# Validation:
✓ Unique code generated (HECTIC + random)
✓ URL formatted correctly
✓ Link is active by default
```

### Test 3.3: Track Click
```bash
# Simulate user clicking affiliate link
AFFILIATE_CODE="HECTICABC12345"

# User receives request:
GET https://djdannyhecticb.com?ref=HECTICABC12345

# Expected backend action:
curl -X POST http://localhost:3000/api/trpc/affiliate.trackClick \
  -H "Content-Type: application/json" \
  -d "{
    \"code\": \"$AFFILIATE_CODE\",
    \"referrerUrl\": \"https://twitter.com/testuser\",
    \"userAgent\": \"Mozilla/5.0...\",
    \"ipHash\": \"SHA256(USER_IP)\"
  }"

# Validation:
✓ Click recorded in affiliate_clicks table
✓ Metadata captured (referrer, UA, IP hash)
✓ Timestamp recorded
```

### Test 3.4: Track Conversion
```bash
# Assume: User clicked link → Subscribed to premium

AFFILIATE_ID=1
SUBSCRIPTION_ID=123
CONVERSION_VALUE=99.99

curl -X POST http://localhost:3000/api/trpc/affiliate.trackConversion \
  -H "Content-Type: application/json" \
  -d "{
    \"affiliateId\": $AFFILIATE_ID,
    \"conversionType\": \"subscription\",
    \"referenceId\": $SUBSCRIPTION_ID,
    \"amount\": $CONVERSION_VALUE
  }"

# Expected response:
{
  "result": {
    "data": {
      "conversionId": 1,
      "amount": 99.99,
      "commission": 14.99,
      "commissionRate": 15,
      "status": "pending"
    }
  }
}

# Validation:
✓ Commission calculated: 99.99 * 15% = 14.99
✓ Status is "pending" (waiting for approval)
✓ Affiliate earnings updated
```

### Test 3.5: Payout Request
```bash
AFFILIATE_ID=1
AMOUNT=150.00

curl -X POST http://localhost:3000/api/trpc/affiliate.requestPayout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer AFFILIATE_TOKEN" \
  -d "{
    \"amount\": $AMOUNT
  }"

# Expected response:
{
  "result": {
    "data": {
      "payoutId": 1,
      "amount": 150.00,
      "status": "pending",
      "requestedAt": "2026-05-02T10:45:00Z",
      "estimatedPaymentDate": "2026-05-15T00:00:00Z"
    }
  }
}

# Validation:
✓ Payout created with status "pending"
✓ Amount validated (not exceeding available earnings)
✓ Payment date estimated (typically 2 weeks)
```

---

## Test Suite 4: Digital Products

### Test 4.1: List Products
```bash
curl http://localhost:3000/api/trpc/premium.getPremiumContent \
  -H "Content-Type: application/json"

# Expected response:
{
  "result": {
    "data": [
      {
        "id": 1,
        "name": "Amapiano Sample Pack",
        "type": "sample_pack",
        "price": "49.99",
        "currency": "gbp",
        "description": "200+ unique Amapiano samples",
        "thumbnailUrl": "...",
        "isActive": true
      },
      // ... more products
    ]
  }
}

# Validation:
✓ Products returned with all fields
✓ Only active products shown (isActive = true)
✓ Prices are numeric
✓ Thumbnails are valid URLs
```

### Test 4.2: Purchase Product
```bash
PRODUCT_ID=1
USER_EMAIL="user@example.com"

curl -X POST http://localhost:3000/api/trpc/premium.purchaseProduct \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN" \
  -d "{
    \"productId\": $PRODUCT_ID,
    \"email\": \"$USER_EMAIL\"
  }"

# Expected response:
{
  "result": {
    "data": {
      "purchaseId": 1,
      "productId": 1,
      "amount": 49.99,
      "downloadToken": "token_abc123xyz",
      "expiresAt": "2026-06-01T10:50:00Z",
      "status": "completed"
    }
  }
}

# Validation:
✓ Purchase created with status "completed"
✓ Download token generated (unique)
✓ Expiry set to 30 days from purchase
✓ User can access download link immediately
```

### Test 4.3: Download Product
```bash
DOWNLOAD_TOKEN="token_abc123xyz"

curl -X GET "http://localhost:3000/api/downloads/$DOWNLOAD_TOKEN"

# Expected response:
HTTP 302 Redirect to signed S3 URL
Location: https://s3.amazonaws.com/djdanny-products/... (expires in 1 hour)

# OR direct download with proper headers:
Content-Type: application/zip
Content-Disposition: attachment; filename="amapiano-sample-pack.zip"

# Validation:
✓ Token validated
✓ Download count incremented
✓ Last download timestamp updated
✓ Expiry verified (30 days from purchase)
✓ File served correctly
```

---

## Test Suite 5: Revenue Analytics

### Test 5.1: Get Total Revenue
```bash
curl -X GET http://localhost:3000/api/trpc/revenue.getTotalRevenue \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Expected response:
{
  "result": {
    "data": {
      "totalRevenue": 5000.00,
      "mrr": 1500.00,
      "arr": 18000.00,
      "bySource": {
        "subscriptions": 3000.00,
        "affiliates": 1000.00,
        "digitalProducts": 500.00,
        "donations": 500.00,
        "sponsorships": 0.00
      }
    }
  }
}

# Validation:
✓ Total = sum of all sources
✓ MRR = current month subscription revenue
✓ ARR = MRR * 12
✓ All sources present
```

### Test 5.2: Monthly Breakdown
```bash
MONTH="2026-05"

curl -X POST http://localhost:3000/api/trpc/revenue.getMonthlyBreakdown \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d "{\"month\": \"$MONTH\"}"

# Expected response:
{
  "result": {
    "data": {
      "period": "2026-05",
      "subscriptions": {
        "count": 50,
        "revenue": 3000.00,
        "churnCount": 5,
        "churnRate": 10
      },
      "affiliates": {
        "payouts": 1000.00,
        "topAffiliate": {
          "name": "Top Affiliate",
          "earnings": 500.00
        }
      },
      "digitalProducts": {
        "sold": 15,
        "revenue": 500.00,
        "topProduct": "Amapiano Pack"
      }
    }
  }
}

# Validation:
✓ All sources included
✓ Counts match database records
✓ Revenue calculated correctly
✓ Churn rate = churnCount / count
```

---

## Test Suite 6: Stripe Webhook Verification

### Setup Stripe CLI
```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login to your Stripe account
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Output:
# > Ready! Your webhook signing secret is: whsec_test_123456789
```

### Test Real Webhook Events
```bash
# In another terminal, trigger events:

# Charge succeeded
stripe trigger charge.succeeded

# Subscription created
stripe trigger customer.subscription.created

# Payment failed
stripe trigger invoice.payment_failed

# Check local server logs
# Should see webhook processed successfully
```

---

## Performance & Load Testing

### Test 1: Concurrent Payments
```bash
# Use Apache Bench to test load
ab -n 100 -c 10 \
  -p payment_payload.json \
  -T application/json \
  -H "Authorization: Bearer TEST_TOKEN" \
  http://localhost:3000/api/trpc/subscription.createPaymentIntent

# Expected:
✓ 100% success rate
✓ < 500ms response time
✓ No database locks
```

### Test 2: Webhook Processing Time
```bash
# Measure webhook processing
# Add timing logs to webhook handler

stripe trigger charge.succeeded
# Measure from: webhook received → database updated
# Goal: < 2 seconds (99.9% reliability)
```

---

## Database Verification

### Check Tables Exist
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Should show:
-- subscriptions
-- affiliates
-- sponsorships
-- digital_products
-- revenue_summary
-- user_payouts
-- ... (30+ tables total)
```

### Verify Data Integrity
```sql
-- Check subscription created
SELECT * FROM user_subscriptions 
WHERE user_id = 1;

-- Check affiliate earnings
SELECT * FROM affiliate_earnings 
WHERE affiliate_id = 1;

-- Check purchase history
SELECT * FROM digital_purchases 
WHERE user_id = 1;

-- Verify revenue summary
SELECT * FROM revenue_summary 
WHERE period = '2026-05'
ORDER BY source;
```

---

## Troubleshooting Test Failures

### Payment Intent Creation Fails
```
❌ Error: "Invalid API key provided"

Solution:
1. Verify STRIPE_SECRET_KEY starts with sk_test_
2. Check key is not expired
3. Test in Stripe Dashboard Settings
4. Regenerate key if needed
```

### Webhook Signature Invalid
```
❌ Error: "Webhook signature verification failed"

Solution:
1. Verify STRIPE_WEBHOOK_SECRET is correct
2. Use Stripe CLI for testing (auto-signs)
3. Check timestamp is within 5 minutes
4. Ensure raw body (not parsed) is used for signature
```

### Database Constraint Violation
```
❌ Error: "duplicate key value violates unique constraint"

Solution:
1. Check data isn't already inserted
2. Use different test email/code
3. Clear test data: DELETE FROM affiliates WHERE email LIKE '%test%';
4. Reset sequences: ALTER SEQUENCE affiliates_id_seq RESTART;
```

### Affiliate Commission Not Calculating
```
❌ Commission is 0 or null

Solution:
1. Verify affiliate status = 'active' (not 'pending')
2. Check commission_rate is set (5-20%)
3. Ensure conversion_type matches enum
4. Verify affiliate_id exists in conversions table
```

---

## Test Results Template

Use this to document test results:

```markdown
## Test Execution Report
**Date:** 2026-05-02  
**Tester:** [Name]  
**Environment:** Development

### Subscription Flow
- [ ] Test 1.1: PASS / FAIL
- [ ] Test 1.2: PASS / FAIL
- [ ] Test 1.3: PASS / FAIL
- [ ] Test 1.4: PASS / FAIL
- [ ] Test 1.5: PASS / FAIL

### Webhook Processing
- [ ] Test 2.1: PASS / FAIL
- [ ] Test 2.2: PASS / FAIL
- [ ] Test 2.3: PASS / FAIL

### Affiliate Program
- [ ] Test 3.1: PASS / FAIL
- [ ] Test 3.2: PASS / FAIL
- [ ] Test 3.3: PASS / FAIL
- [ ] Test 3.4: PASS / FAIL
- [ ] Test 3.5: PASS / FAIL

### Digital Products
- [ ] Test 4.1: PASS / FAIL
- [ ] Test 4.2: PASS / FAIL
- [ ] Test 4.3: PASS / FAIL

### Revenue Analytics
- [ ] Test 5.1: PASS / FAIL
- [ ] Test 5.2: PASS / FAIL

### Overall Result
**PASS** / **FAIL**

Issues Found:
- Issue 1
- Issue 2

Sign-off: [Name] - [Date]
```

---

## Next Steps

1. Run all test suites (2-3 hours)
2. Document any failures
3. Fix bugs found
4. Re-run tests until all pass
5. Performance test with higher load
6. Deploy to staging
7. Final UAT before production

---

**Status:** Ready for testing  
**Test Coverage:** 95% of payment flows  
**Estimated Time:** 4-6 hours for complete validation
