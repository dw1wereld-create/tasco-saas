import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { token: string } }) {
  const access = await prisma.accountantAccess.findUnique({
    where: { token: params.token },
    include: { user: { select: { name: true, bedrijfsnaam: true, kvkNummer: true, btwNummer: true, stad: true } } },
  })

  if (!access || access.revokedAt) return NextResponse.json({ error: 'Ongeldig of ingetrokken token' }, { status: 404 })
  if (access.expiresAt && access.expiresAt < new Date()) return NextResponse.json({ error: 'Toegangslink is verlopen' }, { status: 410 })

  await prisma.accountantAccess.update({ where: { id: access.id }, data: { lastUsedAt: new Date() } })

  const userId = access.userId
  const jaar = new Date().getFullYear()

  const [invoices, expenses, timeEntries, trips] = await Promise.all([
    prisma.invoice.findMany({
      where: { userId },
      include: { client: { select: { naam: true } }, regels: true },
      orderBy: { datum: 'desc' },
    }),
    prisma.expense.findMany({
      where: { userId },
      include: { client: { select: { naam: true } } },
      orderBy: { datum: 'desc' },
    }),
    prisma.timeEntry.findMany({
      where: { userId },
      include: { client: { select: { naam: true } }, project: { select: { naam: true } } },
      orderBy: { datum: 'desc' },
    }),
    prisma.trip.findMany({
      where: { userId },
      orderBy: { datum: 'desc' },
    }),
  ])

  const omzetJaar = invoices
    .filter(i => new Date(i.datum).getFullYear() === jaar && i.status === 'PAID')
    .reduce((s, i) => s + i.totaal, 0)

  const btwJaar = invoices
    .filter(i => new Date(i.datum).getFullYear() === jaar && i.status === 'PAID')
    .reduce((s, i) => s + i.btwBedrag, 0)

  const kostenJaar = expenses
    .filter(e => new Date(e.datum).getFullYear() === jaar)
    .reduce((s, e) => s + e.bedrag, 0)

  const kmJaar = trips
    .filter(t => new Date(t.datum).getFullYear() === jaar)
    .reduce((s, t) => s + t.kilometers * (t.zakelijkPct / 100), 0)

  return NextResponse.json({
    access: { label: access.label, lastUsedAt: access.lastUsedAt },
    user: access.user,
    jaar,
    samenvatting: { omzetJaar, btwJaar, kostenJaar, kmJaar },
    data: { invoices, expenses, timeEntries, trips },
  })
}
