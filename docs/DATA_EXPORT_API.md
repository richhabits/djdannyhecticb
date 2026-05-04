# Data Export API Documentation (GDPR Article 20)

**Last Updated**: 2026-05-03  
**Version**: 1.0  
**Endpoint**: `POST /api/user/export-data`  
**Authentication**: Required (JWT Bearer Token)  
**Rate Limit**: 1 request per 24 hours per user

---

## Overview

The Data Export API allows users to exercise their **Right to Data Portability** (GDPR Article 20, CCPA Article 1798.100) by exporting all their personal data in a structured, machine-readable format.

**Legal Basis**: GDPR Article 20 - Right to Data Portability  
**Response Format**: JSON with accompanying CSV files  
**Use Case**: Users can transfer data to competing services

---

## Endpoint Details

### HTTP Request

```
POST /api/user/export-data
Content-Type: application/json
Authorization: Bearer [JWT_TOKEN]

{
  "includeMedia": true,
  "format": "json",
  "notifyEmail": "user@example.com"
}
```

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `includeMedia` | boolean | No | Include uploaded files/media (default: false for faster export) |
| `format` | string | No | Response format: "json" (default) or "csv" |
| `notifyEmail` | string | No | Email to notify when export ready (default: account email) |

### Response Format

**Status**: 202 Accepted (async processing)

```json
{
  "success": true,
  "message": "Data export initiated",
  "exportId": "export_djdanny_12345_2026050315420000",
  "status": "processing",
  "estimatedTime": 300,
  "estimatedSize": "2.5MB",
  "downloadUrl": "https://djdannyhecticb.com/api/user/export-data/download/export_djdanny_12345_2026050315420000",
  "expiresAt": "2026-05-08T15:42:00Z",
  "notifyEmail": "user@example.com"
}
```

---

## Data Included in Export

### User Account Data

```json
{
  "user": {
    "id": "djdanny_12345",
    "email": "john.smith@example.com",
    "name": "John Smith",
    "phone": "+447957432842",
    "role": "user",
    "status": "active",
    "createdAt": "2026-01-15T10:30:00Z",
    "lastLoginAt": "2026-05-03T14:22:00Z",
    "loginMethod": "google_oauth",
    "otpEnabled": false,
    "privacyAgreement": true,
    "marketingConsent": true,
    "analyticsConsent": true
  }
}
```

### Profile Information

```json
{
  "profile": {
    "bio": "DJ Danny Hectic B",
    "location": "London, UK",
    "website": "https://djdannyhecticb.com",
    "profilePicture": "https://cdn.djdannyhecticb.com/profiles/djdanny_12345.jpg",
    "coverPhoto": "https://cdn.djdannyhecticb.com/covers/djdanny_12345.jpg",
    "socialLinks": {
      "instagram": "djdannyhecticb",
      "twitter": "djdannyhecticb",
      "spotify": "djdannyhecticb",
      "youtube": "djdannyhecticb"
    },
    "verificationStatus": "verified",
    "verifiedAt": "2026-02-10T09:00:00Z"
  }
}
```

### Payment & Transaction History

```json
{
  "transactions": [
    {
      "transactionId": "txn_2026050112345",
      "amount": 29.99,
      "currency": "GBP",
      "date": "2026-05-01T14:30:00Z",
      "description": "Premium Subscription Monthly",
      "status": "completed",
      "paymentMethod": "card_last4_1234",
      "invoiceUrl": "https://djdannyhecticb.com/invoices/txn_2026050112345"
    }
  ],
  "subscriptions": [
    {
      "subscriptionId": "sub_12345",
      "plan": "premium",
      "status": "active",
      "amount": 29.99,
      "currency": "GBP",
      "billingCycle": "monthly",
      "currentPeriodStart": "2026-05-01",
      "currentPeriodEnd": "2026-06-01",
      "renewalDate": "2026-06-01",
      "cancelledAt": null
    }
  ]
}
```

### Communications & Support

