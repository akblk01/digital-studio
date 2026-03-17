"use client"

import { Hero } from "@/components/layout/Hero"
import { Features } from "@/components/layout/Features"
import Header from "@/components/layout/Header"
import { useTranslation } from "@/lib/i18n/context"

export default function Home() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 w-full flex flex-col items-center">
        <Hero />
        <Features />
      </main>
      
      {/* Footer */}
      <footer className="border-t border-[#2A2A3E] bg-[#0F0F1A] py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between">
          <p className="text-[#A0A0B0] text-sm">{t('footer_rights')}</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-[#A0A0B0] hover:text-white text-sm transition-colors">{t('footer_terms')}</a>
            <a href="#" className="text-[#A0A0B0] hover:text-white text-sm transition-colors">{t('footer_privacy')}</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
