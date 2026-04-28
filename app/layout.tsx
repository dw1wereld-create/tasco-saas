import type { Metadata, Viewport } from 'next'
import { Toaster } from 'react-hot-toast'
import { SessionProvider } from '@/components/providers/SessionProvider'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Tasco — ZZP Administratie', template: '%s | Tasco' },
  description: 'Alles-in-één administratie voor Nederlandse zzp\'ers. Urenregistratie, facturatie en financieel inzicht in één app.',
  keywords: ['zzp', 'administratie', 'urenregistratie', 'facturatie', 'belasting', 'freelancer'],
  authors: [{ name: 'Tasco' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tasco',
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    title: 'Tasco — ZZP Administratie',
    description: 'Alles-in-één administratie voor Nederlandse zzp\'ers',
    siteName: 'Tasco',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#6C63FF',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className="h-full">
      <body className="h-full">
        <SessionProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1a1a2e',
                color: '#fff',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '500',
              },
              success: { iconTheme: { primary: '#00D9A6', secondary: '#fff' } },
              error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  )
}
