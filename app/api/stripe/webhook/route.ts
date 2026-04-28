import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { Plan } from '@prisma/client'

const PRICE_TO_PLAN: Record<string, Plan> = {
  [process.env.STRIPE_PRICE_PRO_MONTHLY ?? '']: 'PRO',
  [process.env.STRIPE_PRICE_PRO_YEARLY ?? '']: 'PRO',
  [process.env.STRIPE_PRICE_PREMIUM_MONTHLY ?? '']: 'PREMIUM',
  [process.env.STRIPE_PRICE_PREMIUM_YEARLY ?? '']: 'PREMIUM',
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = headers().get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature verificatie mislukt:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const checkoutSession = event.data.object as Stripe.Checkout.Session
      const userId = checkoutSession.metadata?.userId
      if (!userId) break

      const subscription = await stripe.subscriptions.retrieve(checkoutSession.subscription as string)
      const priceId = subscription.items.data[0].price.id
      const plan = PRICE_TO_PLAN[priceId] ?? 'PRO'
      const interval = subscription.items.data[0].price.recurring?.interval

      await prisma.$transaction([
        prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            stripeCustomerId: checkoutSession.customer as string,
            stripeSubscriptionId: subscription.id,
            plan,
            status: 'ACTIVE',
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            interval: interval ?? 'month',
          },
          update: {
            stripeSubscriptionId: subscription.id,
            plan,
            status: 'ACTIVE',
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            interval: interval ?? 'month',
          },
        }),
        prisma.user.update({ where: { id: userId }, data: { plan } }),
      ])
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      const subId = invoice.subscription as string
      const sub = await stripe.subscriptions.retrieve(subId)
      const priceId = sub.items.data[0].price.id
      const plan = PRICE_TO_PLAN[priceId] ?? 'PRO'
      const userId = sub.metadata?.userId

      if (userId) {
        await prisma.$transaction([
          prisma.subscription.upsert({
            where: { userId },
            create: {
              userId,
              stripeSubscriptionId: subId,
              plan,
              status: 'ACTIVE',
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
            },
            update: {
              plan,
              status: 'ACTIVE',
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
            },
          }),
          prisma.user.update({ where: { id: userId }, data: { plan } }),
        ])
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const subId = invoice.subscription as string
      const sub = await stripe.subscriptions.retrieve(subId)
      const userId = sub.metadata?.userId

      if (userId) {
        await prisma.subscription.updateMany({
          where: { userId },
          data: { status: 'PAST_DUE' },
        })
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.userId

      if (userId) {
        await prisma.$transaction([
          prisma.subscription.updateMany({
            where: { userId },
            data: { status: 'CANCELED', plan: 'FREE' },
          }),
          prisma.user.update({ where: { id: userId }, data: { plan: 'FREE' } }),
        ])
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.userId
      if (!userId) break

      const priceId = sub.items.data[0].price.id
      const plan = PRICE_TO_PLAN[priceId] ?? 'PRO'
      const status = sub.status === 'active' ? 'ACTIVE' : sub.status === 'trialing' ? 'TRIALING' : 'PAST_DUE'

      await prisma.$transaction([
        prisma.subscription.updateMany({
          where: { userId },
          data: {
            plan,
            status,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
        }),
        prisma.user.update({ where: { id: userId }, data: { plan } }),
      ])
      break
    }
  }

  return NextResponse.json({ received: true })
}
