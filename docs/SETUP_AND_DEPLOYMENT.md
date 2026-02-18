# SANKOFA TRIBE - Setup & Deployment Guide

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ (verify with `node --version`)
- npm or yarn package manager
- Git for version control
- A Sanity CMS project (already configured)
- Paystack account for payment processing

---

## 🔧 Installation & Setup

### Step 1: Install Dependencies
```bash
# Install all packages including new PWA and auth dependencies
npm install

# Or using yarn
yarn install
```

### Step 2: Environment Configuration

Create a `.env.local` file in the root directory:

```env
# ============================================
# Authentication
# ============================================
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production

# ============================================
# Payment Processing (Paystack)
# ============================================
# Get from: https://dashboard.paystack.com/settings/developers
PAYSTACK_SECRET_KEY=sk_live_your_paystack_secret_key

# ============================================
# Sanity CMS Configuration (Existing)
# ============================================
NEXT_PUBLIC_SANITY_PROJECT_ID=your-sanity-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your-sanity-api-token

# ============================================
# Paystack Configuration
# ============================================
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your_paystack_key
PAYSTACK_SECRET_KEY=sk_live_your_paystack_key

# ============================================
# Database URL (if using external DB)
# ============================================
# DATABASE_URL=your-database-url

# ============================================
# Email Service (Optional - for order notifications)
# ============================================
# SENDGRID_API_KEY=your-sendgrid-key
# EMAIL_FROM=noreply@sankofatribe.com

# ============================================
# SMS Service (Optional - Twilio for notifications)
# ============================================
# TWILIO_ACCOUNT_SID=your-twilio-sid
# TWILIO_AUTH_TOKEN=your-twilio-token
# TWILIO_PHONE_NUMBER=+1234567890

# ============================================
# Analytics (Optional)
# ============================================
# NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

### Step 3: Generate JWT Secret

Generate a secure JWT secret:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or using openssl
openssl rand -hex 32
```

Copy the output and set it as `JWT_SECRET` in `.env.local`

---

## 📋 Sanity CMS Configuration

### Create AdminUser Schema

Add to your Sanity schemas (`sanity/schemas/index.ts`):

```typescript
// sanity/schemas/adminUser.ts
export default {
  name: 'adminUser',
  title: 'Admin User',
  type: 'document',
  fields: [
    {
      name: 'username',
      title: 'Username',
      type: 'string',
      validation: Rule => Rule.required().min(3),
      isHighlighted: true,
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: Rule => Rule.required().email(),
    },
    {
      name: 'password',
      title: 'Password (Hashed)',
      type: 'string',
      hidden: true,
    },
    {
      name: 'role',
      title: 'Role',
      type: 'string',
      options: {
        list: [
          { title: 'Admin', value: 'admin' },
          { title: 'Manager', value: 'manager' },
          { title: 'Editor', value: 'editor' },
        ],
      },
      validation: Rule => Rule.required(),
    },
    {
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      initialValue: true,
    },
    {
      name: 'lastLogin',
      title: 'Last Login',
      type: 'datetime',
      readOnly: true,
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    },
  ],
  preview: {
    select: {
      title: 'username',
      role: 'role',
    },
    prepare(selection) {
      return {
        title: selection.title,
        subtitle: selection.role,
      }
    },
  },
}
```

### Create Admin User via Script

Create `scripts/create-admin.mjs`:

```javascript
import sanityClient from '@sanity/client'
import bcrypt from 'bcryptjs'

const client = sanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2023-05-03',
  useCdn: false,
})

async function createAdmin() {
  const username = process.argv[2] || 'admin'
  const email = process.argv[3] || 'admin@sankofatribe.com'
  const password = process.argv[4] || 'Change@Me123'

  if (password.length < 8) {
    console.error('❌ Password must be at least 8 characters')
    process.exit(1)
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10)

    const adminUser = await client.create({
      _type: 'adminUser',
      username,
      email,
      password: hashedPassword,
      role: 'admin',
      isActive: true,
    })

    console.log('✅ Admin user created successfully!')
    console.log(`Username: ${username}`)
    console.log(`Email: ${email}`)
    console.log(`ID: ${adminUser._id}`)
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message)
    process.exit(1)
  }
}

createAdmin()
```

Run:
```bash
node scripts/create-admin.mjs admin admin@sankofatribe.com YourPassword123
```

---

## 🧪 Development

### Run Development Server
```bash
npm run dev

# Server runs at http://localhost:3000
```

### Test Admin Login
1. Navigate to `http://localhost:3000/admin/login`
2. Enter admin credentials created via script
3. Should see admin dashboard at `http://localhost:3000/admin/dashboard`

### Test Dark Mode
1. Look for theme toggle button in header
2. Click to switch between light/dark modes
3. Preference should persist on page reload

### Test PWA (Optional)
```bash
# Build for production to see service worker
npm run build
npm run start

# In Chrome DevTools:
# Application → Service Workers → Should show registered service worker
# Application → Manifest → Should show app manifest
```

---

## 🔐 Authentication Testing

### Login Flow
```bash
# Test successful login
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "YourPassword123"
}

# Expected Response (200 OK)
{
  "success": true,
  "user": {
    "id": "...",
    "username": "admin",
    "email": "admin@sankofatribe.com",
    "role": "admin"
  }
}
```

### Logout Flow
```bash
POST http://localhost:3000/api/auth/logout

# Expected Response (200 OK)
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Session Check
```bash
GET http://localhost:3000/api/admin/session

