import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canAddClient } from '@/lib/subscription'
import { Plan } from '@prisma/client'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const clients = await prisma.client.findMany({
    where: { userId: session.user.id, actief: true },
    include: { _count: { select: { invoices: true, timeEntries: true, projects: true } } },
    orderBy: { naam: 'asc' },
  })

  return NextResponse.json({ clients })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const plan = session.user.plan as Plan
  const count = await prisma.client.count({ where: { userId: session.user.id, actief: true } })

  if (!canAddClient(plan, count)) {
    return NextResponse.json({ error: 'Max klanten bereikt voor je plan. Upgrade naar Pro.' }, { status: 403 })
  }

  const body = await req.json()
  const client = await prisma.client.create({
    data: { ...body, userId: session.user.id },
    include: { _count: { select: { invoices: true, timeEntries: true, projects: true } } },
  })

  return NextResponse.json({ client })
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  await prisma.client.updateMany({ where: { id: id!, userId: session.user.id }, data: { actief: false } })
  return NextResponse.json({ success: true })
}
