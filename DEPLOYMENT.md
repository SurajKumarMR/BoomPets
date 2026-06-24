# BoomPets Deployment Guide

## Prerequisites Checklist

Before deploying, ensure you have accounts and API keys for:

- [ ] Vercel account
- [ ] Supabase project
- [ ] Stripe account (with Connect enabled)
- [ ] Anthropic API key
- [ ] Daily.co account
- [ ] OneSignal account
- [ ] Domain name (optional, Vercel provides free subdomain)

## Step 1: Database Setup (Supabase)

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note your Project URL and API keys

### 1.2 Run Database Schema
1. Open Supabase SQL Editor
2. Copy contents from `supabase/schema.sql`
3. Run the SQL script
4. Verify all tables are created

### 1.3 Configure Row Level Security
The schema includes basic RLS policies. Review and adjust based on your security requirements.

### 1.4 Get API Keys
- Project URL: `https://[project-id].supabase.co`
- Anon/Public Key: Found in Project Settings → API
- Service Role Key: Found in Project Settings → API (keep this secret!)

## Step 2: Stripe Setup

### 2.1 Create Stripe Account
1. Sign up at [stripe.com](https://stripe.com)
2. Complete business verification

### 2.2 Enable Stripe Connect
1. Go to Stripe Dashboard → Connect → Get Started
2. Choose "Platform or Marketplace"
3. Configure Connect settings

### 2.3 Set Up Marketplace Split
Configure default application fee (15% platform fee):
- Go to Connect Settings
- Set application fee percentage to 15%
- Configure payout schedules for connected accounts

### 2.4 Create Products (for subscriptions)
1. Go to Products → Add Product
2. Create "Pro Subscription" product
3. Set price to $19/month
4. Note the Price ID (starts with `price_`)

### 2.5 Configure Webhook
1. Go to Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `charge.succeeded`
4. Note the webhook signing secret

### 2.6 Get API Keys
- Publishable Key: Dashboard → Developers → API keys
- Secret Key: Dashboard → Developers → API keys
- Connect Client ID: Connect → Settings

## Step 3: Third-Party Services

### 3.1 Anthropic API
1. Sign up at [console.anthropic.com](https://console.anthropic.com)
2. Create API key
3. Note your API key

### 3.2 Daily.co
1. Sign up at [daily.co](https://daily.co)
2. Get API key from Dashboard → Developers
3. Note your API key

### 3.3 OneSignal
1. Sign up at [onesignal.com](https://onesignal.com)
2. Create new app
3. Configure for Web Push
4. Get App ID and REST API Key from Settings → Keys & IDs

## Step 4: Vercel Deployment

### 4.1 Connect GitHub Repository
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository

### 4.2 Configure Environment Variables
In Vercel project settings, add all environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Anthropic AI
ANTHROPIC_API_KEY=your_anthropic_api_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_CONNECT_CLIENT_ID=your_stripe_connect_client_id

# OneSignal
ONESIGNAL_APP_ID=your_onesignal_app_id
ONESIGNAL_REST_API_KEY=your_onesignal_rest_api_key

# Daily.co
DAILY_API_KEY=your_daily_api_key

# App
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 4.3 Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Note your deployment URL

### 4.4 Update Webhook URLs
Go back to Stripe and update webhook URL with your actual Vercel domain.

## Step 5: Post-Deployment Configuration

### 5.1 Test Stripe Webhook
1. Use Stripe CLI or dashboard
2. Send test events
3. Verify webhook receives and processes events

### 5.2 Configure OneSignal for Your Domain
1. Go to OneSignal Settings → Typical Setup
2. Add your Vercel domain
3. Follow Web Push setup instructions

### 5.3 Test Video Calls
1. Create a test consultation
2. Generate video room
3. Verify Daily.co integration works

## Step 6: Custom Domain (Optional)

### 6.1 Add Domain to Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

### 6.2 Update Environment Variables
Update `NEXT_PUBLIC_APP_URL` to your custom domain

### 6.3 Update All Webhooks
Update webhook URLs in:
- Stripe
- OneSignal
- Any other services

## Step 7: Monitoring & Maintenance

### 7.1 Set Up Error Tracking
Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- Vercel Analytics (built-in)

### 7.2 Monitor API Usage
Keep an eye on:
- Anthropic API usage and costs
- Daily.co usage
- Stripe transaction volume
- Supabase database size

### 7.3 Set Up Alerts
Configure alerts for:
- Failed webhook deliveries
- API errors
- High response times
- Database connection issues

## Production Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Database schema deployed
- [ ] Stripe products created
- [ ] Webhook endpoints verified
- [ ] SSL/HTTPS enabled (automatic with Vercel)
- [ ] Custom domain configured (if applicable)
- [ ] Error tracking set up
- [ ] Test transactions completed
- [ ] Video call functionality tested
- [ ] Push notifications tested
- [ ] Privacy policy and terms of service added
- [ ] GDPR compliance reviewed (if serving EU users)
- [ ] Backup strategy in place

## Rollback Procedure

If issues occur:

1. **Via Vercel Dashboard:**
   - Go to Deployments
   - Find previous working deployment
   - Click "..." → "Promote to Production"

2. **Via CLI:**
   ```bash
   vercel rollback [deployment-url]
   ```

## Support Resources

- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Next.js: [nextjs.org/docs](https://nextjs.org/docs)
- Supabase: [supabase.com/docs](https://supabase.com/docs)
- Stripe: [stripe.com/docs](https://stripe.com/docs)
- Daily.co: [docs.daily.co](https://docs.daily.co)
- OneSignal: [documentation.onesignal.com](https://documentation.onesignal.com)

## Costs Estimate (Monthly)

For ~1000 active users:

- **Vercel:** $20/month (Pro plan) or Free (Hobby)
- **Supabase:** $25/month (Pro plan)
- **Stripe:** 2.9% + $0.30 per transaction + Connect fees
- **Anthropic API:** ~$50-200 (depends on usage)
- **Daily.co:** Free for first 1000 minutes, then $0.0015/min
- **OneSignal:** Free up to 10k subscribers

**Total Estimate:** $100-300/month + transaction fees

## Security Best Practices

1. **Never commit .env files** - Use .gitignore
2. **Rotate API keys regularly** - Especially after team changes
3. **Use environment-specific keys** - Different keys for dev/staging/prod
4. **Enable 2FA** - On all service accounts
5. **Review RLS policies** - Ensure data access is properly restricted
6. **Monitor for suspicious activity** - Set up alerts
7. **Keep dependencies updated** - Run `npm audit` regularly

## Scaling Considerations

As you grow:

1. **Database:** Upgrade Supabase plan or consider dedicated Postgres
2. **API Routes:** May need to optimize or add caching
3. **File Storage:** Implement Cloudflare R2 for pet photos/documents
4. **CDN:** Vercel includes global CDN, but consider additional caching
5. **Rate Limiting:** Add rate limiting to API routes
6. **Background Jobs:** Consider adding job queue for heavy tasks

---

**Need Help?** Contact support or consult the README.md for development setup.
