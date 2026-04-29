'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  LayoutDashboard, Clock, FileText, Receipt,
  Car, Calculator, Users, Settings, LogOut, Zap, Crown, UserCog
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/uren', label: 'Urenregistratie', icon: Clock },
  { href: '/facturen', label: 'Facturatie', icon: FileText },
  { href: '/bonnen', label: 'Bonnen & Uitgaven', icon: Receipt },
  { href: '/kilometers', label: 'Kilometers', icon: Car },
  { href: '/belasting', label: 'Belasting', icon: Calculator },
  { href: '/klanten', label: 'Klanten & Projecten', icon: Users },
  { href: '/teamleden', label: 'Teamleden', icon: UserCog },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isPro = session?.user?.plan === 'PRO' || session?.user?.plan === 'PREMIUM'

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#E8E8F5] h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-[#E8E8F5]">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-md shadow-brand-500/30">
            <Zap size={20} className="text-white" />
          </div>
          <span className="text-xl font-black text-[#0F0F1E] tracking-tight">Tasco</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-brand-50 text-brand-600 font-semibold'
                  : 'text-[#6B6B8A] hover:bg-gray-50 hover:text-[#0F0F1E]'
              )}
            >
              <item.icon size={19} strokeWidth={active ? 2.5 : 2} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Upgrade banner */}
      {!isPro && (
        <div className="p-4">
          <Link href="/upgrade" className="block bg-gradient-to-br from-brand-500 to-blue-500 rounded-2xl p-4 text-white">
            <Crown size={20} className="mb-2 opacity-80" />
            <p className="text-sm font-bold mb-1">Upgrade naar Pro</p>
            <p className="text-xs opacity-80">Facturen, OCR en meer</p>
          </Link>
        </div>
      )}

      {/* User */}
      <div className="p-4 border-t border-[#E8E8F5]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-brand-600">
              {session?.user?.name?.[0]?.toUpperCase() ?? 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#0F0F1E] truncate">
              {session?.user?.name ?? 'Gebruiker'}
            </p>
            <p className="text-xs text-[#9898B0] truncate">
              {session?.user?.plan ?? 'FREE'} plan
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/instellingen" className="flex-1 flex items-center justify-center gap-1.5 text-xs text-[#6B6B8A] hover:text-brand-500 py-2 rounded-lg hover:bg-brand-50 transition-colors">
            <Settings size={14} /> Instellingen
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center justify-center gap-1.5 text-xs text-[#6B6B8A] hover:text-red-500 py-2 px-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
