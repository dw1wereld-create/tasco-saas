'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Clock, FileText, PiggyBank, TrendingUp,
  Crown, Plus, ArrowRight, AlertTriangle, CheckCircle2,
  BarChart3, Zap
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { formatEuro, formatDatum, UREN_CRITERIUM } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Props {
  naam: string
  plan: string
  justUpgraded?: boolean
  stats: {
    totaalUren: number
    declarabelUren: number
    urenPrognose: {
      opSchema: boolean
      prognose: number
      dagelijksBenodigd: number
      resterend: number
      percentageBehaald: number
    }
    jaarOmzet: number
    openFacturen: number
    totaalOpen: number
    verlateFacturen: number
    nettoBTW: number
    belastingReservering: number
    heeftZelfstandigenAftrek: boolean
    omzetTrend: 'stijgend' | 'stabiel' | 'dalend'
  }
  zzpScore: { score: number; label: string; kleur: string; details: { categorie: string; punten: number; max: number }[] }
  maandOmzet: { maand: string; omzet: number }[]
  recenteEntries: { id: string; datum: string; uren: number; omschrijving: string; klant: string; declarabel: boolean }[]
  recenteFacturen: { id: string; factuurNummer: string; klant: string; totaal: number; status: string; datum: string }[]
}

const statusBadge = (status: string) => {
  switch (status) {
    case 'PAID': return <span className="badge-paid">Betaald</span>
    case 'OPEN': return <span className="badge-open">Open</span>
    case 'OVERDUE': return <span className="badge-overdue">Te laat</span>
    default: return <span className="badge-draft">Concept</span>
  }
}

