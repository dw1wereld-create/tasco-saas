'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Clock, Trash2, ChevronDown, CheckCircle2, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { formatEuro, formatDatum, berekenUrenPrognose, UREN_CRITERIUM, getTodayISO, cn } from '@/lib/utils'

interface TimeEntry {
  id: string
  datum: string
  uren: number
  omschrijving: string | null
  declarabel: boolean
  client?: { naam: string } | null
  project?: { naam: string } | null
}

interface Client { id: string; naam: string }
interface Project { id: string; naam: string }

export default function UrenPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uurtarief, setUurtarief] = useState(85)

  const [form, setForm] = useState({
    datum: getTodayISO(),
    uren: '',
    omschrijving: '',
    declarabel: true,
    clientId: '',
    projectId: '',
  })

  const laadData = useCallback(async () => {
    setLoading(true)
    const [e, c, p, u] = await Promise.all([
      fetch('/api/time-entries').then(r => r.json()),
      fetch('/api/clients').then(r => r.json()),
      fetch('/api/projects').then(r => r.json()),
      fetch('/api/user/settings').then(r => r.json()).catch(() => ({ uurtarief: 85 })),
    ])
    setEntries(e.entries ?? [])
    setClients(c.clients ?? [])
    setProjects(p.projects ?? [])
    setUurtarief(u.uurtarief ?? 85)
    setLoading(false)
  }, [])

  useEffect(() => { laadData() }, [laadData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const uren = parseFloat(form.uren)
    if (isNaN(uren) || uren <= 0 || uren > 24) {
      toast.error('Voer een geldig aantal uren in (0-24)')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, uren }),
      })
      if (!res.ok) throw new Error()
      toast.success('Uren opgeslagen!')
      setShowForm(false)
      setForm({ datum: getTodayISO(), uren: '', omschrijving: '', declarabel: true, clientId: '', projectId: '' })
      laadData()
    } catch {
      toast.error('Opslaan mislukt')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Uren verwijderen?')) return
    await fetch(`/api/time-entries?id=${id}`, { method: 'DELETE' })
    toast.success('Verwijderd')
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  const jaar = new Date().getFullYear()
  const jaarEntries = entries.filter(e => new Date(e.datum).getFullYear() === jaar)
  const totaalUren = jaarEntries.reduce((s, e) => s + e.uren, 0)
  const declarabelUren = jaarEntries.filter(e => e.declarabel).reduce((s, e) => s + e.uren, 0)
  const prognose = berekenUrenPrognose(totaalUren)

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-[#0F0F1E]">Urenregistratie</h1>
          <p className="text-sm text-[#9898B0]">{jaar} · {totaalUren.toFixed(1)} uur geregistreerd</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary py-2.5 px-4 text-sm flex items-center gap-1.5">
          <Plus size={16} /> Toevoegen
        </button>
      </div>

      {/* Urencriterium card */}
      <div className="card p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="font-bold text-[#0F0F1E]">Urencriterium {jaar}</p>
          <span className={cn(
            "text-xs font-bold px-2.5 py-1 rounded-full",
            prognose.opSchema ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
          )}>
            {prognose.opSchema ? '✓ Op schema' : '⚠ Achterlopen'}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-black text-[#0F0F1E]">{totaalUren.toFixed(1)}</span>
          <span className="text-[#9898B0]">/ {UREN_CRITERIUM} uur</span>
          <span className="ml-auto text-sm font-semibold text-brand-500">{prognose.percentageBehaald}%</span>
        </div>

        <div className="progress-bar mb-4">
          <div
            className={cn("progress-fill", prognose.percentageBehaald >= 100 ? "bg-emerald-500" : "bg-brand-500")}
            style={{ width: `${Math.min(100, prognose.percentageBehaald)}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-[#F5F4FF] rounded-xl p-3">
            <p className="text-xs text-[#9898B0] mb-1">Declarabel</p>
            <p className="text-lg font-black text-brand-500">{declarabelUren.toFixed(1)} u</p>
          </div>
          <div className="bg-[#F5F4FF] rounded-xl p-3">
            <p className="text-xs text-[#9898B0] mb-1">Prognose einde jaar</p>
            <p className={cn("text-lg font-black", prognose.prognose >= UREN_CRITERIUM ? "text-emerald-500" : "text-amber-500")}>
              {prognose.prognose} u
            </p>
          </div>
          <div className="bg-[#F5F4FF] rounded-xl p-3">
            <p className="text-xs text-[#9898B0] mb-1">Resterend</p>
            <p className="text-lg font-black text-[#0F0F1E]">{prognose.resterend} u</p>
          </div>
          <div className="bg-[#F5F4FF] rounded-xl p-3">
            <p className="text-xs text-[#9898B0] mb-1">Dagelijks nodig</p>
            <p className="text-lg font-black text-[#0F0F1E]">{prognose.dagelijksBenodigd} u</p>
          </div>
        </div>

        {prognose.percentageBehaald >= 100 && (
          <div className="mt-3 p-3 bg-emerald-50 rounded-xl flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-500" />
            <div>
              <p className="text-sm font-bold text-emerald-700">Gefeliciteerd! Zelfstandigenaftrek behaald</p>
              <p className="text-xs text-emerald-600">Je hebt recht op € 3.750 zelfstandigenaftrek</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card p-5 mb-5 border-2 border-brand-200"
          >
            <h2 className="font-bold text-[#0F0F1E] mb-4">Uren toevoegen</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Datum</label>
                  <input
                    type="date"
                    value={form.datum}
                    onChange={e => setForm({ ...form, datum: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Uren</label>
                  <input
                    type="number"
                    value={form.uren}
                    onChange={e => setForm({ ...form, uren: e.target.value })}
                    className="input"
                    placeholder="8.0"
                    step="0.25"
                    min="0.25"
                    max="24"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="label">Omschrijving</label>
                <input
                  type="text"
                  value={form.omschrijving}
                  onChange={e => setForm({ ...form, omschrijving: e.target.value })}
                  className="input"
                  placeholder="Wat heb je gedaan?"
                />
              </div>

              {clients.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Klant</label>
                    <select value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} className="input">
                      <option value="">Geen klant</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.naam}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Project</label>
                    <select value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })} className="input">
                      <option value="">Geen project</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.naam}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="label">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, declarabel: true })}
                    className={cn(
                      "py-3 rounded-xl text-sm font-semibold border-2 transition-all",
                      form.declarabel
                        ? "bg-brand-500 border-brand-500 text-white"
                        : "bg-white border-[#E8E8F5] text-[#6B6B8A]"
                    )}
                  >
                    Declarabel
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, declarabel: false })}
                    className={cn(
                      "py-3 rounded-xl text-sm font-semibold border-2 transition-all",
                      !form.declarabel
                        ? "bg-[#0F0F1E] border-[#0F0F1E] text-white"
                        : "bg-white border-[#E8E8F5] text-[#6B6B8A]"
                    )}
                  >
                    Niet-declarabel
                  </button>
                </div>
              </div>

              {form.uren && !isNaN(parseFloat(form.uren)) && form.declarabel && (
                <div className="p-3 bg-emerald-50 rounded-xl text-sm text-emerald-700 font-medium">
                  Factuurwaarde: {formatEuro(parseFloat(form.uren) * uurtarief)}
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
                  Annuleren
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Opslaan'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entries lijst */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="w-8 h-8 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div className="card p-8 text-center">
          <Clock size={40} className="mx-auto text-[#C0C0D0] mb-3" />
          <p className="font-semibold text-[#0F0F1E] mb-1">Nog geen uren geregistreerd</p>
          <p className="text-sm text-[#9898B0]">Voeg je eerste uren toe via de knop hierboven</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className="card p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold",
                  entry.declarabel ? "bg-brand-50 text-brand-600" : "bg-gray-100 text-gray-600"
                )}>
                  {entry.uren}u
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0F0F1E]">
                    {entry.omschrijving || entry.client?.naam || 'Uren'}
                  </p>
                  <p className="text-xs text-[#9898B0]">
                    {formatDatum(entry.datum)}
                    {entry.client && ` · ${entry.client.naam}`}
                    {' · '}
                    <span className={entry.declarabel ? 'text-emerald-600' : 'text-[#9898B0]'}>
                      {entry.declarabel ? 'Declarabel' : 'Niet-declarabel'}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(entry.id)}
                className="w-8 h-8 flex items-center justify-center text-[#9898B0] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
