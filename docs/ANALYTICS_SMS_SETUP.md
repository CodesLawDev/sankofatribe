# Analytics & Monthly SMS Reports Setup Guide

This guide explains how to set up comprehensive analytics tracking and automated monthly SMS reports for your Sankofa Tribe admin dashboard.

## 📊 Features Implemented

✅ **Site Visit Tracking** - Tracks all page views with IP, device, and referrer data
✅ **Order Analytics** - Total orders, revenue, payment success/failure rates
✅ **Customer Metrics** - New customer signups, unique visitors
✅ **Admin Dashboard** - Beautiful UI showing all key metrics
✅ **SMS Reports** - Monthly analytics sent via SMS to admin phone numbers

---

## 🗄️ Database Setup

### 1. Run Prisma Migration

First, generate and apply the database migration for the new analytics tables:

```bash
npx prisma generate
npx prisma db push
```

This will create two new tables:
- `PageView` - Stores every site visit with metadata
- `MonthlyReport` - Stores monthly analytics summaries and SMS status

---

## 📱 BMS SMS Configuration

### Using Your Existing BMS Integration

The analytics SMS reports use your **existing BMS SMS service** - no additional configuration needed!

**Already Configured:**
- ✅ `BMS_API_KEY` is set in your environment
- ✅ BMS endpoint: `bms.codeslaw.dev`
- ✅ API integration is active via `lib/sms-service.ts`

### Admin Phone Configuration

Admin phone numbers are now pulled directly from **Sanity CMS**:

1. Go to `/studio` → Site Settings
2. Find the **Admin Phone Number** field
3. Enter your phone number(s) with country code: `+233123456789`
4. For multiple admins, separate with commas: `+233123456789,+233987654321`

**Important Notes:**
- Phone numbers must include country code (e.g., +233 for Ghana)
- Use commas to add multiple admin phone numbers
- Changes in Sanity are instantly reflected in SMS reports
- No environment variables needed - all config is in Sanity

---

## 🔄 Automated Monthly Reports via GitHub Actions

### Setup GitHub Actions Cron

The monthly analytics report is automated using **GitHub Actions**, which runs reliably and is free for public/private repos.

The workflow `.github/workflows/monthly-report.yml` is already created and scheduled to:
- Run on the **1st of every month at 9 AM UTC**
- Trigger your `/api/cron/monthly-report` endpoint
- Generate and send the monthly SMS report

### Configure GitHub Secrets

GitHub Actions needs two secrets to call your production endpoint:

1. **Navigate to your repository settings:**
   - Go to your GitHub repo → Settings → Secrets and variables → Actions

2. **Create two secrets:**

   **`BASE_URL`** (Production domain)
   ```
   https://sankofatribe.com
   ```
   
   **`CRON_SECRET`** (Authorization token)
   ```
   your_random_secret_min_32_characters
   ```

3. **Ensure your production `.env` has matching `CRON_SECRET`:**
   ```env
   CRON_SECRET=your_random_secret_min_32_characters
   ```

### How It Works

1. GitHub Actions scheduler triggers on 1st of month at 9 AM UTC
2. Workflow makes HTTP GET request to `/api/cron/monthly-report`
3. Request includes: `Authorization: Bearer {CRON_SECRET}`
4. Your endpoint validates the token
5. Analytics are aggregated from the database
6. SMS is sent to admin phone numbers (from Sanity CMS)
7. Report is saved to `MonthlyReport` table

### View Execution Logs

To check if the cron job ran successfully:

1. Go to your GitHub repo → **Actions** tab
2. Find **"Monthly Analytics Report"** workflow
3. View the latest run
4. Check logs for success or errors

### Manual Trigger (Testing)

You can manually trigger the workflow:

1. Go to GitHub repo → **Actions** tab
2. Click **"Monthly Analytics Report"** workflow
3. Click **"Run workflow"** button
4. Monitor logs to verify it worked

### Change Schedule (Optional)

To modify when reports run, edit `.github/workflows/monthly-report.yml`:

```yaml
schedule:
  - cron: '0 9 1 * *'  # Change this line
```

