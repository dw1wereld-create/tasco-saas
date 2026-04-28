'use client'

import { Suspense } from 'react'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Onjuist e-mailadres of wachtwoord')
    } else {
      toast.success('Welkom terug!')
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-[#0F0F1E] mb-2">Welkom terug</h1>
        <p className="text-[#6B6B8A]">Log in op je Tasco account</p>
      </div>

      {params.get('error') && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-600">
          <AlertCircle size={16} />
          Er is iets mis gegaan. Probeer opnieuw.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">E-mailadres</label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9898B0]" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
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
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input pl-10 pr-10"
              placeholder="••••••••"
              required
              autoComplete="current-password"
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
            <AlertCircle size={16} />
            {error}
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
            <>Inloggen <ArrowRight size={18} /></>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-[#6B6B8A] mt-6">
        Nog geen account?{' '}
        <Link href="/register" className="text-brand-500 font-semibold hover:underline">
          Gratis aanmelden
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
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
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
