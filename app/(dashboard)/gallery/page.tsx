"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Download, Calendar, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function GalleryPage() {
  const [generations, setGenerations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchGenerations() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch generations and their images
      const { data, error } = await supabase
        .from('generations')
        .select(`
          id,
          created_at,
          ethnicity,
          concept,
          status,
          generated_images (
            id, image_url, variation_index
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setGenerations(data)
      }
      setLoading(false)
    }
    fetchGenerations()
  }, [supabase])

  const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  const handleDownloadZip = (generationId: string, images: any[]) => {
    if (isMobile) {
      images.forEach((img: any) => window.open(img.image_url, '_blank'))
      toast.info('Görseller yeni sekmelerde açıldı. Uzun basarak kaydet.')
    } else {
      window.location.href = `/api/download?generationId=${generationId}`
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-2">My Gallery</h1>
      <p className="text-zinc-500 mb-8">View and download your past generated catalogs.</p>

      {generations.length === 0 ? (
        <div className="text-center py-16 bg-zinc-50 dark:bg-zinc-900/40 rounded-3xl border border-zinc-200 dark:border-zinc-800">
          <p className="text-zinc-500">You haven't generated any catalogs yet.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {generations.map((gen) => (
            <div key={gen.id} className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold capitalize">{gen.concept.replace('_', ' ')}</h3>
                  <div className="flex items-center gap-2 text-sm text-zinc-500 mt-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(gen.created_at).toLocaleDateString()}
                    <span className="mx-2">•</span>
                    <span>{gen.ethnicity.replace('_', ' ')}</span>
                  </div>
                </div>
                {gen.status === 'completed' && gen.generated_images?.length > 0 && (
                  <Button 
                    onClick={() => handleDownloadZip(gen.id, gen.generated_images)}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isMobile ? 'Görselleri Aç' : 'Download All (.zip)'}
                  </Button>
                )}
              </div>

              {gen.status === 'processing' ? (
                <div className="flex items-center gap-3 text-violet-500 bg-violet-500/10 p-4 rounded-xl">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating in progress...
                </div>
              ) : gen.status === 'failed' ? (
                 <div className="text-red-500 bg-red-500/10 p-4 rounded-xl">
                   Generation failed. Please try again.
                 </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {gen.generated_images?.sort((a: any, b: any) => a.variation_index - b.variation_index).map((img: any) => (
                    <div key={img.id} className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                      <Image src={img.image_url} alt="Generated" fill className="object-cover" />
                      <a
                        href={img.image_url}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 hover:bg-black/80 text-white rounded-lg p-1.5"
                      >
                        <Download className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
