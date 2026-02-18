# Paystack Payment Integration Guide

## 🎯 Overview

The website now uses **Paystack** as the payment gateway, supporting:
- Cards (Visa, Mastercard, Verve)
- Bank transfers
- Mobile money
- USSD payments

## 📋 Setup Steps

### 1. Create Paystack Account

1. Go to [paystack.com](https://paystack.com)
2. Sign up for a free account
3. Complete verification (business details, bank information)

### 2. Get API Keys

1. Log into your Paystack Dashboard
2. Go to **Settings** → **API Keys & Webhooks**
3. Copy your **Test Public Key** (starts with `pk_test_`)
4. Copy your **Test Secret Key** (starts with `sk_test_`)

### 3. Configure Environment Variables

Add to your `.env.local` file:

```env
# Paystack Configuration
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_actual_public_key
PAYSTACK_SECRET_KEY=sk_test_your_actual_secret_key
```

### 4. Update Exchange Rate (Optional)

The default exchange rate is set to **1 USD = 1500 NGN**. 

To update it, edit `lib/paystack.ts`:

```typescript
export const convertToKobo = (amountInUSD: number): number => {
  const exchangeRate = 1500 // Update this value
  const amountInNGN = amountInUSD * exchangeRate
  return Math.round(amountInNGN * 100)
}
```

For production, consider using a real-time exchange rate API.

## 🧪 Testing

### Test Cards (Paystack Test Mode)

**Successful Transactions**:
- Card: `4084084084084081`
- Expiry: Any future date
- CVV: `408`
- PIN: `0000`

**Failed Transactions**:
- Card: `5060666666666666666`
- Expiry: Any future date
- CVV: Any 3 digits

**Insufficient Funds**:
- Card: `4084080000000409`

### Test the Checkout Flow

1. Add products to cart
2. Go to checkout
3. Fill in customer details (use test email)
4. Click "Pay with Paystack"
5. Paystack popup will appear
6. Use test card details above
7. Complete payment
8. Verify redirect to success page

## 🔄 How Payment Works

### Client Side (Checkout Page)
1. Customer fills shipping form
2. Clicks "Pay with Paystack"
3. Paystack popup opens with payment options
4. Customer completes payment
5. On success → sends reference to server for verification

### Server Side (Payment Verification)
1. Receives payment reference
2. Calls Paystack API to verify transaction
3. Checks payment status
4. Saves order to database (TODO: implement)
5. Sends confirmation email (TODO: implement)
6. Returns success response

## 📝 Currency Conversion

Products are priced in **USD** but charged in **NGN** (Nigerian Naira).

**Current conversion**: `lib/paystack.ts`
```typescript
const exchangeRate = 1500 // 1 USD = 1500 NGN
```

**Amount in Kobo**:
- Paystack requires amount in kobo (100 kobo = 1 Naira)
-Example: $50 USD → 75,000 NGN → 7,500,000 kobo

## 🔐 Production Setup

### 1. Get Live API Keys

In Paystack Dashboard:
- Switch to **Live Mode**
- Copy Live Public and Secret Keys
- Update `.env.local` with live keys

### 2. Webhooks (Optional)

For real-time payment notifications:

1. In Paystack Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/webhooks/paystack`
3. Save webhook secret
4. Create webhook handler (currently not implemented)

### 3. Test Live Mode

Before going fully live:
- Use real card with small amount (₦100)
- Verify payment completes
- Check order is saved
- Confirm email is sent

## 🛠️ Customization

### Change Payment Button Text

Edit `app/checkout/page.tsx`:
```typescript
<Button type="submit">
  {loading ? 'Processing...' : 'Your Custom Text'}
</Button>
```

### Add More Payment Metadata

Edit `app/checkout/page.tsx` - config object:
```typescript
metadata: {
  custom_fields: [
    // Add more fields here
    {
      display_name: 'Phone Number',
      variable_name: 'phone',
      value: formData.phone,
    },
  ],
}
```

### Customize Success Page

Edit `app/success/page.tsx` to add:
- Order tracking
- Download receipt
- Social sharing

## 📊 Key Files

1. **`lib/paystack.ts`** - Configuration and utilities
2. **`app/checkout/page.tsx`** - Checkout form with Paystack integration
3. **`app/api/verify-payment/route.ts`** - Server-side payment verification
4. **`app/success/page.tsx`** - Success page showing order confirmation

## 🚨 Common Issues

### "Cannot find module 'react-paystack'"
```bash
npm install react-paystack
```

### Payment verification fails
- Check secret key is correct
- Ensure reference is being passed correctly
- Check server logs for errors

### Popup doesn't appear
- Verify public key is correct
- Check browser console for JavaScript errors
- Ensure form validation passes

### Wrong amount charged
- Check exchange rate in `lib/paystack.ts`
- Verify conversion to kobo (multiply by 100)
- Check cart total calculation

## ✅ Next Steps

After setup:
1. [ ] Add payment reference to database
2. [ ] Implement order management system
3. [ ] Send confirmation emails
4. [ ] Add webhook handler for async notifications
5. [ ] Implement order tracking
6. [ ] Add refund functionality

## 📞 Support

- **Paystack Docs**: [paystack.com/docs](https://paystack.com/docs)
- **Test Cards**: [paystack.com/docs/payments/test-payments](https://paystack.com/docs/payments/test-payments)
- **API Reference**: [paystack.com/docs/api](https://paystack.com/docs/api)

---

**Ready to go live?** Remember to switch to live API keys and test thoroughly before processing real payments!