# Expected Response (200 OK if authenticated)
{
  "success": true,
  "user": { ... }
}

# Expected Response (401 if not authenticated)
{
  "error": "Not authenticated"
}
```

---

## 💳 Payment Testing

### Initialize Paystack Payment
```bash
POST http://localhost:3000/api/payment/initialize
Content-Type: application/json

{
  "email": "customer@example.com",
  "amount": 99.99,
  "channels": ["card", "bank", "mobile_money"],
  "metadata": {
    "orderId": "order-123",
    "customerName": "John Doe"
  }
}

# Expected Response (200 OK)
{
  "success": true,
  "data": {
    "authorization_url": "https://checkout.paystack.com/...",
    "access_code": "...",
    "reference": "REF-1234567890"
  }
}
```

### Verify Payment
```bash
POST http://localhost:3000/api/payment/verify
Content-Type: application/json

{
  "reference": "REF-1234567890"
}

# Expected Response (200 OK)
{
  "success": true,
  "data": {
    "status": true,
    "reference": "REF-1234567890",
    "amount": 9999,
    "paid_at": "2024-01-15T10:30:00.000Z",
    "customer": {
      "id": 123,
      "email": "customer@example.com"
    }
  }
}
```

---

## 📦 Production Deployment

### Build for Production
```bash
npm run build

# Check for build errors
# Output will be in .next/ directory
```

### Deploy to Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Push to GitHub, GitLab, or Bitbucket
   git add .
   git commit -m "Feature integration complete"
   git push
   ```

2. **Deploy via Vercel**
   - Go to https://vercel.com/import
   - Select your Git repository
   - Configure environment variables
   - Click Deploy

3. **Set Production Environment Variables**
   In Vercel dashboard → Settings → Environment Variables:
   ```
   JWT_SECRET=<production-secret>
   PAYSTACK_SECRET_KEY=<live-paystack-key>
   NEXT_PUBLIC_SANITY_PROJECT_ID=<your-project-id>
   NEXT_PUBLIC_SANITY_DATASET=production
   SANITY_API_TOKEN=<your-token>
   PAYSTACK_SECRET_KEY=<live-paystack-key>
   ```

### Alternative: Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY .next ./
COPY public ./public
COPY .env.local ./

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t sankofatribe .
docker run -p 3000:3000 -e JWT_SECRET=... sankofatribe
```

---

## 🔍 Monitoring & Maintenance

### Check Application Health
```bash
# Check all services running
curl http://localhost:3000/health

# Check admin authentication
curl http://localhost:3000/api/admin/session

# Check payment integration
curl -X POST http://localhost:3000/api/payment/initialize \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","amount":100}'
```

### View Logs
```bash
# Development logs (already in console)
npm run dev

# Production logs (in Vercel or Docker console)
# Vercel: https://vercel.com/dashboard → Deployments → Logs
```

### Database Maintenance (if using DB)
```bash
# Run migrations
npm run migrate

# Backup database
npm run backup:db
```

---

## 🚨 Troubleshooting

### Issue: "Cannot find module 'next-themes'"
**Solution:**
```bash
npm install next-themes
npm run build
```

### Issue: Admin login returns 401
**Checklist:**
- [ ] Admin user exists in Sanity
- [ ] Password is hashed with bcryptjs
- [ ] JWT_SECRET is set in .env.local
- [ ] Credentials exactly match (case-sensitive)

### Issue: Paystack payment fails
**Checklist:**
- [ ] PAYSTACK_SECRET_KEY is set correctly
- [ ] Using live keys in production
- [ ] Email format is valid
- [ ] Amount is in kobo (≥100 for ₵1.00)
- [ ] Callback URL is accessible

### Issue: Dark mode not working
**Checklist:**
- [ ] next-themes is installed
- [ ] tailwind.config.ts has `darkMode: 'class'`
- [ ] HTML has `suppressHydrationWarning`
- [ ] Clear browser cache and cookies

### Issue: PWA not installing
**Checklist:**
- [ ] HTTPS enabled (PWA requires HTTPS)
- [ ] manifest.json is valid
- [ ] Icons exist at correct paths
- [ ] Service worker registered (check DevTools)

---

## 📞 Support Resources

- **Sanity Documentation**: https://www.sanity.io/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Paystack Documentation**: https://paystack.com/docs
- **next-themes**: https://github.com/pacocoursey/next-themes
- **next-pwa**: https://github.com/shadowwalker/next-pwa
- **JWT (jose)**: https://github.com/panva/jose
- **bcryptjs**: https://github.com/dcodeIO/bcrypt.js

---

## ✅ Pre-Launch Checklist

- [ ] All environment variables configured
- [ ] Admin user created in Sanity
- [ ] JWT_SECRET generated and secure
- [ ] Paystack account set up and keys added
- [ ] Dark mode tested in light/dark themes
- [ ] Admin login working
- [ ] Admin dashboard displaying
- [ ] Payment initialization working
- [ ] PWA manifest accessible
- [ ] All dependencies installed
- [ ] Build completes without errors
- [ ] No console errors in development
- [ ] Team trained on admin dashboard
- [ ] Backup strategy in place
- [ ] Monitoring set up

---

## 🎉 You're Ready!

Your SANKOFA TRIBE e-commerce platform with Nike-style redesign, JWT authentication, Paystack payments, dark mode, and PWA support is ready for launch.

**Next Steps:**
1. Create admin user
2. Add first products
3. Test payment flow
4. Deploy to production
5. Monitor and optimize

Good luck! 🚀
