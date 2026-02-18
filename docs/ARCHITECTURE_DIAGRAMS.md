# Architecture Diagram & Visual Reference

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                         │
│  ┌─────────────────────────────────────────────────────────┐
│  │ React Components / Pages                                 │
│  │ - Login/Register                                         │
│  │ - Account Dashboard                                      │
│  │ - Wishlist                                               │
│  │ - Admin Dashboard                                        │
│  └──────────────────────┬──────────────────────────────────┘
│                         │
│              HTTP Requests / JSON
│              (with auth token in cookie)
│                         │
└─────────────────────────┼────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              NEXT.JS API ROUTES (Backend)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Auth Layer  │  │  Customer    │  │  Admin Layer     │  │
│  │              │  │  Management  │  │                  │  │
│  │ • Register   │  │              │  │ • List users     │  │
│  │ • Login      │  │ • Profile    │  │ • Create staff   │  │
│  │ • Logout     │  │ • Addresses  │  │ • List customers │  │
│  │ • Me         │  │ • Wishlist   │  │                  │  │
│  │              │  │              │  │                  │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                   │             │
│         └─────────────────┼───────────────────┘             │
│                           │                                  │
│         ┌─────────────────▼──────────────────┐              │
│         │   lib/auth-utils.ts                │              │
│         │  ┌──────────────────────────────┐  │              │
│         │  │ • hashPassword()             │  │              │
│         │  │ • comparePassword()          │  │              │
│         │  │ • createToken()              │  │              │
│         │  │ • verifyToken()              │  │              │
│         │  │ • registerUser()             │  │              │
│         │  │ • loginUser()                │  │              │
│         │  └──────────────────────────────┘  │              │
│         └─────────────────┬────────────────┘              │
└─────────────────────────────┼─────────────────────────────────┘
                              │
                     Database Queries
                     (Prisma ORM)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              POSTGRESQL DATABASE                            │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │   User       │  │  Address     │  │  Order           │ │
│  ├──────────────┤  ├──────────────┤  ├──────────────────┤ │
│  │ id (PK)      │  │ id (PK)      │  │ id (PK)          │ │
│  │ email*       │  │ userId* (FK) │  │ userId* (FK)     │ │
│  │ phone*       │  │ label        │  │ items (OrderItem)│ │
│  │ firstName    │  │ street       │  │ status           │ │
│  │ lastName     │  │ city         │  │ total            │ │
│  │ passwordHash │  │ country      │  │ createdAt        │ │
│  │ role         │  │ isDefault    │  │                  │ │
│  │ status       │  │              │  │                  │ │
│  │ permissions  │  │              │  │                  │ │
│  │ loyaltyPts   │  │              │  │                  │ │
│  │ totalOrders  │  │              │  │                  │ │
│  │ totalSpent   │  │              │  │                  │ │
│  │ createdAt    │  │              │  │                  │ │
│  │ lastLogin    │  │              │  │                  │ │
│  │ preferences  │  │              │  │                  │ │
│  └──────────────┘  └──────────────┘  └──────────────────┘ │
│         ▲                  │                   │             │
│         │                  ▼                   ▼             │
│         │            ┌──────────────┐  ┌──────────────┐    │
│         │            │  WishlistItem│  │  OrderItem   │    │
│         │            ├──────────────┤  ├──────────────┤    │
│         │            │ userId (FK)  │  │ orderId (FK) │    │
│         │            │ productId    │  │ productId    │    │
│         │            │ addedAt      │  │ quantity     │    │
│         │            │              │  │ price        │    │
│         │            └──────────────┘  └──────────────┘    │
│         │                                                   │
│         └──────────────────────────────────────────────────┘
│         ┌──────────────┐
│         │ LoginHistory │
│         ├──────────────┤
│         │ userId (FK)  │
│         │ ipAddress    │
│         │ userAgent    │
│         │ loginTime    │
│         │ logoutTime   │
│         └──────────────┘
│
│ * = Indexed for performance
│ FK = Foreign Key relationship
│ PK = Primary Key
│
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Authentication Flow

