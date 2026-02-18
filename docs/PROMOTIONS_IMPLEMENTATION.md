# Promotions System Implementation

## Overview
Comprehensive promotions, discounts, and campaign management system implemented based on reference schemas from `for-referencing/` folder.

## Features Implemented

### 1. Promo Codes Schema (`sanity/schemas/promoCode.ts`)
**Full-featured promo code management:**
- **Code Validation**: Uppercase strings, 3-20 characters (e.g., WELCOME20, BLACKFRIDAY)
- **Discount Types**: 
  - Percentage (0-100%)
  - Fixed amount (₵)
  - Free shipping
- **Usage Tracking**:
  - Total usage limit (0 = unlimited)
  - Per-customer usage limit
  - Auto-incremented `timesUsed` counter (read-only)
- **Date Ranges**: `validFrom` and `validUntil` with validation
- **Restrictions**:
  - Minimum purchase amount
  - Maximum discount cap (for percentage discounts)
  - First-time customer only option
  - Applicable products (reference array)
  - Applicable categories (reference array)
- **Active/Inactive Toggle**: Enable/disable codes without deleting
- **Preview**: Shows code, discount summary, usage count, and active status

**Usage**: Create codes like:
- `WELCOME20` - 20% off for new customers
- `FREESHIP50` - Free shipping on orders over ₵50
- `BLACKFRIDAY` - Fixed ₵100 off everything

---

### 2. Product Discounts (`sanity/schemas/product.ts`)
**Product-level discount fields added:**
- **hasDiscount**: Boolean toggle to enable product discount
- **discountType**: Percentage or fixed amount
- **discountValue**: Validated discount value
  - Percentage: 0-100%
  - Fixed: Must be less than product price
- **discountStartDate**: When discount becomes active (optional)
- **discountEndDate**: When discount expires (validated > start date)
- **Preview Enhancement**: Shows discounted price vs original price

**All discount fields are hidden when `hasDiscount` is false**

**Usage**: Create flash sales, clearance items, or time-limited offers directly on products.

---

### 3. Sales Campaigns Schema (`sanity/schemas/campaign.ts`)
**Site-wide campaign management for Black Friday, seasonal sales, etc.:**
- **Campaign Details**:
  - Name and slug (e.g., black-friday-2026)
  - Description for internal reference
  - Start and end dates with validation
  - Active/inactive toggle
- **Banner Settings**:
  - Campaign banner image with hotspot
  - Banner title and subtitle
  - Show on homepage option
- **Discount Settings**:
  - Site-wide percentage discount
  - Site-wide fixed amount discount
  - Custom per-product (uses product discount fields)
- **Product/Category Filtering**:
  - Included products (leave empty for all)
  - Included categories (leave empty for all)
  - Excluded products (opt-out specific items)
- **Stacking**: Option to allow promo codes on top of campaign discount
- **Preview**: Shows campaign name, discount summary, dates, and active status

**Usage Examples**:
- Black Friday: 50% off sitewide (Nov 24-27)
- Summer Sale: 30% off specific categories
- Holiday Clearance: Custom discounts per product

---

### 4. Promo Code Validation API (`app/api/promo/validate/route.ts`)
**POST `/api/promo/validate`** - Validate and calculate promo code discount

**Request Body:**
```typescript
{
  code: string,              // Promo code (e.g., "WELCOME20")
  cartTotal: number,         // Current cart total
  products: string[],        // Array of product IDs in cart
  customerEmail?: string,    // For per-customer limit tracking
  isFirstTimeCustomer?: boolean
}
```

**Response (Success):**
```typescript
{
  valid: true,
  promoCode: string,
  description?: string,
  discountType: 'percentage' | 'fixed' | 'free_shipping',
  discountValue: number,
  discountAmount: number,    // Calculated discount to apply
  freeShipping: boolean,
  message: string
}
```

**Response (Error):**
```typescript
{
  valid: false,
  message: string            // Human-readable error
}
```

**Validations Performed:**
- ✅ Code exists and is active
- ✅ Current date is within validity period
- ✅ Usage limit not exceeded
- ✅ Minimum purchase requirement met
- ✅ First-time customer restriction (if applicable)
- ✅ Product applicability (if specific products)
- ✅ Category applicability (if specific categories)
- ✅ Discount calculation with max cap

