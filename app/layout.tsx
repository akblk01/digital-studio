import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { I18nProvider } from '@/lib/i18n/context'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'TexStudio AI',
  description: 'Tek fotoğraftan profesyonel moda kataloğu oluşturun.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" className="dark" style={{ colorScheme: 'dark' }}>
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        <I18nProvider>
          {children}
          <Toaster theme="dark" position="top-center" />
        </I18nProvider>
      </body>
    </html>
  )
}

