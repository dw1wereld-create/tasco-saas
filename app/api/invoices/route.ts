import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasAccess } from '@/lib/subscription'
import { generateFactuurNummer } from '@/lib/utils'
import { Plan } from '@prisma/client'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const invoices = await prisma.invoice.findMany({
    where: { userId: session.user.id },
    include: { client: { select: { naam: true } }, regels: true },
    orderBy: { datum: 'desc' },
  })

  // Mark overdue invoices
  const now = new Date()
  const updated = await Promise.all(invoices.map(async inv => {
    if (inv.status === 'OPEN' && new Date(inv.vervalDatum) < now) {
      await prisma.invoice.update({ where: { id: inv.id }, data: { status: 'OVERDUE' } })
      return { ...inv, status: 'OVERDUE' as const }
    }
    return inv
  }))

  return NextResponse.json({ invoices: updated })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const plan = session.user.plan as Plan
  if (!hasAccess(plan, 'facturatie')) {
    return NextResponse.json({ error: 'Pro feature vereist' }, { status: 403 })
  }

  const body = await req.json()

  // Generate factuur nummer
  const existing = await prisma.invoice.findMany({
    where: { userId: session.user.id },
    select: { factuurNummer: true },
  })
  const factuurNummer = generateFactuurNummer(existing.map(i => i.factuurNummer))

  const invoice = await prisma.invoice.create({
    data: {
      userId: session.user.id,
      clientId: body.clientId,
      factuurNummer,
      datum: new Date(body.datum),
      vervalDatum: new Date(body.vervalDatum),
      status: 'OPEN',
      subtotaal: body.subtotaal,
      btwBedrag: body.btwBedrag,
      totaal: body.totaal,
      btwTarief: body.btwTarief ?? 21,
      notities: body.notities || null,
      regels: {
        create: body.regels.map((r: any) => ({
          omschrijving: r.omschrijving,
          aantal: r.aantal,
          tarief: r.tarief,
          bedrag: r.aantal * r.tarief,
        })),
      },
    },
    include: { client: true, regels: true },
  })

  return NextResponse.json({ invoice })
}
