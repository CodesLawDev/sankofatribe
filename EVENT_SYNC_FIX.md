# Event Sync Fix - Complete Documentation

## Issue Summary
Event details from Sanity were not being fully synced to the PostgreSQL database. The webhook and backfill scripts were missing critical event data, particularly:
- **Ticket information** (ticketInfo object with pricing, capacity, and tiers)
- **Proper error handling** for optional fields
- **Complete field mapping** from Sanity schema to database

## Root Causes Fixed

### 1. **Incomplete GROQ Query**
**Before:** The webhook was only fetching basic event info:
```groq
*[_type == "event" && _id == $id][0]{
  _id, title, slug, eventDate, endDate, status, featured,
  location{ venue, address, city, isVirtual, virtualLink }
}
```

**After:** Now fetches complete event details including ticket tiers:
```groq
*[_type == "event" && _id == $id][0]{
  _id, title, slug, eventDate, endDate, status, featured, category,
  ticketInfo{
    isFree, maxCapacity, currency,
    ticketTiers[]{ _key, name, description, price, quantity, currency }
  },
  location{ venue, address, city, isVirtual, virtualLink }
}
```

### 2. **Missing Ticket Tier Sync**
**Problem:** Ticket tiers weren't being properly synced to the `EventTicketTier` table.

**Solution:** 
- Enhanced tier sync logic with proper existence checking
- Added deletion of tiers that no longer exist in Sanity
- Preserved the `sold` count when updating tiers (don't reset it)
- Added description field mapping

### 3. **Missing Error Handling**
**Before:** Single try-catch at webhook level - one error would stop all processing

**After:** Per-item error handling allowing webhook to process multiple events even if one fails

### 4. **Incomplete Backfill Scripts**
**Problem:** Both `backfill-events.ts` and `backfill-events.js` weren't including ticket tiers

**Solution:** Updated both scripts to:
- Fetch ticketInfo from Sanity
- Properly sync ticket tiers to database
- Clean up existing tiers before inserting new ones

## Files Modified

### 1. [app/api/sanity/webhook/route.ts](app/api/sanity/webhook/route.ts)
**Changes:**
- Enhanced GROQ query to include all event fields
- Added comprehensive error logging with `[webhook]` prefix
- Per-item error handling with detailed error reporting
- Better tier lifecycle management (update/create/delete)
- Preserved `sold` count when updating tiers
- Added validation for required fields

**Key improvements:**
```typescript
// Better error handling
try {
  // Process single event
} catch (itemError) {
  console.error(`[webhook] Error processing event ${id}:`, itemError)
  results.push({ id, action, success: false, error: String(itemError) })
}

// Tier lifecycle management
const existingTiers = await prisma.eventTicketTier.findMany(...)
const existingTierNames = new Set(existingTiers.map(t => t.name))

// Update/create tiers
for (const t of tiers) {
  // ... logic to update or create
}

// Delete removed tiers
for (const tierName of existingTierNames) {
  // ... delete tier
}
```

### 2. [scripts/backfill-events.ts](scripts/backfill-events.ts)
**Changes:**
- Added ticketInfo to GROQ query
- Added tier sync logic matching webhook approach
- Clears existing tiers before creating new ones

### 3. [scripts/backfill-events.js](scripts/backfill-events.js)
**Changes:**
- Same updates as TypeScript version for compatibility

## Database Schema Reference

### EventRecord
```prisma
model EventRecord {
  id          String   @id @default(cuid())
  sanityId    String   @unique
  slug        String?  @unique
  title       String
  eventDate   DateTime
  endDate     DateTime?
  venue       String?
  address     String?
  city        String?
  isVirtual   Boolean  @default(false)
  virtualLink String?
  status      String   @default("upcoming")
  featured    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### EventTicketTier
```prisma
model EventTicketTier {
  id          String   @id @default(cuid())
  eventId     String   // References Sanity event._id
  name        String
  description String?
  price       Float    @default(0)
  quantity    Int      @default(0)
  sold        Int      @default(0)  // Preserved on updates
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## How to Test the Fix

### 1. Backfill Existing Events
```bash
npm run backfill:events
# or for TypeScript version:
npx ts-node scripts/backfill-events.ts
```

### 2. Manual Webhook Test
```bash
curl -X POST http://localhost:3000/api/sanity/webhook \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: YOUR_WEBHOOK_SECRET" \
  -d '{
    "action": "update",
    "ids": ["event-id-from-sanity"]
  }'
```

### 3. Verify in Database
```sql
-- Check event records
SELECT * FROM "EventRecord" WHERE title LIKE '%event-name%';

-- Check ticket tiers
SELECT * FROM "EventTicketTier" WHERE "eventId" = 'your-sanity-event-id';
```

### 4. Monitor Logs
Webhook now logs with `[webhook]` prefix:
```
[webhook] Processing 3 event(s) with action: update
[webhook] Synced 5 ticket tier(s) for event: event-123
[webhook] Successfully synced event: event-123
```

## Sanity Webhook Configuration

Ensure your Sanity webhook is configured to trigger on event changes:

**Sanity Studio Settings → API → Webhooks**
- **Events:** Published documents, Draft documents (for live previews)
- **Document type:** event
- **Webhook URL:** `https://your-domain.com/api/sanity/webhook`
- **HTTP Secret:** Set to your `ADMIN_INIT_SECRET` or `CRON_SECRET`

## Environment Variables Required

```env
# Database
DATABASE_URL=postgresql://...

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_WRITE_TOKEN=your-write-token

# Webhook Security
ADMIN_INIT_SECRET=your-secret
# OR
CRON_SECRET=your-secret
```

## Troubleshooting

### Events Not Syncing
1. Check webhook secret is correct
2. Verify event is published in Sanity (not just draft)
3. Check database connection and permissions
4. Review application logs for errors with `[webhook]` prefix

### Ticket Tiers Missing
1. Ensure `ticketInfo` is filled in Sanity event editor
2. Check that `ticketTiers` array has items with `name` field
3. Run backfill script to sync existing events
4. Verify `EventTicketTier` table has records

### Webhook Returns 401
1. Verify webhook secret in request header
2. Check `ADMIN_INIT_SECRET` or `CRON_SECRET` environment variable is set
3. Ensure header name is exactly `x-webhook-secret` (case-sensitive)

## Summary of Improvements

✅ **Complete data sync** - All event fields now sync including ticket tiers  
✅ **Better error handling** - Individual event failures don't block others  
✅ **Enhanced logging** - Clear logs for debugging sync issues  
✅ **Tier lifecycle** - Proper create/update/delete of ticket tiers  
✅ **Data preservation** - Ticket sold counts preserved during updates  
✅ **Script updates** - Both TypeScript and JavaScript backfill scripts updated  

The event sync system is now robust and complete.
