'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Receipt, Trash2, Upload, Crown, Loader } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { formatEuro, formatDatum, getTodayISO, cn } from '@/lib/utils'

interface Expense {
  id: string
  datum: string
  bedrag: number
  btw: number
  categorie: string
  omschrijving: string | null
  leverancier: string | null
  bonUrl: string | null
  client?: { naam: string } | null
}

const categorieLabels: Record<string, string> = {
  KANTOOR: 'Kantoor',
  REIZEN: 'Reizen',
  MARKETING: 'Marketing',
  SOFTWARE: 'Software',
  HARDWARE: 'Hardware',
  ETEN_DRINKEN: 'Eten & drinken',
  TELEFOON: 'Telefoon',
  OVERIG: 'Overig',
}

export default function BonnenPage() {
  const { data: session } = useSession()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  const [form, setForm] = useState({
    datum: getTodayISO(),
    bedrag: '',
    btw: '',
    categorie: 'OVERIG',
    omschrijving: '',
    leverancier: '',
    bonUrl: '',
  })

  const isPro = session?.user?.plan === 'PRO' || session?.user?.plan === 'PREMIUM'

  const laadData = useCallback(async () => {
    const d = await fetch('/api/expenses').then(r => r.json())
    setExpenses(d.expenses ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { laadData() }, [laadData])

  const handleFileUpload = async (file: File) => {
    if (!isPro) { toast.error('Pro feature: OCR bon scannen'); return }
    setAnalyzing(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/expenses/ocr', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.result) {
        setForm(prev => ({
          ...prev,
          bedrag: data.result.bedrag?.toString() ?? prev.bedrag,
          datum: data.result.datum ?? prev.datum,
          leverancier: data.result.leverancier ?? prev.leverancier,
          categorie: data.result.categorie ?? prev.categorie,
          btw: data.result.btw?.toString() ?? prev.btw,
          bonUrl: data.result.url ?? prev.bonUrl,
        }))
        toast.success('Bon gescand!')
      }
    } catch {
      toast.error('Scannen mislukt')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const bedrag = parseFloat(form.bedrag)
    if (isNaN(bedrag) || bedrag <= 0) { toast.error('Voer een geldig bedrag in'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, bedrag, btw: parseFloat(form.btw) || 0 }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setExpenses(prev => [data.expense, ...prev])
      toast.success('Bon opgeslagen!')
      setShowForm(false)
      setForm({ datum: getTodayISO(), bedrag: '', btw: '', categorie: 'OVERIG', omschrijving: '', leverancier: '', bonUrl: '' })
    } catch {
      toast.error('Opslaan mislukt')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bon verwijderen?')) return
    await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' })
    setExpenses(prev => prev.filter(e => e.id !== id))
    toast.success('Verwijderd')
  }

  const totaalBedrag = expenses.reduce((s, e) => s + e.bedrag, 0)
  const totaalBTW = expenses.reduce((s, e) => s + e.btw, 0)

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-[#0F0F1E]">Bonnen & Uitgaven</h1>
          <p className="text-sm text-[#9898B0]">{expenses.length} bonnen · {formatEuro(totaalBedrag)} totaal</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary py-2.5 px-4 text-sm flex items-center gap-1.5">
          <Plus size={16} /> Bon
        </button>
      </div>

      {/* Totalen */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="card p-4 text-center">
          <p className="text-xs text-[#9898B0] mb-1">Totaal kosten (excl. BTW)</p>
          <p className="text-xl font-black text-[#0F0F1E]">{formatEuro(totaalBedrag)}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-[#9898B0] mb-1">BTW terug te vragen</p>
          <p className="text-xl font-black text-emerald-600">{formatEuro(totaalBTW)}</p>
        </div>
      </div>

      {/* OCR Upload (Pro) */}
      {isPro && (
        <div className="card p-4 mb-4 border-2 border-dashed border-brand-200 bg-brand-50/50">
          <label className="flex items-center gap-3 cursor-pointer">
            {analyzing ? (
              <Loader size={20} className="text-brand-500 animate-spin" />
            ) : (
              <Upload size={20} className="text-brand-500" />
            )}
            <div>
              <p className="text-sm font-bold text-[#0F0F1E]">
                {analyzing ? 'Bon analyseren...' : 'Scan bon (AI/OCR)'}
              </p>
              <p className="text-xs text-[#9898B0]">Foto uploaden — bedrag & datum automatisch herkend</p>
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              disabled={analyzing}
            />
          </label>
        </div>
      )}

      {!isPro && (
        <div className="card p-4 mb-4 flex items-center gap-3 bg-brand-50/50 border border-brand-100">
          <Crown size={20} className="text-brand-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-[#0F0F1E]">OCR bon scannen</p>
            <p className="text-xs text-[#6B6B8A]">Upgrade naar Pro om bonnen te scannen met AI</p>
          </div>
          <Link href="/upgrade" className="text-xs font-bold text-brand-500 whitespace-nowrap">Pro →</Link>
        </div>
      )}

      {/* Nieuw bon formulier */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="card p-5 mb-5 border-2 border-brand-200">
            <h2 className="font-bold text-[#0F0F1E] mb-4">Bon toevoegen</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Datum</label>
                  <input type="date" value={form.datum} onChange={e => setForm({ ...form, datum: e.target.value })} className="input" required />
                </div>
                <div>
                  <label className="label">Bedrag (incl. BTW)</label>
                  <input type="number" step="0.01" min="0" value={form.bedrag} onChange={e => setForm({ ...form, bedrag: e.target.value })} className="input" placeholder="0.00" required autoFocus />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">BTW bedrag</label>
                  <input type="number" step="0.01" min="0" value={form.btw} onChange={e => setForm({ ...form, btw: e.target.value })} className="input" placeholder="0.00" />
                </div>
                <div>
                  <label className="label">Categorie</label>
                  <select value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value })} className="input">
                    {Object.entries(categorieLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Leverancier</label>
                <input type="text" value={form.leverancier} onChange={e => setForm({ ...form, leverancier: e.target.value })} className="input" placeholder="Albert Heijn, Coolblue, etc." />
              </div>
              <div>
                <label className="label">Omschrijving</label>
                <input type="text" value={form.omschrijving} onChange={e => setForm({ ...form, omschrijving: e.target.value })} className="input" placeholder="Wat was dit?" />
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

      {/* Bonnen lijst */}
      {loading ? (
        <div className="flex justify-center py-12"><span className="w-8 h-8 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" /></div>
      ) : expenses.length === 0 ? (
        <div className="card p-8 text-center">
          <Receipt size={40} className="mx-auto text-[#C0C0D0] mb-3" />
          <p className="font-semibold text-[#0F0F1E] mb-1">Geen bonnen</p>
          <p className="text-sm text-[#9898B0]">Voeg bonnen toe voor belastingaftrek</p>
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.map((expense, i) => (
            <motion.div key={expense.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
              className="card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-lg">
                  {expense.categorie === 'SOFTWARE' ? '💻' :
                   expense.categorie === 'REIZEN' ? '🚗' :
                   expense.categorie === 'KANTOOR' ? '📎' :
                   expense.categorie === 'MARKETING' ? '📣' :
                   expense.categorie === 'ETEN_DRINKEN' ? '☕' : '🧾'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0F0F1E]">
                    {expense.leverancier || expense.omschrijving || categorieLabels[expense.categorie]}
                  </p>
                  <p className="text-xs text-[#9898B0]">
                    {formatDatum(expense.datum)} · {categorieLabels[expense.categorie]}
                    {expense.btw > 0 && ` · BTW ${formatEuro(expense.btw)}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-[#0F0F1E]">{formatEuro(expense.bedrag)}</p>
                <button onClick={() => handleDelete(expense.id)} className="w-8 h-8 flex items-center justify-center text-[#9898B0] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
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
