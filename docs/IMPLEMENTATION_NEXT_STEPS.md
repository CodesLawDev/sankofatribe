# Implementation Checklist & Next Steps

## ✅ What's Been Completed

### 1. Database Architecture
- [x] Prisma schema created with unified User model (admin + customers)
- [x] Database relationships: User ↔ Address, Order, WishlistItem, LoginHistory
- [x] Enums: UserRole (ADMIN/CUSTOMER), UserStatus, OrderStatus
- [x] Proper indexing on email, phone, role, status for performance
- [x] Soft delete support via status field

### 2. Authentication System
- [x] Password hashing with bcryptjs (10 rounds)
- [x] JWT token generation (7-day expiration)
- [x] HTTP-only cookie management
- [x] Auth verification middleware logic

### 3. API Routes (Complete)
- [x] `POST /api/auth/register` - Customer signup
- [x] `POST /api/auth/login` - Login with email/password
- [x] `POST /api/auth/logout` - Clear session
- [x] `GET /api/auth/me` - Current user data
- [x] `GET /api/customers/[id]` - Profile
- [x] `PUT /api/customers/[id]` - Update profile
- [x] `DELETE /api/customers/[id]` - Soft delete
- [x] `GET /api/customers/[id]/addresses` - Get addresses
- [x] `POST /api/customers/[id]/addresses` - Add address
- [x] `GET /api/customers/[id]/wishlist` - Get wishlist
- [x] `POST /api/customers/[id]/wishlist` - Add to wishlist
- [x] `DELETE /api/customers/[id]/wishlist/[itemId]` - Remove from wishlist
- [x] `GET /api/admin/users` - List admin staff
- [x] `POST /api/admin/users` - Create staff user
- [x] `GET /api/admin/customers` - List customers

### 4. Configuration
- [x] `.env` updated with DATABASE_URL placeholder
- [x] `package.json` updated (moved @prisma/client & bcryptjs to dependencies)
- [x] Prisma scripts added (migrate, generate, seed, studio)
- [x] Seed script created (admin user)

### 5. Documentation
- [x] `POSTGRES_SETUP.md` - Detailed setup instructions
- [x] `DATABASE_QUICKSTART.md` - Quick reference guide
- [x] `DATABASE_SETUP_COMPLETE.md` - Full API documentation
- [x] This checklist

---

## ⏳ Next Steps (For You)

### IMMEDIATE (Today - Before Moving On)

#### Step 1: Set Up Database
Choose one option:

**Option A: PostgreSQL Local (Dev)**
```bash
# Install PostgreSQL
# Windows: https://www.postgresql.org/download/windows/
# Mac: brew install postgresql
# Linux: sudo apt-get install postgresql

# Start service
# Windows: Services → PostgreSQL
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql

# Create database
createdb sankofatribe

# Update .env.local
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/sankofatribe"
```

**Option B: Supabase (Cloud - Recommended)**
1. Create account: https://supabase.com
2. Create project
3. Copy connection string from Settings → Database
4. Paste into `.env.local`

**Option C: Railway (Quick Setup)**
1. Create account: https://railway.app
2. Create new project → Add PostgreSQL
3. Copy connection string
4. Paste into `.env.local`

#### Step 2: Install & Migrate
```bash
# Install dependencies
npm install

# Run migrations to create tables
npm run prisma:migrate

# When prompted, enter migration name (e.g., "init")
```

#### Step 3: Test Setup
```bash
# Seed admin user (optional but recommended)
npm run prisma:seed

# Start dev server
npm run dev

# Test register endpoint (from another terminal)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","firstName":"Test","lastName":"User","password":"TestPass123!","confirmPassword":"TestPass123!"}'
```

---

## 📋 Phase 2 Tasks (Admin Migration)

### Task 1: Extract Existing Admin Users from Sanity
```javascript
// In Sanity Studio or via API:
// Get all users from 'user' schema
const query = `*[_type == "user"]`;
// Note: _id, email, firstName, lastName, role, permissions
```

