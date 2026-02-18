# Sankofa Tribe - Admin System Quick Reference

## 🔗 Critical URLs

| Page | URL | Purpose |
|------|-----|---------|
| Admin Dashboard | `/admin` | Main control center |
| Login | `/admin/login` | Authentication |
| Settings | `/admin/settings` | Site config |
| Team | `/admin/team` | User management |
| Analytics | `/admin/analytics` | Metrics |
| Sanity Studio | `/studio` | CMS |

## 🚀 Quick Start (5 Minutes)

### 1. Create First Admin User
```bash
Go to: http://localhost:3000/studio
Create new User document:
- Email: admin@example.com
- First Name: Admin
- Last Name: User
- Role: admin
- Is Active: ON

Generate password hash in Node.js:
node
const crypto = require('crypto');
const password = 'YourPassword123';
const iterations = 100000;
const salt = crypto.randomBytes(32).toString('hex');
const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
console.log(`${salt}:${hash}`);

Paste result into passwordHash field
Click Publish
```

### 2. Login to Admin Panel
```
http://localhost:3000/admin/login
Email: admin@example.com
Password: YourPassword123
Click: Sign In
```

### 3. Configure Settings
```
Go to: http://localhost:3000/admin/settings
Update:
- Site Name
- Admin Phone
- SMS Sender ID  
- Exchange Rate
Click: Save Changes
```

## 🔑 User Roles & Permissions

### Admin Role
- ✅ Full access (all permissions automatically)
- ✅ Manage all users
- ✅ Configure all settings
- ✅ View all analytics

### User Role (Custom)
- Based on assigned permissions
- 11 available permissions (see list below)

### Available Permissions (11 Total)
```
view_orders              Viewing orders
manage_orders           Creating/editing orders
view_products           Viewing products
manage_products         Creating/editing products
view_customers          Viewing customers
manage_customers        Editing customers
view_settings           Viewing settings
manage_settings         Editing settings (including exchange rate)
view_analytics          Viewing analytics
manage_users            Creating/managing users
send_sms                Sending SMS notifications
```

## 🔌 API Endpoints

### Auth
```bash
POST /api/admin/auth/login
POST /api/admin/auth/logout
```

### Users
```bash
GET  /api/admin/users
POST /api/admin/users
```

### Settings
```bash
GET /api/admin/settings
PUT /api/admin/settings
```

### Analytics
```bash
GET /api/admin/stats
```

## 🌍 Currency System

### How It Works
1. **Auto-Detection**: Browser locale → Country code
2. **Mapping**: Ghana (GH) → GHS, Others → USD
3. **Conversion**: Admin sets exchange rate (1 GHS = X USD)
4. **Display**: Prices shown in user's currency

### Usage in Components
```javascript
const { currency, exchangeRate, convertPrice, formatPrice } = useCurrency()

// Convert price from GHS to user's currency
const convertedPrice = convertPrice(100)  // e.g., 8.2 USD

// Format for display with currency symbol
const display = formatPrice(100)  // "₵100.00" or "$99.99"
```

## 🔐 Security

| Feature | Details |
|---------|---------|
| Password Hash | PBKDF2-SHA512 (100,000 iterations) |
| Salt | 32 bytes per password |
| Session | 24-hour token expiry |
| Storage | Browser localStorage |
| Validation | Constant-time comparison |

## 📊 Admin Dashboard Features

### Overview
- Site name display
- Admin info
- Current exchange rate
- Quick links to all features

### Settings
- Site name & description
- Admin phone & SMS sender ID
- Exchange rate management
- Real-time validation

### Team Management
- Create new users
- Assign roles & permissions
- View user list
- Manage permissions

### Analytics
- Total orders & revenue
- Average order value
- Pending vs completed orders
- Top products by revenue
- 7-day revenue trend
- Customer count

## 🧪 Testing Checklist

- [ ] Login with admin credentials
- [ ] Create new user
- [ ] Assign permissions
- [ ] Update exchange rate
- [ ] View analytics dashboard
- [ ] Check currency conversion (switch countries)
- [ ] Test logout
- [ ] Verify session persistence
- [ ] Check error messages

## 🛠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't login | Verify user exists in Sanity, check isActive=ON |
| Permission denied | Check user permissions in Sanity document |
| Settings won't save | Check browser console, verify permission |
| Currency not updating | Hard refresh (Ctrl+Shift+R), check exchange rate |
| Analytics empty | Verify orders exist in Sanity, check permission |

## 📚 Documentation

- **ADMIN_QUICKSTART.md** - Detailed setup guide
- **ADMIN_IMPLEMENTATION.md** - Complete API reference
- **SYSTEM_SUMMARY.md** - Architecture overview
- **DOCUMENTATION_INDEX.md** - All docs navigation
- **COMPLETION_SUMMARY.md** - What was implemented

## ⚙️ Environment Variables

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=u3ligoj7
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_WRITE_TOKEN=your_token
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxx
PAYSTACK_SECRET_KEY=sk_test_xxx
```

## 🚀 Common Commands

```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run sanity:dev       # Start Sanity Studio
npm run lint             # Run linter
```

## 💾 Database Structure

### User Schema
```
_id, email, firstName, lastName, passwordHash, role, permissions, 
phone, isActive, lastLogin, createdAt
```

### Site Settings
```
siteName, description, adminPhone, senderId,
currency { defaultCurrency, exchangeRate, lastUpdated },
geoLocation { ghanaCurrencyCountries, defaultCountry }
```

## 🎯 Quick Tips

1. **Create First User**: Via Sanity Studio (easier than API)
2. **Change Password**: Edit user in Sanity, regenerate hash
3. **View Logs**: Check terminal for API logs
4. **Test Login**: Use admin/admin initially
5. **Reset Session**: Clear localStorage["adminSession"]
6. **Debug Permission**: Check browser console
7. **Update Rate**: In Admin Settings page
8. **Export Data**: Use Sanity export tool
9. **Backup**: Regular Sanity backups
10. **Monitor**: Check analytics daily

## ✅ Status

- ✅ Admin authentication
- ✅ User management
- ✅ Settings control
- ✅ Analytics dashboard
- ✅ Currency conversion
- ✅ Cart quantities
- ✅ Full documentation
- ✅ Production ready

---

**Version**: 1.0.0 | **Updated**: December 2024 | **Status**: COMPLETE ✅
