import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, differenceInDays, startOfYear, endOfYear } from 'date-fns'
import { nl } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatEuro(amount: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDatum(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'd MMM yyyy', { locale: nl })
}

export function formatDatumKort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'dd-MM-yyyy')
}

export function getTodayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export const UREN_CRITERIUM = 1225
export const KM_VERGOEDING = 0.23
export const ZELFSTANDIGENAFTREK = 3750
export const MKB_WINSTVRIJSTELLING = 0.127
export const BELASTING_TARIEF = 0.3693

export function berekenUrenPrognose(totaalUren: number): {
  opSchema: boolean
  prognose: number
  dagelijksBenodigd: number
  resterend: number
  percentageBehaald: number
} {
  const nu = new Date()
  const startJaar = startOfYear(nu)
  const eindJaar = endOfYear(nu)
  const dagenVerlopen = differenceInDays(nu, startJaar) + 1
  const dagenTotaal = differenceInDays(eindJaar, startJaar) + 1
  const dagenResterend = dagenTotaal - dagenVerlopen

  const verwachtUrenOpDitMoment = (UREN_CRITERIUM / dagenTotaal) * dagenVerlopen
  const prognose = dagenTotaal > 0
    ? (totaalUren / dagenVerlopen) * dagenTotaal
    : 0

  const resterend = Math.max(0, UREN_CRITERIUM - totaalUren)
  const werkdagenResterend = dagenResterend * (5 / 7)
  const dagelijksBenodigd = werkdagenResterend > 0 ? resterend / werkdagenResterend : 0

  return {
    opSchema: totaalUren >= verwachtUrenOpDitMoment,
    prognose: Math.round(prognose * 10) / 10,
    dagelijksBenodigd: Math.round(dagelijksBenodigd * 10) / 10,
    resterend: Math.round(resterend * 10) / 10,
    percentageBehaald: Math.min(100, Math.round((totaalUren / UREN_CRITERIUM) * 100)),
  }
}

export function berekenZZPScore({
  urenPercentage,
  openFacturen,
  totaalFacturen,
  belastingGereserveerd,
  omzetTrend,
}: {
  urenPercentage: number
  openFacturen: number
  totaalFacturen: number
  belastingGereserveerd: boolean
  omzetTrend: 'stijgend' | 'stabiel' | 'dalend'
}): {
  score: number
  label: string
  kleur: string
  details: { categorie: string; punten: number; max: number }[]
} {
  let score = 0
  const details: { categorie: string; punten: number; max: number }[] = []

  // Urencriterium (40 punten)
  const urenPunten = Math.min(40, Math.round(urenPercentage * 0.4))
  score += urenPunten
  details.push({ categorie: 'Urencriterium', punten: urenPunten, max: 40 })

  // Openstaande facturen (25 punten)
  const openRatio = totaalFacturen > 0 ? openFacturen / totaalFacturen : 0
  const factuurPunten = Math.round((1 - openRatio) * 25)
  score += factuurPunten
  details.push({ categorie: 'Factuurstatus', punten: factuurPunten, max: 25 })

  // Belastingreservering (20 punten)
  const belastingPunten = belastingGereserveerd ? 20 : 0
  score += belastingPunten
  details.push({ categorie: 'Belastingreservering', punten: belastingPunten, max: 20 })

  // Omzetrend (15 punten)
  const trendPunten = omzetTrend === 'stijgend' ? 15 : omzetTrend === 'stabiel' ? 10 : 3
  score += trendPunten
  details.push({ categorie: 'Omzetrend', punten: trendPunten, max: 15 })

  const label = score >= 80 ? 'Uitstekend' : score >= 60 ? 'Goed' : score >= 40 ? 'Matig' : 'Aandacht nodig'
  const kleur = score >= 80 ? '#00D9A6' : score >= 60 ? '#3B82F6' : score >= 40 ? '#F59E0B' : '#EF4444'

  return { score, label, kleur, details }
}

export function berekenBTW(entries: Array<{ bedrag: number; btw: number }>) {
  const totaalExBTW = entries.reduce((s, e) => s + e.bedrag, 0)
  const totaalBTW = entries.reduce((s, e) => s + e.btw, 0)
  return { totaalExBTW, totaalBTW, totaalIncBTW: totaalExBTW + totaalBTW }
}

export function generateFactuurNummer(existing: string[]): string {
  const jaar = new Date().getFullYear()
  const prefix = `F${jaar}-`
  const nummers = existing
    .filter(n => n.startsWith(prefix))
    .map(n => parseInt(n.replace(prefix, ''), 10))
    .filter(n => !isNaN(n))

  const volgend = nummers.length > 0 ? Math.max(...nummers) + 1 : 1
  return `${prefix}${String(volgend).padStart(4, '0')}`
}
