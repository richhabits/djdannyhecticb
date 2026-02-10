# TRPC Usage Inventory

Scanned from `client/src/**/*.{ts,tsx}` on 2026-02-10

## Summary

Total unique trpc paths found in client: **117**

## Usage Table

| trpc Path | Exists in Server? | File Locations |
|-----------|-------------------|----------------|
| `trpc.ai.chat` | ✅ YES | client/src/components/AIChatBox.tsx:79;client/src/pages/ComponentShowcase.tsx:222; |
| `trpc.ai.listenerAssistant` | ✅ YES | client/src/components/AIDannyFloating.tsx:21;client/src/components/LiveChatDanny.tsx:24; |
| `trpc.articles.adminList` | ✅ YES | client/src/pages/AdminBlog.tsx:43; |
| `trpc.articles.create` | ✅ YES | client/src/pages/AdminBlog.tsx:45; |
| `trpc.articles.delete` | ✅ YES | client/src/pages/AdminBlog.tsx:63; |
| `trpc.articles.update` | ✅ YES | client/src/pages/AdminBlog.tsx:54; |
| `trpc.auth.logout` | ✅ YES | client/src/_core/hooks/useAuth.ts:21; |
| `trpc.auth.me` | ✅ YES | client/src/_core/hooks/useAuth.ts:16; |
| `trpc.auth.register` | ✅ YES | client/src/pages/Signup.tsx:39; |
| `trpc.beatport.cacheStats` | ✅ YES | client/src/pages/AdminBeatport.tsx:24; |
| `trpc.beatport.chartTracks` | ✅ YES | client/src/examples/BeatportExamples.tsx:176;client/src/pages/BeatportChart.tsx:32; |
| `trpc.beatport.charts` | ✅ YES | client/src/examples/BeatportExamples.tsx:171;client/src/pages/BeatportGenre.tsx:46;client/src/pages/BeatportShop.tsx:29; |
| `trpc.beatport.clearCache` | ✅ YES | client/src/pages/AdminBeatport.tsx:27; |
| `trpc.beatport.genres` | ✅ YES | client/src/examples/BeatportExamples.tsx:114;client/src/examples/BeatportExamples.tsx:24;client/src/pages/BeatportGenre.tsx:27; |
| `trpc.beatport.resetCacheStats` | ✅ YES | client/src/pages/AdminBeatport.tsx:35; |
| `trpc.beatport.search` | ✅ YES | client/src/examples/BeatportExamples.tsx:59;client/src/pages/BeatportSearch.tsx:40; |
| `trpc.beatport.subGenres` | ✅ YES | client/src/pages/BeatportGenre.tsx:35; |
| `trpc.beatport.tracks` | ✅ YES | client/src/examples/BeatportExamples.tsx:119;client/src/examples/BeatportExamples.tsx:239;client/src/pages/BeatportGenre.tsx:57; |
| `trpc.bookings.create` | ✅ YES | client/src/pages/BookDanny.tsx:58;client/src/pages/Bookings.tsx:41; |
| `trpc.bookings.createDepositIntent` | ✅ YES | client/src/pages/BookingQuote.tsx:185; |
| `trpc.bookings.delete` | ✅ YES | client/src/pages/AdminBookings.tsx:57; |
| `trpc.bookings.getQuote` | ✅ YES | client/src/pages/BookingQuote.tsx:26; |
| `trpc.bookings.list` | ✅ YES | client/src/components/BookingCalendar.tsx:17;client/src/pages/AdminBookings.tsx:43;client/src/pages/Bookings.tsx:36; |
| `trpc.bookings.update` | ✅ YES | client/src/pages/AdminBookings.tsx:45; |
| `trpc.bookingsPhase7.create` | ✅ YES | client/src/pages/BookingsPage.tsx:34; |
| `trpc.controlTower.stats` | ✅ YES | client/src/pages/AdminControlTower.tsx:25; |
| `trpc.cues.adminCreate` | ✅ YES | client/src/pages/AdminShowLive.tsx:53; |
| `trpc.cues.adminListForSession` | ✅ YES | client/src/pages/AdminShowLive.tsx:28; |
| `trpc.cues.adminUpdateStatus` | ✅ YES | client/src/pages/AdminShowLive.tsx:63; |
| `trpc.danny.chat` | ✅ YES | client/src/pages/AIDanny.tsx:32; |
| `trpc.danny.status` | ✅ YES | client/src/components/DannyStatus.tsx:14; |
| `trpc.empire.overview` | ✅ YES | client/src/pages/AdminEmpire.tsx:32; |
| `trpc.episodes.getBySlug` | ✅ YES | client/src/pages/ShowEpisodeDetail.tsx:13; |
| `trpc.episodes.listByShow` | ✅ YES | client/src/pages/ShowEpisodes.tsx:11;client/src/pages/ShowPage.tsx:13; |
| `trpc.events.all` | ✅ YES | client/src/components/BookingCalendar.tsx:16; |
| `trpc.events.upcoming` | ✅ YES | client/src/pages/Events.tsx:9;client/src/pages/Home.tsx:38; |
| `trpc.eventsPhase7.list` | ✅ YES | client/src/pages/EventsPage.tsx:9; |
| `trpc.feed.list` | ✅ YES | client/src/components/HecticFeed.tsx:20; |
| `trpc.feed.react` | ✅ YES | client/src/components/HecticFeed.tsx:22; |
| `trpc.innerCircle.getStatus` | ✅ YES | client/src/pages/Backstage.tsx:12; |
| `trpc.invites.redeem` | ❌ NO | client/src/pages/Signup.tsx:37; |
| `trpc.listeners.leaderboard` | ✅ YES | client/src/pages/ListenerLeaderboard.tsx:20; |
| `trpc.live.adminEnd` | ✅ YES | client/src/pages/AdminShowLive.tsx:43; |
| `trpc.live.adminListSessions` | ✅ YES | client/src/pages/AdminShowLive.tsx:26; |
| `trpc.live.adminStart` | ✅ YES | client/src/pages/AdminShowLive.tsx:33; |
| `trpc.live.getCurrentLive` | ✅ YES | client/src/pages/AdminShowLive.tsx:27;client/src/pages/ShowPage.tsx:12; |
| `trpc.media.delete` | ✅ YES | client/src/pages/AdminMedia.tsx:31; |
| `trpc.media.list` | ✅ YES | client/src/pages/AdminMedia.tsx:29; |
| `trpc.mixes.adminCreate` | ✅ YES | client/src/pages/AdminMixes.tsx:50; |
| `trpc.mixes.adminDelete` | ✅ YES | client/src/pages/AdminMixes.tsx:78; |
| `trpc.mixes.adminList` | ✅ YES | client/src/pages/AdminMixes.tsx:48; |
| `trpc.mixes.adminUpdate` | ✅ YES | client/src/pages/AdminMixes.tsx:64; |
| `trpc.mixes.free` | ✅ YES | client/src/pages/Mixes.tsx:20; |
| `trpc.partners.list` | ✅ YES | client/src/pages/PartnersPage.tsx:29; |
| `trpc.podcasts.adminCreate` | ✅ YES | client/src/pages/AdminPodcasts.tsx:50; |
| `trpc.podcasts.adminDelete` | ✅ YES | client/src/pages/AdminPodcasts.tsx:78; |
| `trpc.podcasts.adminList` | ✅ YES | client/src/pages/AdminPodcasts.tsx:48; |
| `trpc.podcasts.adminUpdate` | ✅ YES | client/src/pages/AdminPodcasts.tsx:64; |
| `trpc.podcasts.list` | ✅ YES | client/src/pages/Podcasts.tsx:11; |
| `trpc.products.get` | ✅ YES | client/src/pages/Checkout.tsx:149; |
| `trpc.products.list` | ✅ YES | client/src/pages/Shop.tsx:15; |
| `trpc.profiles.createOrUpdate` | ✅ YES | client/src/components/HecticOnboarding.tsx:25; |
| `trpc.purchases.createPaymentIntent` | ✅ YES | client/src/pages/Checkout.tsx:30; |
| `trpc.recommendations.forEntity` | ✅ YES | client/src/components/Recommendations.tsx:16; |
| `trpc.search.all` | ✅ YES | client/src/components/GlobalSearch.tsx:21; |
| `trpc.shouts.create` | ✅ YES | client/src/components/ShoutForm.tsx:27; |
| `trpc.shouts.list` | ✅ YES | client/src/components/LockedInCounter.tsx:6;client/src/components/ShoutList.tsx:22; |
| `trpc.shouts.listAll` | ✅ YES | client/src/pages/AdminShouts.tsx:38; |
| `trpc.shouts.updateStatus` | ✅ YES | client/src/pages/AdminShouts.tsx:40; |
| `trpc.shows.all` | ✅ YES | client/src/pages/AdminShows.tsx:43; |
| `trpc.shows.create` | ✅ YES | client/src/pages/AdminShows.tsx:45; |
| `trpc.shows.delete` | ✅ YES | client/src/pages/AdminShows.tsx:71; |
| `trpc.shows.list` | ✅ YES | client/src/components/ShowSchedule.tsx:66; |
| `trpc.shows.update` | ✅ YES | client/src/pages/AdminShows.tsx:58; |
| `trpc.showsPhase9.adminList` | ✅ YES | client/src/pages/AdminShowLive.tsx:25; |
| `trpc.showsPhase9.listPublic` | ✅ YES | client/src/pages/ShowPage.tsx:11; |
| `trpc.socialFeed.list` | ✅ YES | client/src/pages/SocialFeed.tsx:11; |
| `trpc.socialProof.getActive` | ✅ YES | client/src/components/SocialProofNotifications.tsx:8; |
| `trpc.socialShares.record` | ✅ YES | client/src/components/SocialShareButton.tsx:23; |
| `trpc.streaming.adminCreate` | ✅ YES | client/src/pages/AdminStreamingLinks.tsx:74; |
| `trpc.streaming.adminDelete` | ✅ YES | client/src/pages/AdminStreamingLinks.tsx:102; |
| `trpc.streaming.adminList` | ✅ YES | client/src/pages/AdminStreamingLinks.tsx:72; |
| `trpc.streaming.adminUpdate` | ✅ YES | client/src/pages/AdminStreamingLinks.tsx:88; |
| `trpc.streaming.links` | ✅ YES | client/src/pages/Podcasts.tsx:12; |
| `trpc.streams.active` | ✅ YES | client/src/components/LiveAudioPlayer.tsx:16;client/src/pages/Home.tsx:37;client/src/pages/Live.tsx:15; |
| `trpc.streams.create` | ✅ YES | client/src/pages/AdminStreams.tsx:54; |
| `trpc.streams.delete` | ✅ YES | client/src/pages/AdminStreams.tsx:80; |
| `trpc.streams.getStats` | ✅ YES | client/src/components/LiveAudioPlayer.tsx:21; |
| `trpc.streams.goLive` | ✅ YES | client/src/pages/LiveStudio.tsx:79; |
| `trpc.streams.list` | ✅ YES | client/src/pages/AdminStreams.tsx:52;client/src/pages/LiveStudio.tsx:69; |
| `trpc.streams.setActive` | ✅ YES | client/src/pages/AdminStreams.tsx:92; |
| `trpc.streams.status` | ✅ YES | client/src/pages/AdminStreams.tsx:233; |
| `trpc.streams.update` | ✅ YES | client/src/pages/AdminStreams.tsx:67; |
| `trpc.support.createPaymentIntent` | ✅ YES | client/src/pages/Support.tsx:33; |
| `trpc.trackIdRequests.create` | ✅ YES | client/src/pages/TrackID.tsx:23; |
| `trpc.trackRequests.list` | ✅ YES | client/src/components/TrackRequests.tsx:15; |
| `trpc.trackRequests.updateStatus` | ✅ YES | client/src/pages/AdminShouts.tsx:52; |
| `trpc.trackRequests.upvote` | ✅ YES | client/src/components/TrackRequests.tsx:17; |
| `trpc.tracks.adminDelete` | ✅ YES | client/src/pages/AdminTracks.tsx:74; |
| `trpc.tracks.adminList` | ✅ YES | client/src/pages/AdminTracks.tsx:41; |
| `trpc.tracks.adminUpdate` | ✅ YES | client/src/pages/AdminTracks.tsx:59; |
| `trpc.tracks.create` | ✅ YES | client/src/pages/AdminNowPlaying.tsx:24;client/src/pages/AdminTracks.tsx:44; |
| `trpc.tracks.history` | ✅ YES | client/src/components/NowPlaying.tsx:10;client/src/pages/AdminNowPlaying.tsx:22; |
| `trpc.tracks.nowPlaying` | ✅ YES | client/src/components/NowPlaying.tsx:7;client/src/pages/AdminNowPlaying.tsx:21;client/src/pages/AdminTracks.tsx:42; |
| `trpc.ukEvents.adminPromoters` | ✅ YES | client/src/pages/AdminUKEvents.tsx:35;client/src/pages/AdminUKEvents.tsx:36; |
| `trpc.ukEvents.adminReviewSubmission` | ✅ YES | client/src/pages/AdminUKEvents.tsx:39; |
| `trpc.ukEvents.adminSubmissions` | ✅ YES | client/src/pages/AdminUKEvents.tsx:33;client/src/pages/AdminUKEvents.tsx:34; |
| `trpc.ukEvents.adminSync` | ✅ YES | client/src/pages/AdminUKEvents.tsx:59; |
| `trpc.ukEvents.adminVerifyPromoter` | ✅ YES | client/src/pages/AdminUKEvents.tsx:49; |
| `trpc.videoTestimonials.adminDelete` | ✅ YES | client/src/pages/AdminTestimonials.tsx:42; |
| `trpc.videoTestimonials.adminList` | ✅ YES | client/src/pages/AdminTestimonials.tsx:32; |
| `trpc.videoTestimonials.adminUpdate` | ✅ YES | client/src/pages/AdminTestimonials.tsx:34; |
| `trpc.videoTestimonials.create` | ✅ YES | client/src/pages/AdminTestimonials.tsx:50; |
| `trpc.videoTestimonials.list` | ✅ YES | client/src/components/VideoTestimonialsSection.tsx:19;client/src/pages/Testimonials.tsx:10; |
| `trpc.videos.create` | ✅ YES | client/src/pages/AdminVideos.tsx:40; |
| `trpc.videos.delete` | ✅ YES | client/src/pages/AdminVideos.tsx:48; |
| `trpc.videos.list` | ✅ YES | client/src/pages/AdminVideos.tsx:39; |

