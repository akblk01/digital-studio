import Link from "next/link"
import { Sparkles, User, Coins } from "lucide-react"

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#2A2A3E]/60 bg-[#0F0F1A]/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-[#6C63FF] to-[#FF6584] rounded-lg p-1.5 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:inline-block">TexStudio AI</span>
          </Link>
        </div>

        <nav className="flex items-center gap-4">
          <Link href="/studio" className="text-sm font-medium text-[#A0A0B0] hover:text-white transition-colors">
            Stüdyo
          </Link>
          <Link href="/gallery" className="text-sm font-medium text-[#A0A0B0] hover:text-white transition-colors">
            Galeri
          </Link>
          <Link href="/billing" className="text-sm font-medium text-[#A0A0B0] hover:text-white transition-colors">
            Fiyatlandırma
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="hidden sm:inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-[#2A2A3E] bg-transparent hover:bg-[#1A1A2E] text-white h-9 px-4 py-2"
          >
            Giriş Yap
          </Link>
          <Link 
            href="/register" 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-[#6C63FF] text-white hover:bg-[#5b54d6] h-9 px-4 py-2"
          >
            Kayıt Ol
          </Link>
        </div>
      </div>
    </header>
  )
}
