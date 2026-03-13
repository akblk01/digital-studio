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

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      })

      if (error) {
        toast.error("Kayıt başarısız", { description: error.message })
      } else {
        toast.success("Kayıt başarılı! 50 Hoşgeldin Krediniz yüklendi. Giriş yapabilirsiniz.")
        
        // Attempt to send welcome email via server action
        const { sendWelcomeEmail } = await import('@/app/actions/sendWelcomeEmail')
        await sendWelcomeEmail(email, fullName || 'User')

        router.push("/login")
      }
    } catch (err: any) {
      toast.error("Bir hata oluştu")
    } finally {
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
          <CardTitle className="text-2xl font-bold text-center text-white">Hesap Oluşturun</CardTitle>
          <CardDescription className="text-center text-[#A0A0B0]">
            TexStudio AI'a katılın ve ücretsiz deneme kredilerinizi alın.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullname" className="text-white">Ad Soyad</Label>
              <Input 
                id="fullname" 
                placeholder="Ahmet Yılmaz" 
                required 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-[#0F0F1A] border-[#2A2A3E] text-white focus-visible:ring-[#FF6584]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">E-posta</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="ornek@sirket.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#0F0F1A] border-[#2A2A3E] text-white focus-visible:ring-[#FF6584]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Şifre</Label>
              <Input 
                id="password" 
                type="password"
                placeholder="En az 6 karakter"
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
              {loading ? "Hesap Oluşturuluyor..." : "Kayıt Ol"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-[#A0A0B0]">
          Zaten hesabınız var mı?{' '}
          <Link href="/login" className="ml-1 text-[#6C63FF] hover:underline font-medium">
            Giriş Yapın
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
