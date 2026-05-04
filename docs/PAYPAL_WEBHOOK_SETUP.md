# PayPal Webhook Setup Guide

## Quick Start

Complete integration in 5 steps:

1. Get PayPal credentials
2. Deploy your backend
3. Register webhook in PayPal dashboard
4. Add webhook ID to environment
5. Test with simulator

## Step-by-Step Setup

### Step 1: Obtain PayPal Credentials

#### For Sandbox (Development/Testing)

1. Go to https://developer.paypal.com
2. Sign in with your PayPal account (or create one)
3. Navigate to **Accounts > Sandbox Accounts**
4. Create a Business account if you don't have one
5. Go back to **Dashboard > Apps & Credentials**
6. Select **Sandbox** (top tab)
7. Under "REST API Signature", find your app or create one:
   - Click **Create App** if needed
   - Note the **Client ID** and **Secret**
8. Add to `.env`:
   ```bash
   PAYPAL_CLIENT_ID=your_sandbox_client_id
   PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
   PAYPAL_MODE=sandbox
   ```

#### For Production (Live/Real Payments)

1. Go to https://www.paypal.com/cgi-bin/customerprofiletab
2. Sign in with your business PayPal account
3. Navigate to **Account Settings > API Signature**
4. Note your **API Signature** (user, password, signature)
5. Or create a new API signature:
   - Go to **Account Settings > API Signature > Create**
6. Add to `.env`:
   ```bash
   PAYPAL_CLIENT_ID=your_live_client_id
   PAYPAL_CLIENT_SECRET=your_live_client_secret
   PAYPAL_MODE=live
   ```

### Step 2: Deploy Your Backend

Your webhook endpoint must be publicly accessible at:

```
POST https://your-domain.com/api/payments/webhook/paypal
```

Deploy your backend:

**Option A: Vercel (Recommended for Next.js/Node)**

```bash
vercel deploy --prod
```

Note your deployment URL: `https://your-app.vercel.app`

**Option B: AWS Lambda / Heroku / Custom Server**

Ensure the server is running and accessible from the internet.

### Step 3: Register Webhook in PayPal Dashboard

#### For Sandbox

1. Go to https://developer.paypal.com/dashboard/
2. Click **Apps & Credentials**
3. Select **Sandbox** tab
4. Under your app, scroll to **Webhooks**
5. Click **Add Webhook**
6. Enter webhook details:
   - **URL**: `https://your-domain.com/api/payments/webhook/paypal`
   - **Event Types**: Select these events:
     - ✅ PAYMENT.CAPTURE.COMPLETED
     - ✅ PAYMENT.CAPTURE.DENIED
     - ✅ PAYMENT.CAPTURE.REFUNDED
     - ✅ PAYMENT.CAPTURE.REVERSED
7. Click **Save**
8. **Important**: Copy the **Webhook ID** that appears (looks like: `1A1A1A1A1A1A1A1A1A1A1A1A`)

#### For Production

1. Go to https://www.paypal.com/cgi-bin/customerprofiletab
2. Navigate to **Account Settings > Notifications > Webhooks**
3. Click **New**
4. Enter webhook details:
   - **Listener URL**: `https://your-domain.com/api/payments/webhook/paypal`
   - **Event Types**: Same as sandbox above
5. Click **Save**
6. **Important**: Copy the **Webhook ID**

### Step 4: Configure Environment Variables

Add the webhook ID to your environment:

```bash
# .env file
PAYPAL_WEBHOOK_ID=your_webhook_id_from_step_3
```

**For Vercel:**

```bash
vercel env add PAYPAL_WEBHOOK_ID
# Paste your webhook ID when prompted
vercel deploy --prod
```

### Step 5: Test the Webhook

#### Using PayPal Simulator

1. Go back to **Apps & Credentials > Webhooks** (for your webhook)
2. Click **Test** button
3. Select **Event Type**:
   - PAYMENT.CAPTURE.COMPLETED
4. Click **Send Test Event**
5. You should see status 200 (Success) in the response

#### Check Server Logs

Watch your server logs while testing:

