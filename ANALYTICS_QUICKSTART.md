# 📊 Analytics & SMS Reports - Quick Start

## What Was Implemented

✅ **Comprehensive Analytics System**
- Site visit tracking (page views, unique visitors, device types)
- Order and payment metrics
- Customer growth tracking
- Admin dashboard with real-time metrics

✅ **Monthly SMS Reports**
- Automated SMS delivery via Twilio
- Monthly summaries of orders, revenue, traffic, and customers
- Support for multiple admin phone numbers

---

## 🚀 Quick Setup (2 Steps)

### Step 1: Database Migration
```bash
npx prisma generate
npx prisma db push
```

### Step 2: Configure Environment Variables
Add to your `.env.local`:
```env
CRON_SECRET=your_random_secret_32_chars_min
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

**Note**: 
- Admin phone number is pulled from Sanity `siteSettings.adminPhone`
- SMS uses your existing BMS provider
```bash
npm run build
git add .
git commit -m "feat: Add analytics and monthly SMS reports"
git push
### Step 3: Deploy
```bash
npm run build
git add .
git commit -m "feat: Add analytics and monthly SMS reports"
git push
```

---

## 📱 SMS Provider

**Using Your Existing BMS SMS Service**
- No additional SMS provider needed
- Uses existing `/api/sms` endpoint
- Already configured with `BMS_API_KEY`
- SMS sent through `bms.codeslaw.dev`

---

## 📈 What You'll See

### Admin Dashboard (`/admin`)
- Total Orders
- Total Revenue
- Site Visits (page views)
- Unique Visitors
- New Customers
- Successful Payments
- Failed Payments
- This Month's Performance summary

### Monthly SMS Format
```
🎉 Sankofa Tribe - January 2026 Report

📦 Orders: 145
💰 Revenue: GH₵45,890.50
💳 Payments: 142 successful, 3 failed

👥 Visitors: 12,456 views (3,890 unique)
🆕 New Customers: 67

Keep up the great work! 🚀
```

---

## 🔄 Automated Monthly Reports

**Vercel Cron Job** (configured in `vercel.json`):
- Runs automatically on the 1st of each month at 9 AM
- Sends SMS to all admin phone numbers
- No manual intervention needed

**Manual Trigger** (optional):
```bash
POST /api/admin/analytics/monthly-report
```

---

## 📊 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/analytics/track` | POST | Track page views |
| `/api/admin/analytics` | GET | Get analytics data |
| `/api/admin/analytics/monthly-report` | POST | Generate & send report |
| `/api/cron/monthly-report` | GET | Cron job trigger |

---

## 💰 Costs

- **BMS SMS**: Check your BMS plan pricing
- **No additional SMS provider needed**
- Uses your existing SMS credits/plan

---

## 📖 Full Documentation

See [ANALYTICS_SMS_SETUP.md](./ANALYTICS_SMS_SETUP.md) for:
- Detailed setup instructions
- Troubleshooting guide
- Testing procedures
- Security considerations
- Alternative scheduling options

---

## ✅ Files Created/Modified

### New Files
- `prisma/schema.prisma` - Added `PageView` and `MonthlyReport` models
- `lib/sms-service.ts` - Twilio SMS integration
- `app/api/analytics/track/route.ts` - Page view tracking
- `app/api/admin/analytics/route.ts` - Analytics aggregation
- `app/api/admin/analytics/monthly-report/route.ts` - Report generator
- `app/api/cron/monthly-report/route.ts` - Cron job endpoint
- `components/analytics-tracker.tsx` - Client-side tracking
- `vercel.json` - Cron job configuration
- `ANALYTICS_SMS_SETUP.md` - Complete setup guide

### Modified Files
- `app/admin/page.tsx` - Enhanced dashboard with analytics
- `app/layout.tsx` - Added analytics tracker
- `.env.local.example` - Added Twilio variables

---

## 🎯 Next Steps

1. Run `npx prisma db push` to create database tables
2. Add Twilio credentials to environment variables
3. Deploy to Vercel
4. Test by visiting your site (page views will be tracked)
5. Manually trigger first report to test SMS delivery
6. Wait until the 1st of next month for automated report

---

**Ready to track your store's success! 🚀**
