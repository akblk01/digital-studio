"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Sparkles, LogOut, User, Coins, ChevronDown, LayoutDashboard, Image } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useTranslation, LOCALE_CONFIG, type Locale } from "@/lib/i18n/context"

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const { locale, setLocale, t } = useTranslation()

  useEffect(() => {
    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('credits, full_name, subscription_plan')
          .eq('id', session.user.id)
          .single()
        setProfile(data)
      } else {
        setProfile(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    setDropdownOpen(false)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#2A2A3E]/60 bg-[#0F0F1A]/90 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-[#6C63FF] to-[#FF6584] rounded-lg p-1.5 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:inline-block text-white">TexStudio AI</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-1 sm:gap-4">
          {user ? (
            <>
              {pathname === '/studio' ? (
                <span className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg text-white bg-white/10 cursor-default">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('nav_studio')}</span>
                </span>
              ) : (
                <Link
                  href="/studio"
                  className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors text-[#A0A0B0] hover:text-white hover:bg-white/5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('nav_studio')}</span>
                </Link>
              )}
              <Link
                href="/gallery"
                className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${pathname === '/gallery' ? 'text-white bg-white/10' : 'text-[#A0A0B0] hover:text-white hover:bg-white/5'}`}
              >
                <Image className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('nav_gallery')}</span>
              </Link>
              <Link
                href="/billing"
                className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${pathname === '/billing' ? 'text-white bg-white/10' : 'text-[#A0A0B0] hover:text-white hover:bg-white/5'}`}
              >
                <span className="hidden sm:inline">{t('nav_pricing')}</span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/studio" className="text-sm font-medium text-[#A0A0B0] hover:text-white transition-colors px-2">{t('nav_studio')}</Link>
              <Link href="/billing" className="text-sm font-medium text-[#A0A0B0] hover:text-white transition-colors px-2">{t('nav_pricing')}</Link>
            </>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">

          {/* Dil Seçici */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 text-xs font-medium text-[#A0A0B0] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-2 py-1.5 transition-colors"
            >
              <span>{LOCALE_CONFIG[locale].flag}</span>
              <span className="hidden sm:inline uppercase">{locale}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
            </button>
            {langOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-40 bg-[#1A1A2E] border border-[#2A2A3E] rounded-xl shadow-xl z-50 overflow-hidden py-1">
                  {(Object.keys(LOCALE_CONFIG) as Locale[]).map((loc) => (
                    <button
                      key={loc}
                      onClick={() => { setLocale(loc); setLangOpen(false) }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-left ${
                        locale === loc
                          ? 'text-white bg-white/10 font-semibold'
                          : 'text-[#A0A0B0] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{LOCALE_CONFIG[loc].flag}</span>
                      {LOCALE_CONFIG[loc].label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {user ? (
            <>
              {/* Kredi Göstergesi */}
              <Link
                href="/billing"
                className="hidden sm:flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
              >
                <Coins className="w-3.5 h-3.5 text-yellow-400" />
                {profile?.credits ?? '—'}
              </Link>

              {/* Kullanıcı Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full pl-1 pr-2 py-1 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-fuchsia-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                    {initials}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-white/60 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    {/* Menu */}
                    <div className="absolute right-0 top-full mt-2 w-52 bg-[#1A1A2E] border border-[#2A2A3E] rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                      <div className="px-4 py-3 border-b border-[#2A2A3E]">
                        <p className="text-xs text-[#A0A0B0]">{t('header_signed_in')}</p>
                        <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#A0A0B0] hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        {t('nav_profile')}
                      </Link>
                      <Link
                        href="/studio"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#A0A0B0] hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        {t('nav_studio')}
                      </Link>
                      <div className="border-t border-[#2A2A3E] mt-1 pt-1">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          {t('nav_signout')}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center justify-center rounded-lg text-sm font-medium border border-[#2A2A3E] bg-transparent hover:bg-[#1A1A2E] text-white h-9 px-4 transition-colors"
              >
                {t('nav_login')}
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg text-sm font-medium bg-[#6C63FF] text-white hover:bg-[#5b54d6] h-9 px-4 transition-colors"
              >
                {t('nav_register')}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
