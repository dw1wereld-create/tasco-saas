'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Crown, Info, Calculator } from 'lucide-react'
import { formatEuro, cn } from '@/lib/utils'

interface Kwartaal {
  kwartaal: string
  btwOntvangen: number
  btwBetaald: number
  nettoBTW: number
  deadline: string
  verstreken: boolean
}

interface Props {
  plan: string
  jaar: number
  totaalUren: number
  heeftZelfstandigenAftrek: boolean
  omzet: number
  totaalKosten: number
  kmAftrek: number
  brutoWinst: number
  zelfstandigenAftrek: number
  mkbWinstvrijstelling: number
  belastbaarInkomen: number
  ibSchatting: number
  zvwBijdrage: number
  totaalBelasting: number
  kwartalen: Kwartaal[]
  belastingPct: number
  aanbevolenReservering: number
}

export default function BelastingClient({ plan, jaar, totaalUren, heeftZelfstandigenAftrek, omzet, totaalKosten, kmAftrek, brutoWinst, zelfstandigenAftrek, mkbWinstvrijstelling, belastbaarInkomen, ibSchatting, zvwBijdrage, totaalBelasting, kwartalen, belastingPct, aanbevolenReservering }: Props) {
  const isPro = plan === 'PRO' || plan === 'PREMIUM'

  if (!isPro) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-black text-[#0F0F1E] mb-5">Belasting Overzicht</h1>
        <div className="card p-8 text-center">
          <Crown size={40} className="mx-auto text-brand-500 mb-4" />
          <h2 className="text-xl font-black text-[#0F0F1E] mb-2">Pro feature</h2>
          <p className="text-[#6B6B8A] mb-6">Gedetailleerd belastingoverzicht, BTW per kwartaal en automatische reserveringsberekening.</p>
          <Link href="/upgrade" className="btn-primary inline-flex items-center gap-2">
            <Crown size={16} /> Upgrade naar Pro
          </Link>
        </div>
      </div>
    )
  }

  const huidigKwartaal = Math.floor(new Date().getMonth() / 3)

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-black text-[#0F0F1E]">Belasting Overzicht</h1>
        <p className="text-sm text-[#9898B0]">Schatting voor belastingjaar {jaar}</p>
      </div>

      {/* Urencriterium status */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className={cn("card p-4 flex items-start gap-3", heeftZelfstandigenAftrek ? "border-l-4 border-emerald-400" : "border-l-4 border-amber-400")}>
          {heeftZelfstandigenAftrek
            ? <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />
            : <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />}
          <div>
            <p className="font-bold text-[#0F0F1E]">
              {heeftZelfstandigenAftrek ? 'Zelfstandigenaftrek behaald ✓' : 'Zelfstandigenaftrek nog niet behaald'}
            </p>
            <p className="text-sm text-[#6B6B8A]">
              {totaalUren.toFixed(0)} uur geregistreerd {heeftZelfstandigenAftrek
                ? `· Aftrek: ${formatEuro(zelfstandigenAftrek)}`
                : `· Nog ${(1225 - totaalUren).toFixed(0)} uur nodig`}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Winst berekening */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calculator size={18} className="text-brand-500" />
            <p className="font-bold text-[#0F0F1E]">Winst & Belasting {jaar}</p>
          </div>
          <div className="space-y-3">
            <RegelRij label="Omzet (excl. BTW)" waarde={omzet} positief />
            <RegelRij label="Kosten" waarde={-totaalKosten} />
            <RegelRij label="Km-aftrek" waarde={-kmAftrek} />
            <div className="border-t border-[#E8E8F5] pt-3">
              <RegelRij label="Bruto winst" waarde={brutoWinst} bold />
            </div>
            {heeftZelfstandigenAftrek && <RegelRij label="Zelfstandigenaftrek" waarde={-zelfstandigenAftrek} />}
            <RegelRij label="MKB-winstvrijstelling (12,7%)" waarde={-mkbWinstvrijstelling} />
            <div className="border-t border-[#E8E8F5] pt-3">
              <RegelRij label="Belastbaar inkomen" waarde={belastbaarInkomen} bold />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Belasting breakdown */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="card p-5">
          <p className="font-bold text-[#0F0F1E] mb-4">Geschatte belasting</p>
          <div className="space-y-3">
            <RegelRij label="Inkomstenbelasting (IB)" waarde={ibSchatting} rood />
            <RegelRij label="Zorgverzekeringswet (ZVW)" waarde={zvwBijdrage} rood />
            <div className="border-t border-[#E8E8F5] pt-3">
              <div className="flex items-baseline justify-between">
                <span className="font-black text-[#0F0F1E]">Totaal belasting</span>
                <span className="text-2xl font-black text-red-500">{formatEuro(totaalBelasting)}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-amber-50 rounded-xl flex items-start gap-2">
            <Info size={15} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">Schatting o.b.v. belastingschijven 2024. Raadpleeg een boekhouder voor exacte berekening.</p>
          </div>
        </div>
      </motion.div>

      {/* Reserveringsadvies */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="card p-5 bg-gradient-to-br from-brand-500 to-blue-500 text-white">
          <p className="font-bold mb-1">Aanbevolen reservering</p>
          <p className="text-4xl font-black mb-2">{formatEuro(aanbevolenReservering)}</p>
          <p className="text-white/70 text-sm">
            {belastingPct}% van omzet apart zetten · Huidige omzet: {formatEuro(omzet)}
          </p>
          <p className="text-xs text-white/60 mt-2">
            Pas dit percentage aan via Instellingen
          </p>
        </div>
      </motion.div>

      {/* BTW per kwartaal */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="card">
          <div className="p-5 pb-3">
            <p className="font-bold text-[#0F0F1E]">BTW per kwartaal</p>
          </div>
          <div className="divide-y divide-[#E8E8F5]">
            {kwartalen.map((kw, i) => (
              <div key={kw.kwartaal} className={cn(
                "flex items-center justify-between px-5 py-4",
                i === huidigKwartaal && "bg-brand-50"
              )}>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#0F0F1E] text-sm">{kw.kwartaal}</p>
                    {i === huidigKwartaal && <span className="text-xs bg-brand-500 text-white px-2 py-0.5 rounded-full">Huidig</span>}
                    {kw.verstreken && i < huidigKwartaal && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Afgerond</span>}
                  </div>
                  <p className="text-xs text-[#9898B0] mt-0.5">
                    Deadline: {new Date(kw.deadline).toLocaleDateString('nl-NL')} ·
                    Ontvangen: {formatEuro(kw.btwOntvangen)} · Betaald: {formatEuro(kw.btwBetaald)}
                  </p>
                </div>
                <p className={cn("font-black text-lg", kw.nettoBTW > 0 ? "text-red-500" : "text-emerald-500")}>
                  {formatEuro(kw.nettoBTW)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function RegelRij({ label, waarde, positief, bold, rood }: { label: string; waarde: number; positief?: boolean; bold?: boolean; rood?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn("text-sm", bold ? "font-bold text-[#0F0F1E]" : "text-[#6B6B8A]")}>{label}</span>
      <span className={cn(
        "font-semibold text-sm",
        bold ? "font-black text-base text-[#0F0F1E]" : "",
        rood ? "text-red-500" : waarde >= 0 ? "text-[#0F0F1E]" : "text-red-500"
      )}>
        {waarde >= 0 ? '' : ''}{formatEuro(Math.abs(waarde))}
      </span>
    </div>
  )
}
