import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe, createStripeCustomer, createCheckoutSession, PLANS } from '@/lib/stripe'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { plan, interval } = await req.json()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  if (!['PRO', 'PREMIUM'].includes(plan)) {
    return NextResponse.json({ error: 'Ongeldig plan' }, { status: 400 })
  }

  const planConfig = PLANS[plan as 'PRO' | 'PREMIUM']
  const priceId = planConfig.stripePriceIds?.[interval as 'monthly' | 'yearly']

  if (!priceId) {
    return NextResponse.json({ error: 'Geen prijs geconfigureerd. Stel Stripe prijs-IDs in via .env' }, { status: 400 })
  }

  let sub = await prisma.subscription.findUnique({ where: { userId: session.user.id } })

  // Haal of maak Stripe customer
  let customerId = sub?.stripeCustomerId
  if (!customerId) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { email: true, name: true } })
    const customer = await createStripeCustomer(user!.email, user!.name ?? '')
    customerId = customer.id

    await prisma.subscription.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, stripeCustomerId: customerId },
      update: { stripeCustomerId: customerId },
    })
  }

  const checkoutSession = await createCheckoutSession({
    customerId,
    priceId,
    userId: session.user.id,
    successUrl: `${appUrl}/dashboard?upgraded=1`,
    cancelUrl: `${appUrl}/upgrade`,
  })

  return NextResponse.json({ url: checkoutSession.url })
}
