import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const trips = await prisma.trip.findMany({
    where: { userId: session.user.id },
    include: { client: { select: { naam: true } } },
    orderBy: { datum: 'desc' },
  })

  return NextResponse.json({ trips })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const body = await req.json()

  const trip = await prisma.trip.create({
    data: {
      userId: session.user.id,
      datum: new Date(body.datum),
      van: body.van,
      naar: body.naar,
      kilometers: body.kilometers,
      doel: body.doel || null,
      zakelijkPct: body.zakelijkPct ?? 100,
      clientId: body.clientId || null,
      projectId: body.projectId || null,
    },
    include: { client: { select: { naam: true } } },
  })

  return NextResponse.json({ trip })
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  await prisma.trip.deleteMany({ where: { id: id!, userId: session.user.id } })
  return NextResponse.json({ success: true })
}
