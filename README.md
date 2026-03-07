# Sankofa - Premium Fashion E-Commerce

A high-end fashion e-commerce website built with **Next.js 14** and **Sanity Studio v3**, featuring a minimalist Calvin Klein-inspired design.

## 🌟 Features

- **Modern E-Commerce**: Full-featured shopping cart, product variants (size, color), and checkout flow
- **Headless CMS**: Sanity Studio v3 for easy content management
- **Payment Integration**: Paystack checkout (primary)
- **Premium Design**: Calvin Klein-inspired minimalist aesthetic with smooth animations
- **Fully Responsive**: Mobile-first design that works on all devices
- **SEO Optimized**: Server-side rendering with Next.js App Router
- **Type-Safe**: Built with TypeScript for reliability

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Sanity account ([create one at sanity.io](https://www.sanity.io))
- A Paystack account ([create one at paystack.com](https://paystack.com))

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Sanity

Create a new Sanity project:

```bash
npm create sanity@latest
```

When prompted:
- Choose "Yes" to use the default dataset configuration
- Select "Clean project with no predefined schemas"
- Note your **Project ID** and **Dataset name**

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01

# Paystack (primary payment)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the website.

Access Sanity Studio at [http://localhost:3000/studio](http://localhost:3000/studio).

## 📝 Adding Content

### 1. Access Sanity Studio

Navigate to `http://localhost:3000/studio` and sign in with your Sanity account.

### 2. Create Content

**Site Settings** (do this first):
- Add your site name, description, and navigation links
- Upload a logo

**Categories**:
- Create categories (e.g., "Women", "Men", "Accessories")
- Add category images and descriptions

**Banners**:
- Create hero banners for the homepage
- Upload high-quality images (recommended: 1920x1080px)
- Add title, subtitle, and CTA button

**Products**:
- Add products with images, descriptions, prices
- Set available sizes and colors
- Link to categories
- Mark products as "featured" to show on homepage

**Homepage**:
- Select hero banners to display
- Choose featured products
- Select featured categories

## 🎨 Design Customization

The design uses a Calvin Klein-inspired color palette defined in `tailwind.config.ts`:

```typescript
colors: {
  'ck-black': '#000000',
  'ck-white': '#FFFFFF',
  'ck-gray': { /* various shades */ },
}
```

Modify these colors to match your brand identity.

## 💳 Payments

Paystack is the primary payment processor. Configure `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` and `PAYSTACK_SECRET_KEY` in your `.env` file. (Stripe has been removed.)

## 📦 Project Structure

```
sankofatribe/
├── app/                      # Next.js App Router pages
│   ├── page.tsx              # Homepage
│   ├── products/             # Product pages
│   ├── category/             # Category pages
│   ├── cart/                 # Shopping cart
│   ├── checkout/             # Checkout flow
│   ├── studio/               # Sanity Studio
│   └── api/                  # API routes
├── components/               # React components
│   ├── ui/                   # Base UI components
│   ├── header.tsx            # Navigation
│   ├── footer.tsx            # Footer
│   └── ...
├── lib/                      # Utilities
│   ├── sanity.ts             # Sanity client & types
│   ├── paystack.ts           # Paystack config
│   └── cart-context.tsx      # Cart state management
├── sanity/                   # CMS configuration
│   └── schemas/              # Content schemas
└── public/                   # Static assets
```

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Deploy Sanity Studio

Sanity Studio is automatically deployed with your Next.js app at `/studio`.

For a standalone deployment:

```bash
cd sanity
npx sanity deploy
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📚 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **CMS**: Sanity Studio v3
- **Styling**: TailwindCSS
- **Payment**: Stripe
- **Language**: TypeScript
- **State Management**: React Context API
- **Icons**: Lucide React

## 🤝 Support

For issues or questions:
- Sanity: [Sanity Documentation](https://www.sanity.io/docs)
- Next.js: [Next.js Documentation](https://nextjs.org/docs)
- Stripe: [Stripe Documentation](https://stripe.com/docs)

## 📄 License

This project is licensed under the MIT License.