```
┌──────────────┐
│ User Browser │
└──────┬───────┘
       │
       │ 1. Fill registration form
       │
       ▼
┌──────────────────────────────┐
│ POST /api/auth/register      │
│ {email, password, ...}       │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ lib/auth-utils               │
│ 1. Validate input            │
│ 2. Hash password (bcrypt)    │
│ 3. Create user in DB         │
│ 4. Generate JWT token        │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Set HTTP-only Cookie         │
│ auth-token = JWT             │
│ (7 day expiration)           │
└──────┬───────────────────────┘
       │
       │ Response: {success, user}
       │
       ▼
┌──────────────┐
│ User Browser │ ← Cookie now auto-sent with each request
└──────────────┘

────────────────────────────────────────────────

LOGIN FLOW:

┌──────────────┐
│ User Browser │
└──────┬───────┘
       │
       │ 1. Fill login form
       │
       ▼
┌──────────────────────────┐
│ POST /api/auth/login     │
│ {email, password}        │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ lib/auth-utils               │
│ 1. Find user by email        │
│ 2. Compare password (bcrypt) │
│ 3. Update lastLogin          │
│ 4. Log login history (IP)    │
│ 5. Generate JWT token        │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Set HTTP-only Cookie         │
│ auth-token = JWT             │
└──────┬───────────────────────┘
       │
       │ Response: {success, user}
       │
       ▼
┌──────────────┐
│ User Browser │ ← Now authenticated
└──────────────┘

────────────────────────────────────────────────

PROTECTED REQUEST FLOW:

┌──────────────────────────────┐
│ GET /api/auth/me             │
│ (with auth-token cookie)     │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ 1. Read auth-token from cookie
│ 2. Verify JWT signature      │
│ 3. Extract userId from token │
│ 4. Query user from database  │
│ 5. Return user data          │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Response: {user data}        │
│ OR 401 Unauthorized          │
└──────────────────────────────┘
```

---

## 📊 Data Relationships

```
USER (1)
  │
  ├────→ (N) ADDRESS
  │        └─ label, street, city, country
  │
  ├────→ (N) ORDER
  │        ├─ id, orderNumber, status
  │        └───→ (N) ORDERITEM
  │               └─ productId, quantity, price
  │
  ├────→ (N) WISHLISTITEM
  │        ├─ productId (reference to Sanity product)
  │        └─ addedAt
  │
  └────→ (N) LOGINHISTORY
           ├─ ipAddress, userAgent
           ├─ loginTime, logoutTime
           └─ (for audit trail)
```

---

## 🔐 Security Layers

```
┌──────────────────────────────────────┐
│ CLIENT SIDE                          │
│ • HTTPS only in production           │
│ • No sensitive data in localStorage  │
│ • Token in HTTP-only cookie          │
└──────────────────────────────────────┘
           │
           │ Encrypted transmission
           │
           ▼
┌──────────────────────────────────────┐
│ API ROUTES                           │
│ • Validate input                     │
│ • Verify JWT token from cookie       │
│ • Check user role/permissions        │
│ • Verify user owns requested data    │
└──────────────────────────────────────┘
           │
           │ Only allow valid requests
           │
           ▼
┌──────────────────────────────────────┐
│ DATABASE LAYER                       │
│ • Query by id (no injection risk)    │
│ • Unique email constraint            │
│ • Unique phone constraint            │
│ • Password stored hashed, not plain  │
│ • LoginHistory tracks access         │
└──────────────────────────────────────┘
```

---

## 📱 API Route Tree

```
/api/
├── auth/
│   ├── register           POST   (create account)
│   ├── login              POST   (get JWT token)
│   ├── logout             POST   (clear token)
│   └── me                 GET    (current user - needs token)
│
├── customers/
│   └── [id]/
│       ├── route.ts       GET    (profile)
│       │                  PUT    (update)
│       │                  DELETE (delete)
│       ├── addresses/     GET    (list)
│       │                  POST   (create)
│       └── wishlist/
│           ├── route.ts   GET    (list)
│           │              POST   (add)
│           └── [itemId]/  DELETE (remove)
│
└── admin/
    ├── users/             GET    (list staff)
    │                      POST   (create staff)
    └── customers/         GET    (list customers)
```

---

## 🎯 API Request/Response Pattern

### General Pattern
```
REQUEST:
POST /api/endpoint
Headers: {
  "Content-Type": "application/json"
}
Body: { field1: value, field2: value }
Cookie: auth-token=jwt...

RESPONSE:
200 Success:
{
  "success": true,
  "data": { ... },
  "message": "..."
}

401 Unauthorized:
{
  "error": "Not authenticated"
}

403 Forbidden:
{
  "error": "Unauthorized"
}

400 Bad Request:
{
  "error": "Validation failed"
}
```

---

## 🔄 Customer Signup Journey

