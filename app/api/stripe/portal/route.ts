import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPortalSession } from '@/lib/stripe'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const sub = await prisma.subscription.findUnique({ where: { userId: session.user.id } })
  if (!sub?.stripeCustomerId) {
    return NextResponse.json({ error: 'Geen actief abonnement gevonden' }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const portalSession = await createPortalSession(sub.stripeCustomerId, `${appUrl}/instellingen`)

  return NextResponse.json({ url: portalSession.url })
}
