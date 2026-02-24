# Wishlist Integration - Complete Implementation Guide

## Overview

The wishlist system has been updated to seamlessly integrate between client-side (products) and server-side (account dashboard) with proper authentication awareness.

## How It Works Now

### For Logged-In Customers ✅

```
1. Click Heart on Product Card
   ↓
2. Wishlist Context detects authentication
   ↓
3. Makes API call: POST /api/customer/wishlist
   ↓
4. Item saved to DATABASE with user ID
   ↓
5. Toast shows: "Saved to your account wishlist ❤️"
   ↓
6. Navigate to Account → Wishlist tab
   ↓
7. Wishlist items appear from DATABASE (API endpoint)
   ↓
8. Items persist across devices & sessions
   ↓
9. Items persist after logout/login
```

### For Guest Users (Not Logged In) 📱

```
1. Click Heart on Product Card
   ↓
2. Wishlist Context detects no authentication
   ↓
3. Saves to localStorage (browser cache) only
   ↓
4. Toast shows: "Added to wishlist (saved locally)"
   ↓
5. Items persist in browser only
   ↓
6. Items lost if cache is cleared
   ↓
7. Items not synced across devices
```

## Technical Architecture

### Files Modified

#### 1. **lib/wishlist-context.tsx** - Central Coordinator
**Purpose:** Manages wishlist state and routing

**Key Changes:**
- Detects authentication status by calling `/api/auth/me`
- Routes `addToWishlist()` & `removeFromWishlist()` to API for authenticated users
- Falls back to localStorage for guests
- Exports `isAuthenticated` & `isLoading` flags
- Uses Set for O(1) membership lookups

**Authentication Flow:**
```typescript
// On mount, context checks:
const meResponse = await fetch('/api/auth/me')
const isAuth = meResponse.ok

if (isAuth) {
  // Load from API
  const response = await fetch('/api/customer/wishlist')
  setIsAuthenticated(true)
} else {
  // Load from localStorage
  localStorage.getItem('sankofatribe-wishlist')
}
```

**API Calls Made:**
- **Add Item:** `POST /api/customer/wishlist` with `{ productId: string }`
- **Remove Item:** `DELETE /api/customer/wishlist/[productId]`
- **Fetch All:** `GET /api/customer/wishlist` (called on mount if authenticated)

#### 2. **components/product-card.tsx** - Product UI Integration
**Purpose:** Add/Remove from product displayed card

**Key Changes:**
- Updated `handleWishlistClick` to be async with error handling
- Added toast notifications showing auth status:
  - Logged in: `"Saved to your account wishlist ❤️"`
  - Guest: `"Added to wishlist (saved locally)"`
  - Error: `"Error updating wishlist"`
- Uses useCallback to prevent unnecessary re-renders
- Displays authentication awareness in toast

**Visual Feedback:**
```
Heart Button States:
├─ Empty Heart (grey) → Click to add
├─ Filled Heart (red) → Remove on click
└─ Toast notification → Confirms action
```

#### 3. **components/quick-view-modal.tsx** - Modal UI Integration
**Purpose:** Add/Remove from quick view modal

**Key Changes:**
- Added heart button to footer actions
- Same authentication-aware toast notifications
- Same async/await error handling as product card
- Visual consistency with product card

**Button Placement:**
```
[Close] [❤️ Heart] [Add to Bag]
        ↑ New button with fill on wishlist status
```

### API Endpoints Used

All endpoints require JWT authentication token in cookies.

#### 1. **POST /api/customer/wishlist** - Add Item
```
Request:
{
  "productId": "product-id-123"
}

Response (201):
{
  "id": "wishlist-item-id",
  "userId": "user-id",
  "productId": "product-id-123",
  "addedAt": "2024-01-15T10:30:00Z"
}
```

#### 2. **DELETE /api/customer/wishlist/[productId]** - Remove Item
```
Request: DELETE /api/customer/wishlist/product-id-123

Response (204): [No Content]
```

