'use client'

import { useState, useEffect } from 'react'
import { Plus, Users, Trash2, ChevronRight, Crown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import { formatEuro } from '@/lib/utils'

interface Client {
  id: string
  naam: string
  email: string | null
  telefoon: string | null
  stad: string | null
  actief: boolean
  _count: { invoices: number; timeEntries: number; projects: number }
  omzet?: number
}

export default function KlantenPage() {
  const { data: session } = useSession()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ naam: '', email: '', telefoon: '', adres: '', postcode: '', stad: '', kvkNummer: '', btwNummer: '', iban: '', notities: '' })
  const [clientCount, setClientCount] = useState(0)

  const plan = session?.user?.plan ?? 'FREE'
  const maxClients = plan === 'FREE' ? 3 : -1
  const kanToevoegen = maxClients === -1 || clientCount < maxClients

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(d => {
      setClients(d.clients ?? [])
      setClientCount(d.clients?.length ?? 0)
      setLoading(false)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!kanToevoegen) { toast.error(`Free plan: max ${maxClients} klanten`); return }
    setSaving(true)
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setClients(prev => [data.client, ...prev])
      setClientCount(prev => prev + 1)
      toast.success('Klant toegevoegd!')
      setShowForm(false)
      setForm({ naam: '', email: '', telefoon: '', adres: '', postcode: '', stad: '', kvkNummer: '', btwNummer: '', iban: '', notities: '' })
    } catch {
      toast.error('Toevoegen mislukt')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, naam: string) => {
    if (!confirm(`Klant "${naam}" verwijderen?`)) return
    await fetch(`/api/clients?id=${id}`, { method: 'DELETE' })
    setClients(prev => prev.filter(c => c.id !== id))
    setClientCount(prev => prev - 1)
    toast.success('Klant verwijderd')
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-[#0F0F1E]">Klanten & Projecten</h1>
          <p className="text-sm text-[#9898B0]">
            {clientCount} klant{clientCount !== 1 ? 'en' : ''}
            {maxClients > 0 && ` (max ${maxClients})`}
          </p>
        </div>
        {kanToevoegen ? (
          <button onClick={() => setShowForm(true)} className="btn-primary py-2.5 px-4 text-sm flex items-center gap-1.5">
            <Plus size={16} /> Klant
          </button>
        ) : (
          <Link href="/upgrade" className="flex items-center gap-1.5 text-sm font-semibold text-brand-500 bg-brand-50 px-3 py-2 rounded-xl">
            <Crown size={14} /> Upgrade
          </Link>
        )}
      </div>

      {/* Upgrade prompt voor free */}
      {plan === 'FREE' && (
        <div className="card p-4 mb-4 bg-gradient-to-r from-brand-50 to-blue-50 border border-brand-100">
          <div className="flex items-center gap-3">
            <Crown size={20} className="text-brand-500 shrink-0" />
            <div>
              <p className="text-sm font-bold text-[#0F0F1E]">{clientCount}/{maxClients} klanten gebruikt</p>
              <p className="text-xs text-[#6B6B8A]">Upgrade naar Pro voor onbeperkte klanten en projecten</p>
            </div>
            <Link href="/upgrade" className="ml-auto text-xs font-bold text-brand-500 whitespace-nowrap">Upgraden →</Link>
          </div>
          <div className="mt-2 progress-bar">
            <div className="progress-fill bg-brand-500" style={{ width: `${(clientCount / maxClients) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Nieuw klant formulier */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="card p-5 mb-5 border-2 border-brand-200">
            <h2 className="font-bold text-[#0F0F1E] mb-4">Nieuwe klant</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="label">Bedrijfsnaam *</label>
                <input type="text" value={form.naam} onChange={e => setForm({ ...form, naam: e.target.value })} className="input" placeholder="Acme B.V." required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">E-mail</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input" placeholder="info@acme.nl" />
                </div>
                <div>
                  <label className="label">Telefoon</label>
                  <input type="tel" value={form.telefoon} onChange={e => setForm({ ...form, telefoon: e.target.value })} className="input" placeholder="020 123 4567" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="label">Adres</label>
                  <input type="text" value={form.adres} onChange={e => setForm({ ...form, adres: e.target.value })} className="input" placeholder="Hoofdstraat 1" />
                </div>
                <div>
                  <label className="label">Postcode</label>
                  <input type="text" value={form.postcode} onChange={e => setForm({ ...form, postcode: e.target.value })} className="input" placeholder="1234 AB" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">KvK-nummer</label>
                  <input type="text" value={form.kvkNummer} onChange={e => setForm({ ...form, kvkNummer: e.target.value })} className="input" placeholder="12345678" />
                </div>
                <div>
                  <label className="label">BTW-nummer</label>
                  <input type="text" value={form.btwNummer} onChange={e => setForm({ ...form, btwNummer: e.target.value })} className="input" placeholder="NL123456789B01" />
                </div>
              </div>
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

      {/* Klanten lijst */}
      {loading ? (
        <div className="flex justify-center py-12"><span className="w-8 h-8 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" /></div>
      ) : clients.length === 0 ? (
        <div className="card p-8 text-center">
          <Users size={40} className="mx-auto text-[#C0C0D0] mb-3" />
          <p className="font-semibold text-[#0F0F1E] mb-1">Geen klanten</p>
          <p className="text-sm text-[#9898B0] mb-4">Voeg je eerste klant toe om te beginnen</p>
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map((client, i) => (
            <motion.div key={client.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center">
                      <span className="text-sm font-black text-brand-600">{client.naam[0]}</span>
                    </div>
                    <div>
                      <p className="font-bold text-[#0F0F1E]">{client.naam}</p>
                      <p className="text-xs text-[#9898B0]">
                        {[client.email, client.stad].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-3 text-xs text-[#6B6B8A]">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-brand-400 rounded-full"></span>
                      {client._count.invoices} factuur{client._count.invoices !== 1 ? 'en' : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                      {client._count.timeEntries} uren
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                      {client._count.projects} project{client._count.projects !== 1 ? 'en' : ''}
                    </span>
                  </div>
                </div>
                <button onClick={() => handleDelete(client.id, client.naam)} className="w-8 h-8 flex items-center justify-center text-[#9898B0] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2">
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
