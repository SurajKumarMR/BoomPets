# BoomPets - Pet Health & Wellness Platform

A comprehensive mobile-first web application for pet health management, veterinary consultations, and nutritionist services with marketplace functionality.

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **Anthropic Claude API** - AI-powered pet health consultations
- **Supabase** - PostgreSQL database with real-time capabilities

### Payments & Marketplace
- **Stripe** - Payment processing
- **Stripe Connect** - Marketplace with 85/15 split (nutritionist/platform)
- Multi-currency support for international payments

### Video Consultations
- **Daily.co** - Video call infrastructure
- Server-side room token generation
- Recording capabilities

### Push Notifications
- **OneSignal** - Cross-platform push notifications
- Support for iOS, Android, and Web

### Deployment
- **Vercel** - Hosting with global edge network
- Automatic deployments from Git
- Environment variable management

## Features

### For Pet Owners
- 🏠 **Dashboard** - Health plan tracking, meal logs, reminders
- 📊 **Track** - Feeding streaks, meal logging, weight tracking
- 🏥 **Consult** - Book video/chat sessions with vets and nutritionists
- 💉 **Medical History** - Vaccination records, clinic visits, medications
- 📚 **Academy** - Educational courses on pet nutrition and care
- 👥 **Community** - Share success stories, recipes, and tips
- 🔔 **Reminders** - Automated notifications for vaccines, meds, appointments

### For Nutritionists/Vets
- 💼 **Stripe Connect Onboarding** - Receive payments directly
- 📅 **Appointment Management** - Schedule and manage consultations
- 💰 **Earnings Dashboard** - Track income (85% of consultation fees)
- 🎓 **Course Creation** - Create and sell educational content
- ⭐ **Reviews & Ratings** - Build reputation

### Subscription Tiers
- **Free** - Basic tracking and community access
- **Pro ($19/month)** - Unlimited consultations, priority support, exclusive courses

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Stripe account
- Anthropic API key
- Daily.co account
- OneSignal account

### Installation

1. Clone the repository
\`\`\`bash
git clone <repository-url>
cd boompets-app
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables
\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Edit \`.env.local\` with your API keys and configuration.

4. Set up Supabase database
- Create a new Supabase project
- Run the SQL schema: \`supabase/schema.sql\`
- Configure Row Level Security policies

5. Configure Stripe
- Set up Stripe Connect for marketplace functionality
- Add webhook endpoint: \`/api/stripe/webhook\`
- Configure Connect settings for 85/15 split

6. Run development server
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

\`\`\`
boompets-app/
├── app/                      # Next.js App Router
│   ├── api/                 # API routes
│   │   ├── consult/        # AI consultation endpoints
│   │   ├── stripe/         # Payment & marketplace
│   │   ├── video/          # Video room management
│   │   └── notifications/  # Push notifications
│   ├── consult/            # Consultation pages
│   ├── track/              # Meal tracking pages
│   ├── page.tsx            # Home dashboard
│   └── layout.tsx          # Root layout
├── lib/                     # Utility libraries
│   ├── supabase/           # Database clients
│   ├── stripe.ts           # Stripe configuration
│   └── anthropic.ts        # AI client
├── types/                   # TypeScript types
├── supabase/               # Database schema
└── public/                 # Static assets
\`\`\`

## API Routes

### Consultations
- \`POST /api/consult/ai\` - AI-powered consultation chat

### Video
- \`POST /api/video/room\` - Create Daily.co room for consultation

### Payments
- \`POST /api/stripe/checkout\` - Create Stripe checkout (subscriptions & one-time)
- \`POST /api/stripe/connect\` - Onboard nutritionist to Stripe Connect
- \`POST /api/stripe/webhook\` - Handle Stripe events (payments, subscriptions)

### Notifications
- \`POST /api/notifications/send\` - Send push notification via OneSignal

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

\`\`\`bash
npm run build
vercel --prod
\`\`\`

### Environment Variables
Add all environment variables from \`.env.local.example\` to Vercel project settings.

## Marketplace Payment Flow

1. **Pet Owner books consultation** → Stripe checkout
2. **Payment captured** → Stripe webhook triggered
3. **Platform retains 15%** → Automatic transfer
4. **85% transferred to nutritionist** → Stripe Connect account
5. **Transaction recorded** → Supabase database

## Mobile App (Future)

The current implementation is mobile-web optimized. For native apps:
- **React Native** with Expo
- Share API routes and business logic
- Platform-specific push notifications (FCM/APNS via OneSignal)

## Security Considerations

- ✅ All Anthropic API calls are server-side only
- ✅ Stripe keys never exposed to client
- ✅ Row Level Security enabled on Supabase
- ✅ Webhook signature verification
- ✅ HTTPS enforced on all endpoints
- ✅ Rate limiting on API routes

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## License

Proprietary - All rights reserved

## Support

For issues or questions, contact support@boompets.com
