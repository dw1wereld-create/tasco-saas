'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Zap, FileText, Receipt, Clock, Car, AlertCircle, TrendingUp, Euro } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccountantData {
  access: { label: string; lastUsedAt: string | null }
  user: { name: string | null; bedrijfsnaam: string | null; kvkNummer: string | null; btwNummer: string | null; stad: string | null }
  jaar: number
  samenvatting: { omzetJaar: number; btwJaar: number; kostenJaar: number; kmJaar: number }
  data: { invoices: any[]; expenses: any[]; timeEntries: any[]; trips: any[] }
}

type Tab = 'samenvatting' | 'facturen' | 'bonnen' | 'uren' | 'kilometers'

function formatEuro(n: number) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n)
}
function formatDatum(d: string) {
  return new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AccountantPortaalPage() {
  const { token } = useParams<{ token: string }>()
  const [portal, setPortal] = useState<AccountantData | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('samenvatting')

  useEffect(() => {
    fetch(`/api/accountant/${token}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setPortal(d) })
      .catch(() => setError('Kon gegevens niet laden'))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return (
    <div className="min-h-screen bg-[#F5F4FF] flex items-center justify-center">
      <span className="w-8 h-8 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-[#F5F4FF] flex items-center justify-center p-4">
      <div className="card p-8 text-center max-w-sm">
        <AlertCircle size={36} className="mx-auto text-red-400 mb-3" />
        <h2 className="font-bold text-[#0F0F1E] mb-1">Toegang niet mogelijk</h2>
        <p className="text-sm text-[#6B6B8A]">{error}</p>
      </div>
    </div>
  )

  const { user, jaar, samenvatting, data } = portal!
  const bedrijf = user.bedrijfsnaam || user.name || 'Onbekend'

  const tabs: { id: Tab; label: string; icon: typeof FileText }[] = [
    { id: 'samenvatting', label: 'Samenvatting', icon: TrendingUp },
    { id: 'facturen', label: `Facturen (${data.invoices.length})`, icon: FileText },
    { id: 'bonnen', label: `Bonnen (${data.expenses.length})`, icon: Receipt },
    { id: 'uren', label: `Uren (${data.timeEntries.length})`, icon: Clock },
    { id: 'kilometers', label: `Kilometers (${data.trips.length})`, icon: Car },
  ]

  const factuurStatussen = {
    betaald: data.invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.totaal, 0),
    open: data.invoices.filter(i => i.status === 'OPEN').reduce((s, i) => s + i.totaal, 0),
    verlopen: data.invoices.filter(i => i.status === 'OVERDUE').reduce((s, i) => s + i.totaal, 0),
  }

  const kostenPerCategorie = data.expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.categorie] = (acc[e.categorie] ?? 0) + e.bedrag
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-[#F5F4FF]">
      {/* Header */}
      <div className="bg-white border-b border-[#E8E8F5] px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-md shadow-brand-500/30">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <span className="text-lg font-black text-[#0F0F1E]">Tasco</span>
              <p className="text-xs text-[#9898B0] leading-none">Accountant-portaal</p>
            </div>
          </div>
          <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-full">Alleen-lezen</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Bedrijfsinfo */}
        <div className="card p-5 mb-6">
          <h1 className="text-xl font-black text-[#0F0F1E] mb-1">{bedrijf}</h1>
          <div className="flex flex-wrap gap-3 text-xs text-[#6B6B8A]">
            {user.kvkNummer && <span>KvK: {user.kvkNummer}</span>}
            {user.btwNummer && <span>BTW: {user.btwNummer}</span>}
            {user.stad && <span>{user.stad}</span>}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1 mb-5 border border-[#E8E8F5] overflow-x-auto scrollbar-hide">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all",
                tab === t.id ? "bg-[#F5F4FF] text-brand-600 shadow-sm" : "text-[#6B6B8A] hover:text-[#0F0F1E]"
              )}>
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>

        {/* Samenvatting */}
        {tab === 'samenvatting' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <KpiCard label={`Omzet ${jaar}`} value={formatEuro(samenvatting.omzetJaar)} sub="Betaalde facturen" color="emerald" />
              <KpiCard label={`BTW ${jaar}`} value={formatEuro(samenvatting.btwJaar)} sub="Af te dragen" color="blue" />
              <KpiCard label={`Kosten ${jaar}`} value={formatEuro(samenvatting.kostenJaar)} sub="Totale uitgaven" color="amber" />
              <KpiCard label={`Km ${jaar}`} value={`${samenvatting.kmJaar.toFixed(0)} km`} sub={`Aftrek: ${formatEuro(samenvatting.kmJaar * 0.23)}`} color="purple" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Factuurstatus */}
              <div className="card p-5">
                <h3 className="font-bold text-[#0F0F1E] mb-3">Facturen</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Betaald', bedrag: factuurStatussen.betaald, cls: 'text-emerald-600' },
                    { label: 'Openstaand', bedrag: factuurStatussen.open, cls: 'text-blue-600' },
                    { label: 'Verlopen', bedrag: factuurStatussen.verlopen, cls: 'text-red-600' },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between text-sm">
                      <span className="text-[#6B6B8A]">{r.label}</span>
                      <span className={cn("font-bold", r.cls)}>{formatEuro(r.bedrag)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kosten per categorie */}
              <div className="card p-5">
                <h3 className="font-bold text-[#0F0F1E] mb-3">Kosten per categorie</h3>
                <div className="space-y-2">
                  {Object.entries(kostenPerCategorie)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([cat, bedrag]) => (
                      <div key={cat} className="flex justify-between text-sm">
                        <span className="text-[#6B6B8A] capitalize">{cat.toLowerCase().replace('_', ' ')}</span>
                        <span className="font-semibold text-[#0F0F1E]">{formatEuro(bedrag)}</span>
                      </div>
                    ))}
                  {Object.keys(kostenPerCategorie).length === 0 && <p className="text-sm text-[#9898B0]">Geen uitgaven</p>}
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-xs text-amber-700">
              <strong>Let op:</strong> Dit portaal toont uitsluitend gegevens uit Tasco. Controleer altijd de originele boekhouding voor belastingaangiften.
            </div>
          </div>
        )}

        {/* Facturen */}
        {tab === 'facturen' && (
          <div className="space-y-2">
            {data.invoices.length === 0 ? <Empty label="Geen facturen" /> :
              data.invoices.map((inv: any) => (
                <div key={inv.id} className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-[#0F0F1E]">{inv.factuurNummer}</p>
                      <p className="text-xs text-[#9898B0]">{inv.client?.naam} · {formatDatum(inv.datum)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#0F0F1E]">{formatEuro(inv.totaal)}</p>
                      <StatusBadge status={inv.status} />
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-[#9898B0] border-t border-[#F0F0F8] pt-2">
                    <span>Excl. BTW: {formatEuro(inv.subtotaal)}</span>
                    <span>BTW {inv.btwTarief}%: {formatEuro(inv.btwBedrag)}</span>
                    <span>Vervaldatum: {formatDatum(inv.vervalDatum)}</span>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* Bonnen */}
        {tab === 'bonnen' && (
          <div className="space-y-2">
            {data.expenses.length === 0 ? <Empty label="Geen bonnen" /> :
              data.expenses.map((e: any) => (
                <div key={e.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#0F0F1E]">{e.leverancier || e.omschrijving || 'Uitgave'}</p>
                    <p className="text-xs text-[#9898B0]">{formatDatum(e.datum)} · {e.categorie.toLowerCase().replace('_', ' ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#0F0F1E]">{formatEuro(e.bedrag)}</p>
                    {e.btw > 0 && <p className="text-xs text-[#9898B0]">BTW: {formatEuro(e.btw)}</p>}
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* Uren */}
        {tab === 'uren' && (
          <div className="space-y-2">
            {data.timeEntries.length === 0 ? <Empty label="Geen urenregistraties" /> :
              data.timeEntries.map((e: any) => (
                <div key={e.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#0F0F1E]">{e.omschrijving || 'Geen omschrijving'}</p>
                    <p className="text-xs text-[#9898B0]">{formatDatum(e.datum)} · {e.client?.naam ?? '—'} {e.project ? `· ${e.project.naam}` : ''}</p>
                  </div>
                  <p className="text-sm font-bold text-[#0F0F1E]">{e.uren}u</p>
                </div>
              ))
            }
          </div>
        )}

        {/* Kilometers */}
        {tab === 'kilometers' && (
          <div className="space-y-2">
            {data.trips.length === 0 ? <Empty label="Geen ritten" /> :
              data.trips.map((t: any) => (
                <div key={t.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#0F0F1E]">{t.van} → {t.naar}</p>
                    <p className="text-xs text-[#9898B0]">{formatDatum(t.datum)} · {t.zakelijkPct}% zakelijk{t.doel ? ` · ${t.doel}` : ''}{t.gpsTracked ? ' · GPS' : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#0F0F1E]">{t.kilometers} km</p>
                    <p className="text-xs text-emerald-600">Aftrek: {formatEuro(t.kilometers * (t.zakelijkPct / 100) * 0.23)}</p>
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  )
}

function KpiCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
    purple: 'bg-purple-50 text-purple-700',
  }
  return (
    <div className={cn("rounded-2xl p-4", colors[color])}>
      <p className="text-xs font-semibold opacity-70 mb-1">{label}</p>
      <p className="text-xl font-black">{value}</p>
      <p className="text-xs opacity-60 mt-0.5">{sub}</p>
    </div>
  )
}

function Empty({ label }: { label: string }) {
  return <div className="card p-8 text-center text-sm text-[#9898B0]">{label}</div>
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-600', OPEN: 'bg-blue-100 text-blue-600',
    PAID: 'bg-emerald-100 text-emerald-600', OVERDUE: 'bg-red-100 text-red-600', CANCELLED: 'bg-gray-100 text-gray-500',
  }
  const labels: Record<string, string> = { DRAFT: 'Concept', OPEN: 'Openstaand', PAID: 'Betaald', OVERDUE: 'Verlopen', CANCELLED: 'Geannuleerd' }
  return <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", map[status] ?? '')}>{labels[status] ?? status}</span>
}
