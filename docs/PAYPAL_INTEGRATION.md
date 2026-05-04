# PayPal Integration Guide

## Overview

This document covers the complete PayPal webhook integration for the djdannyhecticb payment processing system. The integration handles real-time payment notifications from PayPal, including captures, refunds, and reversals.

## Architecture

### Components

1. **PayPal Service** (`/server/_core/paypalService.ts`)
   - Order creation
   - Order capture
   - Order details retrieval
   - Token management with caching

2. **PayPal Handler** (`/server/_core/paypalHandler.ts`)
   - Webhook signature verification
   - Event parsing and routing
   - Database updates
   - Audit logging

3. **Payment Routes** (`/server/routes/payments.ts`)
   - Webhook endpoint: `POST /api/payments/webhook/paypal`
   - Stripe webhook endpoint for reference

4. **Database** (`/server/db.ts`)
   - Purchase record management
   - Audit logging
   - Refund request tracking

## Webhook Events Handled

### 1. PAYMENT.CAPTURE.COMPLETED

**Trigger**: Payment successfully captured in PayPal

**Database Updates**:
- Purchase status → "completed"
- Transaction ID set to PayPal capture ID

**Audit Log**: Records successful payment capture with amounts and payer info

**Example Use Case**: Customer completes payment, order confirmed

```json
{
  "event_type": "PAYMENT.CAPTURE.COMPLETED",
  "resource": {
    "id": "8H987654321",
    "status": "COMPLETED",
    "custom_id": "purchase_123",
    "amount": {
      "currency_code": "GBP",
      "value": "49.99"
    }
  }
}
```

### 2. PAYMENT.CAPTURE.DENIED

**Trigger**: Payment capture was declined/denied

**Database Updates**:
- Purchase status → "failed"
- Transaction ID set to PayPal transaction ID

**Audit Log**: Records payment denial with reason

**Example Use Case**: Insufficient funds, card declined, etc.

### 3. PAYMENT.CAPTURE.REFUNDED

**Trigger**: Payment refunded through PayPal

**Database Updates**:
- Purchase status → "refunded"
- Creates refund request record
- Transaction ID set to refund ID

**Audit Log**: Records refund with amount and reason

**Example Use Case**: Customer requests refund, business initiates refund

### 4. PAYMENT.CAPTURE.REVERSED

**Trigger**: Payment reversed due to chargeback

**Database Updates**:
- Purchase status → "refunded"
- Creates refund request with reason "chargeback"

**Audit Log**: Records reversal with investigation details

**Example Use Case**: Customer files dispute, chargebank initiated

## Setup Instructions

### 1. Obtain PayPal Credentials

#### Sandbox (Development)

1. Create account at https://developer.paypal.com
2. Create a Sandbox Business account
3. Create Sandbox app in Developer Dashboard
4. Get credentials:
   - Client ID
   - Secret

#### Production (Live)

1. Create live account at https://www.paypal.com
2. Register as a business
3. Create live app in PayPal Developer Dashboard
4. Get live credentials:
   - Client ID (starts with `AY...`)
   - Secret (starts with client ID + secret)

### 2. Register Webhook

#### Sandbox Setup

```bash
# 1. Go to: https://developer.paypal.com/dashboard/
# 2. Navigate to: Apps & Credentials > Sandbox
# 3. Select your app
# 4. Scroll to: Webhook URL
# 5. Enter webhook URL:
#    https://your-app-domain/api/payments/webhook/paypal
# 6. Select events to subscribe to:
#    - PAYMENT.CAPTURE.COMPLETED
#    - PAYMENT.CAPTURE.DENIED
#    - PAYMENT.CAPTURE.REFUNDED
#    - PAYMENT.CAPTURE.REVERSED
# 7. Click "Save"
# 8. Note the Webhook ID (appears after creation)
```

#### Production Setup

1. Go to: https://www.paypal.com/cgi-bin/customerprofiletab
2. Navigate to: Account Settings > Notifications > Webhook
3. Add Webhook:
   - URL: `https://your-production-domain/api/payments/webhook/paypal`
   - Events: Same as sandbox
4. Note the Webhook ID

### 3. Configure Environment Variables

Add to your `.env` or deployment configuration:

```bash
# PayPal Credentials
PAYPAL_CLIENT_ID=your_sandbox_or_live_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_or_live_secret
PAYPAL_MODE=sandbox  # or "live" for production
PAYPAL_WEBHOOK_ID=your_webhook_id_from_dashboard

# API Configuration
VITE_API_URL=https://your-app-domain
```

### 4. Database Schema

The following fields already exist in the `purchases` table:

- `paypalOrderId` - PayPal order ID
- `transactionId` - PayPal transaction/capture ID
- `status` - Purchase status (pending, completed, failed, refunded)
- `metadata` - JSON field for additional PayPal data

The `refundRequests` table is used to track refunds:
- `purchaseId` - Link to purchase
- `reason` - Refund reason
- `status` - Refund status
- `refundAmount` - Refund amount
- `transactionId` - PayPal refund/reversal ID

## API Integration Flow

### Standard Payment Flow

```
1. Client initiates payment
   └─> POST /api/payments/create-paypal-order
       └─> Creates purchase record (status: "pending")
       └─> Creates PayPal order
       └─> Returns orderId + clientSecret

2. Client approves on PayPal
   └─> PayPal redirects to success URL

3. Client captures payment
   └─> POST /api/payments/capture-paypal-order
       └─> Calls PayPal capture endpoint
       └─> Updates purchase (status: "completed")

4. PayPal sends webhook
   └─> POST /api/payments/webhook/paypal
       └─> Verifies signature
       └─> Updates purchase status
       └─> Creates audit log
       └─> Triggers notifications
```

### Webhook Processing Flow

```
PayPal Event
    ↓
HTTP POST to /api/payments/webhook/paypal
    ↓
Extract headers (transmission ID, time, signature, cert URL)
    ↓
Verify signature using PayPal certificate
    ↓
Parse JSON body
    ↓
Route to specific handler based on event_type
    ↓
Extract purchase ID from custom_id field
    ↓
Fetch current purchase for before snapshot
    ↓
Update purchase in database
    ↓
Create audit log with before/after snapshots
    ↓
Send 200 OK response to PayPal
```

## Testing

### Webhook Simulator

PayPal provides a webhook simulator for testing:

1. Go to: https://developer.paypal.com/dashboard/
2. Navigate to: Apps & Credentials > Sandbox
3. Select your app
4. Scroll to Webhooks
5. Click on your webhook
6. Click "Simulate" tab
7. Select event type
8. Click "Send" to simulate event

### Manual Testing with cURL

```bash
# Test webhook endpoint (note: signature won't be valid)
curl -X POST http://localhost:3000/api/payments/webhook/paypal \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-webhook-123",
    "event_type": "PAYMENT.CAPTURE.COMPLETED",
    "resource": {
      "id": "test-txn-456",
      "status": "COMPLETED",
      "custom_id": "purchase_1",
      "amount": {
        "currency_code": "GBP",
        "value": "49.99"
      }
    }
  }'
```

### Programmatic Testing

Use the test event creator in the handler:

```typescript
import { createTestWebhookEvent, PayPalEventType } from '../_core/paypalHandler';

const testEvent = createTestWebhookEvent(
  PayPalEventType.PAYMENT_CAPTURE_COMPLETED,
  123,  // purchase ID
  "txn_test_123"  // transaction ID
);

// This creates a proper webhook event structure for testing
```

## Signature Verification Details

PayPal webhooks include signature headers for verification:

### Headers Received

```
paypal-transmission-id: {unique-id}
paypal-transmission-time: {ISO-8601-timestamp}
paypal-cert-url: https://api.paypal.com/cert/{cert-id}
paypal-auth-algo: SHA256withRSA
paypal-transmission-sig: {base64-encoded-signature}
```

### Verification Process

1. Fetch PayPal's certificate from `paypal-cert-url`
2. Construct verification string: `{transmissionId}|{transmissionTime}|{webhookId}|{sha256(body)}`
3. Verify signature using RSA-SHA256 with PayPal's public certificate
4. Reject if verification fails

**Security**: This prevents spoofed webhooks from third parties.

## Webhook Event Types Reference

| Event | Trigger | Action | Status |
|-------|---------|--------|--------|
| PAYMENT.CAPTURE.COMPLETED | Payment successfully captured | Update status, log | ✅ Implemented |
| PAYMENT.CAPTURE.DENIED | Payment capture declined | Mark failed, log | ✅ Implemented |
| PAYMENT.CAPTURE.REFUNDED | Payment refunded by business | Create refund record | ✅ Implemented |
| PAYMENT.CAPTURE.REVERSED | Chargeback/reversal initiated | Track chargeback | ✅ Implemented |
| BILLING.SUBSCRIPTION.CREATED | Subscription created | Create subscription | 📋 Future |
| BILLING.SUBSCRIPTION.UPDATED | Subscription modified | Update subscription | 📋 Future |
| BILLING.SUBSCRIPTION.CANCELLED | Subscription cancelled | Archive subscription | 📋 Future |

## Troubleshooting

### Webhook Not Receiving Events