**PATCH `/api/promo/validate`** - Increment usage counter after successful checkout

**Request Body:**
```typescript
{ code: string }
```

**Usage**: Call POST from checkout to validate code. Call PATCH after payment success to increment usage.

---

### 5. TypeScript Interfaces (`lib/sanity.ts`)
**Added interfaces:**

```typescript
export interface Product {
  // ... existing fields
  hasDiscount?: boolean
  discountType?: 'percentage' | 'fixed'
  discountValue?: number
  discountStartDate?: string
  discountEndDate?: string
}

export interface PromoCode {
  _id: string
  _type: 'promoCode'
  code: string
  description?: string
  discountType: 'percentage' | 'fixed' | 'free_shipping'
  discountValue?: number
  minimumPurchase?: number
  maxDiscount?: number
  usageLimit?: number
  usageLimitPerCustomer?: number
  timesUsed?: number
  validFrom: string
  validUntil: string
  isActive?: boolean
  applicableProducts?: Product[]
  applicableCategories?: Category[]
  firstTimeCustomerOnly?: boolean
}

export interface Campaign {
  _id: string
  _type: 'campaign'
  name: string
  slug: { current: string }
  description?: string
  startDate: string
  endDate: string
  isActive?: boolean
  bannerImage?: SanityImage
  bannerTitle?: string
  bannerSubtitle?: string
  showOnHomepage?: boolean
  discountType: 'percentage' | 'fixed' | 'custom'
  discountValue?: number
  includedProducts?: Product[]
  includedCategories?: Category[]
  excludedProducts?: Product[]
  stackWithPromos?: boolean
}
```

---

### 6. Query Updates
**Updated GROQ queries to include discount fields:**

- ✅ `app/page.tsx` - Homepage featured & collection products
- ✅ `app/products/page.tsx` - All products listing
- ✅ `app/products/[slug]/page.tsx` - Product detail & related products

**Fields Added:**
```typescript
hasDiscount,
discountType,
discountValue,
discountStartDate,
discountEndDate
```

---

## How to Use

### Creating a Promo Code
1. Open Sanity Studio at `/studio`
2. Navigate to **Promo Codes**
3. Click **Create new**
4. Fill in:
   - Code (e.g., `WELCOME20`)
   - Description (optional)
   - Discount type (percentage/fixed/free shipping)
   - Discount value (e.g., 20 for 20%)
   - Minimum purchase (optional)
   - Max discount cap (for percentages)
   - Usage limits (total and per customer)
   - Valid date range
   - Applicable products/categories (optional)
   - First-time customer only (optional)
5. Set **Active** to true
6. Publish

### Creating a Product Discount
1. Edit any product in Sanity Studio
2. Enable **Has Discount** toggle
3. Select discount type (percentage or fixed)
4. Enter discount value
5. Set start/end dates (optional for ongoing discounts)
6. Publish

**The preview will show the discounted price automatically**

### Creating a Campaign (e.g., Black Friday)
1. Open Sanity Studio
2. Navigate to **Sales Campaigns**
3. Click **Create new**
4. Fill in:
   - Name: "Black Friday 2026"
   - Slug: "black-friday-2026"
   - Description: "50% off sitewide Black Friday sale"
   - Start date: Nov 24, 2026 00:00
   - End date: Nov 27, 2026 23:59
   - Upload banner image
   - Banner title: "BLACK FRIDAY"
   - Banner subtitle: "50% Off Everything"
   - Show on homepage: true
   - Discount type: Percentage
   - Discount value: 50
   - Leave products/categories empty for sitewide
   - Stack with promos: false
   - Set active: true
5. Publish

### Frontend Integration (To Do)

