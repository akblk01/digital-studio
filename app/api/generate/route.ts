import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { productToModel } from '@/lib/fashn'
import { APPEARANCE_CONFIG, CONCEPT_CONFIG, FABRIC_CONFIG, POSE_CONFIG } from '@/types'
import type { ModelAppearance, Concept, Gender, FabricType } from '@/types'

export const maxDuration = 300 // 5 dakika timeout

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { 
      imageUrl, 
      appearance,
      concept, 
      gender,
      fabricType, 
      textureDetails,
      accessories,
      poseKey,
      faceReferenceUrl,
      backImageUrl
    } = await req.json() as {
      imageUrl: string
      appearance?: ModelAppearance
      concept?: Concept
      gender?: Gender
      fabricType?: FabricType
      textureDetails?: string
      accessories?: string
      poseKey?: string
      faceReferenceUrl?: string
      backImageUrl?: string
    }

    if (!imageUrl) {
      return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 })
    }

    // Kayıtlı manken modunda appearance/concept gönderilmeyebilir — varsayılan ata
    const safeAppearance: ModelAppearance = appearance || 'brunette'
    const safeConcept: Concept = concept || 'minimal_white'
    const safeGender: Gender = gender || 'female'


    // 1. Kullanıcı limitini kontrol et
    // 4K üretimi 1 görsel = 2 kredi (4 görsel = 8 kredi)
    const requiredCredits = 8
    
    const { data: user, error: userError } = await supabase.auth.getUser()
    if (userError || !user?.user) throw new Error("Kullanıcı bulunamadı")
    const userId = user.user.id

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single()

    if (profileError || !profile) throw new Error("Profil bulunamadı")

    if (profile.credits < requiredCredits) {
      return NextResponse.json({ error: 'Yetersiz kredi' }, { status: 402 })
    }

    // 2. Krediyi düş
    const { error: deductError } = await supabase
      .from('profiles')
      .update({ credits: profile.credits - requiredCredits })
      .eq('id', userId)

    if (deductError) throw new Error("Kredi düşülemedi")
    
    // İşlem kaydı
    const { data: genRecord, error: genError } = await supabase
      .from('generations')
      .insert({
        user_id: userId,
        original_image_url: imageUrl,
        ethnicity: safeAppearance, // appearance değerini legacy kolona yaz
        concept: safeConcept,
        gender: safeGender,
        status: 'processing',
        credits_used: requiredCredits,
      })
      .select('id')
      .single()

    if (genError) throw genError

    // 3. Fenotip × Cinsiyet prompt matrisi ile prompt oluştur
    const appearanceConfig = APPEARANCE_CONFIG[safeAppearance]
    const modelPrompt = faceReferenceUrl
      ? 'A professional fashion model'
      : (safeGender === 'female' ? appearanceConfig.femalePrompt : appearanceConfig.malePrompt)
    
    const conceptPrompt = CONCEPT_CONFIG[safeConcept].bgPrompt
    const fabricConfig = fabricType ? FABRIC_CONFIG[fabricType] : null
    const drapePrompt = fabricConfig?.drapePrompt || ''
    const negativePrompt = fabricConfig?.negativePrompt || ''
    const texturePromptSegment = textureDetails ? `. PRESERVE THIS EXACT TEXTURE: ${textureDetails}` : ''
    const accessoriesPromptSegment = accessories ? `, wearing ${accessories}` : ''
    
    const prompt = `${modelPrompt}${accessoriesPromptSegment}, ${conceptPrompt}${drapePrompt ? `. ${drapePrompt}` : ''}${texturePromptSegment}${!faceReferenceUrl && negativePrompt ? `. ${negativePrompt}` : ''}`


    let imageUrls: string[] = []

    try {
      const poseUrl = poseKey && poseKey !== 'auto' ? POSE_CONFIG[poseKey]?.poseUrl : undefined

      if (backImageUrl) {
        // ── Çift açı modu: 3 ön + 1 arka = 4 toplam ────────────────────
        // Paralel çağrı: her iki FASHN isteği aynı anda başlıyor.
        const frontPromise = productToModel({
          productImageUrl: imageUrl,
          prompt,
          faceReferenceUrl,
          numImages: 3,
          aspectRatio: '3:4',
          resolution: '4k',
        })

        const backPrompt = `${prompt}, back view of the model showing the back of the garment`
        const backPromise = productToModel({
          productImageUrl: backImageUrl,
          prompt: backPrompt,
          faceReferenceUrl,
          numImages: 1,
          aspectRatio: '3:4',
          resolution: '4k',
        })

        const [frontUrls, backUrls] = await Promise.all([frontPromise, backPromise])
        // FASHN bazen istenen sayıdan fazla döndürebilir → kesin sınırla
        imageUrls = [...frontUrls.slice(0, 3), ...backUrls.slice(0, 1)]
      } else {
        // ── Tek açı modu: 4 ön ───────────────────────────────────────────
        const fashnOptions: any = {
          productImageUrl: imageUrl,
          prompt,
          faceReferenceUrl,
          numImages: 4,
          aspectRatio: '3:4',
          resolution: '4k',
        }
        if (poseUrl) fashnOptions.poseImageUrl = poseUrl
        const rawUrls = await productToModel(fashnOptions)
        imageUrls = rawUrls.slice(0, 4)
      }

    } catch (apiError: any) {
      console.error('FASHN.ai API error:', apiError)
      await supabaseAdmin.from('generations').update({ status: 'failed' }).eq('id', genRecord.id)
      return NextResponse.json({ 
        error: `Görsel üretimi başarısız: ${apiError.message || 'FASHN.ai servisi yanıt vermedi.'}` 
      }, { status: 500 })
    }


    // 4. Sonuçları kaydet
    if (imageUrls.length === 0) {
      await supabaseAdmin.from('generations').update({ status: 'failed' }).eq('id', genRecord.id)
      return NextResponse.json({ error: 'Görsel üretimi başarısız oldu.' }, { status: 500 })
    }

    const generatedImages = imageUrls.map((url, index) => ({
      image_url: url,
      variation_index: index,
      pose_description: `FASHN product-to-model variation ${index + 1}`,
      generation_id: genRecord.id,
    }))

    await supabaseAdmin.from('generated_images').insert(generatedImages)

    // 5. Status güncelle
    await supabaseAdmin
      .from('generations')
      .update({ status: 'completed' })
      .eq('id', genRecord.id)

    return NextResponse.json({
      generationId: genRecord.id,
      images: generatedImages,
      totalGenerated: generatedImages.length
    })

  } catch (error: any) {
    console.error('Generation API error:', error)
    return NextResponse.json({ error: error.message || 'Üretim hatası' }, { status: 500 })
  }
}
