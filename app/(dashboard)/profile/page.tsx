"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Loader2, User, LogOut, Shield, UserCircle, Trash2, Sparkles, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"
import { useTranslation } from "@/lib/i18n/context"

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [savedModels, setSavedModels] = useState<any[]>([])
  const [modelName, setModelName] = useState("")
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [modelPreview, setModelPreview] = useState<string | null>(null)
  const [savingModel, setSavingModel] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const router = useRouter()
  const { t } = useTranslation()

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: profileData }, { data: models }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('saved_models').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    ])

    if (profileData) setProfile({ ...profileData, email: user.email })
    if (models) setSavedModels(models)
    setLoading(false)
  }

  const handleModelFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setModelFile(file)
    setModelPreview(URL.createObjectURL(file))
  }

  const handleSaveModel = async () => {
    if (!modelName.trim() || !modelFile) {
      toast.error(t('profile_name_photo_required'))
      return
    }
    setSavingModel(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error(t('studio_login_required'))

      const ext = modelFile.name.split('.').pop()
      const path = `saved-models/${user.id}/${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage.from('product-images').upload(path, modelFile)
      if (uploadErr) throw uploadErr

      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path)

      const { error: insertErr } = await supabase.from('saved_models').insert({
        user_id: user.id,
        name: modelName.trim(),
        face_image_url: publicUrl,
      })
      if (insertErr) throw insertErr

      toast.success(`"${modelName}" ${t('profile_model_saved_toast')}`)
      setModelName("")
      setModelFile(null)
      setModelPreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      await fetchAll()
    } catch (err: any) {
      toast.error(err.message || t('profile_save_fail'))
    } finally {
      setSavingModel(false)
    }
  }

  const handleDeleteModel = async (modelId: string, name: string) => {
    if (!confirm(`"${name}" ${t('profile_delete_confirm')}`)) return
    const { error } = await supabase.from('saved_models').delete().eq('id', modelId)
    if (error) {
      toast.error(t('profile_delete_fail'))
    } else {
      toast.success(`"${name}" ${t('profile_delete_success')}`)
      setSavedModels(prev => prev.filter(m => m.id !== modelId))
    }
  }

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
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-1 text-zinc-900 dark:text-white">{t('profile_title')}</h1>
        <p className="text-zinc-500">{t('profile_subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile Card */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="rounded-3xl overflow-hidden">
            <CardHeader className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-tr from-fuchsia-500 to-violet-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0">
                  {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : <User />}
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-lg truncate">{profile?.full_name || t('profile_user_default')}</CardTitle>
                  <CardDescription className="truncate">{profile?.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div>
                <p className="text-xs text-zinc-500 font-medium mb-1">{t('profile_credits')}</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">{profile?.credits ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium mb-1">{t('profile_plan')}</p>
                <p className="text-sm font-semibold capitalize text-violet-500">{profile?.subscription_plan || 'Free'}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-500 font-medium pt-1">
                <Shield className="w-3.5 h-3.5" />
                {t('profile_secure')}
              </div>
            </CardContent>
            <CardFooter className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
              <Button variant="destructive" onClick={handleSignOut} className="w-full rounded-xl">
                <LogOut className="w-4 h-4 mr-2" />
                {t('profile_signout')}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right: Saved Models */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserCircle className="w-5 h-5 text-violet-500" />
                {t('profile_models_title')}
              </CardTitle>
              <CardDescription className="flex items-start gap-2">
                <span className="text-zinc-500 text-sm">
                  {t('profile_models_info')}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {savedModels.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <p className="text-zinc-400 text-sm">{t('profile_no_models')}</p>
                  <a
                    href="/studio"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-fuchsia-500 to-violet-500 hover:opacity-90 px-4 py-2 rounded-xl transition-opacity"
                  >
                    <Sparkles className="w-4 h-4" />
                    {t('profile_go_studio')}
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {savedModels.map((model) => (
                    <div key={model.id} className="group relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                      <div className="relative aspect-square">
                        <Image src={model.face_image_url} alt={model.model_name} fill className="object-cover" />
                      </div>
                      <div className="p-2 flex items-center justify-between">
                        <p className="text-xs font-semibold truncate text-zinc-800 dark:text-zinc-200">{model.model_name}</p>
                        <button
                          onClick={() => handleDeleteModel(model.id, model.model_name)}
                          className="text-red-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