#### Display Discounted Prices
```typescript
// In product card or product page
function calculateDiscountedPrice(product: Product) {
  if (!product.hasDiscount) return product.price

  // Check if discount is currently active
  const now = new Date()
  if (product.discountStartDate && new Date(product.discountStartDate) > now) {
    return product.price
  }
  if (product.discountEndDate && new Date(product.discountEndDate) < now) {
    return product.price
  }

  // Calculate discounted price
  if (product.discountType === 'percentage') {
    return product.price - (product.price * (product.discountValue || 0) / 100)
  } else if (product.discountType === 'fixed') {
    return product.price - (product.discountValue || 0)
  }

  return product.price
}

// Render
<div>
  {product.hasDiscount && (
    <>
      <span className="line-through text-gray-400">₵{product.price}</span>
      <span className="text-red-600 font-bold">₵{calculateDiscountedPrice(product).toFixed(2)}</span>
    </>
  )}
  {!product.hasDiscount && <span>₵{product.price}</span>}
</div>
```

#### Apply Promo Code in Checkout
```typescript
async function applyPromoCode(code: string, cartTotal: number, productIds: string[]) {
  const response = await fetch('/api/promo/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      cartTotal,
      products: productIds,
      isFirstTimeCustomer: false, // Determine from user data
    }),
  })

  const result = await response.json()

  if (result.valid) {
    // Apply discount
    setDiscount(result.discountAmount)
    setFreeShipping(result.freeShipping)
    toast.success(result.message)
  } else {
    toast.error(result.message)
  }
}

// After successful payment
async function incrementPromoUsage(code: string) {
  await fetch('/api/promo/validate', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
}
```

#### Display Active Campaigns on Homepage
```typescript
// Fetch active campaigns
async function getActiveCampaigns() {
  const query = `*[_type == "campaign" && isActive == true && showOnHomepage == true] | order(startDate desc) {
    _id,
    name,
    bannerImage,
    bannerTitle,
    bannerSubtitle,
    slug,
    startDate,
    endDate
  }`
  
  const campaigns = await client.fetch(query)
  
  // Filter by current date
  const now = new Date()
  return campaigns.filter(c => 
    new Date(c.startDate) <= now && new Date(c.endDate) >= now
  )
}

// Render campaign banner
<div className="relative">
  <img src={urlFor(campaign.bannerImage).url()} />
  <div className="absolute inset-0 flex flex-col justify-center items-center text-white">
    <h2 className="text-4xl font-bold">{campaign.bannerTitle}</h2>
    <p className="text-xl">{campaign.bannerSubtitle}</p>
  </div>
</div>
```

---

## Files Created/Modified

### New Files:
- ✅ `sanity/schemas/promoCode.ts` - Promo code schema (178 lines)
- ✅ `sanity/schemas/campaign.ts` - Campaign schema (188 lines)
- ✅ `app/api/promo/validate/route.ts` - Promo validation API (200 lines)

### Modified Files:
- ✅ `sanity/schemas/product.ts` - Added discount fields with validation
- ✅ `sanity/schemas/index.ts` - Registered promoCode and campaign schemas
- ✅ `lib/sanity.ts` - Added PromoCode, Campaign interfaces; extended Product interface
- ✅ `app/page.tsx` - Updated queries to include discount fields
- ✅ `app/products/page.tsx` - Updated query to include discount fields
- ✅ `app/products/[slug]/page.tsx` - Updated queries to include discount fields
- ✅ `tsconfig.json` - Excluded for-referencing folder from build

---

## Build Status
✅ **Build successful** - All schemas compile correctly
✅ **TypeScript validation passed**
✅ **API endpoint created and typed**

---

## Next Steps (Optional Enhancements)

1. **Frontend Components**:
   - Create promo code input component for checkout
   - Add discount badge to product cards
   - Display campaign banners on homepage
   - Show price comparison (original vs discounted)

2. **Analytics**:
   - Track promo code usage per campaign
   - Monitor discount redemption rates
   - Revenue impact analysis

3. **Advanced Features**:
   - Bulk promo code generation
   - User-specific promo codes (referral system)
   - Auto-apply best discount
   - Cart discount preview before checkout

4. **Notifications**:
   - Email notifications for expiring promo codes
   - Alert admins when codes reach usage limits
   - Send promo codes to new customers

---

## Reference Implementation
Based on schemas in `for-referencing/sanity/schemas/`:
- `promoCode.js` - Comprehensive promo code structure
- `product.js` - Product-level discount fields

All features from reference implementation have been successfully ported with TypeScript improvements.