### Task 2: Migrate to Postgres
```bash
# Create migration script: scripts/migrate-admin-users.ts
# 1. Connect to Postgres
# 2. Hash existing passwords
# 3. Insert into User table with role='ADMIN'
# 4. Run: npx ts-node scripts/migrate-admin-users.ts
```

### Task 3: Update Admin Pages to Use Postgres

**File: `app/admin/page.tsx`**
```typescript
// BEFORE: Fetch from Sanity
// const users = await serverClient.fetch(`*[_type == "user"]`)

// AFTER: Fetch from Postgres
const { data } = await fetch('/api/admin/users?limit=100').then(r => r.json());
const users = data.users;
```

**File: `app/admin/customers/page.tsx`** (if exists)
```typescript
// AFTER: Fetch customers from Postgres
const { data } = await fetch('/api/admin/customers?limit=100').then(r => r.json());
const customers = data.customers;
```

### Task 4: Remove Sanity User Schema
```typescript
// In sanity/schemas/index.ts
// Remove: import { user } from './user'
// Remove: user from schemaTypes array
// Keep: customer schema as read-only reference
```

**Update Sanity to content-only:**
```typescript
// sanity/schemas/index.ts should only have:
- product
- category
- banner
- homePage
- campaign
- faq
- review
- customer (read-only reference)
// NO: user schema
```

---

## 🎨 Phase 3 Tasks (Customer Features)

### Task 1: Create Customer Account Page
**File: `app/account/page.tsx` or `app/customer/profile/page.tsx`**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Fetch current user
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (!data.user) {
          router.push('/login');
          return;
        }
        setUser(data.user);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div>
      <h1>My Account</h1>
      <h2>{user.firstName} {user.lastName}</h2>
      <p>Email: {user.email}</p>
      <p>Phone: {user.phone}</p>
      <p>Loyalty Points: {user.loyaltyPoints}</p>
      <p>Total Orders: {user.totalOrders}</p>
      <p>Total Spent: ${user.totalSpent.toFixed(2)}</p>
      {/* Add: Edit profile button, addresses section, wishlist, etc */}
    </div>
  );
}
```

### Task 2: Create Account-Based Wishlist Page
**File: `app/wishlist/page.tsx`**

```typescript
// Fetch from /api/customers/[userId]/wishlist
// Display persisted wishlist (not just localStorage)
// Allow remove/add from this page
```

### Task 3: Create Address Management
**File: `app/account/addresses/page.tsx`**

```typescript
// GET /api/customers/[userId]/addresses
// Display all addresses
// Allow add/edit/delete
// Set default address
```

### Task 4: Create Order History Page
**File: `app/account/orders/page.tsx`**

```typescript
// GET /api/customers/[userId]/orders (need to create this endpoint)
// Display all customer orders
// Show order details, status, tracking
```

---

## 🔐 Phase 4 Tasks (Additional Security)

### Task 1: Password Reset Flow
Create endpoints:
- `POST /api/auth/forgot-password` - Send reset email
- `POST /api/auth/reset-password` - Apply new password

### Task 2: Email Verification
- Send verification email on signup
- Mark `emailVerified` in User table
- Add endpoint to verify token

### Task 3: Two-Factor Authentication (Optional)
- Add 2FA field to User table
- SMS or authenticator app support

---

## 🚀 Phase 5 Tasks (Marketing Integration)

### Task 1: SMS Marketing Setup
- Query users by phone: `prisma.user.findMany({ where: { phone: { not: null } } })`
- Use BMS API to send SMS campaigns
- Track SMS opt-in via preferences

### Task 2: Email Marketing
- Query users by email preferences
- Send promotional emails
- Track email engagement

### Task 3: Loyalty Program
```typescript
// Use loyaltyPoints field to:
// - Track points earned per order
// - Allow point redemption
// - Send points milestone emails
```

---

## 📝 Testing Checklist

### Authentication Flow
- [ ] Register new customer
- [ ] Login with email/password
- [ ] View /api/auth/me
- [ ] Logout clears cookie
- [ ] Login required for protected routes

### Customer Profile
- [ ] Update profile (name, phone, bio)
- [ ] View profile
- [ ] Delete account (soft delete)

### Addresses
- [ ] Add new address
- [ ] Get all addresses
- [ ] Set default address
- [ ] Update address (add endpoint)

### Wishlist
- [ ] Add item to wishlist
- [ ] View wishlist
- [ ] Remove from wishlist
- [ ] Persists across sessions (logged-in users)

### Admin Functions
- [ ] List all customers
- [ ] Search customers by email/name
- [ ] Create new staff user
- [ ] List admin users
- [ ] Update user status

---

## 🔍 Verification Commands

```bash
# Check if migrations were applied
psql $DATABASE_URL -c "\dt"

