'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Save, LogOut, User, Building, CreditCard, Bell, BookUser, Plus, Trash2, Copy, Crown } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface AccountantAccess {
  id: string
  label: string
  token: string
  expiresAt: string | null
  lastUsedAt: string | null
  createdAt: string
}

export default function InstellingenPage() {
  const { data: session } = useSession()
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'profiel' | 'bedrijf' | 'belasting' | 'abonnement' | 'accountant'>('profiel')
  const isPremium = session?.user?.plan === 'PREMIUM'

  // Accountant access state
  const [accesses, setAccesses] = useState<AccountantAccess[]>([])
  const [newLabel, setNewLabel] = useState('')
  const [newExpiry, setNewExpiry] = useState('')
  const [addingAccess, setAddingAccess] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  const laadAccesses = useCallback(async () => {
    const res = await fetch('/api/accountant/access')
    const d = await res.json()
    setAccesses(d.accesses ?? [])
  }, [])

  useEffect(() => {
    if (tab === 'accountant') laadAccesses()
  }, [tab, laadAccesses])

  const [profiel, setProfiel] = useState({
    name: '', email: '', telefoon: '',
  })
  const [bedrijf, setBedrijf] = useState({
    bedrijfsnaam: '', kvkNummer: '', btwNummer: '', iban: '', adres: '', postcode: '', stad: '',
  })
  const [financieel, setFinancieel] = useState({
    uurtarief: 85, btwTarief: 21, belastingPct: 30,
  })

  useEffect(() => {
    fetch('/api/user/settings').then(r => r.json()).then(d => {
      setProfiel({ name: d.name ?? '', email: d.email ?? '', telefoon: d.telefoon ?? '' })
      setBedrijf({
        bedrijfsnaam: d.bedrijfsnaam ?? '', kvkNummer: d.kvkNummer ?? '',
        btwNummer: d.btwNummer ?? '', iban: d.iban ?? '',
        adres: d.adres ?? '', postcode: d.postcode ?? '', stad: d.stad ?? '',
      })
      setFinancieel({ uurtarief: d.uurtarief ?? 85, btwTarief: d.btwTarief ?? 21, belastingPct: d.belastingPct ?? 30 })
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profiel, ...bedrijf, ...financieel }),
      })
      toast.success('Instellingen opgeslagen!')
    } catch {
      toast.error('Opslaan mislukt')
    } finally {
      setSaving(false)
    }
  }

  const handleAddAccess = async () => {
    setAddingAccess(true)
    try {
      const res = await fetch('/api/accountant/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newLabel || 'Accountant', expiresAt: newExpiry || undefined }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      setAccesses(prev => [d.access, ...prev])
      setNewLabel(''); setNewExpiry(''); setShowAddForm(false)
      toast.success('Toegang aangemaakt!')
    } catch (err: any) {
      toast.error(err.message || 'Aanmaken mislukt')
    } finally {
      setAddingAccess(false)
    }
  }

  const handleRevokeAccess = async (id: string) => {
    if (!confirm('Toegang intrekken? De accountant kan dan niet meer inloggen.')) return
    await fetch(`/api/accountant/access?id=${id}`, { method: 'DELETE' })
    setAccesses(prev => prev.filter(a => a.id !== id))
    toast.success('Toegang ingetrokken')
  }

  const copyAccessLink = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/accountant/${token}`)
    toast.success('Link gekopieerd!')
  }

  const tabs = [
    { id: 'profiel', label: 'Profiel', icon: User },
    { id: 'bedrijf', label: 'Bedrijf', icon: Building },
    { id: 'belasting', label: 'Financieel', icon: CreditCard },
    { id: 'abonnement', label: 'Abonnement', icon: Bell },
    { id: 'accountant', label: 'Accountant', icon: BookUser },
  ]

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-black text-[#0F0F1E]">Instellingen</h1>
        <button onClick={handleSave} disabled={saving} className="btn-primary py-2.5 px-4 text-sm flex items-center gap-1.5">
          {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
          Opslaan
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F0F0FF] rounded-2xl p-1 mb-6 overflow-x-auto scrollbar-hide">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all",
              tab === t.id ? "bg-white shadow text-[#0F0F1E]" : "text-[#6B6B8A]")}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {/* Profiel */}
      {tab === 'profiel' && (
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-[#0F0F1E]">Persoonlijk profiel</h2>
          <div>
            <label className="label">Naam</label>
            <input className="input" value={profiel.name} onChange={e => setProfiel({ ...profiel, name: e.target.value })} placeholder="Jan de Vries" />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input className="input" type="email" value={profiel.email} onChange={e => setProfiel({ ...profiel, email: e.target.value })} placeholder="jan@bedrijf.nl" />
          </div>
          <div>
            <label className="label">Telefoon</label>
            <input className="input" type="tel" value={profiel.telefoon} onChange={e => setProfiel({ ...profiel, telefoon: e.target.value })} placeholder="06 12345678" />
          </div>
        </div>
      )}

      {/* Bedrijf */}
      {tab === 'bedrijf' && (
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-[#0F0F1E]">Bedrijfsgegevens</h2>
          <p className="text-xs text-[#9898B0]">Deze gegevens verschijnen op je facturen</p>
          <div>
            <label className="label">Bedrijfsnaam</label>
            <input className="input" value={bedrijf.bedrijfsnaam} onChange={e => setBedrijf({ ...bedrijf, bedrijfsnaam: e.target.value })} placeholder="Jan de Vries Consultancy" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">KvK-nummer</label>
              <input className="input" value={bedrijf.kvkNummer} onChange={e => setBedrijf({ ...bedrijf, kvkNummer: e.target.value })} placeholder="12345678" />
            </div>
            <div>
              <label className="label">BTW-nummer</label>
              <input className="input" value={bedrijf.btwNummer} onChange={e => setBedrijf({ ...bedrijf, btwNummer: e.target.value })} placeholder="NL123456789B01" />
            </div>
          </div>
          <div>
            <label className="label">IBAN</label>
            <input className="input" value={bedrijf.iban} onChange={e => setBedrijf({ ...bedrijf, iban: e.target.value })} placeholder="NL91 ABNA 0417 1643 00" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="label">Adres</label>
              <input className="input" value={bedrijf.adres} onChange={e => setBedrijf({ ...bedrijf, adres: e.target.value })} placeholder="Hoofdstraat 1" />
            </div>
            <div>
              <label className="label">Postcode</label>
              <input className="input" value={bedrijf.postcode} onChange={e => setBedrijf({ ...bedrijf, postcode: e.target.value })} placeholder="1234 AB" />
            </div>
          </div>
          <div>
            <label className="label">Stad</label>
            <input className="input" value={bedrijf.stad} onChange={e => setBedrijf({ ...bedrijf, stad: e.target.value })} placeholder="Amsterdam" />
          </div>
        </div>
      )}

      {/* Financieel */}
      {tab === 'belasting' && (
        <div className="card p-5 space-y-5">
          <h2 className="font-bold text-[#0F0F1E]">Financiële instellingen</h2>
          <div>
            <label className="label">Standaard uurtarief (€)</label>
            <input className="input" type="number" min="0" step="0.50" value={financieel.uurtarief}
              onChange={e => setFinancieel({ ...financieel, uurtarief: parseFloat(e.target.value) })} />
            <p className="text-xs text-[#9898B0] mt-1">Gebruikt bij nieuwe factuurregel en uren-waarde berekening</p>
          </div>
          <div>
            <label className="label">Standaard BTW tarief (%)</label>
            <select className="input" value={financieel.btwTarief} onChange={e => setFinancieel({ ...financieel, btwTarief: parseInt(e.target.value) })}>
              <option value={21}>21% (standaard)</option>
              <option value={9}>9% (laag tarief)</option>
              <option value={0}>0% (vrijgesteld)</option>
            </select>
          </div>
          <div>
            <label className="label">Belastingreservering (%)</label>
            <div className="flex items-center gap-3">
              <input className="input flex-1" type="range" min="0" max="50" step="1" value={financieel.belastingPct}
                onChange={e => setFinancieel({ ...financieel, belastingPct: parseInt(e.target.value) })} />
              <span className="text-lg font-black text-brand-500 w-12 text-right">{financieel.belastingPct}%</span>
            </div>
            <p className="text-xs text-[#9898B0] mt-1">Aanbevolen: 25-35% van je omzet apart zetten voor inkomstenbelasting + ZVW</p>
          </div>
        </div>
      )}

      {/* Abonnement */}
      {tab === 'abonnement' && (
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-bold text-[#0F0F1E] mb-3">Huidig abonnement</h2>
            <div className="flex items-center justify-between p-3 bg-[#F5F4FF] rounded-xl">
              <div>
                <p className="font-bold text-[#0F0F1E]">{session?.user?.plan ?? 'FREE'} plan</p>
                <p className="text-xs text-[#9898B0]">
                  {session?.user?.plan === 'FREE' ? 'Gratis voor altijd' : 'Actief abonnement'}
                </p>
              </div>
              {session?.user?.plan !== 'FREE' && (
                <button
                  onClick={async () => {
                    const res = await fetch('/api/stripe/portal', { method: 'POST' })
                    const d = await res.json()
                    if (d.url) window.location.href = d.url
                  }}
                  className="text-sm text-brand-500 font-semibold"
                >
                  Beheren →
                </button>
              )}
            </div>
            {session?.user?.plan === 'FREE' && (
              <Link href="/upgrade" className="btn-primary w-full mt-3 text-sm py-3 flex items-center justify-center gap-2">
                Upgraden naar Pro
              </Link>
            )}
          </div>

          <div className="card p-5">
            <h2 className="font-bold text-[#0F0F1E] mb-3">Account</h2>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="btn-danger w-full text-sm py-3 flex items-center justify-center gap-2"
            >
              <LogOut size={16} /> Uitloggen
            </button>
          </div>
        </div>
      )}

      {/* Accountant */}
      {tab === 'accountant' && (
        <div className="space-y-4">
          {!isPremium ? (
            <div className="card p-8 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <BookUser size={24} className="text-purple-500" />
              </div>
              <h2 className="font-bold text-[#0F0F1E] mb-2">Premium functie</h2>
              <p className="text-sm text-[#6B6B8A] mb-4">Geef je accountant veilig toegang tot jouw administratie met een unieke alleen-lezen link.</p>
              <Link href="/upgrade" className="btn-primary inline-flex items-center gap-2 text-sm">
                <Crown size={15} /> Upgraden naar Premium
              </Link>
            </div>
          ) : (
            <>
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-[#0F0F1E]">Accountanttoegang</h2>
                  <button onClick={() => setShowAddForm(true)} className="btn-primary py-2 px-3 text-xs flex items-center gap-1">
                    <Plus size={13} /> Nieuw
                  </button>
                </div>
                <p className="text-xs text-[#9898B0] mb-4">
                  Maak een unieke link aan voor je accountant. Zij krijgen alleen-lezen toegang tot facturen, bonnen, uren en kilometers.
                </p>

                {showAddForm && (
                  <div className="bg-[#F5F4FF] rounded-xl p-4 mb-4 space-y-3">
                    <div>
                      <label className="label">Label (bijv. naam accountant)</label>
                      <input className="input" value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Kantoor Jansen" />
                    </div>
                    <div>
                      <label className="label">Vervaldatum (optioneel)</label>
                      <input className="input" type="date" value={newExpiry} onChange={e => setNewExpiry(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setShowAddForm(false)} className="btn-secondary flex-1 text-sm py-2">Annuleren</button>
                      <button onClick={handleAddAccess} disabled={addingAccess} className="btn-primary flex-1 text-sm py-2 flex items-center justify-center gap-1">
                        {addingAccess ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Aanmaken'}
                      </button>
                    </div>
                  </div>
                )}

                {accesses.length === 0 ? (
                  <p className="text-sm text-[#9898B0] text-center py-4">Nog geen toegang aangemaakt</p>
                ) : (
                  <div className="space-y-2">
                    {accesses.map(a => (
                      <div key={a.id} className="flex items-center justify-between p-3 bg-[#F8F8FF] rounded-xl">
                        <div>
                          <p className="text-sm font-semibold text-[#0F0F1E]">{a.label}</p>
                          <p className="text-xs text-[#9898B0]">
                            {a.lastUsedAt ? `Laatst gebruikt: ${new Date(a.lastUsedAt).toLocaleDateString('nl-NL')}` : 'Nog niet gebruikt'}
                            {a.expiresAt && ` · Verloopt: ${new Date(a.expiresAt).toLocaleDateString('nl-NL')}`}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => copyAccessLink(a.token)} title="Kopieer link"
                            className="w-8 h-8 flex items-center justify-center text-[#9898B0] hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors">
                            <Copy size={14} />
                          </button>
                          <button onClick={() => handleRevokeAccess(a.id)} title="Intrekken"
                            className="w-8 h-8 flex items-center justify-center text-[#9898B0] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card p-4 bg-blue-50 border border-blue-100">
                <p className="text-xs text-blue-700">
                  <strong>Privacy:</strong> De accountant ziet alle financiële gegevens maar kan niets wijzigen. De link werkt zonder inloggen. Trek toegang in als de samenwerking eindigt.
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
