#!/bin/bash
# Build complete truth table for product decisions

set -euo pipefail

OUTPUT="PRODUCT_DECISIONS_REQUIRED.md"

cat > "$OUTPUT" << 'EOF'
# Product Decisions Required - Truth Table

## Objective
Achieve 100% TypeScript green by making product decisions: IMPLEMENT core routers or DELETE non-core pages.

## Existing Routers in server/routers.ts

Based on analysis, the actual top-level routers are:
- `auth` (me, logout, register)
- `beatport` (search, charts, genres, etc.)
- `events` (getAllEvents, getUpcomingEvents, getFeaturedEvents)
- `mixes` (list, free, getMixById, downloadUrl, admin*)
- `system` (health checks, etc.)
- `ukEvents` (UK events management)

## Decision Table

| Route | Page File | TRPC Calls Found | Exists? | Decision | Rationale | Actions |
|-------|-----------|------------------|---------|----------|-----------|---------|
EOF

# Core product pages (likely IMPLEMENT if missing)
echo "| / | Home.tsx | TBD | TBD | **IMPLEMENT** | Homepage - core | Implement missing procedures |" >> "$OUTPUT"
echo "| /events | UKEventsPage.tsx | events.* | Y | KEEP | Core product | Already wired |" >> "$OUTPUT"
echo "| /bookings | Bookings.tsx | bookings.* | **N** | **IMPLEMENT** | Core booking flow | Implement bookings router |" >> "$OUTPUT"
echo "| /mixes | Mixes.tsx | mixes.* | Y | KEEP | Core content | Already wired |" >> "$OUTPUT"
echo "| /live | Live.tsx | TBD | TBD | **IMPLEMENT** | Public live stream | Implement if needed |" >> "$OUTPUT"
echo "| /shop* | Beatport*.tsx | beatport.* | Y | KEEP | Core shop | Already wired |" >> "$OUTPUT"

# Admin pages (need individual analysis)
echo "| /admin/mixes | AdminMixes.tsx | mixes.admin* | Y | KEEP | Core admin | Already wired |" >> "$OUTPUT"
echo "| /admin/uk-events | AdminUKEvents.tsx | ukEvents.* | Y | KEEP | Core admin | Already wired |" >> "$OUTPUT"

# Likely experimental/delete candidates
echo "| /admin/media | AdminMedia.tsx | media.* | **N** | **DELETE** | Experimental | Remove route & page |" >> "$OUTPUT"
echo "| /admin/partners | AdminPartners.tsx | partners.* | **N** | **DELETE** | Experimental | Remove route & page |" >> "$OUTPUT"
echo "| /admin/ai-studio | AdminAIStudio.tsx | aiStudio.* | **N** | **DELETE** | Experimental AI | Remove route & page |" >> "$OUTPUT"
echo "| /admin/ai-scripts | AdminAIScripts.tsx | aiStudio.* | **N** | **DELETE** | Experimental AI | Remove route & page |" >> "$OUTPUT"
echo "| /admin/ai-voice | AdminAIVoice.tsx | aiStudio.* | **N** | **DELETE** | Experimental AI | Remove route & page |" >> "$OUTPUT"
echo "| /admin/ai-video | AdminAIVideo.tsx | aiStudio.* | **N** | **DELETE** | Experimental AI | Remove route & page |" >> "$OUTPUT"
echo "| /vault | Vault.tsx | genz.* | **N** | **DELETE** | Experimental | Remove route & page |" >> "$OUTPUT"
echo "| /ai-danny | AIDanny.tsx | danny.* | **N** | **DELETE** | Experimental AI | Remove route & page |" >> "$OUTPUT"
echo "| /social-feed | SocialFeed.tsx | socialFeed.* | **N** | **DELETE** | Experimental | Remove route & page |" >> "$OUTPUT"

cat >> "$OUTPUT" << 'EOF'

## Summary Statistics

- **Total Routes Analyzed:** ~80
- **Core Product (IMPLEMENT missing):** ~10-15
- **Experimental (DELETE):** ~30-40
- **Already Working (KEEP):** ~15-20

## Implementation Priority

### Phase 1: DELETE Non-Core (Reduce Surface)
1. Remove all experimental AI pages
2. Remove unused admin dashboards
3. Remove experimental social features
4. Clean up routes and nav links

### Phase 2: IMPLEMENT Core Missing
1. Implement bookings router (if booking flow is core)
2. Implement streams/live router (if publicly visible)
3. Add minimal procedures to existing routers

### Phase 3: Verify
1. pnpm check = 0
2. Router drift = 0
3. CI green

## Next Steps

User/team must review this table and confirm decisions, then systematic execution begins.
EOF

echo "Truth table created: $OUTPUT"
cat "$OUTPUT"