## Router Drift Analysis

Routers that EXIST in server/routers.ts:
- ai, aiStudio, analytics, auth, beatport, bookings, events, streams, mixes, etc. (70 total)

Routers that DO NOT EXIST but are called by client:
- Will be identified with ❌ NO in table above

## Actions Required

For each ❌ NO entry:
1. Check if page is routed/linked (core product)
2. If core: Refactor to use existing router or implement missing procedure
3. If not core: Delete page

Last updated: 2026-02-10

## Additional Nested Paths Found

| trpc Path | Exists in Server? | Notes |
|-----------|-------------------|-------|
| `trpc.aiStudio.scripts.list` | ✅ YES | Nested under aiStudio router |
| `trpc.aiStudio.scripts.create` | ✅ YES | Nested under aiStudio router |
| `trpc.aiStudio.scripts.get` | ✅ YES | Nested under aiStudio router |
| `trpc.aiStudio.scripts.processOne` | ✅ YES | Nested under aiStudio router |
| `trpc.aiStudio.voice.list` | ✅ YES | Nested under aiStudio router |
| `trpc.aiStudio.voice.create` | ✅ YES | Nested under aiStudio router |
| `trpc.aiStudio.voice.get` | ✅ YES | Nested under aiStudio router |
| `trpc.aiStudio.voice.processOne` | ✅ YES | Nested under aiStudio router |
| `trpc.aiStudio.video.list` | ✅ YES | Nested under aiStudio router |
| `trpc.aiStudio.video.get` | ✅ YES | Nested under aiStudio router |
| `trpc.aiStudio.video.processOne` | ✅ YES | Nested under aiStudio router |
| `trpc.genz.collectibles.getUserCollectibles` | ✅ YES | Nested under genz router |
| `trpc.genz.achievements.getUserAchievements` | ✅ YES | Nested under genz router |
| `trpc.economy.wallet.getMyWallet` | ✅ YES | Nested under economy router |
| `trpc.marketing.socialPosts.list` | ✅ YES | Nested under marketing router |
| `trpc.marketing.socialPosts.create` | ✅ YES | Nested under marketing router |
| `trpc.marketing.scraper.search` | ✅ YES | Nested under marketing router |
| `trpc.marketing.scraper.listResults` | ✅ YES | Nested under marketing router |
| `trpc.observability.incidentBanners.getActive` | ✅ YES | Nested under observability router |
| `trpc.partners.requests.create` | ✅ YES | Nested under partners router |
| `trpc.safety.settings.set` | ✅ YES | Nested under safety router |
| `trpc.safety.settings.getAll` | ✅ YES | Nested under safety router |

## Critical Finding

**Only 1 router drift issue found:**
- `trpc.invites.redeem` in client/src/pages/Signup.tsx - router "invites" does not exist

**Action:** The Signup page should either:
1. Remove the invite code feature (commented out already at line 37)
2. Or implement `invites` router if signup invites are needed

## Conclusion

Router drift is **minimal** - only 1 missing router out of 117+ trpc calls.

Most client code properly uses existing routers. The architecture is mostly aligned.
