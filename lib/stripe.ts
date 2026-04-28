import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export const PLANS = {
  FREE: {
    name: 'Gratis',
    price: 0,
    features: [
      'Urenregistratie',
      'Basis dashboard',
      'Tot 3 klanten',
      'Tot 2 projecten',
    ],
    limits: { clients: 3, projects: 2 },
  },
  PRO: {
    name: 'Pro',
    monthlyPrice: 12.99,
    yearlyPrice: 9.99,
    features: [
      'Alles in Gratis',
      'Facturatie & PDF',
      'Bonnen scannen (OCR)',
      'Belasting inzicht',
      'Kilometerregistratie',
      'Export (PDF & Excel)',
      'Onbeperkt klanten & projecten',
      'BTW kwartaaloverzicht',
    ],
    limits: { clients: -1, projects: -1 },
    stripePriceIds: {
      monthly: process.env.STRIPE_PRICE_PRO_MONTHLY!,
      yearly: process.env.STRIPE_PRICE_PRO_YEARLY!,
    },
  },
  PREMIUM: {
    name: 'Premium',
    monthlyPrice: 24.99,
    yearlyPrice: 19.99,
    features: [
      'Alles in Pro',
      'GPS ritregistratie',
      'Geavanceerde inzichten',
      'Prioriteit support',
      'API toegang',
      'Teamleden (binnenkort)',
    ],
    limits: { clients: -1, projects: -1 },
    stripePriceIds: {
      monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY!,
      yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY!,
    },
  },
}

export async function createStripeCustomer(email: string, name: string) {
  return stripe.customers.create({ email, name })
}

export async function createCheckoutSession({
  customerId,
  priceId,
  userId,
  successUrl,
  cancelUrl,
}: {
  customerId: string
  priceId: string
  userId: string
  successUrl: string
  cancelUrl: string
}) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card', 'ideal', 'sepa_debit'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId },
    subscription_data: {
      metadata: { userId },
    },
    locale: 'nl',
  })
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}
