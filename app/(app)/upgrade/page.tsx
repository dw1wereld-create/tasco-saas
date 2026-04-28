'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { CheckCircle2, Crown, Zap, Shield, ArrowRight, Loader } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const plans = [
  {
    id: 'PRO',
    naam: 'Pro',
    maandelijks: 12.99,
    jaarlijks: 9.99,
    kleur: 'brand',
    icon: Crown,
    populair: true,
    features: [
      'Alles in Gratis',
      'Facturatie + PDF genereren',
      'Bonnen scannen met AI (OCR)',
      'Belasting inzicht & berekening',
      'Kilometerregistratie + export',
      'PDF & Excel export',
      'Onbeperkte klanten & projecten',
      'BTW kwartaaloverzicht',
      'Cashflow grafieken',
    ],
  },
  {
    id: 'PREMIUM',
    naam: 'Premium',
    maandelijks: 24.99,
    jaarlijks: 19.99,
    kleur: 'purple',
    icon: Zap,
    populair: false,
    features: [
      'Alles in Pro',
      'GPS ritregistratie',
      'Geavanceerde inzichten & rapporten',
      'Prioriteit support (< 2u reactie)',
      'API toegang',
      'Teamleden (binnenkort)',
      'Accountant-portal (binnenkort)',
    ],
  },
]

export default function UpgradePage() {
  const { data: session } = useSession()
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('yearly')
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const currentPlan = session?.user?.plan ?? 'FREE'

  const handleUpgrade = async (planId: string) => {
    if (currentPlan === planId) { toast('Je hebt dit plan al'); return }
    setLoadingPlan(planId)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, interval }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error)
      }
    } catch (err: any) {
      toast.error(err.message || 'Er is iets mis gegaan')
    } finally {
      setLoadingPlan(null)
    }
  }

  const handlePortal = async () => {
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-[#0F0F1E] mb-2">Upgrade je account</h1>
        <p className="text-[#6B6B8A]">Kies het plan dat bij jou past</p>

        {/* Interval toggle */}
        <div className="inline-flex items-center gap-1 bg-[#F0F0FF] rounded-2xl p-1 mt-6">
          <button
            onClick={() => setInterval('monthly')}
            className={cn("px-5 py-2.5 rounded-xl text-sm font-semibold transition-all", interval === 'monthly' ? "bg-white shadow text-[#0F0F1E]" : "text-[#6B6B8A]")}
          >
            Maandelijks
          </button>
          <button
            onClick={() => setInterval('yearly')}
            className={cn("px-5 py-2.5 rounded-xl text-sm font-semibold transition-all", interval === 'yearly' ? "bg-white shadow text-[#0F0F1E]" : "text-[#6B6B8A]")}
          >
            Jaarlijks <span className="text-emerald-600 font-bold">-23%</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {plans.map((plan, i) => {
          const prijs = interval === 'yearly' ? plan.jaarlijks : plan.maandelijks
          const isHuidig = currentPlan === plan.id
          const loading = loadingPlan === plan.id

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "card p-6 relative",
                plan.populair && "border-2 border-brand-500 shadow-lg shadow-brand-500/10",
                isHuidig && "bg-emerald-50 border-2 border-emerald-300"
              )}
            >
              {plan.populair && !isHuidig && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full">Meest gekozen</span>
                </div>
              )}
              {isHuidig && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">Huidig plan</span>
                </div>
              )}

              <div className="flex items-center gap-2 mb-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", plan.kleur === 'brand' ? "bg-brand-100" : "bg-purple-100")}>
                  <plan.icon size={20} className={plan.kleur === 'brand' ? "text-brand-500" : "text-purple-500"} />
                </div>
                <div>
                  <h3 className="font-black text-[#0F0F1E]">{plan.naam}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-[#0F0F1E]">€ {prijs.toFixed(2).replace('.', ',')}</span>
                    <span className="text-sm text-[#9898B0]">/mnd</span>
                  </div>
                </div>
              </div>

              {interval === 'yearly' && (
                <p className="text-xs text-emerald-600 font-semibold mb-4">
                  Jaarlijks gefactureerd (€ {(prijs * 12).toFixed(2).replace('.', ',')})
                </p>
              )}

              <ul className="space-y-2 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#4A4A6A]">
                    <CheckCircle2 size={15} className={cn("shrink-0 mt-0.5", plan.kleur === 'brand' ? "text-brand-500" : "text-purple-500")} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={loading || isHuidig}
                className={cn(
                  "w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all",
                  isHuidig
                    ? "bg-emerald-100 text-emerald-700 cursor-default"
                    : plan.kleur === 'brand'
                    ? "bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20"
                    : "bg-purple-500 hover:bg-purple-600 text-white shadow-md shadow-purple-500/20"
                )}
              >
                {loading ? <Loader size={16} className="animate-spin" /> :
                 isHuidig ? 'Huidig plan ✓' :
                 <>{plan.naam} activeren <ArrowRight size={16} /></>}
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* Gratis vergelijking */}
      <div className="card p-5 mb-6">
        <h3 className="font-bold text-[#0F0F1E] mb-3">Gratis plan</h3>
        <div className="grid grid-cols-2 gap-2 text-sm text-[#6B6B8A]">
          {['Urenregistratie', 'Basis dashboard', 'Max 3 klanten', 'Max 2 projecten'].map(f => (
            <div key={f} className="flex items-center gap-2"><CheckCircle2 size={14} className="text-gray-400" /> {f}</div>
          ))}
        </div>
      </div>

      {/* Beheer abonnement */}
      {currentPlan !== 'FREE' && (
        <div className="text-center">
          <button onClick={handlePortal} className="text-sm text-brand-500 font-semibold hover:underline flex items-center gap-1 mx-auto">
            <Shield size={15} /> Abonnement beheren via Stripe
          </button>
        </div>
      )}

      <div className="mt-6 p-4 bg-[#F5F4FF] rounded-2xl text-center">
        <p className="text-xs text-[#9898B0]">
          Veilig betalen via Stripe · iDEAL, creditcard, SEPA beschikbaar · Opzeggen wanneer je wilt
        </p>
      </div>
    </div>
  )
}
