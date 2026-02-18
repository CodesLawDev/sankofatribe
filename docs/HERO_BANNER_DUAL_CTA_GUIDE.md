# Hero Banner Dual CTA Setup Guide

## Overview
Hero banners now support **two side-by-side Call-to-Action (CTA) buttons** in addition to the original single CTA. This guide shows you how to add the second link in Sanity Studio.

## Steps to Add Secondary CTA

### 1. Open Sanity Studio
- Go to your Sanity Studio (usually at `http://localhost:3333` or your hosted instance)
- Navigate to the **Home Page** document

### 2. Locate Hero Banners Section
- Scroll down to find the **"Hero Banners"** array field
- Click on the banner you want to edit, or add a new banner

### 3. Find CTA Fields
Inside each banner, you'll see these CTA-related fields:

#### **Primary CTA** (Original)
- **CTA Text** - The button text for the first button (e.g., "Shop Now")
- **CTA Link** - The URL/path the button links to (e.g., "/products" or "/category/women")

#### **Secondary CTA** (New - For Second Button)
- **CTA Text Secondary** - The button text for the second button (e.g., "View Collection")
- **CTA Link Secondary** - The URL/path the second button links to (e.g., "/products?filter=sale")

### 4. Customize Your Buttons
1. **Fill in Primary CTA:**
   - CTA Text: `Shop Now`
   - CTA Link: `/products`

2. **Fill in Secondary CTA** (optional - you can have just one button):
   - CTA Text Secondary: `View Collection`
   - CTA Link Secondary: `/category/women`

3. **Leave Blank** if you only want one button (either primary or secondary will display)

### 5. Styling
- Both buttons appear side-by-side on desktop (flex layout)
- On mobile, they stack vertically automatically
- Buttons have a white border with white text by default
- Hover effect: background becomes white with black text

## Real-World Examples

### Example 1: Summer Sale Banner
```
Title: "SUMMER COLLECTION 2026"
CTA Text: "Shop Now"
CTA Link: "/products?filter=summer"
CTA Text Secondary: "New Arrivals"
CTA Link Secondary: "/products?sort=newest"
```

### Example 2: Category Feature
```
Title: "DISCOVER PREMIUM DENIM"
CTA Text: "View Denim"
CTA Link: "/category/denim"
CTA Text Secondary: "All Collections"
CTA Link Secondary: "/products"
```

### Example 3: Single CTA Only
```
Title: "EXCLUSIVE OFFER"
CTA Text: "Claim Offer"
CTA Link: "/checkout"
CTA Text Secondary: (Leave empty)
CTA Link Secondary: (Leave empty)
Result: Only one button displays
```

## Field Visibility in Sanity

When you open a banner in Sanity Studio, the layout looks like:

```
BANNER DOCUMENT
├─ Title
├─ Image/Video
├─ Subtitle
├─ === PRIMARY CTA ===
│  ├─ CTA Text
│  └─ CTA Link
├─ === SECONDARY CTA (NEW) ===
│  ├─ CTA Text Secondary
│  └─ CTA Link Secondary
├─ Text Position (left/center/right)
└─ Text Color (white/black)
```

## Important Notes

1. **Both or One?** You can have:
   - Just primary CTA (secondary fields empty)
   - Just secondary CTA (primary fields empty)
   - Both CTAs (displays side-by-side)

2. **Link Format:** Links should be:
   - Relative paths: `/products`, `/category/women`, `/checkout`
   - Absolute URLs: `https://example.com`
   - Query params: `/products?filter=sale&sort=newest`

3. **Mobile Responsive:** Buttons automatically stack on small screens

4. **Publishing:** After editing, make sure to:
   - Click "Publish" to save changes
   - Changes will appear on the homepage within seconds

## Troubleshooting

### "I don't see the secondary CTA fields"
- Scroll down in the banner document - they're below the primary CTA fields
- Make sure you're editing a Banner document type (not a Product or Category)

### "The buttons aren't showing up"
- Check that you filled in BOTH the text and link fields
- Secondary button needs BOTH `CTA Text Secondary` AND `CTA Link Secondary` to display
- If either is empty, that button won't show

### "I want to delete the secondary CTA"
- Just clear the text and link fields - leaving them blank removes the button

## Frontend Rendering

The PremiumHeroBanner component automatically:
- Renders both buttons if both are configured
- Renders only one button if only one is configured
- Arranges them side-by-side on desktop (gap of 12px)
- Stacks them vertically on mobile

No code changes needed - it's all Sanity configuration!

## Quick Links
- [Edit Home Page in Sanity](http://localhost:3333/desk/homePage)
- [Edit Banners](http://localhost:3333/desk/banner)
- [View Homepage](http://localhost:3000)
