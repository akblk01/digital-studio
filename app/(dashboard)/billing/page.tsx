"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Coins, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useTranslation } from "@/lib/i18n/context"

export default function BillingPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { t } = useTranslation()

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!error && data) {
        setProfile(data)
      }
      setLoading(false)
    }
    fetchProfile()
  }, [supabase])

  const handlePurchase = async (type: string) => {
    try {
      toast.info(`Redirecting to Stripe for ${type}...`, {
        description: "Integration deferred down the road as per instructions."
      })
    } catch (e) {
      toast.error(t('studio_toast_error'))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    )
  }

  const starterFeatures = [
    t('billing_starter_f1'),
    t('billing_starter_f2'),
    t('billing_starter_f3'),
    t('billing_starter_f4')
  ]

  const proFeatures = [
    t('billing_pro_f1'),
    t('billing_pro_f2'),
    t('billing_pro_f3'),
    t('billing_pro_f4'),
    t('billing_pro_f5')
  ]

  const enterpriseFeatures = [
    t('billing_enterprise_f1'),
    t('billing_enterprise_f2'),
    t('billing_enterprise_f3'),
    t('billing_enterprise_f4'),
    t('billing_enterprise_f5')
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-2">{t('billing_title')}</h1>
      <p className="text-zinc-500 mb-8">{t('billing_subtitle')}</p>

      {/* Credit Status Card */}
      <Card className="mb-10 bg-gradient-to-tr from-fuchsia-500/10 to-violet-500/10 border-violet-500/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center shadow-sm">
                <Coins className="w-6 h-6 text-violet-500" />
              </div>
              <div>
                <p className="text-sm text-zinc-500 font-medium">{t('billing_available_credits')}</p>
                <h2 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">{profile?.credits || 0}</h2>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{t('billing_current_plan')}: <span className="text-violet-500 capitalize">{profile?.subscription_plan || t('billing_free')}</span></p>
              <p className="text-xs text-zinc-500 mt-1">{t('billing_status')}: {profile?.subscription_status || t('billing_inactive')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {/* Starter Plan */}
        <Card className="relative overflow-hidden group hover:border-violet-500/50 transition-colors flex flex-col">
          <CardHeader>
             <CardTitle className="text-2xl">{t('billing_starter_name')}</CardTitle>
             <CardDescription>{t('billing_starter_desc')}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex justify-center items-end gap-1 mb-6">
               <span className="text-4xl font-bold text-zinc-900 dark:text-white">$149</span>
               <span className="text-zinc-500 mb-1 font-medium">{t('billing_per_month')}</span>
            </div>
            <ul className="space-y-3 mb-6">
              {starterFeatures.map(feature => (
                <li key={feature} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                   <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                   {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button onClick={() => handlePurchase('starter')} variant="outline" className="w-full border-zinc-200 dark:border-zinc-800">
               {t('billing_get_starter')}
            </Button>
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className="relative overflow-hidden group border-violet-500/50 shadow-[0_0_30px_-10px_rgba(139,92,246,0.3)] flex flex-col lg:scale-105 z-10 bg-white dark:bg-zinc-950">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-fuchsia-500 to-violet-500"></div>
          <div className="absolute top-0 right-0 bg-violet-500 text-white px-3 py-1 rounded-bl-lg text-[10px] font-bold uppercase tracking-wider">
            {t('billing_most_popular')}
          </div>
          <CardHeader>
             <CardTitle className="text-2xl text-violet-500 font-extrabold mt-2">{t('billing_pro_name')}</CardTitle>
             <CardDescription>{t('billing_pro_desc')}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex justify-center items-end gap-1 mb-6">
               <span className="text-5xl font-extrabold text-zinc-900 dark:text-white">$399</span>
               <span className="text-zinc-500 mb-2 font-medium">{t('billing_per_month')}</span>
            </div>
            <ul className="space-y-3 mb-6">
              {proFeatures.map(feature => (
                <li key={feature} className="flex items-start gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                   <Check className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
                   {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button onClick={() => handlePurchase('pro')} className="w-full bg-gradient-to-r from-fuchsia-500 to-violet-500 hover:opacity-90 text-white h-12 text-md shadow-lg font-bold">
               {t('billing_subscribe_pro')}
            </Button>
          </CardFooter>
        </Card>

        {/* Enterprise/Annual Plan */}
        <Card className="relative overflow-hidden group hover:border-violet-500/50 transition-colors flex flex-col">
          <CardHeader>
             <CardTitle className="text-2xl">{t('billing_enterprise_name')}</CardTitle>
             <CardDescription>{t('billing_enterprise_desc')}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex justify-center items-end gap-1 mb-2">
               <span className="text-4xl font-bold text-zinc-900 dark:text-white">$3,830</span>
               <span className="text-zinc-500 mb-1 font-medium">{t('billing_per_year')}</span>
            </div>
            <p className="text-center text-xs text-emerald-500 font-medium mb-6">{t('billing_save_note')}</p>
            <ul className="space-y-3 mb-6">
              {enterpriseFeatures.map(feature => (
                <li key={feature} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                   <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                   {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button onClick={() => handlePurchase('annual')} variant="outline" className="w-full border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800">
               {t('billing_get_enterprise')}
            </Button>
          </CardFooter>
        </Card>
      </div>

    </div>
  )
}