#### 3. **GET /api/customer/wishlist** - Fetch All
```
Response (200):
[
  {
    "id": "item-1",
    "userId": "user-id",
    "productId": "product-123",
    "addedAt": "2024-01-15T10:30:00Z"
  },
  {
    "id": "item-2",
    "userId": "user-id",
    "productId": "product-456",
    "addedAt": "2024-01-14T15:45:00Z"
  }
]
```

#### 4. **GET /api/auth/me** - Check Authentication
```
Request: GET /api/auth/me

Response (200 if authenticated):
{
  "userId": "user-id",
  "email": "user@example.com"
}

Response (401 if not authenticated):
{ "error": "Unauthorized" }
```

## Data Flow Diagrams

### Login Flow - Sync Wishlist
```
User Logs In
    ↓
wishlist-context: isAuthenticated = true
    ↓
GET /api/customer/wishlist
    ↓
Load from DATABASE into context
    ↓
Wishlist shown on product cards (from API state)
    ↓
All future add/remove operations use API
```

### Adding Item - Authenticated
```
Customer Clicks Heart Icon
    ↓
product-card: handleWishlistClick()
    ↓
Context checks: isAuthenticated === true
    ↓
POST /api/customer/wishlist { productId: "..." }
    ↓
API: Create wishlistItem in database
    ↓
Context: Update local state
    ↓
UI: Heart fills with red color
    ↓
Toast: "Saved to your account wishlist ❤️"
```

### Removing Item - Authenticated
```
Customer Clicks Filled Heart Icon
    ↓
product-card: handleWishlistClick()
    ↓
Context checks: isAuthenticated === true
    ↓
DELETE /api/customer/wishlist/product-id
    ↓
API: Delete wishlistItem from database
    ↓
Context: Update local state
    ↓
UI: Heart becomes empty (grey)
    ↓
Toast: "Removed from your account wishlist"
```

### Adding Item - Guest (Not Logged In)
```
Guest Clicks Heart Icon
    ↓
product-card: handleWishlistClick()
    ↓
Context checks: isAuthenticated === false
    ↓
localStorage.setItem('sankofatribe-wishlist', [...])
    ↓
Context: Update local state
    ↓
UI: Heart fills with red color
    ↓
Toast: "Added to wishlist (saved locally)"
```

## Database Schema

```sql
table wishlistItem {
  id          String    @id @default(cuid())
  userId      String    @db.Uuid
  productId   String
  addedAt     DateTime  @default(now())
  
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, productId])  -- Prevent duplicates
  @@index([userId])              -- Fast lookup by user
}
```

## Error Handling

### Network Errors
```typescript
catch (error) {
  showToast('Error updating wishlist', 'error')
  console.error('Wishlist error:', error)
  // Fallback to local state update
}
```

### Authentication Errors
- If JWT token invalid → Context redirects to login
- If user not authenticated → Falls back to localStorage
- If token expired → Refresh token handled by auth middleware

### Validation Errors
- Duplicate entries prevented by database unique constraint
- Empty productId rejected by API validation
- Missing auth token returns 401

## Testing the Integration

### Test 1: Logged-In User Adds Product
1. Login to account
2. Click heart on product
3. Should see: `"Saved to your account wishlist ❤️"`
4. Navigate to Account → Wishlist tab
5. **Expected:** Product appears in the list
6. Logout and login again
7. **Expected:** Product still in wishlist

### Test 2: Guest User Adds Product
1. Don't login (stay as guest)
2. Click heart on product
3. Should see: `"Added to wishlist (saved locally)"`
4. Clear browser cache
5. **Expected:** Wishlist is empty (lost because it was in localStorage)

### Test 3: Switch from Guest to Logged-In
1. Add product as guest (localStorage)
2. Login to account
3. Context detects authentication
4. **Expected:** Wishlist loads from database (might be empty if first login)
5. Add same product again
6. **Expected:** Product appears in Account → Wishlist tab

### Test 4: Remove from Product Page
1. Login to account
2. Add product (heart becomes filled)
3. Click filled heart again
4. Should see: `"Removed from your account wishlist"`
5. Heart becomes empty
6. **Expected:** Item removed from account wishlist tab

