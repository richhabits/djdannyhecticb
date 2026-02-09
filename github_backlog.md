# Hectic Full-Suite Backlog (Issues)

> Labels: `area:mobile`, `area:backend`, `area:admin`, `type:feature`, `type:bug`, `type:ops`, `good-first-issue`  
> Sizes: `S` (≤1d), `M` (≤3d), `L` (≤1w), `XL` (>1w)

## Foundation
- [ ] Monorepo setup with workspaces (`S`) — area:ops
- [ ] CI pipelines (build, test, lint) (`M`) — area:ops
- [ ] Env/config management (`S`) — area:ops

## Backend/API (Laravel)
- [ ] DB migrations (catalog, commerce, engagement) (`M`) — area:backend
- [ ] Auth: Firebase token verify + JWT sessions (`M`) — area:backend
- [ ] Radio Browser Import: `stations:import-uk` (`M`) — area:backend
- [ ] Stream Validation: `stations:validate` (`M`) — area:backend
- [ ] Now Playing ICY poller: `stations:nowplaying` (`M`) — area:backend
- [ ] UK export command: `stations:export-uk` (`S`) — area:backend
- [ ] REST: `GET /v1/radio` list/filter/search (`M`) — area:backend
- [ ] REST: `GET /v1/stations/{id}` (`S`) — area:backend
- [ ] REST: playlists/albums/tracks (`L`) — area:backend
- [ ] REST: podcasts (shows/episodes) (`L`) — area:backend
- [ ] REST: events & ticketing (`L`) — area:backend
- [ ] Payments webhooks (Stripe/PayPal/Razorpay/Flutterwave/PayU) (`L`) — area:backend
- [ ] IAP server validation (Apple/Google) (`L`) — area:backend
- [ ] Admin bulk import endpoints (`M`) — area:backend
- [ ] Observability (logs/metrics/traces) (`M`) — area:backend

## Admin (Laravel Blade/React)
- [ ] Sidebar nav routes wired (`S`) — area:admin
- [ ] Categories CRUD (`S`) — area:admin
- [ ] Stations CRUD with stream validator (`M`) — area:admin
- [ ] Home Sections Composer (`M`) — area:admin
- [ ] App/Ads/API Config screens (`S`) — area:admin
- [ ] Notifications composer (FCM topics) (`M`) — area:admin
- [ ] Moderation (comments queue) (`M`) — area:admin
- [ ] Analytics dashboard cards (`M`) — area:admin
- [ ] Bulk CSV import for stations (`M`) — area:admin

## Mobile (Flutter)
- [ ] App shell + router (`S`) — area:mobile
- [ ] Live Stations list + play/pause (`M`) — area:mobile
- [ ] Background audio + lockscreen controls (`M`) — area:mobile
- [ ] ICY now-playing display (`S`) — area:mobile
- [ ] Favorites & recently played (`M`) — area:mobile
- [ ] Search & filters (city/country/category/language) (`M`) — area:mobile
- [ ] Music player/queue (`L`) — area:mobile
- [ ] Podcasts (play + comments) (`M`) — area:mobile
- [ ] Live events player (HLS) (`M`) — area:mobile
- [ ] Paywall + subscriptions + restore (`L`) — area:mobile
- [ ] Ads integration (AdMob) with caps (`M`) — area:mobile
- [ ] i18n + RTL (`M`) — area:mobile

## Ops & Launch
- [ ] SLO dashboards (TTFA, rebuffer rate, crash-free) (`M`) — area:ops
- [ ] Backups + restore playbook (`S`) — area:ops
- [ ] Store assets & review checklists (`M`) — area:ops