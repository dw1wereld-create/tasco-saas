'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ArrowLeft, FileText } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { formatEuro, getTodayISO } from '@/lib/utils'

interface Client { id: string; naam: string; email: string | null; btwNummer: string | null; adres: string | null; stad: string | null }
interface TimeEntry { id: string; datum: string; uren: number; omschrijving: string | null; declarabel: boolean }

interface Regel {
  omschrijving: string
  aantal: number
  tarief: number
}

export default function NieuweFactuurPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [saving, setSaving] = useState(false)
  const [userSettings, setUserSettings] = useState({ uurtarief: 85, btwTarief: 21, naam: '', bedrijfsnaam: '', kvkNummer: '', btwNummer: '', adres: '', iban: '' })

  const [form, setForm] = useState({
    clientId: '',
    datum: getTodayISO(),
    vervalDagen: 30,
    btwTarief: 21,
    notities: '',
    regels: [{ omschrijving: '', aantal: 1, tarief: 85 }] as Regel[],
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/clients').then(r => r.json()),
      fetch('/api/time-entries?ungrouped=1&declarabel=1').then(r => r.json()),
      fetch('/api/user/settings').then(r => r.json()).catch(() => ({})),
    ]).then(([c, t, u]) => {
      setClients(c.clients ?? [])
      setTimeEntries(t.entries ?? [])
      if (u.uurtarief) {
        setUserSettings(prev => ({ ...prev, ...u }))
        setForm(prev => ({
          ...prev,
          btwTarief: u.btwTarief ?? 21,
          regels: [{ omschrijving: '', aantal: 1, tarief: u.uurtarief ?? 85 }],
        }))
      }
    })
  }, [])

  const updateRegel = (i: number, field: keyof Regel, value: string | number) => {
    setForm(prev => ({
      ...prev,
      regels: prev.regels.map((r, idx) => idx === i ? { ...r, [field]: value } : r),
    }))
  }

  const addRegel = () => setForm(prev => ({ ...prev, regels: [...prev.regels, { omschrijving: '', aantal: 1, tarief: userSettings.uurtarief }] }))
  const removeRegel = (i: number) => setForm(prev => ({ ...prev, regels: prev.regels.filter((_, idx) => idx !== i) }))

  const vulUrenIn = () => {
    const entries = timeEntries.filter(e => e.declarabel)
    if (entries.length === 0) { toast.error('Geen declarabele uren gevonden'); return }
    const totaalUren = entries.reduce((s, e) => s + e.uren, 0)
    const omschrijvingen = Array.from(new Set(entries.map(e => e.omschrijving).filter(Boolean))).join(', ')
    setForm(prev => ({
      ...prev,
      regels: [{ omschrijving: omschrijvingen || 'Consultancy werkzaamheden', aantal: totaalUren, tarief: userSettings.uurtarief }],
    }))
    toast.success(`${totaalUren} uur ingevuld`)
  }

  const subtotaal = form.regels.reduce((s, r) => s + (r.aantal * r.tarief), 0)
  const btwBedrag = subtotaal * (form.btwTarief / 100)
  const totaal = subtotaal + btwBedrag

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.clientId) { toast.error('Selecteer een klant'); return }
    if (form.regels.some(r => !r.omschrijving || r.aantal <= 0)) { toast.error('Vul alle regelomschrijvingen in'); return }
    setSaving(true)

    try {
      const vervalDatum = new Date(form.datum)
      vervalDatum.setDate(vervalDatum.getDate() + form.vervalDagen)

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          vervalDatum: vervalDatum.toISOString(),
          subtotaal,
          btwBedrag,
          totaal,
          status: 'OPEN',
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      toast.success('Factuur aangemaakt!')
      router.push(`/facturen/${data.invoice.id}`)
    } catch {
      toast.error('Aanmaken mislukt')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <Link href="/facturen" className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-[#E8E8F5] text-[#6B6B8A] hover:text-brand-500 hover:border-brand-200 transition-all">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[#0F0F1E]">Nieuwe factuur</h1>
          <p className="text-sm text-[#9898B0]">Maak een professionele factuur</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Klant */}
        <div className="card p-5">
          <h2 className="font-bold text-[#0F0F1E] mb-3">Klant</h2>
          {clients.length === 0 ? (
            <div className="p-3 bg-amber-50 rounded-xl text-sm text-amber-700 flex items-center gap-2">
              Voeg eerst een klant toe via{' '}
              <Link href="/klanten" className="font-semibold underline">Klanten</Link>
            </div>
          ) : (
            <select value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} className="input" required>
              <option value="">Selecteer een klant</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.naam}</option>)}
            </select>
          )}
        </div>

        {/* Datum & vervaldatum */}
        <div className="card p-5">
          <h2 className="font-bold text-[#0F0F1E] mb-3">Details</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Factuurdatum</label>
              <input type="date" value={form.datum} onChange={e => setForm({ ...form, datum: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="label">Betaaltermijn</label>
              <select value={form.vervalDagen} onChange={e => setForm({ ...form, vervalDagen: parseInt(e.target.value) })} className="input">
                <option value={7}>7 dagen</option>
                <option value={14}>14 dagen</option>
                <option value={30}>30 dagen</option>
                <option value={60}>60 dagen</option>
              </select>
            </div>
            <div>
              <label className="label">BTW tarief</label>
              <select value={form.btwTarief} onChange={e => setForm({ ...form, btwTarief: parseInt(e.target.value) })} className="input">
                <option value={21}>21% (standaard)</option>
                <option value={9}>9% (laag)</option>
                <option value={0}>0% (vrijgesteld)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Regelomschrijvingen */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-[#0F0F1E]">Factuurregels</h2>
            {timeEntries.length > 0 && (
              <button type="button" onClick={vulUrenIn} className="text-xs text-brand-500 font-semibold bg-brand-50 px-3 py-1.5 rounded-lg hover:bg-brand-100 transition-colors flex items-center gap-1">
                <FileText size={12} /> Uren importeren
              </button>
            )}
          </div>

          <div className="space-y-3">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 text-xs text-[#9898B0] font-medium px-1">
              <div className="col-span-5">Omschrijving</div>
              <div className="col-span-3 text-center">Aantal</div>
              <div className="col-span-3 text-center">Tarief</div>
              <div className="col-span-1"></div>
            </div>

            {form.regels.map((regel, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <input
                  className="input col-span-5 text-sm py-2.5"
                  placeholder="Omschrijving"
                  value={regel.omschrijving}
                  onChange={e => updateRegel(i, 'omschrijving', e.target.value)}
                  required
                />
                <input
                  className="input col-span-3 text-sm py-2.5 text-center"
                  type="number"
                  step="0.25"
                  min="0.01"
                  value={regel.aantal}
                  onChange={e => updateRegel(i, 'aantal', parseFloat(e.target.value) || 0)}
                />
                <input
                  className="input col-span-3 text-sm py-2.5 text-center"
                  type="number"
                  step="0.01"
                  min="0"
                  value={regel.tarief}
                  onChange={e => updateRegel(i, 'tarief', parseFloat(e.target.value) || 0)}
                />
                <button
                  type="button"
                  onClick={() => removeRegel(i)}
                  disabled={form.regels.length === 1}
                  className="col-span-1 w-8 h-8 flex items-center justify-center text-[#9898B0] hover:text-red-500 disabled:opacity-30 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <button type="button" onClick={addRegel} className="mt-3 flex items-center gap-1.5 text-sm text-brand-500 font-semibold hover:text-brand-600">
            <Plus size={15} /> Regel toevoegen
          </button>
        </div>

        {/* Totalen */}
        <div className="card p-5">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#6B6B8A]">Subtotaal</span>
              <span className="font-semibold text-[#0F0F1E]">{formatEuro(subtotaal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B6B8A]">BTW ({form.btwTarief}%)</span>
              <span className="font-semibold text-[#0F0F1E]">{formatEuro(btwBedrag)}</span>
            </div>
            <div className="flex justify-between text-base font-black pt-2 border-t border-[#E8E8F5]">
              <span className="text-[#0F0F1E]">Totaal</span>
              <span className="text-brand-500 text-xl">{formatEuro(totaal)}</span>
            </div>
          </div>
        </div>

        {/* Notities */}
        <div className="card p-5">
          <label className="label">Notities (optioneel)</label>
          <textarea
            value={form.notities}
            onChange={e => setForm({ ...form, notities: e.target.value })}
            className="input resize-none"
            rows={3}
            placeholder="Betalingsinstructies, bedankje, etc."
          />
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full py-4 flex items-center justify-center gap-2">
          {saving ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
            <><FileText size={18} /> Factuur aanmaken</>
          )}
        </button>
      </form>
    </div>
  )
}
