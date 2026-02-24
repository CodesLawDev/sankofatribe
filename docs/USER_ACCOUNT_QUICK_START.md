# User Account System - Quick Start & Testing Guide

## ✅ What's Been Implemented

### Backend APIs (8 Endpoints)
✅ Profile Management (GET, PATCH)
✅ Address Management (GET, POST, PATCH, DELETE)
✅ Order History (GET with pagination)
✅ Wishlist Management (GET, POST, DELETE)
✅ Password/Security (PATCH)
✅ Communication Preferences (GET, PATCH)
✅ Authentication Protection (Middleware)
✅ Rate Limiting (Login attempts)

### Frontend Components (7 Components)
✅ Account Dashboard with 6 Tabs
✅ Profile Management Tab
✅ Address Management Tab
✅ Order History Tab
✅ Wishlist Management Tab
✅ Security/Password Tab
✅ Communication Preferences Tab

### Security Features
✅ JWT Authentication
✅ HTTP-Only Cookie Storage
✅ Password Hashing (Bcrypt)
✅ Middleware Route Protection
✅ Token Expiration (7 days)
✅ Rate Limiting

---

## 🧪 Testing Checklist

### 1. User Registration & Login
```bash
# Test registration
POST /api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "SecurePass123",
  "phone": "+233501234567"
}

# Test login
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "SecurePass123"
}
```

### 2. Profile Management
```bash
# Get profile
GET /api/customer/profile

# Update profile
PATCH /api/customer/profile
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+233501111111",
  "bio": "I love Sankofatribe products!"
}
```

### 3. Address Management
```bash
# List addresses
GET /api/customer/addresses

# Add address
POST /api/customer/addresses
Content-Type: application/json

{
  "label": "Home",
  "street": "123 Main Street",
  "city": "Accra",
  "region": "Greater Accra",
  "postalCode": "00000",
  "country": "Ghana",
  "isDefault": true
}

# Update address
PATCH /api/customer/addresses/{addressId}

# Delete address
DELETE /api/customer/addresses/{addressId}
```

### 4. Order History
```bash
# Get orders (page 1, 10 items per page)
GET /api/customer/orders?page=1&limit=10

# Response includes:
# - orders array with items and shipping address
# - pagination info (page, limit, total, pages)
```

### 5. Wishlist
```bash
# Get wishlist
GET /api/customer/wishlist

# Add to wishlist
POST /api/customer/wishlist
Content-Type: application/json

{
  "productId": "sanity-product-id-123"
}

# Remove from wishlist
DELETE /api/customer/wishlist/{productId}
```

### 6. Password Change
```bash
# Change password
PATCH /api/customer/password
Content-Type: application/json

{
  "currentPassword": "OldPass123",
  "newPassword": "NewSecurePass456",
  "confirmPassword": "NewSecurePass456"
}
```

### 7. Preferences
```bash
# Get preferences
GET /api/customer/preferences

# Update preferences
PATCH /api/customer/preferences
Content-Type: application/json

{
  "emailMarketing": true,
  "smsMarketing": false,
  "orderUpdates": true,
  "newsletters": true,
  "productRecommendations": true,
  "promotions": false
}
```

---

## 🚀 Quick Start Steps

### Step 1: Start Development Server
```bash
npm run dev
```

### Step 2: Create a Test User
```bash
# Option A: Use login page
1. Navigate to http://localhost:3000/register
2. Fill in registration form
3. Submit

# Option B: Use API
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "password": "TestPass123"
  }'
```

### Step 3: Login
1. Navigate to http://localhost:3000/login
2. Enter test user credentials
3. Should redirect to /account dashboard

### Step 4: Test Features
- **Profile Tab**: Edit your information, view stats
- **Addresses Tab**: Add, edit, delete addresses
- **Orders Tab**: View order history (if orders exist)
- **Wishlist Tab**: Add products to wishlist
- **Security Tab**: Change your password
- **Preferences Tab**: Update communication preferences

---

## 📊 Testing Scenarios

### Scenario 1: New Customer Journey
1. ✅ Register on /register
2. ✅ Login on /login
3. ✅ Redirected to /account
4. ✅ Add address in Addresses tab
5. ✅ Update profile in Profile tab
6. ✅ Setup preferences in Preferences tab