```json
{
  "supportTickets": [
    {
      "ticketId": "sup_2026041501",
      "subject": "Booking assistance needed",
      "status": "closed",
      "createdAt": "2026-04-15T10:00:00Z",
      "closedAt": "2026-04-16T15:30:00Z",
      "messages": [
        {
          "from": "user",
          "message": "I need help with my booking",
          "timestamp": "2026-04-15T10:00:00Z"
        },
        {
          "from": "support",
          "message": "We're here to help! What's the issue?",
          "timestamp": "2026-04-15T10:05:00Z"
        }
      ]
    }
  ],
  "contactMessages": [
    {
      "messageId": "msg_2026050102",
      "email": "john.smith@example.com",
      "subject": "General inquiry",
      "message": "Hi, I have a question about...",
      "submittedAt": "2026-05-01T14:22:00Z",
      "status": "responded",
      "response": "Thanks for your inquiry, we'll get back to you soon.",
      "respondedAt": "2026-05-01T16:00:00Z"
    }
  ]
}
```

### User-Generated Content

```json
{
  "posts": [
    {
      "postId": "post_2026043001",
      "title": "New Mix Released",
      "content": "Check out my latest amapiano mix...",
      "type": "text",
      "createdAt": "2026-04-30T18:00:00Z",
      "updatedAt": "2026-05-01T10:00:00Z",
      "likes": 234,
      "comments": 12,
      "shares": 5,
      "visibility": "public"
    }
  ],
  "comments": [
    {
      "commentId": "cmt_2026050101",
      "postId": "post_2026043001",
      "content": "Fire mix! 🔥",
      "createdAt": "2026-05-01T18:30:00Z",
      "likes": 5,
      "replies": 1
    }
  ],
  "reviews": [
    {
      "reviewId": "rev_2026043001",
      "rating": 5,
      "title": "Amazing DJ!",
      "content": "Danny was incredible at our event...",
      "createdAt": "2026-04-30T22:00:00Z",
      "helpful": 45
    }
  ]
}
```

### Bookings & Events

```json
{
  "bookings": [
    {
      "bookingId": "bk_2026050115",
      "eventName": "Summer Party 2026",
      "eventDate": "2026-06-15T20:00:00Z",
      "eventLocation": "London, UK",
      "amount": 500.00,
      "currency": "GBP",
      "status": "confirmed",
      "createdAt": "2026-04-10T14:30:00Z",
      "DJ": "Danny Hectic B",
      "duration": "4 hours",
      "notes": "Please arrive 30 mins early"
    }
  ],
  "eventRegistrations": [
    {
      "registrationId": "reg_2026050101",
      "eventName": "DJ Workshop",
      "eventDate": "2026-05-20T19:00:00Z",
      "registeredAt": "2026-05-01T14:00:00Z",
      "status": "registered",
      "confirmationSent": true
    }
  ]
}
```

### Preferences & Settings

```json
{
  "preferences": {
    "emailNotifications": true,
    "pushNotifications": true,
    "marketingEmails": true,
    "productUpdates": false,
    "newFeatureAlerts": true,
    "weeklyNewsletter": true,
    "eventReminders": true,
    "theme": "dark",
    "language": "en",
    "timezone": "Europe/London",
    "contentPreferences": {
      "genres": ["amapiano", "house", "techno"],
      "interests": ["live-streaming", "production-tips", "equipment"]
    }
  },
  "privacySettings": {
    "profileVisibility": "public",
    "showEmail": false,
    "showPhone": false,
    "allowMessages": true,
    "allowFollowing": true,
    "allowTagging": false
  }
}
```

### Analytics & Activity

```json
{
  "analytics": {
    "accountCreatedAt": "2026-01-15T10:30:00Z",
    "lastActiveAt": "2026-05-03T14:22:00Z",
    "totalLogins": 124,
    "averageSessionDuration": 1200,
    "totalPageViews": 3421,
    "totalEventsTracked": 8943,
    "referralSource": "google",
    "deviceHistory": [
      {
        "device": "iPhone 12",
        "os": "iOS 16.4",
        "browser": "Safari",
        "lastUsed": "2026-05-03T14:22:00Z"
      }
    ]
  }
}
```

### Security & Consent

