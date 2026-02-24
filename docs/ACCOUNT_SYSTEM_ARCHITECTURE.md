# User Account System - Architecture & Component Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND LAYER                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  /account/page.tsx (Main Dashboard)                                    │
│  ├── ProfileManagement.tsx        (Profile Tab)                         │
│  ├── AddressManagement.tsx        (Address Tab)                         │
│  ├── OrderHistory.tsx             (Orders Tab)                          │
│  ├── WishlistManagement.tsx       (Wishlist Tab)                        │
│  ├── SecurityManagement.tsx       (Security Tab)                        │
│  └── PreferencesManagement.tsx    (Preferences Tab)                     │
│                                                                          │
│  /login/page.tsx (Customer Login Form)                                 │
│  /register/page.tsx (Customer Registration Form)                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
                        HTTP/REST API Calls
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                      MIDDLEWARE LAYER                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  middleware.ts                                                           │
│  ├── JWT Verification                                                    │
│  ├── Route Protection (/account/*, /api/customer/*)                     │
│  ├── Redirect to /login if unauthorized                                 │
│  └── Rate Limiting Support                                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                      API LAYER                                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Authentication APIs                                                     │
│  ├── POST /api/customer/auth/login          (Customer Login)            │
│  ├── POST /api/auth/logout                  (Logout)                    │
│  ├── GET  /api/auth/me                      (Current User)              │
│  └── POST /api/auth/register                (Registration)              │
│                                                                          │
│  Profile APIs                                                            │
│  ├── GET  /api/customer/profile             (Get Profile)               │
│  └── PATCH /api/customer/profile            (Update Profile)            │
│                                                                          │
│  Address APIs                                                            │
│  ├── GET  /api/customer/addresses           (List Addresses)            │
│  ├── POST /api/customer/addresses           (Create Address)            │
│  ├── PATCH /api/customer/addresses/[id]     (Update Address)            │
│  └── DELETE /api/customer/addresses/[id]    (Delete Address)            │
│                                                                          │
│  Order APIs                                                              │
│  └── GET  /api/customer/orders              (Get Orders w/ Pagination)  │
│                                                                          │
│  Wishlist APIs                                                           │
│  ├── GET  /api/customer/wishlist            (Get Wishlist)              │
│  ├── POST /api/customer/wishlist            (Add to Wishlist)           │
│  └── DELETE /api/customer/wishlist/[id]     (Remove from Wishlist)      │
│                                                                          │
│  Security APIs                                                           │
│  └── PATCH /api/customer/password           (Change Password)           │
│                                                                          │
│  Preferences APIs                                                        │
│  ├── GET  /api/customer/preferences         (Get Preferences)           │
│  └── PATCH /api/customer/preferences        (Update Preferences)        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
                    Authentication & Validation Layer
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  lib/auth-utils.ts                                                       │
│  ├── hashPassword()                                                      │
│  ├── comparePassword()                                                   │
│  ├── createToken()                                                       │
│  ├── verifyToken()                                                       │
│  ├── registerUser()                                                      │
│  ├── loginUser()                                                         │
│  └── getPrisma()                                                         │
│                                                                          │
│  lib/rate-limit.ts                                                       │
│  └── createRateLimiter()                                                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  PostgreSQL Database (via Prisma ORM)                                   │
│                                                                          │
│  Tables:                                                                 │
│  ├── User                                                                │
│  │   ├── id, email (unique), phone, firstName, lastName                 │
│  │   ├── passwordHash, role, status                                     │
│  │   ├── profileImage, bio, preferences (JSON)                          │
│  │   ├── loyaltyPoints, totalOrders, totalSpent                         │
│  │   └── registeredAt, lastLogin, updatedAt                             │
│  │                                                                       │
│  ├── Address                                                             │
│  │   ├── id, userId (FK), label, street, city, region                  │
│  │   ├── postalCode, country, isDefault                                 │
│  │   └── createdAt, updatedAt                                           │
│  │                                                                       │
│  ├── Order                                                               │
│  │   ├── id, orderNumber (unique), userId (FK)                          │
│  │   ├── subtotal, discount, shipping, tax, total                       │
│  │   ├── status, paymentStatus, paymentReference                        │
│  │   ├── customerEmail, customerPhone, customerFirstName                │
│  │   ├── shippingAddressId (FK), items[]                                │
│  │   └── createdAt, updatedAt                                           │
│  │                                                                       │
│  ├── OrderItem (belongs to Order)                                        │
│  │   ├── id, orderId (FK), productId, productName                       │
│  │   ├── price, quantity, size, color                                   │
│  │                                                                       │
│  ├── WishlistItem                                                        │
│  │   ├── id, userId (FK), productId                                     │
│  │   ├── unique(userId, productId)                                      │
│  │   └── addedAt                                                         │
│  │                                                                       │
│  └── LoginHistory (Audit Trail)                                         │
│      ├── id, userId (FK), ipAddress, userAgent                          │
│      ├── loginTime, logoutTime                                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. Authentication Flow

```
User Visits /login
        ↓
Enters Credentials
        ↓
POST /api/customer/auth/login
        ↓
      ┌─────────────────────┐
      │ Validate Email      │
      │ Hash & Compare      │
      │ Password            │
      └─────────────────────┘
        ↓
    Success?
    ↙        ↖
   NO         YES
   ↓           ↓
Return 401   Create JWT Token
Error        ↓
             Set HTTP-Only Cookie
             ↓
             Return Success
             Redirect to /account
```

### 2. Profile Update Flow

```
User Clicks Edit Profile
        ↓
Opens Edit Form
        ↓
Submits Changes
        ↓
PATCH /api/customer/profile (with JWT)
        ↓
      ┌──────────────────────┐
      │ Verify JWT Token     │
      │ Check User ID        │
      │ Validate Input       │
      └──────────────────────┘
        ↓
    Valid?
    ↙        ↖
   NO         YES
  401         Update Database
  Error       ↓
              Return Updated Profile
              ↓
              UI Updates & Shows Success
```

### 3. Address Management Flow

```
User Clicks "Add Address"
        ↓
Opens Address Form
        ↓
Submits Data
        ↓
POST /api/customer/addresses (with JWT)
        ↓
      ┌──────────────────────┐
      │ Verify JWT Token     │
      │ Validate Fields      │
      │ (street, city, etc.) │
      └──────────────────────┘
        ↓
    Valid?
    ↙        ↖
   NO         YES
 400 Error   ┌─────────────────────┐
             │ If isDefault=true:  │
             │ Unset other         │
             │ defaults            │
             └─────────────────────┘
                     ↓
              Create Address
                     ↓
              Return New Address
                     ↓
              Add to UI List
```

### 4. Order Retrieval Flow

```
User Clicks "Orders" Tab
        ↓
GET /api/customer/orders?page=1&limit=10 (with JWT)
        ↓
      ┌──────────────────────┐
      │ Verify JWT Token     │
      │ Get User ID          │
      │ Count Total Orders   │
      └──────────────────────┘
        ↓
    Fetch Paginated Orders
    (with OrderItems & Address)
        ↓
    Return:
    - orders array
    - pagination info
        ↓
    Display Results
    - Expand/Collapse Orders
    - Show Item Details
    - Pagination Controls
```

---

## Component Interaction Map

```
┌──────────────────────────────────────────────────────┐
│        Account Dashboard (/account/page.tsx)        │
│  ┌────────────────────────────────────────────────┐ │
│  │ Sidebar (Navigation & User Info)              │ │
│  │ - Profile Card                                │ │
│  │ - 6 Tab Buttons                               │ │
│  │ - Logout Button                               │ │
│  └────────────────────────────────────────────────┘ │
│              ↓ onClick                               │
│  ┌────────────────────────────────────────────────┐ │
│  │ Content Area (Dynamic)                         │ │
│  │ Based on activeTab state:                      │ │
│  │                                                │ │
│  │ IF activeTab === 'profile'                    │ │
│  │   Render <ProfileManagement />                │ │
│  │   ├─ GET /api/customer/profile                │ │
│  │   ├─ PATCH /api/customer/profile              │ │
│  │   └─ Display stats                            │ │
│  │                                                │ │
│  │ IF activeTab === 'addresses'                  │ │
│  │   Render <AddressManagement />                │ │
│  │   ├─ GET /api/customer/addresses              │ │
│  │   ├─ POST /api/customer/addresses             │ │
│  │   ├─ PATCH /api/customer/addresses/[id]       │ │
│  │   └─ DELETE /api/customer/addresses/[id]      │ │
│  │                                                │ │
│  │ IF activeTab === 'orders'                     │ │
│  │   Render <OrderHistory />                     │ │
│  │   ├─ GET /api/customer/orders                 │ │
│  │   ├─ Pagination Support                       │ │
│  │   └─ Expandable Details                       │ │
│  │                                                │ │
│  │ IF activeTab === 'wishlist'                   │ │
│  │   Render <WishlistManagement />               │ │
│  │   ├─ GET /api/customer/wishlist               │ │
│  │   ├─ POST /api/customer/wishlist              │ │
│  │   └─ DELETE /api/customer/wishlist/[id]       │ │
│  │                                                │ │
│  │ IF activeTab === 'security'                   │ │
│  │   Render <SecurityManagement />               │ │
│  │   └─ PATCH /api/customer/password             │ │
│  │                                                │ │
│  │ IF activeTab === 'preferences'                │ │
│  │   Render <PreferencesManagement />            │ │
│  │   ├─ GET /api/customer/preferences            │ │
│  │   └─ PATCH /api/customer/preferences          │ │
│  │                                                │ │
│  └────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

---

## State Management & Props Flow

### Account Page State
```typescript
{
  activeTab: 'profile' | 'addresses' | 'orders' | 'wishlist' | 'security' | 'preferences',
  userProfile: {
    id, email, firstName, lastName
  },
  isLoading: boolean,
  isAuthenticated: boolean,
  isLoggingOut: boolean
}
```

### Component-Level State

**ProfileManagement**
```typescript
{
  profile: UserProfile | null,
  formData: { firstName, lastName, phone, bio },
  isEditing: boolean,
  isSaving: boolean,
  error: string | null,
  success: boolean
}
```

**AddressManagement**
```typescript
{
  addresses: Address[],
  formData: { label, street, city, region, postalCode, country, isDefault },
  showForm: boolean,
  editingId: string | null,
  isSaving: boolean,
  error: string | null
}
```

**OrderHistory**
```typescript
{
  orders: Order[],
  pagination: { page, limit, total, pages },
  expandedOrder: string | null,
  isLoading: boolean,
  error: string | null
}
```

---

## Security & Validation Flow

```
┌─ Request Received ─┐
│                    │
├─ Check Cookie     │
│  (auth-token)     │← Missing?
│                    │  ├─ API: 401
│                    │  └─ Page: Redirect /login
│                    │
├─ Verify JWT       │
│  (Signature,      │← Invalid/Expired?
│   Expiration)     │  ├─ API: 401
│                    │  └─ Page: Redirect /login
│                    │
├─ Extract UserID   │
│                    │
├─ Validate Input   │
│  (Type, Length,   │← Missing/Invalid?
│   Format)         │  ├─ API: 400
│                    │  └─ UI: Show Error
│                    │
├─ Verify Ownership │
│  (User ID Match)  │← No Match?
│                    │  └─ API: 404/403
│                    │
└─ Execute Action   │
   (DB Operation)   │
```

---

## Error Handling Strategy

```
┌─ API Response ─┐
│                │
├─ Success (2xx)│
│   ├─ Return   │
│   │ Data      │
│   └─ Update   │
│      UI       │
│                │
├─ Error (4xx)  │
│   ├─ 400: Bad │
│   │ Request   │
│   │   Show    │
│   │ validation│
│   │ error in  │
│   │ UI        │
│   │           │
│   ├─ 401: Not │
│   │ Authed    │
│   │   Redirect│
│   │ to /login │
│   │           │
│   ├─ 404: Not │
│   │ Found     │
│   │   Reload  │
│   │ data      │
│   │           │
│   └─ 429: Too │
│       Many    │
│   Requests    │
│   Show retry  │
│   message     │
│                │
└─ Error (5xx)  │
   Show generic │
   error msg    │
   Log to       │
   console      │
```

---

## User Journey Map

### New Customer Journey
```
1. Visit Website
   ↓
2. Click "Sign Up"
   ↓
3. Fill Registration Form
   ├─ Email
   ├─ First Name
   ├─ Last Name
   ├─ Password
   └─ Phone (optional)
   ↓
4. Submit → POST /api/auth/register
   ↓
5. Redirected to Login
   ↓
6. Enter Credentials
   ↓
7. Click "Sign In"
   ├─ POST /api/customer/auth/login
   ├─ JWT Token Created
   └─ Cookie Set
   ↓
8. Redirected to /account Dashboard
   ↓
9. Complete Profile
   ├─ Edit first name/last name
   ├─ Add profile picture
   └─ Add bio (optional)
   ↓
10. Add Shipping Address
    ├─ Add Address Form
    ├─ Set as Default
    └─ Save
    ↓
11. Update Preferences
    ├─ Email Marketing
    ├─ SMS Notifications
    ├─ Order Updates
    └─ Product Recommendations
    ↓
12. Ready for Checkout!
```

### Returning Customer Journey
```
1. Visit Website
   ↓
2. Navigate to Accounts/Login
   ↓
3. Enter Credentials
   ↓
4. Click "Sign In"
   ├─ POST /api/customer/auth/login
   └─ JWT Token Created
   ↓
5. Redirected to /account Dashboard
   ↓
6. Browse Options:
   ├─ View Profile
   ├─ Browse Order History
   ├─ Check Wishlist
   ├─ Update Preferences
   ├─ Change Password
   └─ Manage Addresses
```

---

## Performance Optimization Strategies

1. **Pagination**
   - Orders use pagination (10 items default)
   - Reduces initial load

2. **Component Lazy Loading**
   - Each tab renders independently
   - Only selected component loads data

3. **Memoization** (Future)
   - React.memo for components
   - useMemo for expensive calculations

4. **API Calls Optimization**
   - Selective field selection in Prisma
   - Indexes on frequently queried fields

5. **Caching** (Future)
   - Implement React Query or SWR
   - Cache user data with stale-while-revalidate

---

## Testing Strategy

```
Unit Tests
├─ Auth Utils
├─ Password Hashing
├─ Token Verification
└─ Rate Limiting

Integration Tests
├─ Login Flow
├─ Profile Update
├─ Address CRUD
└─ Wishlist Management

E2E Tests
├─ Full User Journey
├─ Error Scenarios
├─ Form Validation
└─ Permission Checks
```

---

**Last Updated:** February 24, 2026
**Status:** ✅ Production Ready
