'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Clock, FileText, Receipt, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/uren', label: 'Uren', icon: Clock },
  { href: '/facturen', label: 'Facturen', icon: FileText },
  { href: '/bonnen', label: 'Bonnen', icon: Receipt },
  { href: '/instellingen', label: 'Meer', icon: Settings },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E8E8F5] safe-bottom">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {navItems.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'nav-item flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all',
                active ? 'nav-item-active' : 'nav-item-inactive'
              )}
            >
              <item.icon
                size={22}
                className={cn(
                  'transition-colors',
                  active ? 'text-brand-500' : 'text-[#9898B0]'
                )}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span className={cn(
                'text-[10px] font-semibold transition-colors',
                active ? 'text-brand-500' : 'text-[#9898B0]'
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