```json
{
  "securityData": {
    "passwordLastChangedAt": "2026-03-15T10:00:00Z",
    "twoFactorEnabled": false,
    "loginHistory": [
      {
        "timestamp": "2026-05-03T14:22:00Z",
        "ip": "203.0.113.45",
        "device": "iPhone 12",
        "status": "success",
        "location": "London, UK"
      }
    ],
    "failedLoginAttempts": 0,
    "accountSuspensions": [],
    "dataAccessRequests": [
      {
        "requestId": "req_2026050101",
        "type": "data_export",
        "requestedAt": "2026-05-03T15:42:00Z",
        "completedAt": null
      }
    ]
  },
  "consentRecords": {
    "privacyPolicyConsent": {
      "version": "1.0",
      "consentedAt": "2026-01-15T10:35:00Z",
      "ipAddress": "203.0.113.42"
    },
    "termsOfServiceConsent": {
      "version": "1.0",
      "consentedAt": "2026-01-15T10:35:00Z",
      "ipAddress": "203.0.113.42"
    },
    "marketingConsent": {
      "consentedAt": "2026-01-15T10:35:00Z",
      "ipAddress": "203.0.113.42",
      "withdrawnAt": null
    },
    "analyticsConsent": {
      "consentedAt": "2026-01-15T10:35:00Z",
      "ipAddress": "203.0.113.42",
      "withdrawnAt": null
    }
  }
}
```

### Connected Services & Integrations

```json
{
  "connectedServices": [
    {
      "service": "Spotify",
      "connectedAt": "2026-02-10T14:00:00Z",
      "scope": "public-profile,user-read-playback-position",
      "lastSyncAt": "2026-05-03T10:00:00Z",
      "disconnectUrl": "https://djdannyhecticb.com/integrations/spotify/disconnect"
    },
    {
      "service": "YouTube",
      "connectedAt": "2026-03-01T10:00:00Z",
      "scope": "youtube.readonly",
      "lastSyncAt": "2026-05-03T11:00:00Z",
      "disconnectUrl": "https://djdannyhecticb.com/integrations/youtube/disconnect"
    }
  ]
}
```

---

## Export Formats

### JSON Format (Default)

Complete export as nested JSON structure (as shown above)

**File**: `djdannyhecticb_export_2026_05_03.json`

**Size**: Typically 1-5MB (without media)

---

### CSV Format

Multiple CSV files (one table per file)

**Files**:
- `users.csv` - Account information
- `profiles.csv` - Profile data
- `transactions.csv` - Payment history
- `support_tickets.csv` - Support communications
- `posts.csv` - User-generated content
- `bookings.csv` - Event bookings
- `preferences.csv` - User settings
- `consent_records.csv` - Consent audit trail

**Example users.csv**:
```
id,email,name,phone,createdAt,lastLoginAt,role,status
djdanny_12345,john.smith@example.com,John Smith,+447957432842,2026-01-15T10:30:00Z,2026-05-03T14:22:00Z,user,active
```

---

### Media Files

If `includeMedia: true`, additional folders:
- `/media/profile_pictures/` - Profile images
- `/media/uploads/` - User-uploaded content
- `/media/posts/` - Post attachments

**Separate index file** (`media_manifest.json`) lists all media with original URLs

---

## Usage Examples

### Basic Export (JSON)

```bash
curl -X POST https://djdannyhecticb.com/api/user/export-data \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response** (202 Accepted):
```json
{
  "success": true,
  "exportId": "export_djdanny_12345_2026050315420000",
  "status": "processing",
  "downloadUrl": "https://djdannyhecticb.com/api/user/export-data/download/export_djdanny_12345_2026050315420000",
  "expiresAt": "2026-05-08T15:42:00Z"
}
```

---

### Export with Media (CSV Format)

```bash
curl -X POST https://djdannyhecticb.com/api/user/export-data \
  -H "Authorization: Bearer ..." \
  -H "Content-Type: application/json" \
  -d '{
    "includeMedia": true,
    "format": "csv",
    "notifyEmail": "john.smith@example.com"
  }'
```

---

### Check Export Status

```bash
curl https://djdannyhecticb.com/api/user/export-data/status/export_djdanny_12345_2026050315420000 \
  -H "Authorization: Bearer ..."
```

**Response**:
```json
{
  "exportId": "export_djdanny_12345_2026050315420000",
  "status": "completed",
  "progress": 100,
  "completedAt": "2026-05-03T15:45:00Z",
  "downloadUrl": "https://djdannyhecticb.com/api/user/export-data/download/export_djdanny_12345_2026050315420000",
  "expiresAt": "2026-05-08T15:45:00Z",
  "fileSize": "2.5MB"
}
```

---

### Download Export

```bash
curl https://djdannyhecticb.com/api/user/export-data/download/export_djdanny_12345_2026050315420000 \
  -H "Authorization: Bearer ..." \
  -O djdannyhecticb_export.zip
