'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Car, Trash2, Crown, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { formatEuro, formatDatum, getTodayISO, cn } from '@/lib/utils'

interface Trip {
  id: string
  datum: string
  van: string
  naar: string
  kilometers: number
  doel: string | null
  zakelijkPct: number
  client?: { naam: string } | null
}

export default function KilometersPage() {
  const { data: session } = useSession()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    datum: getTodayISO(),
    van: '',
    naar: '',
    kilometers: '',
    doel: '',
    zakelijkPct: 100,
    clientId: '',
  })
  const [clients, setClients] = useState<{ id: string; naam: string }[]>([])

  const isPro = session?.user?.plan === 'PRO' || session?.user?.plan === 'PREMIUM'

  const laadData = useCallback(async () => {
    const [t, c] = await Promise.all([
      fetch('/api/trips').then(r => r.json()),
      fetch('/api/clients').then(r => r.json()),
    ])
    setTrips(t.trips ?? [])
    setClients(c.clients ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { laadData() }, [laadData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const km = parseFloat(form.kilometers)
    if (isNaN(km) || km <= 0) { toast.error('Voer geldige kilometers in'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, kilometers: km }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setTrips(prev => [data.trip, ...prev])
      toast.success('Rit opgeslagen!')
      setShowForm(false)
      setForm({ datum: getTodayISO(), van: '', naar: '', kilometers: '', doel: '', zakelijkPct: 100, clientId: '' })
    } catch {
      toast.error('Opslaan mislukt')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Rit verwijderen?')) return
    await fetch(`/api/trips?id=${id}`, { method: 'DELETE' })
    setTrips(prev => prev.filter(t => t.id !== id))
    toast.success('Verwijderd')
  }

  const jaar = new Date().getFullYear()
  const jaarTrips = trips.filter(t => new Date(t.datum).getFullYear() === jaar)
  const totaalKm = jaarTrips.reduce((s, t) => s + (t.kilometers * (t.zakelijkPct / 100)), 0)
  const kmAftrek = totaalKm * 0.23

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-[#0F0F1E]">Kilometerregistratie</h1>
          <p className="text-sm text-[#9898B0]">{jaar} · {jaarTrips.length} ritten</p>
        </div>
        <div className="flex gap-2">
          {isPro && (
            <button
              onClick={async () => {
                const res = await fetch('/api/trips/export')
                const blob = await res.blob()
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url; a.download = `kilometers-${jaar}.csv`; a.click()
                toast.success('Export gedownload')
              }}
              className="btn-secondary py-2.5 px-3 text-sm flex items-center gap-1"
            >
              <Download size={15} />
            </button>
          )}
          <button onClick={() => setShowForm(true)} className="btn-primary py-2.5 px-4 text-sm flex items-center gap-1.5">
            <Plus size={16} /> Rit
          </button>
        </div>
      </div>

      {/* Totalen */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="card p-4 text-center">
          <Car size={20} className="mx-auto text-emerald-500 mb-2" />
          <p className="text-2xl font-black text-[#0F0F1E]">{totaalKm.toFixed(0)}</p>
          <p className="text-xs text-[#9898B0]">Zakelijke km {jaar}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-black text-emerald-600">{formatEuro(kmAftrek)}</p>
          <p className="text-xs text-[#9898B0]">Belastingaftrek (€ 0,23/km)</p>
        </div>
      </div>

      {/* Belastingdienst info */}
      <div className="card p-4 mb-4 bg-blue-50 border border-blue-100">
        <p className="text-xs text-blue-700 font-semibold mb-1">Belastingdienst vereisten</p>
        <p className="text-xs text-blue-600">
          Bewaar: datum, vertrekpunt, bestemming, kilometers en zakelijk doel.
          Tarief 2024: € 0,23 per zakelijke kilometer.
        </p>
      </div>

      {/* Formulier */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="card p-5 mb-5 border-2 border-brand-200">
            <h2 className="font-bold text-[#0F0F1E] mb-4">Rit registreren</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Datum</label>
                  <input type="date" value={form.datum} onChange={e => setForm({ ...form, datum: e.target.value })} className="input" required />
                </div>
                <div>
                  <label className="label">Kilometers</label>
                  <input type="number" step="0.1" min="0" value={form.kilometers} onChange={e => setForm({ ...form, kilometers: e.target.value })} className="input" placeholder="45.5" required autoFocus />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Van</label>
                  <input type="text" value={form.van} onChange={e => setForm({ ...form, van: e.target.value })} className="input" placeholder="Amsterdam" required />
                </div>
                <div>
                  <label className="label">Naar</label>
                  <input type="text" value={form.naar} onChange={e => setForm({ ...form, naar: e.target.value })} className="input" placeholder="Rotterdam" required />
                </div>
              </div>
              <div>
                <label className="label">Zakelijk doel</label>
                <input type="text" value={form.doel} onChange={e => setForm({ ...form, doel: e.target.value })} className="input" placeholder="Klantbezoek, vergadering, etc." />
              </div>
              <div>
                <label className="label">Zakelijk percentage</label>
                <div className="flex gap-2">
                  {[100, 75, 50].map(pct => (
                    <button key={pct} type="button" onClick={() => setForm({ ...form, zakelijkPct: pct })}
                      className={cn("flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all",
                        form.zakelijkPct === pct ? "bg-brand-500 border-brand-500 text-white" : "bg-white border-[#E8E8F5] text-[#6B6B8A]")}>
                      {pct}% zakelijk
                    </button>
                  ))}
                </div>
              </div>
              {form.kilometers && !isNaN(parseFloat(form.kilometers)) && (
                <div className="p-3 bg-emerald-50 rounded-xl text-sm text-emerald-700 font-medium">
                  Belastingaftrek: {formatEuro(parseFloat(form.kilometers) * (form.zakelijkPct / 100) * 0.23)}
                </div>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Annuleren</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Opslaan'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ritten lijst */}
      {loading ? (
        <div className="flex justify-center py-12"><span className="w-8 h-8 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" /></div>
      ) : trips.length === 0 ? (
        <div className="card p-8 text-center">
          <Car size={40} className="mx-auto text-[#C0C0D0] mb-3" />
          <p className="font-semibold text-[#0F0F1E] mb-1">Geen ritten</p>
          <p className="text-sm text-[#9898B0]">Registreer je eerste zakelijke rit</p>
        </div>
      ) : (
        <div className="space-y-2">
          {trips.map((trip, i) => (
            <motion.div key={trip.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
              className="card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <Car size={18} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0F0F1E]">{trip.van} → {trip.naar}</p>
                  <p className="text-xs text-[#9898B0]">
                    {formatDatum(trip.datum)} · {trip.kilometers} km
                    {trip.zakelijkPct < 100 && ` (${trip.zakelijkPct}% zakelijk)`}
                    {trip.doel && ` · ${trip.doel}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-emerald-600">
                  {formatEuro(trip.kilometers * (trip.zakelijkPct / 100) * 0.23)}
                </p>
                <button onClick={() => handleDelete(trip.id)} className="w-8 h-8 flex items-center justify-center text-[#9898B0] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
