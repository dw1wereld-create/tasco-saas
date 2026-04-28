import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasAccess } from '@/lib/subscription'
import { Plan } from '@prisma/client'
import { format } from 'date-fns'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  if (!hasAccess(session.user.plan as Plan, 'export')) {
    return NextResponse.json({ error: 'Pro feature vereist' }, { status: 403 })
  }

  const trips = await prisma.trip.findMany({
    where: { userId: session.user.id },
    include: { client: { select: { naam: true } } },
    orderBy: { datum: 'asc' },
  })

  const KM_VERGOEDING = 0.23
  const jaar = new Date().getFullYear()

  const rows = [
    ['Datum', 'Van', 'Naar', 'Kilometers', 'Zakelijk %', 'Zakelijke km', 'Aftrek (€)', 'Doel', 'Klant'],
    ...trips.map(t => {
      const zakelijkeKm = t.kilometers * (t.zakelijkPct / 100)
      return [
        format(new Date(t.datum), 'dd-MM-yyyy'),
        t.van,
        t.naar,
        t.kilometers.toString(),
        `${t.zakelijkPct}%`,
        zakelijkeKm.toFixed(1),
        (zakelijkeKm * KM_VERGOEDING).toFixed(2),
        t.doel ?? '',
        t.client?.naam ?? '',
      ]
    }),
    [],
    ['Totaal zakelijke km', '', '', '', '', trips.reduce((s, t) => s + t.kilometers * (t.zakelijkPct / 100), 0).toFixed(1)],
    ['Totaal aftrek', '', '', '', '', '', (trips.reduce((s, t) => s + t.kilometers * (t.zakelijkPct / 100), 0) * KM_VERGOEDING).toFixed(2)],
  ]

  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="kilometers-${jaar}.csv"`,
    },
  })
}
