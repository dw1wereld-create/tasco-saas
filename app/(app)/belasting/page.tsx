import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatEuro, ZELFSTANDIGENAFTREK, MKB_WINSTVRIJSTELLING } from '@/lib/utils'
import { startOfYear, startOfQuarter, endOfQuarter } from 'date-fns'
import BelastingClient from './BelastingClient'

export const metadata = { title: 'Belasting Overzicht' }

export default async function BelastingPage() {
  const session = await getServerSession(authOptions)
  const userId = session!.user.id
  const plan = session!.user.plan
  const now = new Date()
  const jaar = now.getFullYear()
  const jaarStart = startOfYear(now)

  const [invoices, expenses, trips, timeEntries, user] = await Promise.all([
    prisma.invoice.findMany({ where: { userId, datum: { gte: jaarStart } } }),
    prisma.expense.findMany({ where: { userId, datum: { gte: jaarStart } } }),
    prisma.trip.findMany({ where: { userId, datum: { gte: jaarStart } } }),
    prisma.timeEntry.findMany({ where: { userId, datum: { gte: jaarStart } } }),
    prisma.user.findUnique({ where: { id: userId }, select: { belastingPct: true } }),
  ])

  const totaalUren = timeEntries.reduce((s, e) => s + e.uren, 0)
  const heeftZelfstandigenAftrek = totaalUren >= 1225

  const betaaldeFacturen = invoices.filter(inv => inv.status === 'PAID')
  const omzet = betaaldeFacturen.reduce((s, inv) => s + inv.subtotaal, 0)
  const totaalKosten = expenses.reduce((s, e) => s + e.bedrag, 0)
  const totaalKm = trips.reduce((s, t) => s + (t.kilometers * (t.zakelijkPct / 100)), 0)
  const kmAftrek = totaalKm * 0.23
  const brutoWinst = omzet - totaalKosten - kmAftrek
  const zelfstandigenAftrek = heeftZelfstandigenAftrek ? ZELFSTANDIGENAFTREK : 0
  const mkbWinstvrijstelling = Math.max(0, brutoWinst - zelfstandigenAftrek) * MKB_WINSTVRIJSTELLING
  const belastbaarInkomen = Math.max(0, brutoWinst - zelfstandigenAftrek - mkbWinstvrijstelling)
  const schijf1 = Math.min(belastbaarInkomen, 75518)
  const schijf2 = Math.max(0, belastbaarInkomen - 75518)
  const ibSchatting = schijf1 * 0.3693 + schijf2 * 0.495
  const zvwBijdrage = Math.min(belastbaarInkomen, 71628) * 0.0532
  const totaalBelasting = ibSchatting + zvwBijdrage

  const kwartalen = [0, 1, 2, 3].map(q => {
    const qStart = startOfQuarter(new Date(jaar, q * 3, 1))
    const qEnd = endOfQuarter(new Date(jaar, q * 3, 1))
    const btwOntvangen = invoices
      .filter(inv => inv.status === 'PAID' && inv.betaaldOp && new Date(inv.betaaldOp) >= qStart && new Date(inv.betaaldOp) <= qEnd)
      .reduce((s, inv) => s + inv.btwBedrag, 0)
    const btwBetaald = expenses
      .filter(e => new Date(e.datum) >= qStart && new Date(e.datum) <= qEnd)
      .reduce((s, e) => s + e.btw, 0)
    return {
      kwartaal: `Q${q + 1} ${jaar}`,
      btwOntvangen,
      btwBetaald,
      nettoBTW: Math.max(0, btwOntvangen - btwBetaald),
      deadline: new Date(jaar, q * 3 + 3, 30).toISOString(),
      verstreken: new Date() > new Date(jaar, q * 3 + 3, 30),
    }
  })

  const belastingPct = user?.belastingPct ?? 30
  const aanbevolenReservering = omzet * (belastingPct / 100)

  return (
    <BelastingClient
      plan={plan}
      jaar={jaar}
      totaalUren={totaalUren}
      heeftZelfstandigenAftrek={heeftZelfstandigenAftrek}
      omzet={omzet}
      totaalKosten={totaalKosten}
      kmAftrek={kmAftrek}
      brutoWinst={brutoWinst}
      zelfstandigenAftrek={zelfstandigenAftrek}
      mkbWinstvrijstelling={mkbWinstvrijstelling}
      belastbaarInkomen={belastbaarInkomen}
      ibSchatting={ibSchatting}
      zvwBijdrage={zvwBijdrage}
      totaalBelasting={totaalBelasting}
      kwartalen={kwartalen}
      belastingPct={belastingPct}
      aanbevolenReservering={aanbevolenReservering}
    />
  )
}
