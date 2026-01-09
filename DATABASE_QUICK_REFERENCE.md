# Database Setup Quick Reference Card

## 🚀 Getting Started (3 Steps)

```bash
# 1. Set DATABASE_URL in .env.local
# 2. Install dependencies
npm install

# 3. Create tables
npm run prisma:migrate
```

## 🔌 Database URLs

### Local Postgres
```
postgresql://postgres:password@localhost:5432/sankofatribe
```

### Supabase
```
postgresql://[user].[project]:[password]@[host].supabase.co:5432/postgres
```

### Railway
```
Copy from dashboard → PostgreSQL → Connection String
```

## 📝 .env Setting

```env
DATABASE_URL="postgresql://..."
```

## 🧪 Test Commands

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"john@example.com",
    "firstName":"John",
    "lastName":"Doe",
    "password":"Pass123!",
    "confirmPassword":"Pass123!"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"john@example.com",
    "password":"Pass123!"
  }'
```

### Check Auth
```bash
curl http://localhost:3000/api/auth/me
```

## 📊 Useful Commands

```bash
npm run prisma:studio      # View database visually
npm run prisma:seed        # Create admin user
npm run prisma:migrate     # Run migrations
npx prisma migrate reset   # Reset database (⚠️ deletes data)
npm run dev                # Start dev server
```

## 🔑 15 API Endpoints

### Auth (No token)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`

### Auth (With token)
- `GET /api/auth/me`

### Customer Profile
- `GET /api/customers/[id]`
- `PUT /api/customers/[id]`
- `DELETE /api/customers/[id]`

### Addresses
- `GET /api/customers/[id]/addresses`
- `POST /api/customers/[id]/addresses`

### Wishlist
- `GET /api/customers/[id]/wishlist`
- `POST /api/customers/[id]/wishlist`
- `DELETE /api/customers/[id]/wishlist/[itemId]`

### Admin
- `GET /api/admin/users`
- `POST /api/admin/users`
- `GET /api/admin/customers`

## 📱 Sample Payloads

### Register
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "phone": "+233201234567"
}
```

### Add Address
```json
{
  "label": "Home",
  "street": "123 Main St",
  "city": "Accra",
  "country": "Ghana",
  "isDefault": true
}
```

### Create Admin User
```json
{
  "email": "admin@example.com",
  "firstName": "Admin",
  "lastName": "User",
  "password": "AdminPass123!",
  "permissions": ["manage_users", "manage_products", "manage_orders"]
}
```

## 🗄️ Database Tables

```
User
├── Address (1:many)
├── Order (1:many)
├── WishlistItem (1:many)
└── LoginHistory (1:many)

Order
└── OrderItem (1:many)
```

## 🐛 Quick Fixes

| Error | Fix |
|-------|-----|
| "DATABASE_URL not set" | Add to `.env`: `DATABASE_URL="postgresql://..."` |
| "Can't connect" | Test: `psql $DATABASE_URL -c "SELECT 1"` |
| "Migration failed" | Run: `npx prisma migrate reset` |
| "Auth not working" | Clear cookies, restart dev server |

## ✅ Checklist

- [ ] DATABASE_URL set in .env.local
- [ ] `npm install` completed
- [ ] `npm run prisma:migrate` succeeded
- [ ] `npm run dev` starts without errors
- [ ] Register endpoint works (test with curl)
- [ ] Login endpoint works
- [ ] Admin pages updated to use Postgres

## 📚 Full Documentation

- `DATABASE_QUICKSTART.md` - Complete setup guide
- `DATABASE_SETUP_COMPLETE.md` - Full API documentation  
- `IMPLEMENTATION_NEXT_STEPS.md` - Rollout phases
- `POSTGRES_COMPLETE.md` - Full overview

---

**Status:** ✅ Ready to migrate
**Next:** Provide PostgreSQL connection string → Run migrations → Test!
