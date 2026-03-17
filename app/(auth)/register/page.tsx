"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"
import { Sparkles } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { t } = useTranslation()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      })

      if (error) {
        toast.error(t('register_toast_fail'), { description: error.message })
        setLoading(false)
        return
      }

      // Supabase bazen başarılı kayıt sonrası identities boş dönebilir (email zaten kullanılıyorsa)
      if (data?.user?.identities?.length === 0) {
        toast.error(t('register_toast_fail'), { description: 'Bu e-posta adresi zaten kayıtlı.' })
        setLoading(false)
        return
      }

      toast.success(t('register_toast_success'))

      // Welcome email — fire-and-forget (başarısız olursa kullanıcıyı etkilemez)
      try {
        const { sendWelcomeEmail } = await import('@/app/actions/sendWelcomeEmail')
        sendWelcomeEmail(email, fullName || 'User').catch(() => {})
      } catch {
        // Email gönderimi opsiyonel — hatayı yut
      }

      setTimeout(() => {
        window.location.href = '/login'
      }, 1000)
    } catch (err: any) {
      console.error('Register error:', err)
      toast.error(t('register_toast_error'))
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-[#0F0F1A] p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FF6584]/10 rounded-full blur-[100px] pointer-events-none" />

      <Card className="w-full max-w-md bg-[#1A1A2E]/80 border-[#2A2A3E] backdrop-blur-xl relative z-10">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-[#6C63FF] to-[#FF6584] rounded-lg p-3">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-white">{t('register_title')}</CardTitle>
          <CardDescription className="text-center text-[#A0A0B0]">
            {t('register_subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullname" className="text-white">{t('register_name')}</Label>
              <Input 
                id="fullname" 
                placeholder={t('register_placeholder_name')} 
                required 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-[#0F0F1A] border-[#2A2A3E] text-white focus-visible:ring-[#FF6584]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">{t('register_email')}</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder={t('register_placeholder_email')} 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#0F0F1A] border-[#2A2A3E] text-white focus-visible:ring-[#FF6584]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">{t('register_password')}</Label>
              <Input 
                id="password" 
                type="password"
                placeholder={t('register_placeholder_password')}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#0F0F1A] border-[#2A2A3E] text-white focus-visible:ring-[#FF6584]"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#FF6584] hover:bg-[#e05673] text-white" 
              disabled={loading}
            >
              {loading ? t('register_creating') : t('register_btn')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-[#A0A0B0]">
          {t('register_have_account')}{' '}
          <Link href="/login" className="ml-1 text-[#6C63FF] hover:underline font-medium">
            {t('register_login_link')}
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
