# 🚀 Quick Start Guide - Sankofa Fashion Website

## What's Been Built

A complete high-end fashion e-commerce website with:
- ✅ Next.js 14 with App Router & TypeScript
- ✅ Sanity Studio v3 CMS
- ✅ Stripe payment integration
- ✅ Shopping cart with localStorage
- ✅ Calvin Klein-inspired minimal design
- ✅ Fully responsive layouts

## 📝 Setup Steps (5 minutes)

### 1. Create Sanity Project

Visit [sanity.io](https://www.sanity.io) and create a free account, then run:

```bash
npm create sanity@latest
```

Answer the prompts:
- **Project name**: Sankofa Fashion
- **Dataset**: production
- **Template**: Clean project

**Copy your Project ID** - you'll need it next!

### 2. Get Stripe Keys

1. Visit [stripe.com](https://stripe.com) and create an account
2. Go to [Dashboard → Developers → API Keys](https://dashboard.stripe.com/test/apikeys)
3. Copy your **Publishable Key** and **Secret Key** (use TEST mode)

### 3. Configure Environment

Create `.env.local` file:

```bash
# Copy the example file
copy .env.example .env
```

Edit `.env` and add your keys:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_actual_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_SECRET_KEY=sk_test_...

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

### 5. Add Content in Sanity Studio

1. Go to [http://localhost:3000/studio](http://localhost:3000/studio)
2. Sign in with your Sanity account
3. Add content in this order:

#### a) Site Settings
- Site name: "Sankofa"
- Description: Your site description
- Navigation menu items

#### b) Categories
Create categories like:
- Women
- Men
- Accessories

#### c) Banners
- Title: "New Collection"
- Subtitle: "Spring/Summer 2024"
- Upload an image (jpg/png, 1920x1080px recommended)
- CTA Text: "Shop Now"
- CTA Link: "/products"

#### d) Products
For each product:
- Name
- Upload 2-3 images
- Description
- Price
- Select sizes (XS, S, M, L, XL)
- Add colors (optional)
- Select category
- Check "Featured" for homepage display
- Check "In Stock"

#### e) Homepage
- Select 1-3 banners for hero carousel
- Select 4-8 featured products

## 🧪 Testing

### Test Shopping Cart
1. Browse products
2. Click a product → Select size → Add to cart
3. View cart (click cart icon)
4. Update quantities
5. Proceed to checkout

### Test Stripe (Test Mode)
Use test card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

## 🎨 Customization

### Change Colors
Edit `tailwind.config.ts`:
```typescript
colors: {
  'ck-black': '#000000',  // Change to your brand color
  'ck-white': '#FFFFFF',
  // ...
}
```

### Update Logo
Replace `public/logo.svg` with your logo

### Edit Navigation
Update links in `components/header.tsx`

## 📱 Project Structure

```
app/
  ├── page.tsx              → Homepage
  ├── products/             → Shop pages
  ├── cart/                 → Shopping cart
  ├── checkout/             → Checkout flow
  └── studio/               → Sanity CMS

components/
  ├── header.tsx            → Navigation
  ├── footer.tsx            → Footer
  └── ...                   → Other components

lib/
  ├── sanity.ts             → CMS client
  ├── stripe.ts             → Payments
  └── cart-context.tsx      → Cart state
```

## 🚀 Deployment to Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables (same as `.env.local`)
5. Deploy!

Your site will be live at `your-project.vercel.app`

## 🆘 Troubleshooting

**"Cannot find module" errors**
```bash
npm install
```

**Sanity Studio not loading**
- Check Project ID in `.env.local`
- Make sure you're signed in at `/studio`

**Images not showing**
- Add proper content in Sanity Studio
- Check images are uploaded

**Stripe checkout fails**
- Verify API keys in `.env.local`
- Use test mode keys for development

## 📚 Next Steps

1. ✅ Add your products in Sanity Studio
2. ✅ Customize colors and branding
3. ✅ Test all cart functionality
4. ✅ Deploy to Vercel
5. ✅ Connect custom domain

## 🎯 Features You Can Add Later

- User authentication
- Product search
- Product reviews
- Wishlist
- Email notifications
- Email marketing integration
- Advanced analytics

---

### 🔐 First Admin Setup (No Login Yet)
If this is your very first admin user and you cannot log in to reset passwords, use the bootstrap endpoint:

1. Ensure environment variables are set:
   - `SANITY_WRITE_TOKEN` (or `SANITY_API_TOKEN`) for server writes
   - Optional: `ADMIN_INIT_SECRET` to protect subsequent runs
2. Create a user in Studio with an email (or skip and create via API)
3. Call the init endpoint to set the password:

```bash
# If no user has a password yet, no secret is required
curl -X POST http://localhost:3000/api/admin/users/init \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "YourStrongPassword123",
    "firstName": "Admin",
    "lastName": "User"
  }'

# If any user already has a passwordHash, include your secret
curl -X POST http://localhost:3000/api/admin/users/init \
  -H "Content-Type: application/json" \
  -H "x-admin-init-secret: YOUR_SECRET" \
  -d '{
    "email": "admin@example.com",
    "password": "YourStrongPassword123"
  }'
```

After this, log in at `/admin/login` with the email and password you set.

**Need help?** Check the `README.md` for detailed documentation!
