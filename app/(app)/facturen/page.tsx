'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, FileText, Crown, Download, Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { formatEuro, formatDatum, cn } from '@/lib/utils'

interface Invoice {
  id: string
  factuurNummer: string
  datum: string
  vervalDatum: string
  status: 'DRAFT' | 'OPEN' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  totaal: number
  subtotaal: number
  client: { naam: string }
}

export default function FacturenPage() {
  const { data: session } = useSession()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'open' | 'paid' | 'overdue'>('all')

  const isPro = session?.user?.plan === 'PRO' || session?.user?.plan === 'PREMIUM'

  useEffect(() => {
    fetch('/api/invoices').then(r => r.json()).then(d => {
      setInvoices(d.invoices ?? [])
      setLoading(false)
    })
  }, [])

  const filtered = filter === 'all' ? invoices
    : filter === 'open' ? invoices.filter(i => i.status === 'OPEN' || i.status === 'DRAFT')
    : filter === 'paid' ? invoices.filter(i => i.status === 'PAID')
    : invoices.filter(i => i.status === 'OVERDUE')

  const totalen = {
    open: invoices.filter(i => i.status === 'OPEN').reduce((s, i) => s + i.totaal, 0),
    betaald: invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.totaal, 0),
    verlaat: invoices.filter(i => i.status === 'OVERDUE').reduce((s, i) => s + i.totaal, 0),
  }

  const statusInfo = (status: string) => {
    switch (status) {
      case 'PAID': return { label: 'Betaald', cls: 'badge-paid' }
      case 'OPEN': return { label: 'Open', cls: 'badge-open' }
      case 'OVERDUE': return { label: 'Te laat', cls: 'badge-overdue' }
      default: return { label: 'Concept', cls: 'badge-draft' }
    }
  }

  if (!isPro) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-black text-[#0F0F1E]">Facturatie</h1>
        </div>
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Crown size={32} className="text-brand-500" />
          </div>
          <h2 className="text-xl font-black text-[#0F0F1E] mb-2">Pro feature</h2>
          <p className="text-[#6B6B8A] mb-6 max-w-sm mx-auto">
            Maak professionele facturen, stuur ze direct naar klanten en volg betalingen bij.
          </p>
          <ul className="text-left space-y-2 max-w-xs mx-auto mb-6">
            {['PDF facturen genereren', 'Automatisch vanuit uren', 'Betalingsstatus bijhouden', 'BTW berekening', 'Cashflow overzicht'].map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-[#4A4A6A]">
                <FileText size={15} className="text-brand-500" /> {f}
              </li>
            ))}
          </ul>
          <Link href="/upgrade" className="btn-primary inline-flex items-center gap-2">
            <Crown size={16} /> Upgrade naar Pro — € 9,99/mnd
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-[#0F0F1E]">Facturatie</h1>
          <p className="text-sm text-[#9898B0]">{invoices.length} facturen</p>
        </div>
        <Link href="/facturen/nieuw" className="btn-primary py-2.5 px-4 text-sm flex items-center gap-1.5">
          <Plus size={16} /> Nieuwe factuur
        </Link>
      </div>

      {/* Totalen */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="card p-3 text-center">
          <p className="text-xs text-[#9898B0] mb-1">Openstaand</p>
          <p className="text-base font-black text-blue-600">{formatEuro(totalen.open)}</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-xs text-[#9898B0] mb-1">Betaald</p>
          <p className="text-base font-black text-emerald-600">{formatEuro(totalen.betaald)}</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-xs text-[#9898B0] mb-1">Te laat</p>
          <p className="text-base font-black text-red-600">{formatEuro(totalen.verlaat)}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        {[
          { key: 'all', label: 'Alle' },
          { key: 'open', label: 'Open' },
          { key: 'overdue', label: 'Te laat' },
          { key: 'paid', label: 'Betaald' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all",
              filter === tab.key ? "bg-brand-500 text-white" : "bg-white text-[#6B6B8A] border border-[#E8E8F5]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Facturen lijst */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="w-8 h-8 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-8 text-center">
          <FileText size={40} className="mx-auto text-[#C0C0D0] mb-3" />
          <p className="font-semibold text-[#0F0F1E] mb-1">Geen facturen</p>
          <p className="text-sm text-[#9898B0] mb-4">Maak je eerste factuur aan</p>
          <Link href="/facturen/nieuw" className="btn-primary text-sm py-2.5 px-5 inline-flex items-center gap-1.5">
            <Plus size={15} /> Nieuwe factuur
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((inv, i) => {
            const info = statusInfo(inv.status)
            const isOverdue = inv.status === 'OVERDUE'
            return (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={cn("card p-4", isOverdue && "border-l-4 border-red-400")}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-[#0F0F1E]">{inv.client.naam}</p>
                      <span className={info.cls}>{info.label}</span>
                    </div>
                    <p className="text-xs text-[#9898B0]">
                      {inv.factuurNummer} · {formatDatum(inv.datum)}
                      {inv.status === 'OPEN' && ` · Vervalt ${formatDatum(inv.vervalDatum)}`}
                    </p>
                  </div>
                  <p className="text-lg font-black text-[#0F0F1E] ml-4">{formatEuro(inv.totaal)}</p>
                </div>
                <div className="flex gap-2 mt-3">
                  <Link href={`/facturen/${inv.id}`} className="flex-1 flex items-center justify-center gap-1.5 text-xs text-[#6B6B8A] bg-[#F5F4FF] hover:bg-brand-50 hover:text-brand-500 py-2 rounded-lg transition-colors">
                    <Eye size={13} /> Bekijken
                  </Link>
                  <button className="flex-1 flex items-center justify-center gap-1.5 text-xs text-[#6B6B8A] bg-[#F5F4FF] hover:bg-brand-50 hover:text-brand-500 py-2 rounded-lg transition-colors">
                    <Download size={13} /> PDF
                  </button>
                  {inv.status === 'OPEN' || inv.status === 'OVERDUE' ? (
                    <button
                      onClick={async () => {
                        await fetch(`/api/invoices/${inv.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'PAID', betaaldOp: new Date().toISOString() }) })
                        setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: 'PAID' } : i))
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 py-2 rounded-lg transition-colors font-semibold"
                    >
                      ✓ Betaald
                    </button>
                  ) : null}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
