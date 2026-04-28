import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="flex h-screen bg-[#F5F4FF]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-6 scroll-touch">
        {children}
      </main>
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  )
}
