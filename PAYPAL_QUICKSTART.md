# PayPal Webhook Integration - Quick Start

**Status**: ✅ COMPLETE AND PRODUCTION-READY

## 5-Minute Setup

### 1. Get PayPal Credentials (2 min)

**Sandbox (for testing)**:
1. Go to https://developer.paypal.com
2. Login → Dashboard → Apps & Credentials → Sandbox
3. Copy **Client ID** and **Secret** from your app

**Production (for real payments)**:
1. Go to https://www.paypal.com/cgi-bin/customerprofiletab
2. Account Settings → API Signature
3. Copy API credentials

### 2. Add to Environment (1 min)

```bash
# Add to .env or deployment config
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_CLIENT_SECRET=your_client_secret_here
PAYPAL_MODE=sandbox  # or "live"
```

### 3. Deploy Backend (1 min)

```bash
# Vercel
vercel deploy --prod

# Note your public URL: https://your-app.vercel.app
```

### 4. Register Webhook (1 min)

PayPal Developer Dashboard:
1. **Apps & Credentials** → **Webhooks**
2. Click **Add Webhook**
3. **URL**: `https://your-app.vercel.app/api/payments/webhook/paypal`
4. **Events**: Select these 4:
   - ✅ PAYMENT.CAPTURE.COMPLETED
   - ✅ PAYMENT.CAPTURE.DENIED
   - ✅ PAYMENT.CAPTURE.REFUNDED
   - ✅ PAYMENT.CAPTURE.REVERSED
5. Click **Save**
6. **Copy the Webhook ID** (important!)

### 5. Add Webhook ID (1 min)

```bash
# Add to environment
PAYPAL_WEBHOOK_ID=webhook_id_from_step_4

# Vercel
vercel env add PAYPAL_WEBHOOK_ID
# paste webhook ID when prompted
vercel deploy --prod
```

## ✅ Done! Test It

### Test the Webhook

1. Go to **Apps & Credentials** → **Webhooks** → Your webhook → **Test**
2. Select event: **PAYMENT.CAPTURE.COMPLETED**
3. Click **Send Test Event**
4. Should see ✅ **200 Success** response

### Verify Database Update

Create a test purchase, then check:

```sql
SELECT * FROM purchases ORDER BY updatedAt DESC LIMIT 1;
-- Should show status = "completed"
```

## 📚 Documentation

- **Full Integration Guide**: `/docs/PAYPAL_INTEGRATION.md`
- **Step-by-Step Setup**: `/docs/PAYPAL_WEBHOOK_SETUP.md`
- **Implementation Details**: `/docs/PAYPAL_IMPLEMENTATION_SUMMARY.md`

## 🚀 What's Integrated

✅ **Payment Capture Handling** - Updates order status when payment succeeds
✅ **Refund Processing** - Tracks refunds and chargebacks
✅ **Signature Verification** - Prevents spoofed webhooks
✅ **Audit Logging** - Complete transaction history
✅ **Error Handling** - Comprehensive error tracking
✅ **Database Integration** - Automatic status updates

## 🧪 Test Script

```bash
# Test webhook with your database
npm run test:paypal-webhook -- --purchase-id 123
```

## 📋 Webhook Events Handled

| Event | Action | Status |
|-------|--------|--------|
| PAYMENT.CAPTURE.COMPLETED | Purchase complete | ✅ |
| PAYMENT.CAPTURE.DENIED | Payment failed | ✅ |
| PAYMENT.CAPTURE.REFUNDED | Refund processed | ✅ |
| PAYMENT.CAPTURE.REVERSED | Chargeback initiated | ✅ |

## 🔒 Security

- ✅ RSA-SHA256 signature verification
- ✅ PayPal certificate validation
- ✅ Webhook ID enforcement
- ✅ Complete audit trail

## 💡 Key Files

```
/server/_core/paypalHandler.ts          - Webhook logic
/server/routes/payments.ts              - Webhook endpoint
/server/scripts/test-paypal-webhook.ts  - Test utility
/docs/PAYPAL_INTEGRATION.md             - Full guide
```

## 🆘 Troubleshooting

**Webhook not working?**
- Check `PAYPAL_WEBHOOK_ID` is set: `echo $PAYPAL_WEBHOOK_ID`
- Check URL is accessible: `curl https://your-domain/api/payments/webhook/paypal`
- Check server logs for errors: `vercel logs --tail`

**Payment not updating?**
- Verify purchase exists in database
- Check `custom_id` field is `"purchase_123"` format
- Run test script: `npm run test:paypal-webhook -- --purchase-id 123`

**Signature verification failing?**
- Copy exact Webhook ID from dashboard
- Ensure using correct PayPal mode (sandbox vs live)
- Check database logs: `vercel logs --tail`

## 📞 Support

- **PayPal Docs**: https://developer.paypal.com/docs/
- **Webhook Events**: https://developer.paypal.com/docs/apis/webhooks/event-names/
- **Full Setup Guide**: `/docs/PAYPAL_WEBHOOK_SETUP.md`

---

**Ready to go live? Complete the production checklist in `/docs/PAYPAL_WEBHOOK_SETUP.md`**
