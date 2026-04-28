import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canAddProject } from '@/lib/subscription'
import { Plan } from '@prisma/client'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    include: {
      client: { select: { naam: true } },
      _count: { select: { timeEntries: true, expenses: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ projects })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const plan = session.user.plan as Plan
  const count = await prisma.project.count({ where: { userId: session.user.id } })

  if (!canAddProject(plan, count)) {
    return NextResponse.json({ error: 'Max projecten bereikt voor je plan. Upgrade naar Pro.' }, { status: 403 })
  }

  const body = await req.json()
  const project = await prisma.project.create({
    data: {
      userId: session.user.id,
      naam: body.naam,
      omschrijving: body.omschrijving || null,
      clientId: body.clientId || null,
      budget: body.budget ? parseFloat(body.budget) : null,
      uurtarief: body.uurtarief ? parseFloat(body.uurtarief) : null,
      startDatum: body.startDatum ? new Date(body.startDatum) : null,
      eindDatum: body.eindDatum ? new Date(body.eindDatum) : null,
    },
    include: { client: { select: { naam: true } }, _count: { select: { timeEntries: true, expenses: true } } },
  })

  return NextResponse.json({ project })
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  await prisma.project.deleteMany({ where: { id: id!, userId: session.user.id } })
  return NextResponse.json({ success: true })
}