1. **Check webhook ID in environment**:
   ```bash
   echo $PAYPAL_WEBHOOK_ID
   ```

2. **Verify webhook URL in PayPal dashboard**:
   - Should match `VITE_API_URL + /api/payments/webhook/paypal`
   - Must be publicly accessible (not localhost)
   - HTTPS required for production

3. **Check server logs**:
   ```bash
   tail -f logs/server.log | grep "PayPal"
   ```

4. **Use PayPal Dashboard Webhook Logs**:
   - Go to Webhooks in Developer Dashboard
   - Select your webhook
   - View recent deliveries and responses

### Signature Verification Failures

**Problem**: "Invalid signature" errors

**Solutions**:
1. Ensure `PAYPAL_WEBHOOK_ID` is correct (from dashboard)
2. Verify you're using the right PayPal mode (sandbox vs live)
3. Check that certificate URL is accessible
4. Ensure webhook secret is not rotated (PayPal generates new ones)

### Missing custom_id in Events

**Problem**: "Invalid or missing custom_id in webhook event"

**Solution**: Ensure PayPal orders are created with `custom_id` field:

```typescript
// In paypalService.ts createPayPalOrder()
purchase_units: [{
  custom_id: `purchase_${purchaseId}`,  // Must be set
  ...
}]
```

### Database Updates Not Happening

1. Check `DATABASE_URL` is configured
2. Verify purchase record exists: `SELECT * FROM purchases WHERE id = ?`
3. Check audit logs for errors: `SELECT * FROM auditLogs WHERE action LIKE '%payment%'`
4. Ensure database credentials have write permission

## Monitoring & Analytics

### Audit Log Queries

```sql
-- Recent payment webhooks
SELECT * FROM auditLogs 
WHERE action LIKE '%payment%' 
ORDER BY createdAt DESC 
LIMIT 20;

-- Failed payments
SELECT p.*, a.* FROM purchases p
LEFT JOIN auditLogs a ON a.entityId = p.id
WHERE p.status = 'failed'
ORDER BY p.createdAt DESC;

-- Refund tracking
SELECT p.id, p.amount, r.refundAmount, r.reason
FROM purchases p
LEFT JOIN refundRequests r ON r.purchaseId = p.id
WHERE p.status = 'refunded'
ORDER BY p.createdAt DESC;
```

### Metrics to Track

- **Capture success rate**: COMPLETED / (COMPLETED + DENIED)
- **Refund rate**: REFUNDED / COMPLETED
- **Chargeback rate**: REVERSED / COMPLETED
- **Payment revenue**: SUM(amount WHERE status = 'completed')

## Security Considerations

### Webhook Security

✅ **Implemented**:
- Signature verification using PayPal's RSA-SHA256
- Certificate validation
- Webhook ID enforcement
- Rate limiting via database writes

⚠️ **Recommended**:
- Monitor webhook failure rates
- Set up alerts for high chargeback rates
- Regular security audits of webhook logs
- Webhook signing key rotation policy (yearly)

### Data Protection

- PayPal data stored in `metadata` field (encrypted at DB level)
- Transaction IDs never logged to console (only audit DB)
- Email addresses stored only with purchase records
- PCI compliance: Don't store card details (PayPal handles this)

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Webhooks returning 403 | Invalid signature | Check PAYPAL_WEBHOOK_ID |
| Webhooks returning 500 | Database error | Check DATABASE_URL and migrations |
| Purchase not updating | Missing custom_id | Ensure order created with custom_id |
| Signature verify fails | Wrong webhook ID | Copy exact ID from PayPal dashboard |
| Certificate fetch fails | Network issue | Check firewall allows api.paypal.com |

## Future Enhancements

1. **Subscription Webhooks**
   - Handle recurring billing events
   - Auto-renew management

2. **Dispute Resolution**
   - Track disputes and chargebacks
   - Automated response flow

3. **Email Notifications**
   - Send order confirmation on capture
   - Send refund notification on reversal

4. **Webhook Retry Logic**
   - Store failed webhook events
   - Automatic retry with exponential backoff

5. **Analytics Dashboard**
   - Real-time payment metrics
   - Revenue charts by provider
   - Chargeback tracking

## Support & Resources

- **PayPal Docs**: https://developer.paypal.com/docs/
- **Webhook Events**: https://developer.paypal.com/docs/apis/webhooks/event-names/
- **SDK Reference**: https://github.com/paypal/Checkout-NodeJS-SDK
- **Community**: https://github.com/paypal/PayPal-node-SDK

## Version History

- **v1.0** (2025-03-04): Initial webhook implementation
  - Payment capture handling
  - Signature verification
  - Refund tracking
  - Chargeback handling
