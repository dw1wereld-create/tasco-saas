'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { Zap, User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

function RegisterForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [form, setForm] = useState({ naam: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Er is iets mis gegaan')
        setLoading(false)
        return
      }

      await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      toast.success('Account aangemaakt! Welkom bij Tasco!')
      router.push('/dashboard')
    } catch {
      setError('Er is iets mis gegaan. Probeer opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-[#0F0F1E] mb-2">Account aanmaken</h1>
        <p className="text-[#6B6B8A]">Gratis starten, geen creditcard nodig</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Naam</label>
          <div className="relative">
            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9898B0]" />
            <input
              type="text"
              value={form.naam}
              onChange={e => setForm({ ...form, naam: e.target.value })}
              className="input pl-10"
              placeholder="Jan de Vries"
              required
            />
          </div>
        </div>

        <div>
          <label className="label">E-mailadres</label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9898B0]" />
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="input pl-10"
              placeholder="jij@bedrijf.nl"
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div>
          <label className="label">Wachtwoord</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9898B0]" />
            <input
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="input pl-10 pr-10"
              placeholder="Minimaal 8 tekens"
              required
              minLength={8}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9898B0] hover:text-brand-500"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-600">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 py-4"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Account aanmaken <ArrowRight size={18} /></>
          )}
        </button>
      </form>

      <p className="text-xs text-center text-[#9898B0] mt-4">
        Door aan te melden ga je akkoord met onze{' '}
        <Link href="/voorwaarden" className="text-brand-500 hover:underline">Voorwaarden</Link> en{' '}
        <Link href="/privacy" className="text-brand-500 hover:underline">Privacybeleid</Link>.
      </p>

      <p className="text-center text-sm text-[#6B6B8A] mt-4">
        Al een account?{' '}
        <Link href="/login" className="text-brand-500 font-semibold hover:underline">
          Inloggen
        </Link>
      </p>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#F5F4FF] flex flex-col">
      <div className="p-6 flex justify-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-xl font-black text-[#0F0F1E]">Tasco</span>
        </Link>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-16">
        <Suspense fallback={<div className="w-8 h-8 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  )
}
