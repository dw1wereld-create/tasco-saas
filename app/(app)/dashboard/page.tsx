import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { berekenUrenPrognose, berekenZZPScore, UREN_CRITERIUM } from '@/lib/utils'
import { startOfYear, endOfMonth, startOfMonth, subMonths, format } from 'date-fns'
import { nl } from 'date-fns/locale'
import DashboardClient from './DashboardClient'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { upgraded?: string }
}) {
  const session = await getServerSession(authOptions)
  const userId = session!.user.id
  const now = new Date()
  const jaar = now.getFullYear()
  const jaarStart = startOfYear(now)

  const [timeEntries, invoices, expenses, trips, user] = await Promise.all([
    prisma.timeEntry.findMany({
      where: { userId, datum: { gte: jaarStart } },
      include: { client: { select: { naam: true } }, project: { select: { naam: true } } },
      orderBy: { datum: 'desc' },
    }),
    prisma.invoice.findMany({
      where: { userId },
      include: { client: { select: { naam: true } } },
      orderBy: { datum: 'desc' },
    }),
    prisma.expense.findMany({ where: { userId, datum: { gte: jaarStart } } }),
    prisma.trip.findMany({ where: { userId, datum: { gte: jaarStart } } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, uurtarief: true, belastingPct: true, plan: true },
    }),
  ])

  const totaalUren = timeEntries.reduce((s, e) => s + e.uren, 0)
  const declarabelUren = timeEntries.filter(e => e.declarabel).reduce((s, e) => s + e.uren, 0)
  const urenPrognose = berekenUrenPrognose(totaalUren)

  const maandOmzet: { maand: string; omzet: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(now, i)
    const start = startOfMonth(d)
    const end = endOfMonth(d)
    const omzet = invoices
      .filter(inv => inv.status === 'PAID' && inv.betaaldOp
        && new Date(inv.betaaldOp) >= start && new Date(inv.betaaldOp) <= end)
      .reduce((s, inv) => s + inv.subtotaal, 0)
    maandOmzet.push({ maand: format(d, 'MMM', { locale: nl }), omzet })
  }

  const openFacturen = invoices.filter(inv => inv.status === 'OPEN' || inv.status === 'OVERDUE')
  const totaalOpen = openFacturen.reduce((s, inv) => s + inv.totaal, 0)
  const verlateFacturen = invoices.filter(inv => inv.status === 'OVERDUE').length
  const jaarOmzet = invoices
    .filter(inv => inv.status === 'PAID' && inv.betaaldOp && new Date(inv.betaaldOp) >= jaarStart)
    .reduce((s, inv) => s + inv.subtotaal, 0)

  const kwartaal = Math.floor(now.getMonth() / 3)
  const kwartaalStart = new Date(jaar, kwartaal * 3, 1)
  const kwartaalEind = new Date(jaar, kwartaal * 3 + 3, 0)
  const btwTePitten = invoices
    .filter(inv => inv.status === 'PAID' && inv.betaaldOp
      && new Date(inv.betaaldOp) >= kwartaalStart && new Date(inv.betaaldOp) <= kwartaalEind)
    .reduce((s, inv) => s + inv.btwBedrag, 0)
  const uitgavenBTW = expenses
    .filter(e => new Date(e.datum) >= kwartaalStart && new Date(e.datum) <= kwartaalEind)
    .reduce((s, e) => s + e.btw, 0)
  const nettoBTW = Math.max(0, btwTePitten - uitgavenBTW)

  const belastingPct = user?.belastingPct ?? 30
  const totaalKosten = expenses.reduce((s, e) => s + e.bedrag, 0)
  const belastingReservering = Math.max(0, (jaarOmzet - totaalKosten) * (belastingPct / 100))
  const heeftZelfstandigenAftrek = totaalUren >= UREN_CRITERIUM

  const nu3 = maandOmzet.slice(3).reduce((s, m) => s + m.omzet, 0)
  const voor3 = maandOmzet.slice(0, 3).reduce((s, m) => s + m.omzet, 0)
  const omzetTrend: 'stijgend' | 'stabiel' | 'dalend' =
    nu3 > voor3 * 1.05 ? 'stijgend' : nu3 < voor3 * 0.95 ? 'dalend' : 'stabiel'

  const zzpScore = berekenZZPScore({
    urenPercentage: urenPrognose.percentageBehaald,
    openFacturen: openFacturen.length,
    totaalFacturen: Math.max(1, invoices.filter(inv => new Date(inv.datum) >= jaarStart).length),
    belastingGereserveerd: heeftZelfstandigenAftrek,
    omzetTrend,
  })

  const recenteEntries = timeEntries.slice(0, 5).map(e => ({
    id: e.id,
    datum: e.datum.toISOString(),
    uren: e.uren,
    omschrijving: e.omschrijving ?? '',
    klant: e.client?.naam ?? '',
    declarabel: e.declarabel,
  }))

  const recenteFacturen = invoices.slice(0, 3).map(inv => ({
    id: inv.id,
    factuurNummer: inv.factuurNummer,
    klant: inv.client.naam,
    totaal: inv.totaal,
    status: inv.status,
    datum: inv.datum.toISOString(),
  }))

  return (
    <DashboardClient
      naam={user?.name ?? 'ZZP\'er'}
      plan={session!.user.plan}
      justUpgraded={searchParams.upgraded === '1'}
      stats={{
        totaalUren: Math.round(totaalUren * 10) / 10,
        declarabelUren: Math.round(declarabelUren * 10) / 10,
        urenPrognose,
        jaarOmzet,
        openFacturen: openFacturen.length,
        totaalOpen,
        verlateFacturen,
        nettoBTW,
        belastingReservering,
        heeftZelfstandigenAftrek,
        omzetTrend,
      }}
      zzpScore={zzpScore}
      maandOmzet={maandOmzet}
      recenteEntries={recenteEntries}
      recenteFacturen={recenteFacturen}
    />
  )
}
