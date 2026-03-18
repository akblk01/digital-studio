"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"
import { Camera } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const supabase = createClient()
  const { t } = useTranslation()

  // Zaten giriş yapmışsa direkt studio'ya yönlendir
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.location.href = '/studio'
      } else {
        setCheckingSession(false)
      }
    }).catch(() => {
      setCheckingSession(false)
    })
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        console.error('[Login] Auth error:', error.message)
        toast.error(t('login_toast_fail'), { description: error.message })
        setLoading(false)
      } else {
        toast.success(t('login_toast_success'))
        window.location.href = '/studio'
      }
    } catch (err: any) {
      console.error('[Login] Catch error:', err)
      toast.error(t('login_toast_fail'), { description: err.message || 'Bağlantı hatası' })
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-[#0F0F1A]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500" />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-[#0F0F1A] p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#6C63FF]/10 rounded-full blur-[100px] pointer-events-none" />

      <Card className="w-full max-w-md bg-[#1A1A2E]/80 border-[#2A2A3E] backdrop-blur-xl relative z-10">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-[#6C63FF] to-[#FF6584] rounded-lg p-3">
              <Camera className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-white">{t('login_title')}</CardTitle>
          <CardDescription className="text-center text-[#A0A0B0]">
            {t('login_subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">{t('login_email')}</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder={t('login_placeholder_email')} 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#0F0F1A] border-[#2A2A3E] text-white focus-visible:ring-[#6C63FF]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">{t('login_password')}</Label>
              <Input 
                id="password" 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#0F0F1A] border-[#2A2A3E] text-white focus-visible:ring-[#6C63FF]"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#6C63FF] hover:bg-[#5b54d6] text-white" 
              disabled={loading}
            >
              {loading ? t('login_logging_in') : t('login_btn')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-[#A0A0B0]">
          {t('login_no_account')}{' '}
          <Link href="/register" className="ml-1 text-[#FF6584] hover:underline font-medium">
            {t('login_register_link')}
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