export default function DashboardClient({ naam, plan, justUpgraded, stats, zzpScore, maandOmzet, recenteEntries, recenteFacturen }: Props) {
  const isPro = plan === 'PRO' || plan === 'PREMIUM'
  const uur = new Date().getHours()
  const greeting = uur < 12 ? 'Goedemorgen' : uur < 18 ? 'Goedemiddag' : 'Goedenavond'
  const voornaam = naam.split(' ')[0]

  useEffect(() => {
    if (justUpgraded) {
      toast.success('Welkom bij Pro! Alle features zijn nu beschikbaar.')
    }
  }, [justUpgraded])

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#9898B0] font-medium">{greeting}</p>
          <h1 className="text-2xl font-black text-[#0F0F1E]">{voornaam} 👋</h1>
        </div>
        <Link href="/uren" className="btn-primary py-2.5 px-4 text-sm flex items-center gap-1.5">
          <Plus size={16} /> Uren
        </Link>
      </motion.div>

      {/* ZZP Gezondheidsscore */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="card p-5 bg-gradient-to-br from-[#0F0F1E] to-[#1a1a3e] text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white/60 text-sm font-medium">ZZP Gezondheidsscore</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-5xl font-black" style={{ color: zzpScore.kleur }}>
                  {zzpScore.score}
                </span>
                <span className="text-white/40 text-lg">/100</span>
              </div>
              <span className="inline-block mt-2 text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${zzpScore.kleur}20`, color: zzpScore.kleur }}>
                {zzpScore.label}
              </span>
            </div>
            <div className="text-right">
              <Zap size={32} style={{ color: zzpScore.kleur }} className="opacity-60" />
            </div>
          </div>

          {/* Score breakdown */}
          <div className="space-y-2">
            {zzpScore.details.map(d => (
              <div key={d.categorie}>
                <div className="flex justify-between text-xs text-white/60 mb-1">
                  <span>{d.categorie}</span>
                  <span>{d.punten}/{d.max}</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${(d.punten / d.max) * 100}%`, backgroundColor: zzpScore.kleur }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Urencriterium */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-50 rounded-xl flex items-center justify-center">
                <Clock size={16} className="text-brand-500" />
              </div>
              <div>
                <p className="font-bold text-[#0F0F1E] text-sm">Urencriterium {new Date().getFullYear()}</p>
                <p className="text-xs text-[#9898B0]">1225 uur voor zelfstandigenaftrek</p>
              </div>
            </div>
            <Link href="/uren" className="text-xs text-brand-500 font-semibold flex items-center gap-0.5">
              Details <ArrowRight size={12} />
            </Link>
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-black text-[#0F0F1E]">{stats.totaalUren} u</span>
            <span className="text-sm text-[#9898B0]">van {UREN_CRITERIUM} uur</span>
          </div>

          <div className="progress-bar mb-3">
            <div
              className={cn("progress-fill", stats.heeftZelfstandigenAftrek ? "bg-emerald-500" : "bg-brand-500")}
              style={{ width: `${stats.urenPrognose.percentageBehaald}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-xs text-[#9898B0]">Resterend</p>
              <p className="text-sm font-bold text-[#0F0F1E]">{stats.urenPrognose.resterend} u</p>
            </div>
            <div className="text-center border-x border-[#E8E8F5]">
              <p className="text-xs text-[#9898B0]">Prognose</p>
              <div className="flex items-center justify-center gap-1">
                {stats.urenPrognose.opSchema
                  ? <CheckCircle2 size={13} className="text-emerald-500" />
                  : <AlertTriangle size={13} className="text-amber-500" />}
                <p className="text-sm font-bold text-[#0F0F1E]">{stats.urenPrognose.prognose} u</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-[#9898B0]">Per dag</p>
              <p className="text-sm font-bold text-[#0F0F1E]">{stats.urenPrognose.dagelijksBenodigd} u</p>
            </div>
          </div>

          {stats.heeftZelfstandigenAftrek && (
            <div className="mt-3 p-2.5 bg-emerald-50 rounded-xl flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <p className="text-xs font-semibold text-emerald-700">Zelfstandigenaftrek behaald! 🎉</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="grid grid-cols-2 gap-3">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <TrendingUp size={18} className="text-emerald-500" />
            <span className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-full",
              stats.omzetTrend === 'stijgend' ? 'bg-emerald-100 text-emerald-700' :
              stats.omzetTrend === 'dalend' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-600'
            )}>
              {stats.omzetTrend === 'stijgend' ? '↑' : stats.omzetTrend === 'dalend' ? '↓' : '→'} {stats.omzetTrend}
            </span>
          </div>
          <p className="text-xl font-black text-[#0F0F1E] mt-2">{formatEuro(stats.jaarOmzet)}</p>
          <p className="text-xs text-[#9898B0]">Omzet {new Date().getFullYear()}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <FileText size={18} className={stats.verlateFacturen > 0 ? 'text-red-500' : 'text-blue-500'} />
            {stats.verlateFacturen > 0 && (
              <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                {stats.verlateFacturen} te laat
              </span>
            )}
          </div>
          <p className="text-xl font-black text-[#0F0F1E] mt-2">{stats.openFacturen}</p>
          <p className="text-xs text-[#9898B0]">Openstaand ({formatEuro(stats.totaalOpen)})</p>
        </div>

        <div className="stat-card">
          <PiggyBank size={18} className="text-amber-500" />
          <p className="text-xl font-black text-[#0F0F1E] mt-2">{formatEuro(stats.nettoBTW)}</p>
          <p className="text-xs text-[#9898B0]">BTW dit kwartaal</p>
        </div>

        <div className="stat-card">
          <BarChart3 size={18} className="text-purple-500" />
          <p className="text-xl font-black text-[#0F0F1E] mt-2">{formatEuro(stats.belastingReservering)}</p>
          <p className="text-xs text-[#9898B0]">Belastingreservering</p>
        </div>
      </motion.div>

      {/* Omzetgrafiek (Pro) */}
      {isPro ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="card p-5">
            <p className="font-bold text-[#0F0F1E] mb-4">Omzet laatste 6 maanden</p>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={maandOmzet}>
                <defs>
                  <linearGradient id="omzetGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E8F5" />
                <XAxis dataKey="maand" tick={{ fontSize: 11, fill: '#9898B0' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9898B0' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `€${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v: number) => [formatEuro(v), 'Omzet']}
                  contentStyle={{ background: '#fff', border: '1px solid #E8E8F5', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="omzet" stroke="#6C63FF" strokeWidth={2.5} fill="url(#omzetGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="card p-5 border-2 border-dashed border-brand-200 bg-brand-50/50">
            <div className="flex items-start gap-3">
              <Crown size={24} className="text-brand-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-[#0F0F1E] mb-1">Omzetgrafiek — Pro</p>
                <p className="text-sm text-[#6B6B8A] mb-3">Zie je omzettrend per maand met een Pro abonnement</p>
                <Link href="/upgrade" className="btn-primary text-sm py-2 px-4 inline-flex items-center gap-1.5">
                  <Crown size={14} /> Upgrade naar Pro
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recente facturen */}
      {recenteFacturen.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="card">
            <div className="flex items-center justify-between p-5 pb-3">
              <p className="font-bold text-[#0F0F1E]">Recente facturen</p>
              <Link href="/facturen" className="text-xs text-brand-500 font-semibold flex items-center gap-0.5">
                Alle <ArrowRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-[#E8E8F5]">
              {recenteFacturen.map(inv => (
                <Link key={inv.id} href={`/facturen/${inv.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-[#0F0F1E]">{inv.klant}</p>
                    <p className="text-xs text-[#9898B0]">{inv.factuurNummer} · {formatDatum(inv.datum)}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className="text-sm font-bold text-[#0F0F1E]">{formatEuro(inv.totaal)}</span>
                    {statusBadge(inv.status)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Recente uren */}
      {recenteEntries.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="card">
            <div className="flex items-center justify-between p-5 pb-3">
              <p className="font-bold text-[#0F0F1E]">Recente uren</p>
              <Link href="/uren" className="text-xs text-brand-500 font-semibold flex items-center gap-0.5">
                Alle <ArrowRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-[#E8E8F5]">
              {recenteEntries.map(e => (
                <div key={e.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-semibold text-[#0F0F1E]">{e.omschrijving || e.klant || 'Uren'}</p>
                    <p className="text-xs text-[#9898B0]">{formatDatum(e.datum)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#0F0F1E]">{e.uren} u</p>
                    <p className={cn("text-xs", e.declarabel ? "text-emerald-600" : "text-[#9898B0]")}>
                      {e.declarabel ? 'Declarabel' : 'Niet decl.'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {recenteEntries.length === 0 && recenteFacturen.length === 0 && (
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Clock size={32} className="text-brand-400" />
          </div>
          <h3 className="font-bold text-[#0F0F1E] mb-2">Begin met registreren</h3>
          <p className="text-sm text-[#6B6B8A] mb-4">Voeg je eerste uren toe om aan de slag te gaan</p>
          <Link href="/uren" className="btn-primary text-sm py-3 px-6 inline-flex items-center gap-2">
            <Plus size={16} /> Eerste uren invoeren
          </Link>
        </div>
      )}
    </div>
  )
}