```

---

## Error Responses

### 400: Bad Request

```json
{
  "error": "Invalid request",
  "message": "Unknown format. Use 'json' or 'csv'",
  "status": 400
}
```

### 401: Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Valid JWT token required",
  "status": 401
}
```

### 403: Forbidden

```json
{
  "error": "Forbidden",
  "message": "User account is suspended",
  "status": 403
}
```

### 429: Too Many Requests

```json
{
  "error": "Rate limited",
  "message": "Maximum 1 export per 24 hours",
  "retryAfter": 86400,
  "status": 429
}
```

### 500: Server Error

```json
{
  "error": "Server error",
  "message": "Failed to generate export. Please try again later.",
  "status": 500
}
```

---

## Implementation Notes

### Backend (Node.js/TypeScript)

```typescript
// POST /api/user/export-data
export async function exportUserData(req: AuthRequest, res: Response) {
  try {
    const { includeMedia = false, format = 'json', notifyEmail } = req.body;
    const userId = req.user.id;

    // Validate format
    if (!['json', 'csv'].includes(format)) {
      return res.status(400).json({ error: 'Invalid format' });
    }

    // Check rate limit (1 export per 24 hours)
    const lastExport = await checkLastExportTime(userId);
    if (lastExport && Date.now() - lastExport < 86400000) {
      return res.status(429).json({ 
        error: 'Rate limited',
        retryAfter: 86400000 - (Date.now() - lastExport)
      });
    }

    // Generate export ID
    const exportId = `export_${userId}_${Date.now()}`;

    // Queue async job
    await queueExportJob({
      exportId,
      userId,
      includeMedia,
      format,
      notifyEmail: notifyEmail || req.user.email
    });

    // Return immediately (202 Accepted)
    res.status(202).json({
      success: true,
      exportId,
      status: 'processing',
      downloadUrl: `/api/user/export-data/download/${exportId}`,
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    });
  } catch (error) {
    res.status(500).json({ error: 'Export failed' });
  }
}
```

### Data Retrieval Process

1. **Collect all user data** from all tables/services
2. **Anonymize sensitive data** where appropriate
3. **Format output** (JSON or CSV)
4. **Compress** (ZIP if large)
5. **Encrypt** (AES-256)
6. **Store** temporarily (30-day expiry)
7. **Notify user** (send download link)
8. **Log request** (audit trail)

---

## Security Considerations

### Authentication

- Requires valid JWT token
- Only user can export their own data
- JWT validated on every request

### Encryption

- Files encrypted at rest (AES-256)
- Download link HTTPS-only
- Temporary download tokens (one-time use)

### Rate Limiting

- 1 export per 24 hours per user
- Prevents abuse/resource exhaustion
- Logged for audit trail

### Expiration

- Files expire after 5 days
- Automatic cleanup on expiry
- Users can re-request anytime

### Audit Trail

- Every export logged
- Timestamp recorded
- User IP logged (for security)
- Retention: Indefinite

---

## Compliance Notes

### GDPR Article 20

- ✅ Structured, machine-readable format (JSON/CSV)
- ✅ Portable format (can import to other services)
- ✅ All personal data included
- ✅ Response within 30 days (usually < 1 hour)
- ✅ No fee charged
- ✅ User can request direct transfer (if technically feasible)

### CCPA Article 1798.100

- ✅ Right to Know (provides all collected data)
- ✅ Right to Delete (separate endpoint)
- ✅ Right to Correct (self-service profile edit)
- ✅ No discrimination for exercise
- ✅ 45-day response timeline

---

## Support & Questions

### For Users

- **Email**: privacy@djdannyhecticb.com
- **Response Time**: Within 7 business days
- **Include**: Export ID and description of issue

### For Developers

- **API Documentation**: https://djdannyhecticb.com/api/docs
- **Status Page**: https://djdannyhecticb.com/api/status
- **GitHub Issues**: [Link to repository]

---

**Version History**:
- v1.0 - 2026-05-03 - Initial API documentation

