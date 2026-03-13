"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Loader2, User, LogOut, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

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
        setProfile({ ...data, email: user.email })
      }
      setLoading(false)
    }
    fetchProfile()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">My Profile</h1>
      <p className="text-zinc-500 mb-8">Manage your account settings and personal details.</p>

      <Card className="bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-md">
        <CardHeader className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-tr from-fuchsia-500 to-violet-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : <User />}
            </div>
            <div>
              <CardTitle className="text-2xl">{profile?.full_name || 'User'}</CardTitle>
              <CardDescription>{profile?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-zinc-500 font-medium">Account ID</span>
            <span className="text-sm font-mono text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-md inline-block max-w-full truncate">
              {profile?.id}
            </span>
          </div>
          <div className="flex flex-col gap-1">
             <span className="text-sm text-zinc-500 font-medium">Joined Date</span>
             <span className="text-sm text-zinc-900 dark:text-zinc-100">
               {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
             </span>
          </div>
          <div className="flex flex-col gap-1">
             <span className="text-sm text-zinc-500 font-medium">Security</span>
             <div className="flex items-center gap-2 text-sm text-emerald-500 font-medium">
               <Shield className="w-4 h-4" />
               Account is secure
             </div>
          </div>
        </CardContent>
        <CardFooter className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
           <Button variant="destructive" onClick={handleSignOut} className="w-full sm:w-auto h-12 rounded-xl">
             <LogOut className="w-4 h-4 mr-2" />
             Sign Out
           </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