### Test 5: Account Dashboard Persistence
1. Add items from product pages
2. Open Account → Wishlist tab
3. **Expected:** All added items visible
4. Refresh page
5. **Expected:** Items still visible (loaded from API)

## Performance Considerations

### Optimizations Implemented

1. **Set for Membership Lookup**
   - `wishlistIds` stored as Set for O(1) `isInWishlist()` checks
   - Prevents unnecessary product card re-renders

2. **Lazy Loading**
   - Wishlist loads on context mount
   - API calls only when authenticated
   - localStorage only read on first mount

3. **Caching**
   - Items stored in context state (in memory)
   - API only called on add/remove, not on every check

### API Call Patterns
```
On App Load:
- 1 call to GET /api/auth/me
- 1 call to GET /api/customer/wishlist (if authenticated)

Per Action (add/remove):
- 1 call to POST or DELETE endpoint

Account Page Load:
- 1 call to fetch from API (with user ID filtering)
```

## Future Enhancements

1. **Sync Suggestions**
   - When logging in for first time, sync localStorage to database
   - Offer merge or replace options

2. **Wishlist Sharing**
   - Share wishlist via URL
   - Add share button to Account → Wishlist tab

3. **Price Tracking**
   - Notify when wishlist item price drops
   - Email notifications for tracked items

4. **Wishlist Categories**
   - Organize wishlist into collections
   - "Birthday Gifts", "Personal", "To Try", etc.

5. **Social Features**
   - Like/comment on friends' wishlists
   - Gift recommendations from wishlist items

## Support & Debugging

### Common Issues

**Issue: "Saved to your account wishlist" but item doesn't appear in account**
- Verify JWT token is valid: Check `/api/auth/me` response
- Check browser network tab: Verify POST request succeeded (201 status)
- Check database: Run `SELECT * FROM wishlistItem WHERE userId = 'xxx'`

**Issue: Wishlist empty after login**
- Check if `/api/customer/wishlist` API is returning items
- Verify auth token is in cookies
- Check Database if wishlistItems exist for user ID

**Issue: "Added to wishlist (saved locally)" even when logged in**
- Check `/api/auth/me` endpoint is responding correctly
- Check if auth-token cookie is set
- Verify isAuthenticated flag in context is true

### Debug Steps
```typescript
// 1. Check authentication
const meRes = await fetch('/api/auth/me')
console.log('Authenticated:', meRes.ok)

// 2. Check wishlist API
const wishlistRes = await fetch('/api/customer/wishlist')
console.log('Wishlist items:', await wishlistRes.json())

// 3. Check localStorage fallback
console.log('localStorage:', localStorage.getItem('sankofatribe-wishlist'))

// 4. Check context state
// Open DevTools → Components tab → WishlistProvider
// Inspect: items, isAuthenticated, wishlistIds
```

## Deployment Checklist

- [ ] Updated wishlist-context.tsx deployed
- [ ] Updated product-card.tsx deployed
- [ ] Updated quick-view-modal.tsx deployed
- [ ] Auth endpoints working: `/api/auth/me`
- [ ] Wishlist API endpoints working: `/api/customer/wishlist`
- [ ] Database migrations run: wishlistItem table exists
- [ ] JWT tokens configured correctly
- [ ] Testing all scenarios (guest, logged-in, mixed)
- [ ] Monitoring errors in Sentry/error tracking
- [ ] Performance metrics acceptable

---

## Summary

The wishlist system now intelligently routes between localStorage (for guests) and database API (for authenticated users), providing:

✅ Persistent wishlist for logged-in users across devices
✅ Local-only wishlist for guests
✅ Clear visual feedback with authentication-aware toasts
✅ Seamless authentication flow
✅ Error handling and fallbacks
✅ Performance optimizations with Set-based lookups
✅ Account dashboard showing actual database wishlist

All changes maintain backward compatibility with localStorage for existing guests while adding robust server-side persistence for authenticated customers.
