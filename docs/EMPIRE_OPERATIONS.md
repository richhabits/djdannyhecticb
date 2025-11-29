# Empire Operations Guide

## Empire Dashboard (`/admin/empire`)

The Empire Dashboard is the central control room for managing the entire platform.

### High-Level KPIs
- **Daily Active Listeners**: Unique listeners who sent shouts in last 24 hours
- **Weekly Active Listeners**: Unique listeners in last 7 days
- **Shouts Per Day**: Total shouts submitted today
- **Revenue Summary**: Breakdown by bookings, support, products, subscriptions

### Status Overview
- **Database Health**: Connection status
- **Queue Health**: Background job queue status
- **Cron Status**: Scheduled task status
- **Error Rate (24h)**: Number of errors in last 24 hours

### Quick Actions (Kill Switches)

#### Pause All AI Posting
- Temporarily disables AI-generated social media posts
- Setting: `ai_posting_enabled` (false = paused)

#### Enable AI Hosting
- Allows AI Danny to automatically host shows
- Setting: `ai_hosting_enabled` (true = enabled)

#### Max Hectic Mode
- Enables maximum controversy/engagement features
- Setting: `max_hectic_mode` (true = enabled)

#### Maintenance Mode
- Shows holding page to all users
- Setting: `maintenance_mode` (true = enabled)

## Safety & Reputation Shield (`/admin/safety`)

### Audit Logs
- View all admin actions with timestamps
- See before/after snapshots of changes
- Track who made what changes

### Empire Settings
- Manage all kill switches and feature toggles
- Settings are stored in `empireSettings` table
- Key-value pairs with JSON support

## Observability (`/admin/ops`)

### Error Logs
- View application errors by severity
- Mark errors as resolved
- Filter by severity (low, medium, high, critical)

### Incident Banners
- Create global messages for users
- Set severity (info, warning, error)
- Schedule start/end times
- Active banners show on all pages

## Backup & Recovery (`/admin/backups`)

### Creating Backups
1. Click "Create Backup"
2. Enter label and description
3. System serializes core data into JSON
4. Backup stored with SHA-256 checksum

### Restoring Backups
1. Select backup from list
2. Preview contents (summary)
3. Click "Restore" (currently simulated - logs to audit log)

## Revenue Management

### Support Events
- View all tips/donations
- Filter by status (pending, completed, failed)
- See total revenue by currency

### Products
- Create digital products (drops, soundpacks, presets)
- Set prices and download URLs
- Activate/deactivate products

### Subscriptions
- Manage VIP tier subscriptions
- View active subscriptions
- Update subscription status

## Brand Management (`/admin/brands`)

### Creating Brands
1. Enter name, slug, type
2. Set colors and logo
3. Optionally set as default brand

### Switching Brands
- Use brand selector in admin top bar
- Filter views by active brand
- Branding (logo, colors) applied automatically

## Notification Management

### Creating Notifications
- Use `trpc.notifications.create` from any module
- Specify channel (web_push, email, whatsapp, in_app)
- Include payload data

### User Notifications
- Users see notification bell with unread count
- Mark individual or all as read
- Notifications stored in `notifications` table

## API Key Management (`/admin/api-keys`)

### Creating API Keys
1. Enter label and scopes
2. Optionally set expiration date
3. Key generated and shown once (store securely)

### Managing Keys
- Deactivate keys (keeps history)
- Delete keys (permanent)
- View last used timestamp

## Best Practices

1. **Regular Backups**: Create backups before major changes
2. **Monitor Error Logs**: Check daily for critical errors
3. **Never share API keys**: Store keys securely
4. **Use Kill Switches**: Pause features during incidents
5. **Audit Trail**: All admin actions are logged automatically

