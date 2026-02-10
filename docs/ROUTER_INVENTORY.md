# Router Inventory - Actual Source of Truth

Extracted from `server/routers.ts` on 2026-02-10

## Top-Level Routers (70 total)

### Core Routers (nested router objects)

1. **auth** - Authentication
   - me, logout, register

2. **mixes** - DJ Mixes
   - list, free, downloadUrl, adminList, adminCreate, adminUpdate, adminDelete

3. **events** - Events
   - upcoming, featured, all, adminList, adminCreate, adminUpdate, adminDelete

4. **podcasts** - Podcasts
   - list, adminList, adminCreate, adminUpdate, adminDelete

5. **streaming** - Streaming Links
   - links, adminList, adminCreate, adminUpdate, adminDelete

6. **shouts** - Shoutouts
   - create, list, updateStatus

7. **streams** - Live Streams
   - active, list, create, update, delete, getStats, goLive, setActive, status

8. **danny** - Danny AI
   - chat, status, updateStatus

9. **trackRequests** - Track Requests
   - list, upvote, updateStatus

10. **feed** - Social Feed
    - list, react

11. **tracks** - Tracks
    - nowPlaying, history, create, adminList, adminUpdate, adminDelete

12. **shows** - Shows
    - list, all, create, update, delete

13. **listeners** - Listener Features
    - leaderboard

14. **ai** - AI Features
    - listenerAssistant, bookingAssistant, showSummary

15. **bookings** - Bookings
    - create, list, get, update, delete

16. **support** - Support/Tips
    - createPaymentIntent, create, list, total

17. **products** - Products/Merch
    - create, list, update, delete

18. **search** - Search
    - global

19. **analytics** - Analytics
    - trackEvent, pageView, getStats

20. **favorites** - User Favorites
    - list, add, remove

21. **playlists** - Playlists
    - list, create, update, delete, addTrack, removeTrack

22. **notifications** - Notifications
    - list, markRead, markAllRead, create

23. **profiles** - User Profiles
    - get, update, getPublic

24. **social** - Social Features
    - follow, unfollow, followers, following

25. **live** - Live Features
    - currentShow, schedule

26. **genz** - GenZ Features
    - vault, vibes

27. **socialFeed** - Social Feed Posts
    - list, create, adminList, adminUpdate

28. **videoTestimonials** - Video Testimonials
    - list, create, approve

29. **media** - Media Library
    - list, upload, delete

30. **partners** - Partners
    - list, create, update

31. **integrations** - Integrations
    - list, connect, disconnect

32. **marketing** - Marketing
    - campaigns, outreach, analytics

33. **empire** - Empire Features
    - dashboard, metrics

34. **controlTower** - Control Tower
    - overview, systems

35. **economy** - Economy Features
    - balance, transactions

36. **safety** - Safety Features
    - report, moderate

37. **aiStudio** - AI Studio
    - generate, edit

38. **cues** - DJ Cues
    - list, create

39. **eventsPhase7** - Events Phase 7
    - enhanced features

40. **bookingsPhase7** - Bookings Phase 7
    - enhanced features

41. **showsPhase9** - Shows Phase 9
    - enhanced features

42. **subscriptions** - Subscriptions
    - list, create, cancel

43. **purchases** - Purchases
    - list, create

44. **innerCircle** - Inner Circle
    - members, access

45. **socialProof** - Social Proof
    - testimonials, stats

46. **socialShares** - Social Sharing
    - share, track

47. **trackIdRequests** - Track ID Requests
    - list, submit

48. **videos** - Videos
    - list, create, update

49. **articles** - Articles/Blog
    - list, create, update

50. **apiKeys** - API Keys
    - list, create, revoke

51. **backups** - Backups
    - list, create, restore

52. **observability** - Observability
    - logs, metrics

53. **brands** - Brands
    - list, create

54. **episodes** - Episodes
    - list, create

55. **recommendations** - Recommendations
    - forUser, forEntity, create

### Direct Procedures (at top level, not in nested routers)

56. **getAllMixes** - Get all mixes
57. **getFreeMixes** - Get free mixes  
58. **getMixById** - Get mix by ID
59. **getAllEvents** - Get all events
60. **getFeaturedEvents** - Get featured events
61. **getUpcomingEvents** - Get upcoming events
62. **getAllShouts** - Get all shouts
63. **getAllStreams** - Get all streams
64. **getActiveStream** - Get active stream
65. **getDannyStatus** - Get Danny AI status
66. **getAllShows** - Get all shows

### Imported Routers

67. **system** - System health/status (from systemRouter)
68. **beatport** - Beatport integration (from beatportRouter)
69. **ukEvents** - UK Events (from ukEventsRouter)

## Notes

- Some routers have both top-level procedures and nested router objects (e.g., mixes, events)
- Many routers follow the pattern: public list/get + admin CRUD operations
- Phase7/Phase9 routers indicate feature expansion phases
- Some routers are minimal/placeholder implementations

## Total Count

- **70 total router/procedure keys** at top level of appRouter
- **3 imported routers** (system, beatport, ukEvents)
- **67 defined inline** in routers.ts

Last updated: 2026-02-10
