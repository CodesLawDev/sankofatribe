# Admin System - Quick Start Guide

## 🚀 Launching the Admin Panel

### Step 1: Create Your First Admin User

#### Using Sanity Studio (Recommended)
1. **Open Sanity Studio**
   ```
   Go to http://localhost:3000/studio
   ```

2. **Create a New User Document**
   - Click "Create document"
   - Select "User"
   - Fill in these fields:
     - **Email**: Your admin email (e.g., `admin@sankofatribe.com`)
     - **First Name**: Your first name
     - **Last Name**: Your last name
     - **Role**: Select "admin"
     - **Phone**: (optional) Your phone number
     - **Is Active**: Toggle ON

3. **Generate Password Hash**
   
   You have two options:

   **Option A: Quick (Use Online PBKDF2 Tool)**
   - Visit: https://github.com/mlomb/pbkdf2-hmac-sha512-javascript
   - Password: `YourSecurePassword123`
   - Salt: Generate random (copy the salt)
   - Iterations: `100000`
   - Output: Copy the resulting hash

   **Option B: Terminal Command**
   ```bash
   node
   ```
   
   Then paste this code:
   ```javascript
   const crypto = require('crypto');
   
   // Define your password and iterations
   const password = 'YourSecurePassword123';  // Change this!
   const iterations = 100000;
   
   // Generate a random salt
   const salt = crypto.randomBytes(32).toString('hex');
   
   // Generate the hash
   const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
   
   // Combine salt and hash (format: salt:hash)
   console.log(`${salt}:${hash}`);
   ```
   
   Copy the output (it will be a long string like `abc123...:def456...`)

4. **Add Password Hash to Sanity**
   - In the User document, scroll to "Password Hash" field
   - Paste the entire `salt:hash` string
   - Click "Publish"

5. **Test Your Login**
   ```
   Go to http://localhost:3000/admin/login
   ```
   - Email: The email you entered
   - Password: The password you set in Step 3B
   - Click "Sign in"

### Step 2: Complete First-Time Setup

Once logged in, you'll see the Admin Dashboard. Complete these steps:

#### 1. Update Site Settings
1. Click "Settings" in the dashboard
2. Update these important fields:
   - **Site Name**: "Sankofa Tribe"
   - **Admin Phone**: Your business phone
   - **SMS Sender ID**: Your sender name (max 11 characters)
   - **Exchange Rate**: Set current GHS to USD rate (e.g., 0.082)

3. Click "Save Changes"

#### 2. Create Additional Admin Users
1. Click "Team" in the dashboard
2. Fill in the "Create New User" form:
   - Email
   - First & Last Name
   - Role: "Admin" or "User"
   - Permissions (auto-selected for Admin)

3. Click "Create User"
4. A temporary password will be generated
5. Share this with the new user (they can change it later)

#### 3. Check Your Analytics
1. Click "Analytics" in the dashboard
2. You should see:
   - Total Orders
   - Total Revenue
   - Average Order Value
   - Customer Count
   - Revenue trends
   - Top products

---

## 📋 Admin Features Overview

### Dashboard (`/admin`)
- Welcome message
- Quick links to all admin areas
- Current user info

### Settings (`/admin/settings`)
- Site configuration
- Exchange rate management
- SMS settings
- Phone numbers

### Team Management (`/admin/team`)
- Create new users
- Assign roles
- Set permissions
- View user list

### Analytics (`/admin/analytics`)
- Business metrics
- Revenue trends
- Top products
- Order status breakdown

---

## 🔑 Permissions Explained

When creating "User" role accounts, you can give them specific permissions:

- **view_orders** - See customer orders
- **manage_orders** - Modify orders, mark as complete
- **view_products** - Browse products
- **manage_products** - Create/edit products
- **view_customers** - See customer information
- **manage_customers** - Edit customer details
- **view_settings** - See site settings
- **manage_settings** - Change settings
- **view_analytics** - See dashboard analytics
- **manage_users** - Create/edit/delete users
- **send_sms** - Send SMS to customers

**Admin users** have all permissions automatically.

---

## 🔒 Password Security

Passwords are stored using **PBKDF2-SHA512** with:
- 100,000 iterations (secure)
- Unique salt per password
- Hashed, never plain text

When creating users, they get a temporary password that they should change on first login.

---

## 🌍 Currency Conversion

The system automatically detects user location:
- **Ghana** (GH) users → See prices in GHS (₵)
- **Other countries** → See prices in USD ($)

Prices are automatically converted based on the exchange rate you set in Settings.

---

## ❓ Common Questions

### Q: I forgot my password?
**A:** For now, you need to regenerate the hash in Sanity Studio. This will be automated in a future update.

### Q: How do I reset a user's password?
**A:** Create a new temporary password by editing the user in Sanity Studio and regenerating the password hash.

### Q: Can I edit users from the Team page?
**A:** Currently, the Team page allows creating users. Editing is coming soon. Use Sanity Studio to edit existing users.

### Q: The exchange rate isn't updating for customers?
**A:** The rate updates when customers refresh their browser. Consider adding a notification when rates change.

### Q: How are new orders reflected in Analytics?
**A:** Analytics pulls data directly from Sanity in real-time. New orders appear immediately after creation.

---

## 🐛 Troubleshooting

### Login Not Working
1. Double-check your email (case-sensitive)
2. Verify the password you created (case-sensitive)
3. Check that the user's "Is Active" toggle is ON in Sanity
4. Open browser console (F12) and check for errors

### Missing Features
1. Verify your user role is "admin"
2. If "user" role, check that required permissions are assigned
3. Try logging out and back in
4. Hard refresh browser (Ctrl+Shift+R)

### Settings Won't Save
1. Check browser console for error messages
2. Verify you have "manage_settings" permission
3. Make sure you clicked "Save Changes"
4. Check network tab in DevTools

### Analytics Show No Data
1. Verify orders exist in Sanity
2. Check you have "view_analytics" permission
3. Refresh the page
4. Check browser console for API errors

---

## 📱 Mobile Considerations

The admin panel is best viewed on desktop (1024px+). Some features may not work well on mobile yet.

---

## 🔄 Regular Maintenance

### Daily
- Check new orders
- Review analytics trends
- Respond to customer inquiries

### Weekly
- Update exchange rates if needed
- Review top selling products
- Check team activity

### Monthly
- Review analytics reports
- Update product prices if needed
- Check server logs

---

## 🎯 Next Steps

1. ✅ Create first admin user
2. ✅ Update site settings
3. ✅ Create team members
4. ✅ Configure SMS alerts
5. ⭕ Set up email notifications (coming soon)
6. ⭕ Configure social media links (coming soon)
7. ⭕ Set up scheduled reports (coming soon)

---

## 📞 Support

For issues or questions:
1. Check the ADMIN_IMPLEMENTATION.md file for detailed docs
2. Review browser console (F12) for error messages
3. Check Sanity Studio for data validation issues
4. Review API logs in terminal

---

**Ready to get started? Go to http://localhost:3000/admin/login!**