**Cron format:** `minute hour day month dayofweek`
- `0 9 1 * *` = 9 AM on 1st of each month
- `0 14 * * 0` = 2 PM every Sunday
- Use [crontab.guru](https://crontab.guru) for reference

---

## 📈 Using the Analytics Dashboard

### Viewing Current Month Metrics

The main admin dashboard (`/admin`) now shows:
- **Total Orders** - All orders this month
- **Total Revenue** - Revenue from successful orders
- **Site Visits** - Total page views
- **Unique Visitors** - Distinct users/sessions
- **New Customers** - New user registrations
- **Successful Payments** - Orders with payment success
- **Failed Payments** - Orders with payment failures

### Viewing Detailed Analytics

Go to `/admin/analytics` for:
- Daily charts of traffic and orders
- Device breakdown (mobile/tablet/desktop)
- Top pages by visits
- Payment success rates
- Average order value
- Custom date range selection

### API Endpoints

**Get Current Month Analytics:**
```bash
GET /api/admin/analytics?period=month
```

**Get Specific Month:**
```bash
GET /api/admin/analytics?period=month&month=12&year=2025
```

**Generate & Send Monthly Report:**
```bash
POST /api/admin/analytics/monthly-report
```

**Check Report Status:**
```bash
GET /api/admin/analytics/monthly-report?month=1&year=2026
```

---

## 📱 SMS Report Format

The monthly SMS will look like this:

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

## 🔧 Troubleshooting

### SMS Not Sending

1. **Check BMS API key**: Verify `BMS_API_KEY` is set in production environment
2. **Check admin phone in Sanity**: Go to `/studio` → Site Settings → Admin Phone Number
3. **Phone number format**: Ensure numbers include country code (+233...)
4. **Check SMS logs**: Contact BMS support for delivery logs

### Analytics Not Tracking

1. **Run migration**: Ensure `npx prisma db push` completed successfully
2. **Check browser console**: Look for errors when visiting pages
3. **Database connection**: Verify `DATABASE_URL` is correct
4. **Session cookies**: Check if `analytics_session` cookie is being set

### Cron Job Not Running

1. **Check GitHub Actions logs**: Repository → Actions → Monthly Analytics Report
2. **Verify GitHub Secrets**: Ensure `BASE_URL` and `CRON_SECRET` are set correctly
3. **Verify production env**: Ensure `CRON_SECRET` matches between GitHub Secrets and production `.env`
4. **Check workflow file**: Ensure `.github/workflows/monthly-report.yml` is committed

---

## 🚀 Testing

### Test Page View Tracking

```bash
curl -X POST https://your-site.com/api/analytics/track \
  -H "Content-Type: application/json" \
  -d '{"path": "/products", "referrer": "https://google.com"}'
```

### Test Monthly Report (Manual via GitHub Actions)

1. Go to GitHub repo → **Actions** → **Monthly Analytics Report**
2. Click **"Run workflow"** → **"Run workflow"**
3. Wait for it to complete
4. Check your phone for the SMS message

### Test Monthly Report (Manual via Curl)

```bash
curl -X GET https://your-site.com/api/cron/monthly-report \
  -H "Authorization: Bearer your_cron_secret"
```

### Test SMS Service

Create a test endpoint `app/api/test-sms/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { sendSMS } from '@/lib/sms-service'

export async function GET() {
  try {
    // Get admin phone from Sanity
    const { serverClient } = await import('@/sanity/lib/client')
    const settings = await serverClient.fetch<{ adminPhone?: string }>(
      `*[_type == "siteSettings"][0]{adminPhone}`
    )
    
    const result = await sendSMS(
      settings?.adminPhone || '',
      'Test message from Sankofa Tribe Analytics'
    )
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

Visit: `https://your-site.com/api/test-sms`

---

## 💰 Cost Estimates

### BMS SMS Pricing

Your existing BMS plan covers the monthly analytics SMS reports - **no additional costs!**

Check your current BMS pricing with their support for details on per-message rates.

### GitHub Actions

- **Cost**: **FREE** ✅
- **Free tier**: Thousands of free runs per month
- **Reliability**: 99.9% uptime SLA

### Database Storage

- **PageView records**: ~1KB per record
- **100,000 views/month**: ~100MB storage
- **PostgreSQL**: Included in most hosting plans

---

## 📝 Next Steps

1. ✅ Run database migration
2. ✅ Configure admin phone in Sanity
3. ✅ Set up GitHub Secrets (`BASE_URL`, `CRON_SECRET`)
4. ✅ Test SMS delivery
5. ✅ Monitor analytics dashboard

---

## 🔐 Security Considerations

- **Cron secret**: Use a strong random string (at least 32 characters)
- **API authentication**: Ensure all admin endpoints verify admin role
- **Rate limiting**: Consider adding rate limits to prevent abuse
- **Phone number validation**: Numbers are validated and formatted automatically

---

## 📞 Support

If you need help:
1. Check GitHub Actions logs for cron job issues: Repository → Actions → Monthly Analytics Report
2. Check BMS dashboard for SMS delivery logs
3. Check browser console for tracking issues
4. Review database for stored PageView records

---

**Setup Complete! 🎉**

Your admin dashboard now tracks:
- ✅ Total orders
- ✅ Payments (successful & failed)
- ✅ Store visits
- ✅ New customers
- ✅ Monthly SMS reports
