# Sanity CMS Content Setup Guide

## Overview
All site content is now managed through Sanity CMS. This includes:
- Navigation menus (header & footer)
- Announcement bars
- Footer sections & social links
- Content pages (About, FAQ, Shipping, Returns, Contact)

## Initial Setup Steps

### 1. Access Sanity Studio
Navigate to `/studio` in your browser (e.g., `http://localhost:3001/studio`)

### 2. Create Announcement Bar
1. Go to "Announcement Bar" in the studio
2. Click "Create"
3. Fill in:
   - **Announcement Text**: "Free Shipping on Orders Over $100"
   - **Background Color**: Black
   - **Text Color**: White
   - **Active**: ✓ (checked)
4. Publish

### 3. Create Main Navigation
1. Go to "Navigation" in the studio
2. Click "Create"
3. Fill in:
   - **Navigation Title**: "Main Navigation"
   - **Slug**: Generate from title, should be `main-nav`
4. Add Navigation Items:
   - New & Featured → `/products`
   - Men → `/category/men`
   - Women → `/category/women`
   - Kids → `/products`
   - Sale → `/products`
5. Publish

### 4. Create Footer Settings
1. Go to "Footer Settings" in the studio
2. Click "Create"
3. **Footer Sections** (add 3-6 sections):
   
   **Section 1: Featured**
   - New Releases → `/products?filter=new`
   - Bestsellers → `/products?filter=bestsellers`
   - On Sale → `/products?filter=sale`
   - All Products → `/products`

   **Section 2: Shop**
   - Women → `/category/women`
   - Men → `/category/men`
   - Kids → `/products?category=kids`
   - Accessories → `/products?category=accessories`

   **Section 3: Help**
   - Contact Us → `/contact`
   - Shipping & Delivery → `/shipping`
   - Returns → `/returns`
   - FAQ → `/faq`

4. **Social Links**:
   - Instagram: `https://instagram.com/yourusername`
   - Facebook: `https://facebook.com/yourpage`
   - Twitter: `https://twitter.com/yourhandle`
   - YouTube: `https://youtube.com/yourchannel`

5. **Newsletter Section**:
   - Heading: "Email Sign Up"
   - Description: "Get the latest product launches, exclusive offers, and updates"
   - Button Text: "Sign Up"

6. **Bottom Section** (add 2 items):
   - Find a Store | Locate our retail locations near you
   - Sustainability | Learn about our environmental commitment

7. **Copyright Text**: `© {year} SANKOFA TRIBE. All rights reserved.`

8. **Legal Links**:
   - Privacy Policy → `/privacy`
   - Terms of Service → `/terms`

9. Publish

### 5. Create Content Pages

#### About Page
1. Go to "Content Pages"
2. Click "Create"
3. Fill in:
   - **Title**: "About Us"
   - **Slug**: `about`
   - **Meta Description**: "Learn about SANKOFA - our story, values, and commitment to timeless fashion."
4. **Hero Section**:
   - Hero Title: "Our Story"
   - Hero Subtitle: "Celebrating African heritage through contemporary fashion"
   - Show Hero Section: ✓
5. **Content**: Add rich text content about your brand
6. **Sections** (optional): Add structured content like values, mission, etc.
7. Publish

#### FAQ Page
1. Create new Content Page
2. Fill in:
   - **Title**: "Frequently Asked Questions"
   - **Slug**: `faq`
3. **Hero Section**:
   - Hero Title: "FAQ"
   - Hero Subtitle: "Find answers to common questions"
4. **Sections**: Create sections like:
   - **Shipping & Delivery**
     - How long does shipping take? | Standard shipping takes 5-7 business days...
     - Do you offer free shipping? | Yes, free shipping on orders over $100...
   - **Returns & Exchanges**
     - What is your return policy? | 30-day return policy for unworn items...
   - **Products & Sizing**
     - How do I find my size? | Check our size guide on each product page...
5. Publish

#### Shipping Page
1. Create new Content Page
2. Fill in:
   - **Title**: "Shipping & Delivery"
   - **Slug**: `shipping`
3. Add sections for:
   - Shipping Methods
   - Delivery Times
   - International Shipping
   - Tracking Orders
4. Publish

#### Returns Page
1. Create new Content Page
2. Fill in:
   - **Title**: "Returns & Exchanges"
   - **Slug**: `returns`
3. Add sections for:
   - Return Policy
   - How to Return
   - Exchanges
   - Refund Process
4. Publish

#### Contact Page
1. Create new Content Page
2. Fill in:
   - **Title**: "Contact Us"
   - **Slug**: `contact`
3. **Contact Information**:
   - Address: Your store address
   - Email: hello@sankofatribe.com
   - Phone: +1 (555) 123-4567
   - Hours: Mon-Fri: 9AM-6PM, Sat-Sun: 10AM-4PM
4. Publish

## Updating Page Files

After creating content in Sanity, rename the new page files to replace the old ones:

```bash
# Backup old pages (optional)
mv app/about/page.tsx app/about/page.old.tsx
mv app/contact/page.tsx app/contact/page.old.tsx
mv app/faq/page.tsx app/faq/page.old.tsx
mv app/shipping/page.tsx app/shipping/page.old.tsx
mv app/returns/page.tsx app/returns/page.old.tsx

# Activate new CMS-powered pages
mv app/about/page-new.tsx app/about/page.tsx
mv app/contact/page-new.tsx app/contact/page.tsx
mv app/faq/page-new.tsx app/faq/page.tsx
mv app/shipping/page-new.tsx app/shipping/page.tsx
mv app/returns/page-new.tsx app/returns/page.tsx
```

Or use PowerShell:
```powershell
# Backup and replace
Rename-Item app/about/page.tsx page.old.tsx
Rename-Item app/about/page-new.tsx page.tsx

Rename-Item app/contact/page.tsx page.old.tsx
Rename-Item app/contact/page-new.tsx page.tsx

Rename-Item app/faq/page.tsx page.old.tsx
Rename-Item app/faq/page-new.tsx page.tsx

Rename-Item app/shipping/page.tsx page.old.tsx
Rename-Item app/shipping/page-new.tsx page.tsx

Rename-Item app/returns/page.tsx page.old.tsx
Rename-Item app/returns/page-new.tsx page.tsx
```

## Features

✅ **Dynamic Navigation**: Update header menu from Sanity
✅ **Announcement Bar**: Create/edit promotional messages
✅ **Dynamic Footer**: Manage all footer links & sections
✅ **Social Media Links**: Update social profiles
✅ **Newsletter Section**: Customize newsletter CTA
✅ **Content Pages**: Full rich-text editing for all pages
✅ **FAQ Management**: Accordion-style FAQ with sections
✅ **Contact Info**: Update address, phone, email, hours
✅ **SEO Meta**: Set custom meta descriptions per page

## Fallback Behavior

All components include fallback content, so the site will still work if Sanity content isn't created yet. Pages will show a message prompting you to add content in the Sanity Studio.

## Development Workflow

1. Edit content in Sanity Studio (`/studio`)
2. Publish changes
3. Content updates automatically (60-second cache)
4. No code deployment needed for content changes

## Support

For issues or questions, refer to:
- Sanity documentation: https://www.sanity.io/docs
- Next.js documentation: https://nextjs.org/docs
