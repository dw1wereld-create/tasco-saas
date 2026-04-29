import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasAccess } from '@/lib/subscription'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const accesses = await prisma.accountantAccess.findMany({
    where: { userId: session.user.id, revokedAt: null },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ accesses })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
  if (!hasAccess(session.user.plan as any, 'accountant_portal')) {
    return NextResponse.json({ error: 'Premium abonnement vereist' }, { status: 403 })
  }

  const { label, expiresAt } = await req.json()

  const access = await prisma.accountantAccess.create({
    data: {
      userId: session.user.id,
      label: label || 'Accountant',
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  })

  return NextResponse.json({ access })
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  await prisma.accountantAccess.updateMany({
    where: { id: id!, userId: session.user.id },
    data: { revokedAt: new Date() },
  })

  return NextResponse.json({ success: true })
}