```bash
# Vercel
vercel logs --tail

# Local development
npm run dev  # Look for "Processing PayPal webhook event"
```

#### Manual Database Check

```sql
-- Check if purchase was updated
SELECT * FROM purchases ORDER BY updatedAt DESC LIMIT 1;

-- Check audit logs for PayPal events
SELECT * FROM auditLogs 
WHERE action LIKE '%payment%' 
ORDER BY createdAt DESC LIMIT 5;
```

## Troubleshooting

### Issue: Webhook Returns 403 Forbidden

**Cause**: Signature verification failing

**Solutions**:
1. Verify `PAYPAL_WEBHOOK_ID` is correct:
   ```bash
   echo $PAYPAL_WEBHOOK_ID
   ```
2. Check webhook ID matches exactly what's in PayPal dashboard
3. Ensure you're using the right environment (sandbox vs live)
4. Check server logs for more details:
   ```
   PayPal webhook signature verification failed
   ```

### Issue: Webhook Returns 500 Error

**Cause**: Server error processing webhook

**Solutions**:
1. Check DATABASE_URL is configured:
   ```bash
   echo $DATABASE_URL
   ```
2. Verify database is accessible
3. Check server logs:
   ```bash
   # Vercel
   vercel logs --tail
   
   # Local
   npm run dev
   ```
4. Look for specific error message in logs

### Issue: Webhook Not Receiving Events

**Cause**: URL not registered or not accessible

**Solutions**:
1. Verify URL in PayPal dashboard is correct
2. Test URL is publicly accessible:
   ```bash
   curl -X GET https://your-domain.com/api/payments/webhook/paypal
   # Should return 404 (method not allowed) or error, not connection timeout
   ```
3. Check firewall/network allows HTTPS connections
4. Verify domain has valid SSL certificate

### Issue: "Missing signature headers"

**Cause**: Request not from PayPal

**Solutions**:
1. This is expected for manual curl requests
2. PayPal's webhook simulator includes proper headers
3. Use PayPal Dashboard → Webhooks → Test for verification

## Testing Workflow

### Test Flow Chart

```
1. Create a Test Purchase
   └─> POST /api/payments/create-paypal-order
       └─> Returns orderId

2. Simulate Payment Capture
   └─> PayPal Dashboard → Webhooks → Test
       └─> Select PAYMENT.CAPTURE.COMPLETED
       └─> Click Send

3. Verify Database Update
   └─> SELECT * FROM purchases WHERE id = {purchase_id}
       └─> status should be "completed"
       └─> transactionId should be filled

4. Check Audit Log
   └─> SELECT * FROM auditLogs WHERE entityId = {purchase_id}
       └─> Should have "payment_capture_completed" action
```

### Using npm Test Script

```bash
# Test with default purchase ID 1
npm run test:paypal-webhook

# Test with specific purchase ID
npm run test:paypal-webhook -- --purchase-id 123

# Test different event type
npm run test:paypal-webhook -- --event PAYMENT.CAPTURE.REFUNDED --purchase-id 123

# Test with custom API URL
npm run test:paypal-webhook -- --api-url https://your-domain.com
```

## Event Reference

### PAYMENT.CAPTURE.COMPLETED

**When**: Payment successfully captured

**Database Changes**:
```sql
UPDATE purchases 
SET status = 'completed', 
    transactionId = '8H987654321'
WHERE id = 123;
```

**Audit Log**:
```json
{
  "action": "payment_capture_completed",
  "entityType": "purchase",
  "entityId": 123,
  "metadata": {
    "paypalTransactionId": "8H987654321",
    "captureStatus": "COMPLETED",
    "amount": "49.99",
    "currency": "GBP"
  }
}
```

### PAYMENT.CAPTURE.DENIED

**When**: Payment was declined

**Database Changes**:
```sql
UPDATE purchases 
SET status = 'failed'
WHERE id = 123;
```

### PAYMENT.CAPTURE.REFUNDED

**When**: Payment refunded (full or partial)