### Scenario 2: Security Testing
1. ✅ Try accessing /account without login → Should redirect to /login
2. ✅ Try accessing /api/customer/profile without token → Should return 401
3. ✅ Try password change with wrong current password → Should fail
4. ✅ Try password less than 8 characters → Should fail
5. ✅ Change password successfully → Should work

### Scenario 3: Address Management
1. ✅ Add address without required fields → Should show error
2. ✅ Add address with all required fields → Should succeed
3. ✅ Set one address as default → Others should be unset
4. ✅ Edit address → Should update
5. ✅ Delete address → Should remove from list

### Scenario 4: Data Persistence
1. ✅ Update profile → Refresh page → Data should persist
2. ✅ Add wishlist item → Logout → Login → Item should still exist
3. ✅ Change preferences → Logout → Login → Settings should persist

---

## 🔍 Debugging Tips

### Check Authentication
```typescript
// In browser console
// Verify token is set in cookies
document.cookie
// Should see: auth-token=eyJ...

// Verify token in storage
const token = document.cookie.split('; ').find(c => c.startsWith('auth-token'));
console.log(token);
```

### Monitor API Calls
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by Fetch/XHR
4. Perform actions in account
5. Check requests and responses

### Database Verification
```bash
# Connect to database
psql $DATABASE_URL

# Check user was created
SELECT id, email, firstName, lastName FROM "User" WHERE email = 'test@example.com';

# Check addresses
SELECT * FROM "Address" WHERE userId = '[user-id]';

# Check wishlist
SELECT * FROM "WishlistItem" WHERE userId = '[user-id]';
```

---

## 🆘 Common Issues & Solutions

### Issue: Redirect to /login after clicking account tab
**Solution:**
- Check if auth-token cookie is set
- Verify JWT_SECRET environment variable is set correctly
- Check token hasn't expired (7 days)
- Try logging out and logging back in

### Issue: Cannot update profile
**Solution:**
- Check network requests in DevTools
- Verify all required fields are provided
- Check API response for error messages
- Ensure you're using PATCH method (not PUT)

### Issue: Address not saving
**Solution:**
- Ensure street, city, country are provided
- Check for validation errors in response
- Verify database connection is working
- Check Prisma schema for Address model

### Issue: API returns 401 Unauthorized
**Solution:**
- Verify user is logged in (check auth-token cookie)
- Token might have expired - try logging in again
- Check middleware.ts includes the route in matcher config
- Verify JWT_SECRET environment variable

### Issue: Password change fails
**Solution:**
- Verify current password is correct (case-sensitive)
- New password must be different from old password
- New password must be at least 8 characters
- New password and confirm password must match

---

## 📱 Mobile Testing

The account dashboard is fully responsive. Test on:
- ✅ Mobile phones (375px - 425px width)
- ✅ Tablets (768px width)
- ✅ Desktop (1024px+ width)

All tabs and forms should be accessible and functional on all screen sizes.

---

## 🔐 Security Verification

```bash
# Test rate limiting on login (should fail after 10 attempts)
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
  echo "Attempt $i"
done
```

Expected: After 10 attempts, should receive 429 (Too Many Requests)

---

## 📈 Performance Optimization

- Order history uses pagination (default 10 items per page)
- Sidebar is sticky on desktop for better UX
- Components use React.useState for local state
- API calls are optimized with selective field selection

---

## 🎯 Next Steps

1. ✅ Test all features in development
2. ✅ Verify all validations work correctly
3. ✅ Test on mobile/tablet devices
4. ✅ Perform security testing (sql injection, xss, etc.)
5. ✅ Load testing with multiple concurrent users
6. ✅ Database backup/recovery testing
7. 🚀 Deploy to staging environment
8. 🚀 Get user feedback
9. 🚀 Deploy to production

---

**Need Help?** 
- Check API response status codes
- Review browser console for JavaScript errors
- Check database for data persistence
- Verify environment variables are set
- Review middleware.ts for route protection

**Last Updated:** February 24, 2026