```
User visits /register
       │
       ▼
Fills form
  • email
  • firstName, lastName
  • password (confirm)
  • phone (optional)
       │
       ▼
Clicks "Create Account"
       │
       ▼
POST /api/auth/register
       │
       ▼
API validates:
  ✓ All required fields
  ✓ Password length (8+ chars)
  ✓ Passwords match
  ✓ Email not already used
       │
       ▼
Hash password with bcrypt
       │
       ▼
Create User in database:
  • user.id = new CUID
  • user.email = normalized
  • user.passwordHash = hashed
  • user.role = "CUSTOMER"
  • user.status = "ACTIVE"
       │
       ▼
Generate JWT token:
  • Payload: {userId, email, role}
  • Expiration: 7 days
  • Algorithm: HS256
       │
       ▼
Set HTTP-only cookie:
  • Name: auth-token
  • Value: JWT
  • HttpOnly: true
  • Secure: true (prod only)
  • SameSite: Lax
  • MaxAge: 7 days
       │
       ▼
Return response:
{
  "success": true,
  "user": {id, email, firstName, lastName, role}
}
       │
       ▼
Browser stores cookie automatically
       │
       ▼
Redirect to /account
       │
       ▼
All subsequent requests include cookie
(automatic, user doesn't see it)
```

---

## 📊 Wishlist Data Flow

### Before (Browser Only)
```
localStorage: {
  wishlist: [productId1, productId2]
}
Problem: Lost when user clears cache or uses different device
```

### After (Account-Based)
```
User: {
  id: "clz..."
  email: "user@example.com"
}
     │
     ▼
WishlistItem: [
  { id, userId, productId, addedAt },
  { id, userId, productId, addedAt },
  { id, userId, productId, addedAt }
]
     │
     ▼
Benefits:
✓ Persists across devices
✓ Persists across browsers
✓ User can access anytime
✓ Can be shared/synced
✓ Admin can see popular items
```

---

## 🏢 Admin Dashboard Data Flow

```
Admin Login
     │
     ▼
/api/auth/login
     │
     ▼
Set auth-token cookie
(role: "ADMIN")
     │
     ▼
Access /admin/dashboard
     │
     ├──→ GET /api/admin/users
     │    │
     │    ▼
     │    Verify: role === "ADMIN"
     │    │
     │    ▼
     │    Query: User where role = "ADMIN"
     │    │
     │    ▼
     │    Return: [admin1, admin2, ...]
     │
     ├──→ GET /api/admin/customers
     │    │
     │    ▼
     │    Verify: role === "ADMIN"
     │    │
     │    ▼
     │    Query: User where role = "CUSTOMER"
     │    │
     │    ▼
     │    Return: [customer1, customer2, ...]
     │
     └──→ GET /api/admin/orders
          │
          ▼
          Query: Order with relations
          │
          ▼
          Return: [order1, order2, ...]
```

---

## 🔑 Key Concepts

### JWT Token Structure
```
Header: {alg: "HS256", typ: "JWT"}
Payload: {userId: "...", email: "...", role: "ADMIN"}
Signature: HMACSHA256(header + payload, secret)

When sent in cookie:
Set-Cookie: auth-token=eyJhbGc...; HttpOnly; Secure; SameSite=Lax; Max-Age=604800
```

### Password Hashing
```
User enters: "MyPassword123!"
     │
     ▼
bcryptjs.hash(password, 10)
     │
     ▼
Stored in database: $2b$10$XYZ...random...salt...hash

On login:
bcryptjs.compare(inputPassword, storedHash)
     │
     ▼
Returns: true or false
```

### Database Indexing
```
Indexed columns:
- email (fast login lookups)
- phone (fast SMS marketing queries)
- role (fast admin/customer filtering)
- status (fast user status filtering)
- registeredAt (sort by signup date)

Example benefit:
10M users, searching by email:
Without index: Scan all 10M rows → ~5s
With index: Binary search → ~0.01s
```

---

## 📈 Scaling Considerations

```
Current Setup (Small)
├── Single PostgreSQL instance
├── Direct Prisma queries
└── Good for: 1K-100K users

Medium Scale (100K-1M users)
├── Database connection pooling
├── Caching layer (Redis)
├── Separate read replicas
└── Optimize: phone indexes, search queries

Large Scale (1M+ users)
├── Sharded database
├── Message queue for async tasks
├── ElasticSearch for customer search
├── CDN for static content
└── API rate limiting

For now: Single PostgreSQL is fine!
```

---

This architecture provides:
✅ Security (hashed passwords, JWT tokens)
✅ Scalability (indexed queries, normalized schema)
✅ Reliability (ACID transactions, audit trail)
✅ Developer Experience (Prisma, type-safe queries)
✅ Customer Experience (persistent accounts, multi-device support)
