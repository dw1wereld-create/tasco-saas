'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Clock, FileText, Receipt, Car, PiggyBank, BarChart3,
  CheckCircle2, ArrowRight, Star, Zap, Shield
} from 'lucide-react'

const features = [
  { icon: Clock, title: 'Urenregistratie', desc: 'In 2 klikken uren bijhouden met voortgang naar de 1225-uursnorm', color: 'text-brand-500', bg: 'bg-brand-50' },
  { icon: FileText, title: 'Facturatie', desc: 'Professionele facturen genereren en direct versturen als PDF', color: 'text-blue-500', bg: 'bg-blue-50' },
  { icon: Receipt, title: 'Bonnen & OCR', desc: 'Foto van je bon — AI herkent automatisch bedrag en categorie', color: 'text-purple-500', bg: 'bg-purple-50' },
  { icon: Car, title: 'Kilometers', desc: 'Zakelijke ritten bijhouden voor belastingaftrek', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { icon: PiggyBank, title: 'Belastingschatting', desc: 'BTW per kwartaal en jaarlijkse belastingreservering automatisch', color: 'text-amber-500', bg: 'bg-amber-50' },
  { icon: BarChart3, title: 'ZZP Gezondheidsscore', desc: 'Persoonlijke score 0-100 voor je financiële gezondheid', color: 'text-teal-500', bg: 'bg-teal-50' },
]

const testimonials = [
  { name: 'Femke de Vries', role: 'Designer', text: 'Eindelijk een app die ik echt gebruik. Factuur maken in 1 minuut!', stars: 5 },
  { name: 'Joost Bergman', role: 'IT Consultant', text: 'De belasting berekening bespaart me uren accountantswerk.', stars: 5 },
  { name: 'Lisa Smit', role: 'Copywriter', text: 'De ZZP score motiveert me om mijn administratie bij te houden.', stars: 5 },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E8E8F5]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-xl font-black text-[#0F0F1E] tracking-tight">Tasco</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-[#4A4A6A] hover:text-brand-500 transition-colors">
              Inloggen
            </Link>
            <Link href="/register" className="btn-primary text-sm py-2 px-4">
              Gratis starten
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-600 text-sm font-semibold px-3 py-1.5 rounded-full mb-6">
              <Star size={14} className="fill-brand-500" /> #1 ZZP-app van Nederland
            </span>
            <h1 className="text-5xl sm:text-6xl font-black text-[#0F0F1E] leading-tight mb-6">
              Administratie die{' '}
              <span className="text-gradient">werkt voor jou</span>
            </h1>
            <p className="text-xl text-[#6B6B8A] leading-relaxed mb-8 max-w-xl mx-auto">
              Stop met Excel-sheets en losse apps. Tasco is de alles-in-één oplossing voor Nederlandse zzp'ers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register" className="btn-primary inline-flex items-center gap-2 justify-center text-base py-4 px-8">
                Gratis beginnen <ArrowRight size={18} />
              </Link>
              <Link href="/login" className="btn-secondary inline-flex items-center gap-2 justify-center text-base py-4 px-8">
                Demo bekijken
              </Link>
            </div>
            <p className="text-sm text-[#9898B0] mt-4">
              Gratis plan beschikbaar · Geen creditcard nodig
            </p>
          </motion.div>

          {/* Hero mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12 bg-gradient-to-br from-brand-500 to-blue-500 rounded-3xl p-0.5 shadow-2xl shadow-brand-500/30 mx-auto max-w-sm"
          >
            <div className="bg-[#F5F4FF] rounded-3xl p-6 text-left">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-[#9898B0] font-medium">ZZP Gezondheidsscore</p>
                  <p className="text-3xl font-black text-brand-500">82</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#9898B0] font-medium">Urencriterium</p>
                  <p className="text-xl font-bold text-[#0F0F1E]">847 <span className="text-sm text-[#9898B0]">/ 1225</span></p>
                </div>
              </div>
              <div className="progress-bar mb-4">
                <div className="progress-fill bg-brand-500" style={{ width: '69%' }} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Omzet', value: '€ 18.500' },
                  { label: 'Open facturen', value: '3' },
                  { label: 'BTW Q3', value: '€ 1.240' },
                ].map(item => (
                  <div key={item.label} className="bg-white rounded-xl p-2.5 text-center">
                    <p className="text-xs text-[#9898B0] font-medium">{item.label}</p>
                    <p className="text-sm font-bold text-[#0F0F1E] mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-[#F5F4FF]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-[#0F0F1E] mb-4">
              Alles wat je nodig hebt
            </h2>
            <p className="text-lg text-[#6B6B8A]">Geen losse tools meer — alles in één overzicht</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="card p-6 hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 ${f.bg} rounded-2xl flex items-center justify-center mb-4`}>
                  <f.icon size={24} className={f.color} />
                </div>
                <h3 className="font-bold text-[#0F0F1E] mb-2">{f.title}</h3>
                <p className="text-sm text-[#6B6B8A] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-[#0F0F1E] mb-4">
              Simpele, eerlijke prijzen
            </h2>
            <p className="text-lg text-[#6B6B8A]">Begin gratis, upgrade wanneer je wilt</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Free */}
            <div className="card p-6">
              <h3 className="font-bold text-lg text-[#0F0F1E] mb-1">Gratis</h3>
              <p className="text-3xl font-black text-[#0F0F1E] mb-1">€ 0</p>
              <p className="text-sm text-[#9898B0] mb-6">Voor altijd gratis</p>
              <ul className="space-y-2 mb-6">
                {['Urenregistratie', 'Basis dashboard', 'Max 3 klanten'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#4A4A6A]">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="btn-secondary block text-center text-sm py-2.5">
                Gratis starten
              </Link>
            </div>

            {/* Pro */}
            <div className="relative card p-6 border-2 border-brand-500 shadow-lg shadow-brand-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full">Meest gekozen</span>
              </div>
              <h3 className="font-bold text-lg text-[#0F0F1E] mb-1">Pro</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <p className="text-3xl font-black text-brand-500">€ 9,99</p>
                <span className="text-sm text-[#9898B0]">/mnd</span>
              </div>
              <p className="text-sm text-[#9898B0] mb-6">Jaarlijks gefactureerd</p>
              <ul className="space-y-2 mb-6">
                {['Alles in Gratis', 'Facturatie + PDF', 'Bonnen scan (OCR)', 'Belasting inzicht', 'Export PDF & Excel', 'Onbeperkte klanten'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#4A4A6A]">
                    <CheckCircle2 size={16} className="text-brand-500 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register?plan=pro" className="btn-primary block text-center text-sm py-2.5">
                Pro starten
              </Link>
            </div>

            {/* Premium */}
            <div className="card p-6">
              <h3 className="font-bold text-lg text-[#0F0F1E] mb-1">Premium</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <p className="text-3xl font-black text-[#0F0F1E]">€ 19,99</p>
                <span className="text-sm text-[#9898B0]">/mnd</span>
              </div>
              <p className="text-sm text-[#9898B0] mb-6">Jaarlijks gefactureerd</p>
              <ul className="space-y-2 mb-6">
                {['Alles in Pro', 'GPS ritregistratie', 'Geavanceerde inzichten', 'Prioriteit support'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#4A4A6A]">
                    <CheckCircle2 size={16} className="text-purple-500 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register?plan=premium" className="btn-secondary block text-center text-sm py-2.5">
                Premium starten
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-[#F5F4FF]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-center text-[#0F0F1E] mb-12">
            Wat zzp'ers zeggen
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {testimonials.map(t => (
              <div key={t.name} className="card p-6">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-[#4A4A6A] leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-sm text-[#0F0F1E]">{t.name}</p>
                  <p className="text-xs text-[#9898B0]">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-br from-brand-500 to-blue-500 rounded-3xl p-10 text-white">
            <Shield size={40} className="mx-auto mb-4 opacity-80" />
            <h2 className="text-3xl font-black mb-4">Klaar om te beginnen?</h2>
            <p className="text-white/80 mb-8">
              Meer dan 5.000 zzp'ers vertrouwen op Tasco. Begin vandaag nog gratis.
            </p>
            <Link href="/register" className="inline-flex items-center gap-2 bg-white text-brand-500 font-bold py-4 px-8 rounded-2xl hover:bg-brand-50 transition-colors">
              Gratis account aanmaken <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[#E8E8F5]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-500 rounded-lg flex items-center justify-center">
              <Zap size={13} className="text-white" />
            </div>
            <span className="font-black text-[#0F0F1E]">Tasco</span>
          </div>
          <p className="text-sm text-[#9898B0]">© 2024 Tasco. Gemaakt voor Nederlandse zzp'ers.</p>
          <div className="flex gap-4">
            <a href="#" className="text-sm text-[#9898B0] hover:text-brand-500 transition-colors">Privacy</a>
            <a href="#" className="text-sm text-[#9898B0] hover:text-brand-500 transition-colors">Voorwaarden</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
