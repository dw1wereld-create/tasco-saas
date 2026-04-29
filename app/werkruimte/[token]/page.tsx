'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Zap, Clock, FileText, Receipt, Car, Users, Eye, Pencil, Shield, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PortalData {
  member: { naam: string; role: 'VIEWER' | 'EDITOR' | 'ADMIN' }
  owner: { name: string | null; bedrijfsnaam: string | null; plan: string }
  data: {
    timeEntries: any[]
    invoices: any[]
    expenses: any[]
    trips: any[]
    clients: any[]
  }
}

const ROLE_ICONS = { VIEWER: Eye, EDITOR: Pencil, ADMIN: Shield }
const ROLE_LABELS = { VIEWER: 'Lezer', EDITOR: 'Bewerker', ADMIN: 'Beheerder' }

type Tab = 'uren' | 'facturen' | 'bonnen' | 'kilometers' | 'klanten'

function formatEuro(n: number) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n)
}
function formatDatum(d: string) {
  return new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function WerkruimtePage() {
  const { token } = useParams<{ token: string }>()
  const [portal, setPortal] = useState<PortalData | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('uren')

  useEffect(() => {
    fetch(`/api/werkruimte/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setPortal(d)
      })
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
        <h2 className="font-bold text-[#0F0F1E] mb-1">Toegang geweigerd</h2>
        <p className="text-sm text-[#6B6B8A]">{error}</p>
      </div>
    </div>
  )

  const { member, owner, data } = portal!
  const RoleIcon = ROLE_ICONS[member.role]
  const bedrijf = owner.bedrijfsnaam || owner.name || 'Onbekend bedrijf'

  const tabs: { id: Tab; label: string; icon: typeof Clock; count: number }[] = [
    { id: 'uren', label: 'Uren', icon: Clock, count: data.timeEntries.length },
    { id: 'facturen', label: 'Facturen', icon: FileText, count: data.invoices.length },
    { id: 'bonnen', label: 'Bonnen', icon: Receipt, count: data.expenses.length },
    { id: 'kilometers', label: 'Kilometers', icon: Car, count: data.trips.length },
    { id: 'klanten', label: 'Klanten', icon: Users, count: data.clients.length },
  ]

  return (
    <div className="min-h-screen bg-[#F5F4FF]">
      {/* Header */}
      <div className="bg-white border-b border-[#E8E8F5] px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-md shadow-brand-500/30">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <span className="text-lg font-black text-[#0F0F1E]">Tasco</span>
              <p className="text-xs text-[#9898B0] leading-none">{bedrijf}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full",
              member.role === 'ADMIN' ? "bg-red-50 text-red-600" :
              member.role === 'EDITOR' ? "bg-amber-50 text-amber-600" :
              "bg-blue-50 text-blue-600"
            )}>
              <RoleIcon size={11} /> {ROLE_LABELS[member.role]}
            </span>
            <span className="text-sm text-[#6B6B8A]">{member.naam}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-1">
          <h1 className="text-2xl font-black text-[#0F0F1E]">Werkruimte {bedrijf}</h1>
          <p className="text-sm text-[#9898B0]">Alleen-lezen weergave</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
          <StatCard label="Uren (totaal)" value={`${data.timeEntries.reduce((s, e) => s + e.uren, 0).toFixed(1)}u`} />
          <StatCard label="Openstaande facturen" value={data.invoices.filter(i => i.status === 'OPEN' || i.status === 'OVERDUE').length.toString()} />
          <StatCard label="Uitgaven" value={formatEuro(data.expenses.reduce((s, e) => s + e.bedrag, 0))} />
          <StatCard label="Zakelijke km" value={`${data.trips.reduce((s, t) => s + t.kilometers * (t.zakelijkPct / 100), 0).toFixed(0)} km`} />
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
              <span className="bg-[#E8E8F5] text-[#6B6B8A] px-1.5 rounded-full text-[10px]">{t.count}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
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

        {tab === 'facturen' && (
          <div className="space-y-2">
            {data.invoices.length === 0 ? <Empty label="Geen facturen" /> :
              data.invoices.map((inv: any) => (
                <div key={inv.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#0F0F1E]">{inv.factuurNummer} · {inv.client?.naam}</p>
                    <p className="text-xs text-[#9898B0]">{formatDatum(inv.datum)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#0F0F1E]">{formatEuro(inv.totaal)}</p>
                    <StatusBadge status={inv.status} />
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {tab === 'bonnen' && (
          <div className="space-y-2">
            {data.expenses.length === 0 ? <Empty label="Geen bonnen" /> :
              data.expenses.map((e: any) => (
                <div key={e.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#0F0F1E]">{e.leverancier || e.omschrijving || 'Uitgave'}</p>
                    <p className="text-xs text-[#9898B0]">{formatDatum(e.datum)} · {e.categorie}</p>
                  </div>
                  <p className="text-sm font-bold text-[#0F0F1E]">{formatEuro(e.bedrag)}</p>
                </div>
              ))
            }
          </div>
        )}

        {tab === 'kilometers' && (
          <div className="space-y-2">
            {data.trips.length === 0 ? <Empty label="Geen ritten" /> :
              data.trips.map((t: any) => (
                <div key={t.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#0F0F1E]">{t.van} → {t.naar}</p>
                    <p className="text-xs text-[#9898B0]">{formatDatum(t.datum)} · {t.zakelijkPct}% zakelijk{t.gpsTracked ? ' · GPS' : ''}</p>
                  </div>
                  <p className="text-sm font-bold text-[#0F0F1E]">{t.kilometers} km</p>
                </div>
              ))
            }
          </div>
        )}

        {tab === 'klanten' && (
          <div className="space-y-2">
            {data.clients.length === 0 ? <Empty label="Geen klanten" /> :
              data.clients.map((c: any) => (
                <div key={c.id} className="card p-4">
                  <p className="text-sm font-semibold text-[#0F0F1E]">{c.naam}</p>
                  <p className="text-xs text-[#9898B0]">{c.email ?? '—'} {c.stad ? `· ${c.stad}` : ''}</p>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4 text-center">
      <p className="text-xl font-black text-[#0F0F1E]">{value}</p>
      <p className="text-xs text-[#9898B0] mt-0.5">{label}</p>
    </div>
  )
}

function Empty({ label }: { label: string }) {
  return (
    <div className="card p-8 text-center text-sm text-[#9898B0]">{label}</div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-600',
    OPEN: 'bg-blue-100 text-blue-600',
    PAID: 'bg-emerald-100 text-emerald-600',
    OVERDUE: 'bg-red-100 text-red-600',
    CANCELLED: 'bg-gray-100 text-gray-500',
  }
  const labels: Record<string, string> = { DRAFT: 'Concept', OPEN: 'Openstaand', PAID: 'Betaald', OVERDUE: 'Verlopen', CANCELLED: 'Geannuleerd' }
  return <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", map[status] ?? '')}>{labels[status] ?? status}</span>
}
