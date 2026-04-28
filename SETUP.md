# Tasco — Setup Instructies

## Vereisten
- Node.js 18+
- PostgreSQL database (lokaal of Supabase/Railway/Neon)

## 1. Dependencies installeren

```bash
cd TascoSaaS
npm install
```

## 2. Environment variabelen

```bash
cp .env.example .env
```

Vul `.env` in:

```env
# Database (lokaal voorbeeld)
DATABASE_URL="postgresql://postgres:password@localhost:5432/tasco"

# NextAuth (genereer een secret met: openssl rand -base64 32)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="jouw-super-geheime-sleutel-hier"

# Stripe (haal op via stripe.com/dashboard)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Stripe Prijs IDs (aanmaken in Stripe Dashboard > Products)
STRIPE_PRICE_PRO_MONTHLY="price_..."
STRIPE_PRICE_PRO_YEARLY="price_..."
STRIPE_PRICE_PREMIUM_MONTHLY="price_..."
STRIPE_PRICE_PREMIUM_YEARLY="price_..."

# Google Vision OCR (optioneel)
GOOGLE_VISION_API_KEY="jouw-api-key"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

## 3. Database opzetten

```bash
# Prisma client genereren
npm run db:generate

# Schema naar database pushen
npm run db:push

# Demo data laden (optioneel)
npm run db:seed
```

## 4. Ontwikkelserver starten

```bash
npm run dev
```

Open http://localhost:3000

**Demo inloggen:** demo@tasco.nl / wachtwoord123

## 5. Stripe Webhook (lokaal testen)

```bash
# Stripe CLI installeren
brew install stripe/stripe-cli/stripe

# Inloggen
stripe login

# Webhook doorsturen naar lokale server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Kopieer de `whsec_...` webhook secret naar `.env`

## 6. Productie (Vercel)

```bash
# Vercel CLI
npm i -g vercel

# Deployen
vercel

# Environment variabelen instellen via Vercel Dashboard
# of: vercel env add NEXTAUTH_SECRET
```

## Stripe Products aanmaken

In het Stripe Dashboard > Products > Add product:

| Product | Prijs | Interval | Prijs ID |
|---------|-------|----------|----------|
| Tasco Pro | € 12,99 | Maandelijks | → STRIPE_PRICE_PRO_MONTHLY |
| Tasco Pro | € 9,99 | Jaarlijks | → STRIPE_PRICE_PRO_YEARLY |
| Tasco Premium | € 24,99 | Maandelijks | → STRIPE_PRICE_PREMIUM_MONTHLY |
| Tasco Premium | € 19,99 | Jaarlijks | → STRIPE_PRICE_PREMIUM_YEARLY |

## Project structuur

```
TascoSaaS/
├── app/
│   ├── (app)/              # Authenticeerde routes
│   │   ├── dashboard/      # Hoofddashboard + ZZP Score
│   │   ├── uren/           # Urenregistratie
│   │   ├── facturen/       # Facturatie + PDF
│   │   ├── bonnen/         # Bonnen + OCR
│   │   ├── kilometers/     # Rittenregistratie
│   │   ├── belasting/      # Belasting inzicht
│   │   ├── klanten/        # CRM
│   │   ├── upgrade/        # Stripe checkout
│   │   └── instellingen/   # Profiel & bedrijf
│   ├── api/                # API routes
│   │   ├── auth/           # NextAuth
│   │   ├── invoices/       # Facturen CRUD + export
│   │   ├── time-entries/   # Uren CRUD
│   │   ├── clients/        # Klanten CRUD
│   │   ├── expenses/       # Bonnen CRUD + OCR
│   │   ├── trips/          # Ritten CRUD + CSV export
│   │   ├── projects/       # Projecten CRUD
│   │   ├── user/settings/  # Gebruikersprofiel
│   │   └── stripe/         # Checkout, Portal, Webhook
│   ├── login/              # Inlogpagina
│   ├── register/           # Registratiepagina
│   └── page.tsx            # Landingspagina
├── lib/
│   ├── auth.ts             # NextAuth configuratie
│   ├── prisma.ts           # Database client
│   ├── stripe.ts           # Stripe + plan configuratie
│   ├── subscription.ts     # Feature gating
│   └── utils.ts            # ZZP berekeningen + helpers
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Demo data
└── middleware.ts            # Auth bescherming
```