**Database Changes**:
```sql
UPDATE purchases 
SET status = 'refunded'
WHERE id = 123;

INSERT INTO refundRequests (purchaseId, reason, status, refundAmount)
VALUES (123, 'PayPal refund processed', 'approved', 49.99);
```

### PAYMENT.CAPTURE.REVERSED

**When**: Chargeback or reversal initiated

**Database Changes**:
```sql
UPDATE purchases 
SET status = 'refunded'
WHERE id = 123;

INSERT INTO refundRequests (purchaseId, reason, status, refundAmount)
VALUES (123, 'PayPal reversal/chargeback', 'approved', 49.99);
```

## Security Checklist

- ✅ Webhook URL is HTTPS
- ✅ Webhook ID is stored in environment (not hardcoded)
- ✅ Signature verification is enabled
- ✅ PayPal certificate is fetched and validated
- ✅ Database credentials are secure
- ✅ Audit logs record all transactions
- ✅ Error handling doesn't expose sensitive data
- ✅ Rate limiting configured (optional)

## Production Deployment Checklist

Before going live with real payments:

1. **Credentials**
   - [ ] PAYPAL_CLIENT_ID set to live credentials
   - [ ] PAYPAL_CLIENT_SECRET set to live secret
   - [ ] PAYPAL_MODE set to "live"
   - [ ] All values in production environment

2. **Webhook**
   - [ ] Webhook registered in production PayPal dashboard
   - [ ] PAYPAL_WEBHOOK_ID copied from production
   - [ ] URL is production domain (HTTPS)
   - [ ] All 4 event types subscribed

3. **Testing**
   - [ ] Send 5+ test events from PayPal simulator
   - [ ] Verify each purchase updates correctly
   - [ ] Check audit logs for all events
   - [ ] Monitor error logs for 24 hours

4. **Monitoring**
   - [ ] Set up alerts for failed webhooks
   - [ ] Monitor database for status updates
   - [ ] Check email notifications work
   - [ ] Regular audit log review

5. **Documentation**
   - [ ] Team trained on webhook flow
   - [ ] Runbook created for troubleshooting
   - [ ] Payment procedures documented
   - [ ] Refund process documented

## Monitoring & Analytics

### Key Metrics

```sql
-- Payment success rate
SELECT 
  status,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM purchases
WHERE paymentProvider = 'paypal'
GROUP BY status;

-- Daily revenue
SELECT 
  DATE(createdAt) as date,
  SUM(CAST(amount AS DECIMAL)) as revenue,
  COUNT(*) as transactions
FROM purchases
WHERE paymentProvider = 'paypal' AND status = 'completed'
GROUP BY DATE(createdAt)
ORDER BY date DESC;

-- Refund rate
SELECT 
  COUNT(CASE WHEN status = 'refunded' THEN 1 END) as refunds,
  COUNT(*) as total,
  ROUND(100.0 * COUNT(CASE WHEN status = 'refunded' THEN 1 END) / COUNT(*), 2) as refund_rate
FROM purchases
WHERE paymentProvider = 'paypal';
```

## Support & Resources

- **PayPal Developer Docs**: https://developer.paypal.com/docs/
- **Webhook Events Guide**: https://developer.paypal.com/docs/apis/webhooks/event-names/
- **API Reference**: https://developer.paypal.com/docs/api/
- **GitHub Issues**: https://github.com/paypal/Checkout-NodeJS-SDK

## FAQ

**Q: How often do webhooks get sent?**
A: Immediately after the event occurs. PayPal attempts delivery for 3 days if there's no response.

**Q: Can I test without PayPal simulator?**
A: Not recommended for signature verification, but you can disable verification temporarily in dev.

**Q: How long before I see the webhook in logs?**
A: Usually within 1-2 seconds of the event.

**Q: What if a webhook fails?**
A: PayPal retries for 3 days. You can also resend manually from the webhook dashboard.

**Q: Can I have multiple webhooks?**
A: Yes, register separate webhooks for different environments (sandbox vs live).

**Q: How do I rotate webhook secrets?**
A: Register a new webhook with a new URL or delete and recreate the existing one.

---

Last updated: March 4, 2025
