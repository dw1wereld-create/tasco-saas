import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { token: string } }) {
  const member = await prisma.teamMember.findUnique({
    where: { accessToken: params.token, actief: true },
    include: { owner: { select: { name: true, bedrijfsnaam: true, plan: true } } },
  })

  if (!member) return NextResponse.json({ error: 'Ongeldig of verlopen token' }, { status: 404 })

  await prisma.teamMember.update({ where: { id: member.id }, data: {} })

  const ownerId = member.ownerId
  const jaar = new Date().getFullYear()

  const [timeEntries, invoices, expenses, trips, clients] = await Promise.all([
    prisma.timeEntry.findMany({
      where: { userId: ownerId },
      include: { client: { select: { naam: true } }, project: { select: { naam: true } } },
      orderBy: { datum: 'desc' },
      take: 50,
    }),
    prisma.invoice.findMany({
      where: { userId: ownerId },
      include: { client: { select: { naam: true } }, regels: true },
      orderBy: { datum: 'desc' },
      take: 50,
    }),
    prisma.expense.findMany({
      where: { userId: ownerId },
      include: { client: { select: { naam: true } } },
      orderBy: { datum: 'desc' },
      take: 50,
    }),
    prisma.trip.findMany({
      where: { userId: ownerId },
      orderBy: { datum: 'desc' },
      take: 50,
    }),
    prisma.client.findMany({
      where: { userId: ownerId, actief: true },
      select: { id: true, naam: true, email: true, stad: true },
    }),
  ])

  return NextResponse.json({
    member: { naam: member.naam, role: member.role },
    owner: member.owner,
    data: { timeEntries, invoices, expenses, trips, clients },
  })
}
