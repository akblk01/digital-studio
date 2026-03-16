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
  User,
  PersonStanding,
  Bookmark
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { ETHNICITY_CONFIG, CONCEPT_CONFIG, FABRIC_CONFIG, GENDER_CONFIG, POSE_CONFIG } from "@/types"
import type { Ethnicity, Concept, GeneratedImage, FabricType, Gender } from "@/types"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useTranslation } from "@/lib/i18n/context"

export default function StudioPage() {
  const [file, setFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [backFile, setBackFile] = useState<File | null>(null)
  const [backImageUrl, setBackImageUrl] = useState<string | null>(null)
  
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null)
  const [selectedEthnicity, setSelectedEthnicity] = useState<Ethnicity | null>(null)
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null)
  const [selectedFabric, setSelectedFabric] = useState<FabricType | null>(null)
  const [extractedTexture, setExtractedTexture] = useState<string>("")
  const [selectedAccessories, setSelectedAccessories] = useState<string>("")
  const [selectedPose, setSelectedPose] = useState<string>("auto")
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDetectingFabric, setIsDetectingFabric] = useState(false)
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

  // Saved Models State
  const [savedModels, setSavedModels] = useState<any[]>([])
  const [useSavedModel, setUseSavedModel] = useState<boolean>(false)
  const [saveModelName, setSaveModelName] = useState('')
  const [savingModel, setSavingModel] = useState(false)

  const supabase = createClient()
  const { t } = useTranslation()

  useEffect(() => {
    async function loadSavedModels() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data, error } = await supabase.from('saved_models').select('*')
        if (!error && data) {
          setSavedModels(data)
        }
      } catch (e) {
        // fail silently if table doesn't exist yet
      }
    }
    loadSavedModels()
  }, [])

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
    "Stüdyo ortamı hazırlanıyor...",
    "Ürün görseli yükleniyor...",
    "Kumaş ve desen analiz ediliyor...",
    "Gelişmiş AI VTON modeli uygulanıyor...",
    "Işık ve gölgeler render ediliyor...",
    "Son sanatsal dokunuşlar ekleniyor..."
  ]

  useEffect(() => {
    if (!isGenerating) return
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % progressMessages.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [isGenerating])

  const detectFabric = async (sourceFile: File) => {
    setIsDetectingFabric(true)
    const toastId = toast.loading("Kumaş türü analiz ediliyor...")
    try {
      const reader = new FileReader()
      reader.readAsDataURL(sourceFile)
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1]
        const res = await fetch('/api/detect-fabric', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64Image: base64Data })
        })
        if (res.ok) {
          const data = await res.json()
          if (data.fabric && FABRIC_CONFIG[data.fabric as FabricType]) {
            setSelectedFabric(data.fabric as FabricType)
            if (data.textureDetails) {
              setExtractedTexture(data.textureDetails)
            }
            toast.success(`Kumaş tespit edildi: ${FABRIC_CONFIG[data.fabric as FabricType].label}`, { id: toastId })
            return
          }
        }
        toast.dismiss(toastId)
      }
    } catch (err) {
      toast.dismiss(toastId)
      console.error(err)
    } finally {
      setIsDetectingFabric(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setImageUrl(URL.createObjectURL(selectedFile))
      setResults([])
      setExtractedTexture('')
      setSelectedAccessories('')
      setShowPreview(false)
      detectFabric(selectedFile)
    }
  }

  const handleBackFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBackFile(e.target.files[0])
      setBackImageUrl(URL.createObjectURL(e.target.files[0]))
    }
  }

  const removeBackFile = () => {
    setBackFile(null)
    setBackImageUrl(null)
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
    if (!file || !selectedGender || !selectedEthnicity || !selectedConcept) return

    setIsGenerating(true)
    setShowPreview(true)
    setProgressStep(1)

    try {
      // ─── P3: Texture Preservation (Sharpening Pre-processing) ───
      // Send original file to our sharpening API to make fine textures pop
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1])
        reader.onerror = error => reject(error)
      })
      reader.readAsDataURL(file)
      const originalBase64 = await base64Promise

      const sharpenRes = await fetch('/api/sharpen-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Image: originalBase64 })
      })

      let fileToUpload = file
      
      if (sharpenRes.ok) {
        const sharpenData = await sharpenRes.json()
        if (sharpenData.success && sharpenData.sharpenedImage) {
          // Convert sharpened base64 back to File object
          const byteCharacters = atob(sharpenData.sharpenedImage)
          const byteNumbers = new Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          const byteArray = new Uint8Array(byteNumbers)
          fileToUpload = new File([byteArray], file.name, { type: 'image/jpeg' })
        }
      }

      // Upload the potentially sharpened file
      const fileExt = fileToUpload.name.split('.').pop()?.toLowerCase() || 'jpg'
      const safeExt = ['heic', 'heif'].includes(fileExt) ? 'jpg' : fileExt
      const fileName = `${Math.random()}.${safeExt}`
      const filePath = `uploads/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, fileToUpload, {
          contentType: fileToUpload.type || 'image/jpeg',
          upsert: true
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error(`Görsel yüklenemedi: ${uploadError.message}`)
      }
      
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

      // Back-angle görsel varsa Supabase'e yükle
      let uploadedBackUrl: string | undefined
      if (backFile) {
        const backExt = backFile.name.split('.').pop()
        const backName = `uploads/back_${Math.random()}.${backExt}`
        const { error: backUploadErr } = await supabase.storage
          .from('product-images')
          .upload(backName, backFile)
        if (!backUploadErr) {
          const { data: { publicUrl: backPublicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(backName)
          uploadedBackUrl = backPublicUrl
        }
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            imageUrl: publicUrl,
            gender: selectedGender,
            ethnicity: selectedEthnicity,
            concept: selectedConcept,
            fabricType: selectedFabric,
            textureDetails: extractedTexture,
            accessories: selectedAccessories,
            poseKey: selectedPose,
            faceReferenceUrl: useSavedModel && faceReferenceUrl ? faceReferenceUrl : uploadedFaceUrl,
            backImageUrl: uploadedBackUrl,
          }),
      })

      setProgressStep(3)

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || "Üretim hatası")
      }

      setResults(responseData.images)
      setGenerationId(responseData.generationId)
      setProgress(100)
      setIsGenerating(false)
      setProgressStep(4)
      
      toast.success("Tebrikler! 4 adet profesyonel katalog görseliniz hazır.", {
        position: 'top-center',
        className: 'bg-zinc-900 border-zinc-800 text-white'
      });
      
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

  const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  const handleSaveModel = async () => {
    if (!saveModelName.trim()) {
      toast.error('Lütfen bir isim girin')
      return
    }
    setSavingModel(true)
    try {
      // getSession kullan (getUser middleware lock çakışmasına neden olur)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) throw new Error('Giriş yapın')
      
      const faceImageUrl = results[0]?.image_url
      if (!faceImageUrl) throw new Error('Görsel bulunamadı')

      // Timeout ile insert (sonsuz beklemeyi önle)
      const insertPromise = supabase.from('saved_models').insert({
        user_id: session.user.id,
        model_name: saveModelName.trim(),
        face_image_url: faceImageUrl,
      })
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('İstek zaman aşımına uğradı. Lütfen tekrar deneyin.')), 10000)
      )

      const { error } = await Promise.race([insertPromise, timeoutPromise]) as any
      if (error) {
        console.error('Save model error:', error)
        throw new Error(error.message || 'Kayıt başarısız')
      }
      
      toast.success(t('studio_model_saved'))
      setSaveModelName('')
    } catch (err: any) {
      console.error('handleSaveModel error:', err)
      toast.error(err.message || 'Kayıt başarısız')
    } finally {
      setSavingModel(false)
    }
  }

  const handleDownloadZip = () => {
    if (!generationId) return
    if (isMobile) {
      // Mobilde ZIP desteklenmez — her görseli ayrı sekmede aç (uzun bas → kaydet)
      results.forEach((img) => {
        window.open(img.image_url, '_blank')
      })
      toast.info('Görseller yeni sekmelerde açıldı. Uzun basarak kaydet.', { position: 'top-center' })
    } else {
      window.location.href = `/api/download?generationId=${generationId}`
    }
  }

  const handleDownloadSingle = (url: string) => {
    const a = document.createElement('a')
    a.href = url
    a.download = `texstudio_${Date.now()}.jpg`
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
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
          AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-violet-500">{t('studio_title').replace('AI ', '')}</span>
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium">
          {t('studio_subtitle')}
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
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">{t('studio_configurator_header')}</h3>
            </div>
          </div>
          {showPreview && !isGenerating && results.length > 0 && (
             <button
               onClick={handleBackToForm}
               className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors font-medium flex items-center gap-1"
             >
               <Settings2 className="w-3.5 h-3.5" />
               {t('studio_new_session')}
             </button>
          )}
        </div>

        <div className="flex-1 flex flex-col p-6">
          {!showPreview ? (
            <form onSubmit={handleGenerate} className="flex flex-col h-full justify-between gap-6">
              
              <div className="space-y-6">
                {/* Upload Images Section — Ön ve Arka */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-zinc-500" />
                    <Label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('studio_label_garment')}</Label>
                    <span className="text-[10px] text-zinc-400 ml-auto">{t('studio_label_required_note')}</span>
                  </div>
                  
                  {/* Yan Yana Grid: Ön + Arka */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* ÖN GÖRSEL */}
                    <div className={`relative border-2 border-dashed rounded-2xl overflow-hidden transition-all duration-300 aspect-[3/4] flex flex-col items-center justify-center
                      ${imageUrl ? 'border-violet-500/50 bg-zinc-900/30' : 'border-zinc-300 dark:border-zinc-700 hover:border-violet-400 bg-zinc-50 dark:bg-zinc-900/30'}`}>
                      {imageUrl ? (
                        <div className="absolute inset-0 group/img">
                          <Image src={imageUrl} alt="Ön" fill className="object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <Label htmlFor="image-upload" className="cursor-pointer bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full text-white font-medium text-xs transition-colors border border-white/20">
                              Değiştir
                            </Label>
                          </div>
                          <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold rounded px-2 py-0.5">ÖN</div>
                        </div>
                      ) : (
                        <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2 p-4 text-center">
                          <UploadCloud className="w-8 h-8 text-zinc-400" />
                          <p className="text-xs font-medium text-zinc-500">Ön görsel yükle</p>
                        </label>
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

                    {/* ARKA GÖRSEL */}
                    <div className={`relative border-2 border-dashed rounded-2xl overflow-hidden transition-all duration-300 aspect-[3/4] flex flex-col items-center justify-center
                      ${backImageUrl ? 'border-emerald-500/50 bg-zinc-900/30' : 'border-red-300 dark:border-red-700 hover:border-violet-400 bg-zinc-50 dark:bg-zinc-900/30'}`}>
                      {backImageUrl ? (
                        <div className="absolute inset-0 group/back">
                          <Image src={backImageUrl} alt="Arka" fill className="object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/back:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <button type="button" onClick={removeBackFile} className="bg-red-500/80 hover:bg-red-500 px-3 py-1.5 rounded-full text-white font-medium text-xs transition-colors">
                              {t('studio_back_remove')}
                            </button>
                          </div>
                          <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold rounded px-2 py-0.5">ARKA</div>
                        </div>
                      ) : (
                        <label htmlFor="back-upload" className="cursor-pointer flex flex-col items-center gap-2 p-4 text-center">
                          <UploadCloud className="w-8 h-8 text-red-400" />
                          <p className="text-xs font-medium text-red-400">Arka görsel yükle</p>
                          <p className="text-[9px] text-zinc-400">(zorunlu)</p>
                        </label>
                      )}
                      <Input id="back-upload" type="file" accept="image/*" className="hidden" onChange={handleBackFileUpload} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Select Gender */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-zinc-500" />
                      <Label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('studio_label_gender')}</Label>
                    </div>
                    <Select value={selectedGender || ""} onValueChange={(val) => setSelectedGender(val as Gender)} required>
                      <SelectTrigger className="w-full h-12 bg-zinc-50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-violet-500">
                        <SelectValue placeholder={t('studio_label_gender') + '...'} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800 z-50">
                        {Object.entries(GENDER_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key} className="cursor-pointer">
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Select Ethnicity */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-zinc-500" />
                      <Label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('studio_label_ethnicity')}</Label>
                    </div>
                    <Select value={selectedEthnicity || ""} onValueChange={(val) => setSelectedEthnicity(val as Ethnicity)} required>
                      <SelectTrigger className="w-full h-12 bg-zinc-50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-violet-500">
                        <SelectValue placeholder={t('studio_label_ethnicity') + '...'} />
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
                      <Label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('studio_label_concept')}</Label>
                    </div>
                    <Select value={selectedConcept || ""} onValueChange={(val) => setSelectedConcept(val as Concept)} required>
                      <SelectTrigger className="w-full h-12 bg-zinc-50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-violet-500">
                        <SelectValue placeholder={t('studio_label_concept') + '...'} />
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
                    <Label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('studio_label_fabric')} <span className="text-xs font-normal text-zinc-400">(Opsiyonel)</span></Label>
                  </div>
                  <Select value={selectedFabric || ""} onValueChange={(val) => setSelectedFabric(val as FabricType)} disabled={isDetectingFabric}>
                    <SelectTrigger className="w-full h-12 bg-zinc-50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-violet-500">
                      <SelectValue placeholder={isDetectingFabric ? 'Otomatik tespit ediliyor...' : 'Otomatik tespit...'} />
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

                {/* Pose Reference */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <PersonStanding className="w-4 h-4 text-zinc-500" />
                    <Label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('studio_label_pose')} <span className="text-xs font-normal text-zinc-400">(Opsiyonel)</span></Label>
                  </div>
                  <Select value={selectedPose} onValueChange={(val) => setSelectedPose(val)}>
                    <SelectTrigger className="w-full h-12 bg-zinc-50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-violet-500">
                      <SelectValue placeholder={t('studio_label_pose') + '...'} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800 z-50">
                      {Object.entries(POSE_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key} className="cursor-pointer">
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Accessories (Text) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-zinc-500" />
                    <Label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('studio_label_accessories')} <span className="text-xs font-normal text-zinc-400">(Opsiyonel)</span></Label>
                  </div>
                  <Input 
                    placeholder="örn. siyah güneş gözlüğü, gümüş küpeler, deri çanta..." 
                    value={selectedAccessories} 
                    onChange={(e) => setSelectedAccessories(e.target.value)} 
                    className="h-12 bg-zinc-50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-violet-500"
                  />
                </div>

                {/* Face Reference (Opsiyonel) */}
                <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-zinc-500" />
                    <Label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('studio_label_face')} <span className="text-xs font-normal text-zinc-400">(Opsiyonel)</span></Label>
                  </div>
                  <p className="text-xs text-zinc-500">{t('studio_face_desc')}</p>
                  
                  {savedModels.length > 0 && (
                    <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg mb-2">
                      <button 
                        type="button"
                        onClick={() => { setUseSavedModel(false); setFaceReferenceUrl(null); }}
                        className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-colors ${!useSavedModel ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                      >
                        Yeni Yükle
                      </button>
                      <button 
                        type="button"
                        onClick={() => { setUseSavedModel(true); setFaceFile(null); setFacePreviewUrl(null); }}
                        className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-colors ${useSavedModel ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                      >
                        Kayıtlı Modeller
                      </button>
                    </div>
                  )}

                  <div className="relative border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-4 hover:border-violet-400 transition-colors cursor-pointer min-h-[90px] flex flex-col justify-center">
                    
                    {useSavedModel ? (
                      <div className="w-full">
                        <Select value={faceReferenceUrl || ""} onValueChange={(val) => setFaceReferenceUrl(val)}>
                          <SelectTrigger className="w-full bg-transparent border-0 ring-0 focus:ring-0 shadow-none">
                            <SelectValue placeholder="Kayıtlı model seçin..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800 z-50 max-h-48">
                            {savedModels.map((m) => (
                              <SelectItem key={m.id} value={m.face_image_url} className="cursor-pointer">
                                <div className="flex items-center gap-3">
                                  <Image src={m.face_image_url} alt={m.model_name} width={24} height={24} className="rounded-full object-cover w-6 h-6 border border-zinc-200 dark:border-zinc-700" />
                                  <span>{m.model_name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <>
                        {facePreviewUrl ? (
                          <div className="flex items-center gap-3">
                            <Image src={facePreviewUrl} alt="Face" width={48} height={48} className="rounded-full object-cover w-12 h-12" />
                            <div>
                              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{faceFile?.name}</p>
                              <button type="button" onClick={() => { setFaceFile(null); setFacePreviewUrl(null); setFaceReferenceUrl(null) }} className="text-xs text-red-500 hover:text-red-400">
                                Kaldır
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label htmlFor="face-upload" className="flex items-center gap-3 cursor-pointer">
                            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                              <UserCircle className="w-5 h-5 text-zinc-400" />
                            </div>
                            <span className="text-sm text-zinc-500">Yüz referansı yüklemek için tıklayın</span>
                          </label>
                        )}
                        <Input
                          id="face-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFaceUpload}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Generate Action */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/50 mt-4">
                <button
                  type="submit"
                  disabled={!file || !backFile || !selectedEthnicity || !selectedConcept}
                  className="w-full h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-fuchsia-500 to-violet-500 hover:from-fuchsia-600 hover:to-violet-600 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg disabled:shadow-none"
                >
                  <Sparkles className="w-4 h-4" />
                  {t('studio_btn_generate')}
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
                      {t('studio_wait_msg')}
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
                       <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{t('studio_complete')}</h3>
                    </div>
                    <Button 
                      onClick={handleDownloadZip}
                      size="sm"
                      className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg px-3 h-8 text-xs font-semibold"
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      {isMobile ? t('studio_open_images') : t('studio_save_zip')}
                    </Button>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {results.map((img, i) => (
                           <div key={img.id || i} className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                             <Image
                               src={img.image_url}
                               alt={`Pose ${i + 1}`}
                               fill
                               className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                             />
                             {/* İndir */}
                             <button
                               onClick={() => handleDownloadSingle(img.image_url)}
                               className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 hover:bg-black/80 text-white rounded-lg p-1.5"
                               title="İndir"
                             >
                               <Download className="w-3 h-3" />
                             </button>
                             {/* Pozisyon etiketi */}
                             <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[9px] font-bold rounded px-1.5 py-0.5">
                               {i === results.length - 1 ? 'ARKA' : `#${i + 1}`}
                             </div>
                           </div>
                        ))}
                     </div>

                     {/* Manken Kaydet — Tek Form */}
                     <div className="border border-violet-500/20 bg-violet-500/5 rounded-2xl p-4 space-y-2">
                       <div className="flex items-center gap-2 mb-1">
                         <Bookmark className="w-4 h-4 text-violet-400" />
                         <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{t('studio_save_model_title')}</p>
                       </div>
                       <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('studio_save_model_desc')}</p>
                       <div className="flex gap-2 mt-2">
                         <input
                           type="text"
                           value={saveModelName}
                           onChange={(e) => setSaveModelName(e.target.value)}
                           placeholder={t('studio_model_name_placeholder')}
                           className="flex-1 h-9 px-3 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                           onKeyDown={(e) => e.key === 'Enter' && handleSaveModel()}
                         />
                         <button
                           onClick={handleSaveModel}
                           disabled={savingModel || !saveModelName.trim()}
                           className="h-9 px-4 text-sm font-semibold bg-gradient-to-r from-fuchsia-500 to-violet-500 hover:opacity-90 text-white rounded-xl transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
                         >
                           {savingModel ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bookmark className="w-3.5 h-3.5" />}
                           {t('studio_save_model_btn')}
                         </button>
                       </div>
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
