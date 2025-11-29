# HecticOps Control Tower

## Overview

The HecticOps Control Tower (`/admin/control`) is your central command center for managing the entire DJ Danny Hectic B ecosystem. It provides a unified dashboard that surfaces key metrics and quick access to all admin areas.

## Access

- **Route**: `/admin/control`
- **Access**: Admin only
- **Purpose**: Single-page overview of all system activity

## Dashboard Sections

### Top-Level KPIs

Six key metric cards showing:
- **Shouts (7d)**: Total shouts submitted in the last 7 days
- **Track Votes**: Total votes across all track requests
- **Active Wallets**: Number of users with HecticCoins wallets
- **Total Coins**: Total HecticCoins in circulation
- **Episodes**: Number of published show episodes
- **AI Jobs**: Total AI jobs run (scripts + voice + video)
- **Incident**: Active incident banner status (if any)

### Module Panels

Six panels linking to major admin areas:

1. **Economy**
   - Preview: Active wallets count
   - Links: `/admin/economy`, `/admin/rewards`, `/admin/redemptions`

2. **Shows & Live**
   - Preview: Published episodes count
   - Links: `/admin/show-live`, `/admin/shows`

3. **Streams**
   - Preview: Stream management status
   - Link: `/admin/streams`

4. **Hectic Hub**
   - Preview: Shouts count (7d)
   - Link: `/admin/shouts`

5. **AI Studio**
   - Preview: Total AI jobs
   - Link: `/admin/ai-studio`

6. **Safety & Empire**
   - Preview: System status
   - Link: `/admin/empire`

### Quick Actions

Four quick action buttons:
- **Start Live Show** → Opens `/admin/show-live`
- **Manage Integrations** → Opens `/admin/integrations`
- **Create AI Script** → Opens `/admin/ai-scripts`
- **Empire Settings** → Opens `/admin/empire`

## Daily Workflow

### Morning Check-In
1. Open `/admin/control`
2. Review KPIs (shouts, coins, episodes)
3. Check for active incidents
4. Review pending redemptions (via Economy panel)

### Before Going Live
1. Check `/admin/control` for system status
2. Open `/admin/show-live` for producer panel
3. Verify stream is active in `/admin/streams`
4. Review cues and prepare content

### After Live Show
1. Return to `/admin/control`
2. Check shout count increase
3. Review AI jobs if any were created
4. Update episode status if recording was published

## Integration with Other Systems

The Control Tower aggregates data from:
- **Economy**: Wallets, transactions, rewards
- **Shows**: Episodes, live sessions
- **Hectic Hub**: Shouts, track requests
- **AI Studio**: Script, voice, video jobs
- **Empire Mode**: Incident banners, audit logs

All data is real-time and updates automatically when you refresh the page.

## Best Practices

1. **Start here**: Always begin your admin session at `/admin/control`
2. **Monitor KPIs**: Watch for unusual spikes or drops
3. **Use quick actions**: Leverage the quick action buttons for common tasks
4. **Check incidents**: Always review the incident status before major operations
5. **Link navigation**: Use panel links to drill down into specific areas

## Future Enhancements

- Real-time updates via WebSockets
- Customizable dashboard layout
- Saved views/filters
- Export KPI reports
- Alert thresholds and notifications

