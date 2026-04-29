import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasAccess } from '@/lib/subscription'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const members = await prisma.teamMember.findMany({
    where: { ownerId: session.user.id, actief: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ members })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
  if (!hasAccess(session.user.plan as any, 'team_beheer')) {
    return NextResponse.json({ error: 'Premium abonnement vereist' }, { status: 403 })
  }

  const { naam, email, role } = await req.json()
  if (!naam) return NextResponse.json({ error: 'Naam is verplicht' }, { status: 400 })

  const member = await prisma.teamMember.create({
    data: {
      ownerId: session.user.id,
      naam,
      email: email || null,
      role: role || 'VIEWER',
    },
  })

  return NextResponse.json({ member })
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  await prisma.teamMember.updateMany({
    where: { id: id!, ownerId: session.user.id },
    data: { actief: false },
  })

  return NextResponse.json({ success: true })
}
