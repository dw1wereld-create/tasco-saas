import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasAccess } from '@/lib/subscription'
import { Plan } from '@prisma/client'
import { format } from 'date-fns'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  if (!hasAccess(session.user.plan as Plan, 'export')) {
    return NextResponse.json({ error: 'Pro feature vereist' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const jaar = parseInt(searchParams.get('jaar') ?? String(new Date().getFullYear()))

  const invoices = await prisma.invoice.findMany({
    where: {
      userId: session.user.id,
      datum: {
        gte: new Date(jaar, 0, 1),
        lte: new Date(jaar, 11, 31),
      },
    },
    include: { client: { select: { naam: true } } },
    orderBy: { datum: 'asc' },
  })

  const rows = [
    ['Factuurnummer', 'Datum', 'Klant', 'Status', 'Subtotaal', 'BTW', 'Totaal', 'Vervaldatum', 'Betaald op'],
    ...invoices.map(inv => [
      inv.factuurNummer,
      format(new Date(inv.datum), 'dd-MM-yyyy'),
      inv.client.naam,
      inv.status,
      inv.subtotaal.toFixed(2),
      inv.btwBedrag.toFixed(2),
      inv.totaal.toFixed(2),
      format(new Date(inv.vervalDatum), 'dd-MM-yyyy'),
      inv.betaaldOp ? format(new Date(inv.betaaldOp), 'dd-MM-yyyy') : '',
    ]),
    [],
    ['', '', '', 'Totaal omzet', invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.subtotaal, 0).toFixed(2)],
    ['', '', '', 'Totaal BTW', invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.btwBedrag, 0).toFixed(2)],
  ]

  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="facturen-${jaar}.csv"`,
    },
  })
}
