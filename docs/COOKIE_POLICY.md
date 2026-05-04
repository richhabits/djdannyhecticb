# Cookie Policy

**Last Updated**: 2026-05-03  
**Effective Date**: [DEPLOYMENT_DATE]  
**Version**: 1.0

---

## Table of Contents

1. [What Are Cookies](#what-are-cookies)
2. [Why We Use Cookies](#why-we-use-cookies)
3. [Cookie Types & Categories](#cookie-types--categories)
4. [Detailed Cookie List](#detailed-cookie-list)
5. [Third-Party Cookies](#third-party-cookies)
6. [Cookie Consent & Management](#cookie-consent--management)
7. [How to Control Cookies](#how-to-control-cookies)
8. [Technical Data](#technical-data)
9. [EU/UK Compliance](#euuk-compliance)
10. [Contact](#contact)

---

## What Are Cookies

A cookie is a small text file stored on your device (computer, phone, tablet) when you visit a website. Cookies allow websites to:
- Remember information about you
- Recognize you when you return
- Understand how you use the site
- Provide personalized experiences
- Improve service quality

**Types of Storage**:
- **Cookies**: Text files in browser
- **Local Storage**: JavaScript-accessible storage
- **Session Storage**: Temporary memory for session
- **Service Workers**: Caches for offline functionality
- **Pixels/Web Beacons**: Invisible 1x1 images for tracking

---

## Why We Use Cookies

### Service Delivery
- Keeping you logged in
- Remembering preferences
- Maintaining shopping cart
- Preventing fraud

### Analytics & Improvement
- Understanding how users interact with the site
- Identifying popular features
- Improving performance
- A/B testing new features

### Marketing & Personalization
- Showing relevant content
- Retargeting ads
- Understanding content preferences
- Measuring campaign effectiveness

### User Experience
- Remembering theme (light/dark mode)
- Remembering language preference
- Storing session state
- Smooth navigation

---

## Cookie Types & Categories

### 1. Essential / Necessary Cookies

**Purpose**: Required for core functionality

**Consent**: Implicit (no consent required)

**Deletion**: Does not affect service capability

**Examples**:
- Session authentication
- CSRF protection tokens
- Payment processing tokens
- Security cookies

| Cookie Name | Purpose | Duration | Data Stored |
|------------|---------|----------|------------|
| `session_id` | User authentication | Session | Unique session token |
| `csrf_token` | Prevent CSRF attacks | Session | CSRF token |
| `payment_token` | Stripe payment processing | Session | Encrypted payment token |
| `user_preferences` | Core user preferences | 1 year | Theme, language |

### 2. Analytics Cookies

**Purpose**: Understand user behavior, improve service

**Consent**: Opt-in required (explicit consent)

**Legitimate Interest**: Service improvement

**Examples**:
- Page views
- Time on page
- Clicks and scrolling
- Feature usage
- Error tracking

| Cookie Name | Purpose | Operator | Duration | Data Stored |
|------------|---------|----------|----------|------------|
| `_ga` | Google Analytics | Google | 2 years | User ID, session tracking |
| `_gat` | Google Analytics throttling | Google | 10 minutes | Throttling flag |
| `_gid` | Google Analytics session ID | Google | 24 hours | Session ID |
| `vercel_analytics` | Vercel Analytics | Vercel | 24 months | Aggregate usage data |
| `analytics_token` | Custom analytics | DJ Danny Hectic B | 1 year | Event tracking ID |

### 3. Preference / Functionality Cookies

**Purpose**: Remember user preferences

**Consent**: Implicit (no consent strictly required, but disclosed)

**Examples**:
- Theme preference (light/dark)
- Language selection
- Layout preferences
- Accessibility settings
- Recent searches

| Cookie Name | Purpose | Duration | Data Stored |
|------------|---------|----------|------------|
| `theme_preference` | Light/dark mode | 1 year | "light" or "dark" |
| `language_preference` | Language selection | 1 year | Language code (e.g., "en", "fr") |
| `volume_preference` | Audio player volume | 1 year | Volume level (0-100) |
| `sidebar_state` | Collapsed/expanded sidebar | Session | "collapsed" or "expanded" |
| `accessibility_settings` | Font size, high contrast, etc. | 1 year | Accessibility preferences |

### 4. Marketing / Targeting Cookies

**Purpose**: Display relevant ads, measure campaign effectiveness

**Consent**: Explicit opt-in required

**Operators**: Third-party ad networks and platforms

**Data Shared**: User interests, browsing history, demographic info

| Cookie Name | Purpose | Operator | Duration | Data Shared |
|------------|---------|----------|----------|------------|
| `_fbp` | Facebook Pixel | Facebook | 3 months | Browsing behavior, interactions |
| `tr` | Facebook tracking | Facebook | Session | Activity tracking |
| `IDE` | Google Display Network | Google | 1-2 years | Personalized ad interest |
| `__gads` | Google Ads | Google | 2 years | Ad engagement tracking |
| `ANID` | Google Ads | Google | 6 months | Ad targeting, behavior |
| `NID` | Google Ads | Google | 6 months | Ad preferences |
| `riskified_session_id` | Fraud detection | Riskified | Session | Fraud risk assessment |

### 5. Social Media Cookies

**Purpose**: Enable social features, track social shares

**Consent**: Explicit opt-in (or implicit through social login)

**Operators**: Social media platforms

| Cookie Name | Purpose | Operator | Duration | Data Shared |
|------------|---------|----------|----------|------------|
| `__ar_v4` | TikTok tracking | TikTok | 2 years | User engagement |
| `fr` | Facebook tracking | Facebook | 3 months | Social engagement |
| `X-CSRF-TOKEN` | Twitter/X CSRF | Twitter/X | Session | CSRF protection |
| `twitch_auth` | Twitch authentication | Twitch | 1 year | Authentication token |
| `youtube_session` | YouTube session | YouTube | Session | YouTube interactions |

### 6. Advertising Performance Cookies

**Purpose**: Measure ad performance, ROI, attribution

**Consent**: Explicit opt-in

**Data Tracked**: Clicks, conversions, revenue attribution

| Cookie Name | Purpose | Operator | Duration | Data Shared |
|------------|---------|----------|----------|------------|
| `conversion_token` | Conversion tracking | Stripe | Session | Purchase attribution |
| `utm_source` | Campaign tracking | Internal | Session | Traffic source |
| `gclid` | Google Click ID | Google Ads | Session | Ad click tracking |
| `fbclid` | Facebook Click ID | Facebook | Session | Ad click tracking |

---

## Detailed Cookie List

### Session Cookies (Temporary - Deleted When You Close Browser)

**Purpose**: Maintain authentication and session state

**Consent**: Implicit (necessary for service)

| Cookie | Purpose | Content | Expires |
|--------|---------|---------|---------|
| `session_id` | User authentication | Encrypted session token | Session end |
| `csrf_token` | CSRF attack prevention | CSRF token | Session end |
| `payment_session` | Payment processing state | Stripe session ID | Session end |
| `auth_token` | OAuth authentication | JWT token | Session end |

### Persistent Cookies (Stored on Your Device)

**Purpose**: Remember preferences, analyze usage

**Consent**: Varies by cookie (indicated below)

| Cookie | Purpose | Content | Duration | Consent |
|--------|---------|---------|----------|---------|
| `_ga` | Google Analytics | Client ID | 2 years | Opt-in |
| `_gat` | Google Analytics throttling | Throttling flag | 10 minutes | Opt-in |
| `_gid` | Google Analytics session | Session ID | 24 hours | Opt-in |
| `vercel_analytics` | Web performance | Anonymous event data | 24 months | Opt-in |
| `analytics_token` | Custom analytics | Tracking token | 1 year | Opt-in |
| `theme_preference` | Dark/light mode | "light" \| "dark" | 1 year | Implicit |
| `language_preference` | Language selection | Language code | 1 year | Implicit |
| `volume_preference` | Player volume | Integer 0-100 | 1 year | Implicit |
| `accessibility_settings` | Accessibility options | Settings object | 1 year | Implicit |

### Local Storage (Not Technically Cookies)

**Purpose**: Client-side data persistence

**Format**: Key-value pairs stored in browser

| Key | Purpose | Data | Expires |
|-----|---------|------|---------|
| `user_preferences` | User settings | JSON object | Never (manual delete) |
| `draft_messages` | Unsent messages | Message text | Never (manual delete) |
| `offline_queue` | Messages to send when online | Message queue | Never (until sent) |
| `recent_searches` | Recent search history | Array of search terms | Until manually cleared |
| `cache_version` | Service worker cache version | Version number | Until update |

### Service Worker Caches (Offline Functionality)

**Purpose**: Enable offline access, improve performance

**Data**: Static assets, previously loaded pages, media files

**Management**: Automatically cleared with cache clearing, or via app settings

---

## Third-Party Cookies

### Google Analytics

**Operator**: Google LLC  
**Purpose**: Website analytics and traffic tracking

**Cookies Set**:
- `_ga`: Anonymous user ID
- `_gat`: Request throttling
- `_gid`: Session ID

**Data Shared**: 
- Pages visited
- Time on page
- Referral source
- Browser/device info
- Approximate location (IP-based)
- Anonymized (IP last octet removed)

**Privacy**: [Google Analytics Privacy Policy](https://policies.google.com/privacy)

**Opt-Out**: [Google Analytics Opt-Out Browser Add-On](https://tools.google.com/dlpage/gaoptout)

---

### Vercel Analytics

**Operator**: Vercel Inc.  
**Purpose**: Web performance and usage analytics

**Cookies Set**:
- `vercel_analytics`: Event tracking token

**Data Shared**:
- Page performance metrics (Core Web Vitals)
- User interactions
- Error tracking
- Feature usage
- Aggregated traffic analysis

**Privacy**: [Vercel Analytics Privacy](https://vercel.com/legal/privacy-policy)

**Data Processing**: Vercel acts as data processor on our behalf

---

### Stripe Payment Processing

**Operator**: Stripe, Inc.  
**Purpose**: Payment processing, fraud prevention

**Cookies Set**:
- `payment_token`: Session token
- Stripe's own tracking cookies (if enabled)

**Data Shared**:
- Transaction amount and status
- Billing information
- Device fingerprinting (fraud prevention)
- Payment method type (not full card)

**Privacy**: [Stripe Privacy Policy](https://stripe.com/privacy)

**PCI Compliance**: Stripe handles full PCI-DSS compliance

---

### Facebook Pixel

**Operator**: Meta Platforms Inc.  
**Purpose**: Conversion tracking, audience building for ads

**Cookies Set**:
- `_fbp`: Facebook Pixel ID
- `fr`: Facebook conversion tracking
- Other Facebook tracking cookies

**Data Shared**:
- Pages visited
- Buttons clicked
- Form submissions
- Purchases (if enabled)
- Browsing history
- Device information

**Privacy**: [Meta Privacy Policy](https://www.facebook.com/privacy/explanation)

**Opt-Out**: [Meta Ad Preferences](https://www.facebook.com/ads/preferences/)

**Consent Required**: Yes, explicit opt-in for Facebook ads

---

### Google Ads & Display Network

**Operator**: Google LLC  
**Purpose**: Advertising targeting, conversion measurement

**Cookies Set**:
- `IDE`: Interest-based advertising ID
- `__gads`: Google Ads conversion tracking
- `ANID`: Ad network ID
- `NID`: Ad preferences

**Data Shared**:
- Pages visited
- Products viewed
- Purchases made
- Browsing history
- Interests and demographics
- Ad clicks

**Privacy**: [Google Ads Privacy](https://policies.google.com/privacy)

**Opt-Out**: [Google Ads Settings](https://myadcenter.google.com/)

**Consent Required**: Yes for non-essential targeting

---

### TikTok Pixel

**Operator**: TikTok Ltd.  
**Purpose**: Conversion tracking, audience targeting

**Cookies Set**:
- `__ar_v4`: TikTok tracking ID

**Data Shared**:
- Pages visited
- Buttons clicked
- Purchases
- Browsing behavior
- Device information

**Privacy**: [TikTok Privacy Policy](https://www.tiktok.com/legal/page/us/privacy-policy)

**Consent Required**: Yes

---

### Riskified Fraud Detection

**Operator**: Riskified Ltd.  
**Purpose**: Fraud detection and prevention

**Cookies Set**:
- `riskified_session_id`: Session tracking

**Data Shared**:
- User behavior patterns
- Device information
- Transaction data
- Fraud risk assessment (internal only)

**Privacy**: [Riskified Privacy Policy](https://www.riskified.com/privacy-policy)

**Note**: Used only to protect against fraudulent transactions

---

## Cookie Consent & Management

### Consent Mechanism

**First Visit**: 
- Cookies banner appears at top of page
- User has three options:
  1. **Accept All**: Accept all cookies
  2. **Accept Essential Only**: Only necessary cookies for functionality
  3. **Customize**: Choose specific categories

**Banner Content**:
- Clear explanation of cookie use
- Links to full Cookie Policy
- Link to Privacy Policy
- Direct link to cookie settings

**Consent Recording**:
- User choice stored in `cookie_consent` cookie
- Timestamp recorded
- Granular preferences saved (which categories accepted)

### Granular Consent Controls

Users can manage cookie preferences separately:

1. **Essential Cookies**: 
   - Status: Always enabled (necessary for service)
   - Cannot be disabled
   - No consent required

2. **Analytics Cookies**:
   - Status: Disabled by default (opt-in)
   - Checkbox to enable
   - Data: Page views, time on site, features used

3. **Marketing Cookies**:
   - Status: Disabled by default (opt-in)
   - Checkbox to enable
   - Includes: Facebook, Google Ads, TikTok pixels

4. **Preference Cookies**:
   - Status: Enabled by default (low privacy impact)
   - Checkbox to disable
   - Data: Theme, language, accessibility

5. **Third-Party Cookies**:
   - Status: Disabled by default (opt-in)
   - Checkbox to enable
   - Includes: Social media integrations

### Cookie Preferences Page

**Location**: https://djdannyhecticb.com/cookie-settings

**Features**:
- View all active cookies
- Description of each cookie's purpose
- Toggle switches for each category
- Save preferences button
- Reset to defaults button
- Download cookie list (PDF/CSV)

**Logged-In Users**:
- Preferences synced across devices
- Preferences persistent after logout
- Can revert to previous preferences

**Anonymous Users**:
- Preferences stored in local `cookie_consent` cookie
- Preferences reset if cookies cleared

---

## How to Control Cookies

### Browser Controls

**Chrome**:
1. Click ⋮ (menu) → Settings
2. Click "Privacy and security" → Cookies and other site data
3. Choose blocking level:
   - Allow all cookies
   - Block third-party cookies in incognito mode
   - Block all third-party cookies
   - Block all cookies

**Firefox**:
1. Click ☰ (menu) → Settings
2. Go to "Privacy & Security"
3. Under "Cookies and Site Data" choose:
   - Accept all cookies
   - Reject all (except necessary)
   - Custom settings

**Safari**:
1. Click Safari → Settings
2. Go to "Privacy" tab
3. Choose:
   - Always allow
   - Allow from websites I visit
   - Block all

**Edge**:
1. Click ⋯ (menu) → Settings
2. Go to "Privacy" → Cookies and site permissions
3. Choose blocking level

### Opt-Out Tools

**Google Analytics Opt-Out**:
- Install [browser add-on](https://tools.google.com/dlpage/gaoptout)
- Or disable in cookie settings

**Facebook Opt-Out**:
- Go to [Ad Preferences](https://www.facebook.com/ads/preferences/)
- Turn off ads from DJ Danny Hectic B

**Google Ads Opt-Out**:
- Go to [My Ad Center](https://myadcenter.google.com/)
- Manage interests and ads

**NAI Opt-Out**:
- Go to [Network Advertising Initiative](https://optout.networkadvertising.org/)
- Opt-out from network ad serving

### Do Not Track

**Browser DNT Signal**:
- Most browsers have "Do Not Track" setting
- If enabled, we honor DNT requests
- Send request to: privacy@djdannyhecticb.com

**Process**:
1. Enable DNT in browser settings
2. Some cookies will be disabled
3. Some tracking reduced (analytics, ads)
4. Core functionality unaffected

### Clear Cookies Manually

**Chrome**:
- Click ⋮ → Settings → Privacy → Clear browsing data
- Select "Cookies and other site data"
- Choose time range
- Click "Clear data"

**Firefox**:
- Click ☰ → Settings → Privacy & Security → Clear Data
- Check "Cookies"
- Click "Clear"

**Safari**:
- Click Safari → Settings → Privacy
- Click "Manage Website Data"
- Select site and click "Remove"

**Edge**:
- Click ⋯ → Settings → Privacy → Clear browsing data
- Select "Cookies" and click "Clear"

---

## Technical Data

### Cookie Storage Location

**First-Party Cookies** (Set by djdannyhecticb.com):
- Domain: `djdannyhecticb.com`
- Accessible by: Only djdannyhecticb.com
- Examples: `session_id`, `theme_preference`

**Third-Party Cookies** (Set by partner sites):
- Domain: `google.com`, `facebook.com`, etc.
- Accessible by: These third-party sites
- Examples: `_ga`, `_fbp`
- Requires: Cross-site cookies to be enabled in browser

### Cookie Security

**Secure Flag**:
- Cookies transmitted only over HTTPS
- Cannot be accessed by unencrypted HTTP
- Protects against man-in-the-middle attacks

**HttpOnly Flag**:
- Cookies not accessible by JavaScript
- Prevents XSS (cross-site scripting) attacks
- Improves security against cookie theft

**SameSite Attribute**:
- `SameSite=Strict`: Only sent in same-site requests
- `SameSite=Lax`: Sent in same-site + top-level cross-site navigation
- `SameSite=None`: Sent in cross-site requests (requires Secure flag)

**Encryption**:
- Session tokens encrypted
- Authentication tokens hashed
- Sensitive data not stored in cookies

### Local Storage vs. Cookies

**Cookies**:
- Automatically sent with HTTP requests
- Domain and path scope
- Expiration dates
- Limited to ~4KB per cookie

**Local Storage**:
- Only accessed by JavaScript
- Larger storage (~10MB)
- No automatic expiration
- Cleared only by user action
- More persistent than cookies

**Service Workers**:
- Background scripts
- Cache assets for offline access
- Separate storage (~50MB+)
- Controlled by app
- Can update without user action

---

## EU/UK Compliance

### GDPR Requirements

**Cookie Consent**:
- ✅ Explicit opt-in for non-essential cookies
- ✅ Clear information about purposes
- ✅ Easy withdrawal of consent
- ✅ Consent recorded with timestamp
- ✅ No pre-ticked checkboxes

**Privacy Information**:
- ✅ Cookie Policy published
- ✅ Available and easy to find
- ✅ Granular cookie descriptions
- ✅ Third-party information
- ✅ User rights explained

**User Rights**:
- ✅ Access to cookie data
- ✅ Deletion/erasure rights
- ✅ Opt-out mechanisms
- ✅ Withdrawal of consent
- ✅ Right to lodge complaint

---

### UK PECR (Privacy and Electronic Communications Regulations)

**Requirements**:
- ✅ Prior consent for marketing cookies
- ✅ Clear withdrawal method
- ✅ No tracking before consent
- ✅ Annual consent refresh recommended
- ✅ Comply with Privacy Policy

---

### ePrivacy Directive (2002/58/EC)

**Requirements**:
- ✅ Consent before storing cookies
- ✅ Exceptions for essential cookies
- ✅ Clear information provided
- ✅ Easy opt-out mechanism
- ✅ Special rules for electronic marketing

---

## Contact

### Cookie-Related Questions

**Email**: privacy@djdannyhecticb.com

**Response Time**: Within 7 business days

**Include**:
- Your question or concern
- Specific cookie name (if applicable)
- Type of device/browser
- When issue started

### How to Request

**Subject Line**:
- "Cookie Question: [Your Question]"
- "Opt-Out Request: [Cookie Name]"
- "Cookie Complaint"

**What Happens**:
1. We acknowledge receipt within 1 business day
2. Investigate and gather information
3. Respond with detailed answer
4. Implement requested changes if necessary

### Additional Resources

- **Privacy Policy**: https://djdannyhecticb.com/privacy
- **Terms of Service**: https://djdannyhecticb.com/terms
- **GDPR Compliance**: https://djdannyhecticb.com/gdpr
- **Cookie Settings**: https://djdannyhecticb.com/cookie-settings
- **Data Deletion Request**: https://djdannyhecticb.com/request-deletion

### Regulatory Contact

**UK Information Commissioner's Office (ICO)**:
- Website: https://ico.org.uk/
- Phone: 0303 123 1113
- Address: Water Lane, Walsall WS2 8NP, UK

**European Data Protection Board (EDPB)**:
- Website: https://edpb.eu/
- Contact your country's Data Protection Authority

---

**Version History**:
- v1.0 - 2026-05-03 - Initial policy (production launch)

**Policy Owner**: Privacy & Compliance Team  
**Review Frequency**: Annually or when material changes occur  
**Last Review**: 2026-05-03  
**Next Review Date**: 2027-05-03

