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

## 📱 Twilio SMS Configuration

### 1. Sign Up for Twilio

1. Go to [https://www.twilio.com/](https://www.twilio.com/)
2. Sign up for a free account (you get $15.50 in free credit)
3. Get a Twilio phone number (free with trial)
4. Note down your **Account SID** and **Auth Token**

### 2. Add Environment Variables

Create or update your `.env.local` file with:

```env
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Admin Phone Number(s) - comma-separated for multiple admins
ADMIN_PHONE_NUMBER=+233123456789,+233987654321
```

**Important Notes:**
- Phone numbers must include country code (e.g., +233 for Ghana)
- Use commas to add multiple admin phone numbers
- Twilio trial accounts can only send to verified phone numbers

### 3. Verify Phone Numbers (Trial Account)

If using a trial account:
1. Go to Twilio Console → Phone Numbers → Verified Caller IDs
2. Add and verify each admin phone number
3. You'll receive a verification code via SMS

---

## 🔄 Automated Monthly Reports

### Option 1: Vercel Cron Jobs (Recommended)

Create `app/api/cron/monthly-report/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Vercel Cron Job - Runs monthly
 * Configure in vercel.json
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Call the monthly report API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/analytics/monthly-report`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ADMIN_API_KEY}`,
        },
      }
    )

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
```

Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/monthly-report",
      "schedule": "0 9 1 * *"
    }
  ]
}
```

Add to `.env.local`:

```env
CRON_SECRET=your_random_secret_here
ADMIN_API_KEY=your_admin_api_key_here
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

**Schedule Explanation:**
- `0 9 1 * *` = 9:00 AM on the 1st day of every month
- Adjust as needed (use [crontab.guru](https://crontab.guru) to help)

### Option 2: External Cron Service (Alternative)

Use a service like [cron-job.org](https://cron-job.org) or [EasyCron](https://easycron.com):

1. Create an endpoint URL: `https://your-site.com/api/admin/analytics/monthly-report`
2. Set authentication header with your admin token
3. Schedule to run monthly (1st of each month at 9 AM)

### Option 3: Manual Trigger

Admins can manually trigger the monthly report from the dashboard:

1. Go to Admin Dashboard → Analytics
2. Click "Send Monthly Report"
3. Report will be generated and SMS sent immediately

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

1. **Check Twilio credentials**: Verify `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER`
2. **Check admin phone numbers**: Ensure `ADMIN_PHONE_NUMBER` is set with country code
3. **Trial account**: Verify recipient phone numbers in Twilio Console
4. **Check Twilio logs**: Go to Twilio Console → Messaging → Logs

### Analytics Not Tracking

1. **Run migration**: Ensure `npx prisma db push` completed successfully
2. **Check browser console**: Look for errors when visiting pages
3. **Database connection**: Verify `DATABASE_URL` is correct
4. **Session cookies**: Check if `analytics_session` cookie is being set

### Cron Job Not Running

1. **Verify vercel.json**: Ensure cron configuration is correct
2. **Check Vercel logs**: Go to Vercel Dashboard → Deployments → Logs
3. **Authentication**: Verify `CRON_SECRET` matches in both places
4. **Base URL**: Ensure `NEXT_PUBLIC_BASE_URL` is your production URL

---

## 🚀 Testing

### Test Page View Tracking

```bash
curl -X POST https://your-site.com/api/analytics/track \
  -H "Content-Type: application/json" \
  -d '{"path": "/products", "referrer": "https://google.com"}'
```

### Test Monthly Report (Manual)

1. Log in to admin dashboard
2. Open browser console
3. Run:

```javascript
fetch('/api/admin/analytics/monthly-report', {
  method: 'POST',
  credentials: 'include',
}).then(r => r.json()).then(console.log)
```

### Test SMS Service

Create `app/api/test-sms/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { sendSMS } from '@/lib/sms-service'

export async function GET() {
  const result = await sendSMS(
    process.env.ADMIN_PHONE_NUMBER!,
    'Test message from Sankofa Tribe'
  )
  return NextResponse.json(result)
}
```

Visit: `https://your-site.com/api/test-sms`

---

## 💰 Cost Estimates

### Twilio SMS Pricing (Ghana)

- **Outbound SMS**: ~$0.045 per message to Ghana
- **Monthly cost**: $0.045 × 12 months = **$0.54/year** per admin
- **For 3 admins**: ~$1.62/year

### Database Storage

- **PageView records**: ~1KB per record
- **100,000 views/month**: ~100MB storage
- **PostgreSQL**: Included in most hosting plans

---

## 📝 Next Steps

1. ✅ Run database migration
2. ✅ Configure Twilio credentials
3. ✅ Add admin phone number(s)
4. ✅ Set up Vercel cron job
5. ✅ Test SMS delivery
6. ✅ Monitor analytics dashboard

---

## 🔐 Security Considerations

- **Cron secret**: Use a strong random string (at least 32 characters)
- **API authentication**: Ensure all admin endpoints verify admin role
- **Rate limiting**: Consider adding rate limits to prevent abuse
- **Phone number validation**: Numbers are validated and formatted automatically

---

## 📞 Support

If you need help:
1. Check Twilio Console logs for SMS issues
2. Check Vercel deployment logs for cron job issues
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
