# Events Feature Documentation

## Overview
The Events feature allows you to manage and display fashion events, pop-up stores, workshops, and community gatherings through your Sanity CMS. Each event has its own shareable page with Open Graph metadata for beautiful social media previews.

## Features

### Event Management in Sanity Studio
- **Rich Event Details**: Title, description, images, dates, locations
- **Event Categories**: Fashion Show, Pop-up, Workshop, Launch, Sale, Community, Other
- **Location Support**: Physical venues or virtual events with links
- **Ticket Information**: Free or paid events with pricing and purchase links
- **Registration**: RSVP and registration URL support
- **Status Tracking**: Upcoming, Ongoing, Completed, Cancelled
- **Featured Events**: Highlight important events on the listing page
- **Gallery**: Add multiple photos for each event

### Public-Facing Pages

#### Events Listing Page (`/events`)
- **Hero Section**: Attractive banner introducing the events
- **Featured Events**: Prominently display up to 3 featured events
- **Upcoming Events**: Grid view of all upcoming events
- **Past Events**: Archive of completed events
- **Responsive Design**: Beautiful on all device sizes

#### Individual Event Page (`/events/[slug]`)
- **Event Details**: Full description with rich text support
- **Event Information Card**: Date, time, location, ticket info
- **Social Sharing**: Share button with native share API or clipboard fallback
- **Call-to-Actions**: Registration, ticket purchase, virtual event links
- **Open Graph Metadata**: Beautiful previews when shared on social media
- **Gallery**: Display additional event photos
- **Breadcrumb Navigation**: Easy navigation back to events list

### Social Sharing
Each event page includes comprehensive Open Graph and Twitter Card metadata:
- Event image preview (1200x630)
- Event title and description
- Shareable URL
- Works with Facebook, Twitter, LinkedIn, WhatsApp, and more

## Using the Events Feature

### Creating an Event in Sanity

1. **Access Sanity Studio**: Navigate to `/studio` in your browser
2. **Create New Event**: Click "Events" → "Create" → "Event"
3. **Fill in Details**:
   - **Title**: Name of your event
   - **Slug**: Auto-generates from title (used in URL)
   - **Image**: Upload main event image (used for previews)
   - **Summary**: Brief description (max 200 characters, used for previews)
   - **Description**: Full event details (rich text editor)
   - **Event Date**: Start date and time
   - **End Date**: Optional, for multi-day events
   
4. **Location Information**:
   - For physical events: Add venue name, address, city
   - For virtual events: Toggle "Virtual Event" and add meeting link
   
5. **Categorize**:
   - Select event category (Fashion Show, Pop-up, Workshop, etc.)
   
6. **Ticket Information**:
   - Toggle "Free Event" for free events
   - For paid events: Add price, currency, and ticket purchase URL
   
7. **Additional Settings**:
   - **Registration URL**: Add RSVP or registration link
   - **Status**: Set to "Upcoming" (or other status)
   - **Featured**: Toggle to feature on homepage
   - **Gallery**: Add additional event photos
   
8. **Publish**: Click "Publish" to make the event live

### Event Status Management

- **Upcoming**: Event hasn't started yet (shows registration/ticket buttons)
- **Ongoing**: Event is currently happening
- **Completed**: Event has finished (shown in Past Events section)
- **Cancelled**: Event was cancelled (displays prominently)

### Featured Events

Toggle the "Featured Event" option in Sanity to:
- Display the event prominently on the events page
- Larger card size in the listing
- Featured badge on the card
- Shows up to 3 featured events

## Technical Implementation

### Files Structure
```
app/
  events/
    page.tsx              # Events listing page
    loading.tsx           # Loading state for listing
    [slug]/
      page.tsx            # Individual event page
      loading.tsx         # Loading state for event details

components/
  share-button.tsx        # Client component for sharing

sanity/
  schemas/
    event.ts              # Event schema definition
    index.ts              # Schema registry

lib/
  sanity.ts              # Sanity client and Event type
```

### Schema Fields

**Required Fields**:
- `title` (string)
- `slug` (slug)
- `image` (image)
- `summary` (text, max 200 chars)
- `eventDate` (datetime)
- `status` (string: upcoming/ongoing/completed/cancelled)

**Optional Fields**:
- `endDate` (datetime)
- `description` (rich text)
- `location` (object: venue, address, city, virtual details)
- `category` (string: fashion-show/popup/workshop/etc.)
- `ticketInfo` (object: isFree, price, currency, ticketUrl)
- `registrationUrl` (url)
- `featured` (boolean)
- `gallery` (array of images)
- `publishedAt` (datetime)

### Navigation Integration

The Events link has been added to both header components:
- Standard header: `components/header.tsx`
- Nike-style header: `components/header-new.tsx`

## SEO and Sharing

### Open Graph Metadata
Each event page includes:
- `og:title`: Event title
- `og:description`: Event summary
- `og:image`: Event image (1200x630)
- `og:url`: Event page URL
- `og:type`: website

### Twitter Card Metadata
- `twitter:card`: summary_large_image
- `twitter:title`: Event title
- `twitter:description`: Event summary
- `twitter:image`: Event image

### Share Button
- Uses native Web Share API when available
- Falls back to clipboard copy
- Shows "Link Copied!" confirmation
- Works on mobile and desktop

## Styling and Design

### Color Scheme
- Primary: Amber/Orange gradient for hero sections
- Status badges: Blue (upcoming), Green (ongoing), Gray (completed), Red (cancelled)
- Cards: Clean white with hover effects

### Responsive Breakpoints
- Mobile: Single column, stacked layout
- Tablet: 2-column grid for events
- Desktop: 3-column grid with featured events spanning 2 columns

### Loading States
- Skeleton screens with pulse animation
- Maintains layout during loading
- Smooth transitions when content loads

## Future Enhancements

Potential additions:
- Calendar integration (Add to Google Calendar, iCal)
- Event attendee count/capacity
- Related events suggestions
- Event filtering by category, date, location
- Map integration for physical events
- Email reminders for registered attendees
- Social media feed integration
- Past event photo galleries with user uploads

## Support

For questions or issues with the Events feature:
1. Check event is published in Sanity
2. Verify slug is correct in URL
3. Check Sanity environment variables are set
4. Review browser console for errors
5. Ensure images are uploaded and accessible
