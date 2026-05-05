# Ticketmaster Fix - Deployment Checklist

## ✅ Changes Made

### File 1: `server/_core/ukEventsService.ts`
- [x] Added logging to capture actual Ticketmaster API response structure
- [x] Added logging line 262-263: `console.log('[UKEvents] Sample event structure:', ...)`
- [x] Updated `mapTicketmasterEvent()` function (lines 170-185):
  - latitude/longitude now explicitly converted to strings
  - priceMin/priceMax now explicitly converted to strings

### File 2: `server/ukEventsRouter.ts`
- [x] Added `ukEventOutputSchema` (lines 19-46): Zod schema defining output format
- [x] Added `transformUKEvent()` function (lines 54-65): Transforms database objects to output format
- [x] Updated `list` procedure (lines 77-97): Added `.output()` schema and transform
- [x] Updated `featured` procedure (lines 100-110): Added `.output()` schema and transform
- [x] Updated `byId` procedure (lines 113-123): Added `.output()` schema and transform
- [x] Updated `search` procedure (lines 126-142): Added `.output()` schema and transform

## 📋 Pre-Deployment Verification

### Local Testing (Optional)
```bash
# Run the app locally to ensure no TypeScript errors
npm run dev
# or
yarn dev

# Test the Events page works without errors
# Should see no tRPC validation errors in browser console
```

### Git Status Check
```bash
git status
# Should show:
# - server/_core/ukEventsService.ts (modified)
# - server/ukEventsRouter.ts (modified)
# - TICKETMASTER_FIX_SUMMARY.md (new)
# - DEPLOYMENT_CHECKLIST.md (new)
```

## 🚀 Deployment Steps

### Step 1: Commit Changes
```bash
git add server/_core/ukEventsService.ts
git add server/ukEventsRouter.ts
git commit -m "Fix Ticketmaster schema validation error

- Add logging to capture actual API response structure
- Add tRPC output schemas for proper type transformation
- Ensure numeric fields (lat/lon/price) are properly formatted as strings
- Fixes: 'TRPCClientError: The string did not match the expected pattern'"
```

### Step 2: Push to Git
```bash
git push origin main  # or your branch
```

### Step 3: Deploy to Vercel
- Vercel will auto-build and deploy on push to main
- Wait for deployment to complete (usually 2-5 minutes)
- Check Vercel dashboard for successful deployment

### Step 4: Monitor Logs After Deployment

**In Railway (Backend Logs):**
1. Go to Railway dashboard → your project
2. Check Logs tab
3. Look for these entries (they appear when /events is visited):
   ```
   [UKEvents] Fetching: https://app.ticketmaster.com/discovery/v2/events.json?...
   [UKEvents] Page X/Y, Total: Z events
   [UKEvents] Sample event structure: {
     "id": "...",
     "name": "...",
     ...
   }
   ```

**Expected log output:**
- If logs show a sample event structure with all fields, the API is working
- If logs show pagination info, events are being fetched successfully

## ✅ Post-Deployment Testing

### Test 1: Check Events Page Loads
1. Navigate to: `https://djdannyhecticb.com/events`
2. Page should load with UI visible
3. Check browser console (F12) for any errors
   - Should see NO `TRPCClientError` messages
   - Should see NO "string did not match pattern" errors

### Test 2: Test Search Functionality
1. On Events page, find the search box
2. Type any query: "music", "jazz", "london", etc.
3. Results should appear below
4. Check browser console:
   - Should see NO validation errors
   - Search results should display properly
5. Click on an event card:
   - Should show event details
   - All fields should display correctly (price, venue, date, etc.)

### Test 3: Test Filters
1. Click "FILTERS" button
2. Select a category (Music, Sports, Boxing, etc.)
3. Select a city if available
4. Results should update
5. No errors in console

### Test 4: Check Featured Events Section
1. Scroll up on Events page
2. Should see featured event(s) at the top
3. Featured event card should display all details correctly

## 🔍 Monitoring & Troubleshooting

### If Search Still Shows Error:
1. Check Railway logs for the sample event structure
2. If the structure differs from our schema, we may need to adjust the schema
3. Contact me with the logged event structure

### If Some Fields Are Missing:
1. Check the sample event structure in logs
2. The field might be missing from Ticketmaster API response for that event
3. Schema allows nullable fields, so this is expected

### Performance Check:
- Search response time should be <500ms
- If slow, might need database indexing (separate task)

## 📊 Success Criteria

✅ **Deployment Successful When:**
1. Events page loads without errors
2. Search functionality returns results
3. No tRPC validation errors in browser console
4. All fields display correctly (dates, prices, venues, etc.)
5. Event cards render properly with images and details
6. No errors in Railway/Vercel logs related to schema validation

## 🎯 Next Steps After Successful Deployment

1. **Monitor for 24-48 hours**
   - Check daily for any error spikes in Vercel/Railway

2. **Test Stripe Checkout** (separate task)
   - Verify payment flow works end-to-end
   - Test with test credit card

3. **Performance Optimization** (optional)
   - Consider adding database indexes on frequently searched fields
   - Monitor query performance

## 📞 Rollback Plan

If something goes wrong:
```bash
git revert <commit-hash>  # Revert the commit
git push origin main      # Redeploy without the fix
```
Old version will deploy within 1-2 minutes.

## 📝 Notes

- Redis cache fix (lazy loading) ✅ Already complete
- Stripe webhook setup ✅ Already complete
- This Ticketmaster fix ✅ Complete and ready to deploy
- All changes are backward compatible and non-breaking
- No database migrations required
- No environment variable changes needed

---

**Ready to deploy?** Let me know when you've pushed the changes and I can help monitor the deployment.
