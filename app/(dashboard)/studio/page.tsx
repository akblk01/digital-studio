"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import {
  UploadCloud,
  Sparkles,
  Loader2,
  CheckCircle2,
  Download,
  Camera,
  Layers,
  Palette,
  Eye,
  Settings2,
  Image as ImageIcon,
  UserCircle,
  Flag
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { ETHNICITY_CONFIG, CONCEPT_CONFIG, FABRIC_CONFIG } from "@/types"
import type { Ethnicity, Concept, GeneratedImage, FabricType } from "@/types"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

export default function StudioPage() {
  const [file, setFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  
  const [selectedEthnicity, setSelectedEthnicity] = useState<Ethnicity | null>(null)
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null)
  const [selectedFabric, setSelectedFabric] = useState<FabricType | null>(null)
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [progressStep, setProgressStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  
  const [results, setResults] = useState<GeneratedImage[]>([])
  const [generationId, setGenerationId] = useState<string | null>(null)
  
  const [showPreview, setShowPreview] = useState(false) // Toggle form vs generating/results view

  // Face Reference (Tutarlı Model Yüzü)
  const [faceFile, setFaceFile] = useState<File | null>(null)
  const [facePreviewUrl, setFacePreviewUrl] = useState<string | null>(null)
  const [faceReferenceUrl, setFaceReferenceUrl] = useState<string | null>(null)

  const supabase = createClient()

  // Fake progress effect for sleek UI
  useEffect(() => {
    if (!isGenerating) {
      setProgress(0)
      return
    }
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
           return 95 // Will jump to 100 on complete
        }
        return prev + 0.5
      })
    }, 100)
    return () => clearInterval(interval)
  }, [isGenerating])

  const progressMessages = [
    "Preparing the studio environment...",
    "Uploading your garment...",
    "Analyzing fabric and patterns...",
    "Applying advanced AI VTON model...",
    "Rendering lighting and shadows...",
    "Adding final artistic touches..."
  ]

  useEffect(() => {
    if (!isGenerating) return
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % progressMessages.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [isGenerating])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setImageUrl(URL.createObjectURL(selectedFile))
      setResults([])
      setShowPreview(false)
    }
  }

  const handleFaceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFace = e.target.files[0]
      setFaceFile(selectedFace)
      setFacePreviewUrl(URL.createObjectURL(selectedFace))
    }
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !selectedEthnicity || !selectedConcept) return

    setIsGenerating(true)
    setShowPreview(true)
    setProgressStep(1)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `uploads/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

      if (uploadError) throw new Error("Görsel yüklenemedi")
      
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      setProgressStep(2)

      // Face reference varsa onu da Supabase'e yükle
      let uploadedFaceUrl: string | undefined
      if (faceFile) {
        const faceExt = faceFile.name.split('.').pop()
        const faceName = `faces/${Math.random()}.${faceExt}`
        const { error: faceUploadErr } = await supabase.storage
          .from('product-images')
          .upload(faceName, faceFile)
        if (!faceUploadErr) {
          const { data: { publicUrl: facePublicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(faceName)
          uploadedFaceUrl = facePublicUrl
        }
      }

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: publicUrl,
          ethnicity: selectedEthnicity,
          concept: selectedConcept,
          faceReferenceUrl: uploadedFaceUrl,
          fabricType: selectedFabric,
        })
      })

      setProgressStep(3)

      const resultData = await res.json()

      if (!res.ok) {
        throw new Error(resultData.error || "Üretim hatası")
      }

      setResults(resultData.images)
      setGenerationId(resultData.generationId)
      setProgress(100)
      setIsGenerating(false)
      setProgressStep(4)
      
      toast.success("Tebrikler! 4 adet profesyonel katalog görseliniz hazır.", {
        position: 'top-center',
        className: 'bg-zinc-900 border-zinc-800 text-white'
      })
      
    } catch (err: any) {
      toast.error("Hata Oluştu", { 
        description: err.message,
        position: 'top-center'
      })
      setIsGenerating(false)
      setShowPreview(false)
      setProgressStep(0)
    }
  }

  const handleDownloadZip = () => {
    if (generationId) {
      window.location.href = `/api/download?generationId=${generationId}`
    }
  }

  const handleBackToForm = () => {
    setShowPreview(false)
    setIsGenerating(false)
    setProgress(0)
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 sm:p-8 bg-white dark:bg-[#0A0A0A]">
      <div className="w-full max-w-4xl text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
          AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-violet-500">Catalog Studio</span>
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium">
          Professional, minimal, automated. Upload your garment and let the magic happen.
        </p>
      </div>

      <div className="group relative overflow-hidden w-full max-w-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-3xl transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] min-h-[500px] flex flex-col backdrop-blur-sm">
        
        {/* Header inside Card */}
        <div className="p-5 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-fuchsia-500 to-violet-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Generation Configurator</h3>
            </div>
          </div>
          {showPreview && !isGenerating && results.length > 0 && (
             <button
               onClick={handleBackToForm}
               className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors font-medium flex items-center gap-1"
             >
               <Settings2 className="w-3.5 h-3.5" />
               New Session
             </button>
          )}
        </div>

        <div className="flex-1 flex flex-col p-6">
          {!showPreview ? (
            <form onSubmit={handleGenerate} className="flex flex-col h-full justify-between gap-6">
              
              <div className="space-y-6">
                {/* Upload Image Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-zinc-500" />
                    <Label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Garment Image</Label>
                  </div>
                  
                  <div className={`relative border-2 border-dashed rounded-2xl p-6 text-center flex flex-col items-center justify-center transition-all duration-300 bg-zinc-50 dark:bg-zinc-900/30
                    ${imageUrl ? 'border-violet-500/50 min-h-[220px]' : 'border-zinc-300 dark:border-zinc-700 hover:border-violet-400 min-h-[160px]'}`}>
                    
                    {imageUrl ? (
                      <div className="absolute inset-2 rounded-xl overflow-hidden group/img">
                        <Image src={imageUrl} alt="Uploaded Garment" fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          <Label htmlFor="image-upload" className="cursor-pointer bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-white font-medium text-sm transition-colors border border-white/20">
                            Change Image
                          </Label>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                          <UploadCloud className="w-6 h-6 text-zinc-500 dark:text-zinc-400" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Click to upload or drag & drop</p>
                          <p className="text-xs text-zinc-500 mt-1">PNG, JPG, JPEG (Max. 10MB)</p>
                        </div>
                        <Label htmlFor="image-upload" className="cursor-pointer mt-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm">
                          Browse File
                        </Label>
                      </div>
                    )}
                    <Input 
                      id="image-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleFileUpload}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Select Ethnicity */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-zinc-500" />
                      <Label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Model Ethnicity</Label>
                    </div>
                    <Select value={selectedEthnicity || ""} onValueChange={(val) => setSelectedEthnicity(val as Ethnicity)} required>
                      <SelectTrigger className="w-full h-12 bg-zinc-50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-violet-500">
                        <SelectValue placeholder="Select appearance..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800 z-50">
                        {Object.entries(ETHNICITY_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key} className="cursor-pointer">
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Select Concept */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-zinc-500" />
                      <Label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Environment</Label>
                    </div>
                    <Select value={selectedConcept || ""} onValueChange={(val) => setSelectedConcept(val as Concept)} required>
                      <SelectTrigger className="w-full h-12 bg-zinc-50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-violet-500">
                        <SelectValue placeholder="Select concept..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800 z-50">
                        {Object.entries(CONCEPT_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key} className="cursor-pointer">
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Fabric Type (Physics-Aware Draping) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-zinc-500" />
                    <Label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Fabric Type <span className="text-xs font-normal text-zinc-400">(Optional)</span></Label>
                  </div>
                  <Select value={selectedFabric || ""} onValueChange={(val) => setSelectedFabric(val as FabricType)}>
                    <SelectTrigger className="w-full h-12 bg-zinc-50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-violet-500">
                      <SelectValue placeholder="Auto-detect..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800 z-50">
                      {Object.entries(FABRIC_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key} className="cursor-pointer">
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Face Reference (Opsiyonel) */}
                <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-zinc-500" />
                    <Label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Consistent Model Face <span className="text-xs font-normal text-zinc-400">(Optional)</span></Label>
                  </div>
                  <p className="text-xs text-zinc-500">Upload a face photo to keep the same model identity across all generations. Extra credits apply.</p>
                  <div className="relative border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-4 hover:border-violet-400 transition-colors cursor-pointer">
                    {facePreviewUrl ? (
                      <div className="flex items-center gap-3">
                        <Image src={facePreviewUrl} alt="Face" width={48} height={48} className="rounded-full object-cover w-12 h-12" />
                        <div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{faceFile?.name}</p>
                          <button type="button" onClick={() => { setFaceFile(null); setFacePreviewUrl(null); setFaceReferenceUrl(null) }} className="text-xs text-red-500 hover:text-red-400">
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label htmlFor="face-upload" className="flex items-center gap-3 cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                          <UserCircle className="w-5 h-5 text-zinc-400" />
                        </div>
                        <span className="text-sm text-zinc-500">Click to upload face reference</span>
                      </label>
                    )}
                    <Input
                      id="face-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFaceUpload}
                    />
                  </div>
                </div>
              </div>

              {/* Generate Action */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/50 mt-4">
                <button
                  type="submit"
                  disabled={!file || !selectedEthnicity || !selectedConcept}
                  className="w-full h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-fuchsia-500 to-violet-500 hover:from-fuchsia-600 hover:to-violet-600 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg disabled:shadow-none"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate 4 Professional Photos
                </button>
              </div>
            </form>
          ) : (
            /* PREVIEW / GENERATING / RESULTS SECTION */
            <div className="flex-1 flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
              
              {/* Generating State */}
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center flex-1 py-12">
                  <div className="relative w-20 h-20 mb-8">
                    <Loader2 className="w-full h-full animate-spin text-fuchsia-500" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-violet-500/20 rounded-full animate-spin-slow" />
                  </div>
                  
                  <div className="space-y-2 text-center max-w-sm mb-8">
                    <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      {progressMessages[currentTextIndex]}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      High quality AI image generation takes about ~3-4 minutes. Do not close this page.
                    </p>
                  </div>
                  
                  <div className="w-full max-w-sm h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-fuchsia-500 to-violet-500 transition-all duration-300 ease-linear rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                /* Results State */
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                       <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                       <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Generation Complete</h3>
                    </div>
                    <Button 
                      onClick={handleDownloadZip}
                      size="sm"
                      className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg px-3 h-8 text-xs font-semibold"
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      Save Collection (.zip)
                    </Button>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-1">
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {results.map((img, i) => (
                           <div key={img.id || i} className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                             <Image
                               src={img.image_url}
                               alt={`Pose ${i + 1}`}
                               fill
                               className="object-cover group-hover:scale-110 transition-transform duration-500"
                             />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 gap-1">
                               <p className="text-[10px] font-medium text-white tracking-widest uppercase">Variant {i + 1}</p>
                               <button
                                 type="button"
                                 onClick={async () => {
                                   if (!generationId) return
                                   try {
                                     const res = await fetch('/api/refund', {
                                       method: 'POST',
                                       headers: { 'Content-Type': 'application/json' },
                                       body: JSON.stringify({ generationId, reason: 'Defective image reported by user' })
                                     })
                                     const data = await res.json()
                                     if (res.ok) {
                                       toast.success(data.message || 'Kredi iade edildi')
                                     } else {
                                       toast.error(data.error || 'İade başarısız')
                                     }
                                   } catch { toast.error('İade isteği gönderilemedi') }
                                 }}
                                 className="flex items-center gap-1 text-[9px] text-red-300 hover:text-red-200 transition-colors"
                               >
                                 <Flag className="w-3 h-3" />
                                 Report Defective
                               </button>
                             </div>
                           </div>
                        ))}
                     </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