# View database schema
npm run prisma:studio

# Test register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","firstName":"Test","lastName":"User","password":"Test123!","confirmPassword":"Test123!"}'

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'

# Test me (check cookie)
curl http://localhost:3000/api/auth/me
```

---

## 🎯 Success Criteria

### Immediate (This Week)
- [ ] PostgreSQL database set up
- [ ] Migrations run successfully
- [ ] Auth endpoints tested (register, login, me)
- [ ] Admin users migrated from Sanity
- [ ] Admin pages updated to use Postgres

### Short-term (Next 2 Weeks)
- [ ] Customer account page created
- [ ] Wishlist page created and persisted
- [ ] Address management working
- [ ] Order history page (if orders exist)
- [ ] All API endpoints tested

### Medium-term (Next Month)
- [ ] Password reset flow
- [ ] Email verification
- [ ] Customer dashboard completed
- [ ] SMS marketing setup
- [ ] Loyalty program operational

---

## 📞 Common Issues & Fixes

### "DATABASE_URL is not set"
```bash
# Verify .env exists and has DATABASE_URL
cat .env

# Add if missing:
DATABASE_URL="postgresql://..."
```

### "Can't connect to database"
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check Postgres is running
# Windows: Services → PostgreSQL
# Mac: brew services list
# Linux: sudo systemctl status postgresql
```

### "Migration failed"
```bash
# Check what migrations exist
npx prisma migrate status

# Reset database (⚠️ WARNING: Deletes all data)
npx prisma migrate reset

# Re-run migrations
npm run prisma:migrate
```

### "Auth token not working"
```bash
# Clear browser cookies
# Restart dev server
npm run dev

# Check JWT_SECRET in auth-utils.ts
```

### "Admin pages still showing Sanity data"
```typescript
// Make sure these files are updated:
// app/admin/page.tsx
// app/admin/customers/page.tsx
// app/admin/users/page.tsx

// Search for: serverClient.fetch
// Replace with: fetch('/api/admin/...')
```

---

## 📚 Resources

- Prisma Docs: https://www.prisma.io/docs/
- Next.js API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- PostgreSQL: https://www.postgresql.org/docs/
- JWT: https://jwt.io/
- Bcrypt: https://github.com/kelektiv/node.bcrypt.js

---

## Summary

You now have:
✅ Complete Postgres database schema
✅ Full authentication system (register, login, logout)
✅ Customer management APIs
✅ Admin management APIs
✅ Wishlist persistence
✅ Order tracking structure

**Next immediate action:**
1. Set up PostgreSQL (local or cloud)
2. Run migrations: `npm run prisma:migrate`
3. Seed admin user: `npm run prisma:seed`
4. Test with curl commands above
5. Update admin pages to use Postgres

**Then:**
6. Create customer account pages
7. Migrate existing admin users
8. Update remaining pages

Let me know when you're ready to proceed with any of these phases!
