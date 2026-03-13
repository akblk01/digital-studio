import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TexStudio AI',
  description: 'Tek fotoğraftan profesyonel moda kataloğu oluşturun.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Proje varsayılan olarak karanlık tema (dark) ile açılır
  return (
    <html lang="tr" className="dark" style={{ colorScheme: 'dark' }}>
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        {children}
        <Toaster theme="dark" position="top-center" />
      </body>
    </html>
  )
}
