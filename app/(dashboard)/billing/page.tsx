"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Coins, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function BillingPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

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
      // In a real application, this would redirect to a Stripe checkout session.
      // For demonstration, we simply show a toast.
      toast.info(`Redirecting to Stripe for ${type}...`, {
        description: "Integration deferred down the road as per instructions."
      })
    } catch (e) {
      toast.error("Error initiating payment")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-2">Billing & Plans</h1>
      <p className="text-zinc-500 mb-8">Manage your subscription and purchase credits.</p>

      {/* Credit Status Card */}
      <Card className="mb-10 bg-gradient-to-tr from-fuchsia-500/10 to-violet-500/10 border-violet-500/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center shadow-sm">
                <Coins className="w-6 h-6 text-violet-500" />
              </div>
              <div>
                <p className="text-sm text-zinc-500 font-medium">Available Credits</p>
                <h2 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">{profile?.credits || 0}</h2>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Current Plan: <span className="text-violet-500 capitalize">{profile?.subscription_plan || 'Free'}</span></p>
              <p className="text-xs text-zinc-500 mt-1">Status: {profile?.subscription_status || 'Inactive'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Credits Purchase */}
        <Card className="relative overflow-hidden group hover:border-violet-500/50 transition-colors">
          <CardHeader>
             <CardTitle className="text-2xl">One-time Purchase</CardTitle>
             <CardDescription>Top up your credits anytime.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-end gap-1 mb-6">
               <span className="text-4xl font-bold">$29</span>
               <span className="text-zinc-500 mb-1">/ 500 Credits</span>
            </div>
            <ul className="space-y-3 mb-6">
              {['No expiry date', 'Instant delivery', 'Generate 25 complete catalogs (20 poses each)'].map(feature => (
                <li key={feature} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                   <Check className="w-4 h-4 text-emerald-500" />
                   {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button onClick={() => handlePurchase('credits')} className="w-full bg-zinc-900 hover:bg-zinc-800 text-white">
               Buy 500 Credits
               <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>

        {/* Subscription Plan */}
        <Card className="relative overflow-hidden group border-violet-500/50 shadow-[0_0_30px_-10px_rgba(139,92,246,0.3)]">
          <div className="absolute top-0 right-0 bg-violet-500 text-white px-3 py-1 rounded-bl-lg text-xs font-bold uppercase tracking-wider">
            Most Popular
          </div>
          <CardHeader>
             <CardTitle className="text-2xl text-violet-500 font-extrabold">Pro Monthly</CardTitle>
             <CardDescription>Best for active businesses and agencies.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-end gap-1 mb-6">
               <span className="text-5xl font-extrabold text-zinc-900 dark:text-white">$99</span>
               <span className="text-zinc-500 mb-2 font-medium">/ month</span>
            </div>
            <ul className="space-y-3 mb-6">
              {[
                '1000 Credits monthly', 
                'Rollover unused credits', 
                'Priority queue processing',
                'Generate 50 complete catalogs/mo'
              ].map(feature => (
                <li key={feature} className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                   <Check className="w-5 h-5 text-violet-500" />
                   {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button onClick={() => handlePurchase('subscription')} className="w-full bg-gradient-to-r from-fuchsia-500 to-violet-500 hover:opacity-90 text-white h-12 text-md shadow-lg font-bold">
               Subscribe to Pro
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
