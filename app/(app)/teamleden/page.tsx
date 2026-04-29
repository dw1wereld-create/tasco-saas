'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Users, Plus, Trash2, Copy, Shield, Eye, Pencil, Crown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface TeamMember {
  id: string
  naam: string
  email: string | null
  role: 'VIEWER' | 'EDITOR' | 'ADMIN'
  accessToken: string
  createdAt: string
}

const ROLE_LABELS: Record<TeamMember['role'], string> = {
  VIEWER: 'Lezer',
  EDITOR: 'Bewerker',
  ADMIN: 'Beheerder',
}

const ROLE_ICONS: Record<TeamMember['role'], typeof Eye> = {
  VIEWER: Eye,
  EDITOR: Pencil,
  ADMIN: Shield,
}

export default function TeamledenPage() {
  const { data: session } = useSession()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ naam: '', email: '', role: 'VIEWER' as TeamMember['role'] })

  const isPremium = session?.user?.plan === 'PREMIUM'

  const laad = useCallback(async () => {
    const res = await fetch('/api/team/members')
    const data = await res.json()
    setMembers(data.members ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { laad() }, [laad])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.naam) { toast.error('Naam is verplicht'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/team/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMembers(prev => [data.member, ...prev])
      setShowForm(false)
      setForm({ naam: '', email: '', role: 'VIEWER' })
      toast.success('Teamlid toegevoegd!')
    } catch (err: any) {
      toast.error(err.message || 'Toevoegen mislukt')
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (id: string, naam: string) => {
    if (!confirm(`${naam} verwijderen uit het team?`)) return
    await fetch(`/api/team/members?id=${id}`, { method: 'DELETE' })
    setMembers(prev => prev.filter(m => m.id !== id))
    toast.success('Teamlid verwijderd')
  }

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/werkruimte/${token}`
    navigator.clipboard.writeText(url)
    toast.success('Link gekopieerd!')
  }

  if (!isPremium) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-black text-[#0F0F1E] mb-6">Teamleden</h1>
        <div className="card p-8 text-center">
          <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users size={28} className="text-purple-500" />
          </div>
          <h2 className="font-bold text-[#0F0F1E] mb-2">Premium functie</h2>
          <p className="text-sm text-[#6B6B8A] mb-6 max-w-xs mx-auto">
            Nodig teamleden uit en geef ze toegang tot jouw administratie. Beschikbaar in het Premium plan.
          </p>
          <Link href="/upgrade" className="btn-primary inline-flex items-center gap-2">
            <Crown size={16} /> Upgraden naar Premium
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-[#0F0F1E]">Teamleden</h1>
          <p className="text-sm text-[#9898B0]">{members.length} leden</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary py-2.5 px-4 text-sm flex items-center gap-1.5">
          <Plus size={16} /> Toevoegen
        </button>
      </div>

      <div className="card p-4 bg-blue-50 border border-blue-100 mb-5">
        <p className="text-xs text-blue-700">
          Elk teamlid krijgt een unieke toegangslink voor jouw werkruimte.
          <span className="font-semibold"> Lezer</span> kan alleen bekijken,
          <span className="font-semibold"> Bewerker</span> kan ook registraties toevoegen,
          <span className="font-semibold"> Beheerder</span> heeft volledige toegang.
        </p>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="card p-5 mb-5 border-2 border-brand-200">
            <h2 className="font-bold text-[#0F0F1E] mb-4">Teamlid toevoegen</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="label">Naam</label>
                <input className="input" value={form.naam} onChange={e => setForm({ ...form, naam: e.target.value })} placeholder="Lisa van den Berg" required autoFocus />
              </div>
              <div>
                <label className="label">E-mail (optioneel)</label>
                <input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="lisa@bedrijf.nl" />
              </div>
              <div>
                <label className="label">Rol</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['VIEWER', 'EDITOR', 'ADMIN'] as const).map(role => {
                    const Icon = ROLE_ICONS[role]
                    return (
                      <button key={role} type="button"
                        onClick={() => setForm({ ...form, role })}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-semibold transition-all",
                          form.role === role ? "bg-brand-500 border-brand-500 text-white" : "bg-white border-[#E8E8F5] text-[#6B6B8A] hover:border-brand-200"
                        )}>
                        <Icon size={16} />
                        {ROLE_LABELS[role]}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Annuleren</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Toevoegen'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-12"><span className="w-8 h-8 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" /></div>
      ) : members.length === 0 ? (
        <div className="card p-8 text-center">
          <Users size={36} className="mx-auto text-[#C0C0D0] mb-3" />
          <p className="font-semibold text-[#0F0F1E] mb-1">Geen teamleden</p>
          <p className="text-sm text-[#9898B0]">Voeg je eerste teamlid toe</p>
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((m, i) => {
            const Icon = ROLE_ICONS[m.role]
            return (
              <motion.div key={m.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-brand-600">{m.naam[0].toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0F0F1E]">{m.naam}</p>
                      <p className="text-xs text-[#9898B0]">{m.email ?? 'Geen e-mail'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
                      m.role === 'ADMIN' ? "bg-red-50 text-red-600" :
                      m.role === 'EDITOR' ? "bg-amber-50 text-amber-600" :
                      "bg-blue-50 text-blue-600"
                    )}>
                      <Icon size={11} /> {ROLE_LABELS[m.role]}
                    </span>
                    <button onClick={() => copyLink(m.accessToken)} title="Kopieer toegangslink"
                      className="w-8 h-8 flex items-center justify-center text-[#9898B0] hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors">
                      <Copy size={14} />
                    </button>
                    <button onClick={() => handleRemove(m.id, m.naam)}
                      className="w-8 h-8 flex items-center justify-center text-[#9898B0] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
