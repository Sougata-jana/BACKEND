# Subscription Button Fix

## Problem
- Clicking "Subscribe" shows "Subscribed" but refreshing the page reverts to "Subscribe"

## Root Cause
- The `/user/c/:username` route did not have authentication middleware
- `req.user` was undefined, so `isSubscribed` was always false in the aggregation

## Solution
- Created `optionalAuth` middleware in `backend/src/middlewares/auth.middlewares.js`
- Updated `backend/src/routes/user.routes.js` to use `optionalAuth` for the channel profile route
- Now `req.user` is set when a valid token is provided, allowing correct `isSubscribed` calculation

## Files Modified
- `backend/src/middlewares/auth.middlewares.js`: Added `optionalAuth` function
- `backend/src/routes/user.routes.js`: Added `optionalAuth` import and middleware to `/c/:username` route

## Testing
- Subscribe to a channel
- Refresh the page
- Should now show "Subscribed" instead of "Subscribe"
