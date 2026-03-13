import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { productToModel } from '@/lib/fashn'
import { ETHNICITY_CONFIG, CONCEPT_CONFIG } from '@/types'
import type { Ethnicity, Concept } from '@/types'

export const maxDuration = 300 // 5 dakika timeout

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json() as {
      imageUrl: string
      ethnicity: Ethnicity
      concept: Concept
      faceReferenceUrl?: string
    }

    const { imageUrl, ethnicity, concept, faceReferenceUrl } = body

    // 1. Kredi kontrolü ve düşme (atomik)
    // face_reference kullanılıyorsa ek maliyet: +3 kredi/görsel × 4 = +12
    const creditCost = faceReferenceUrl ? 16 : 4
    const { data: hasCredits, error: creditError } = await supabaseAdmin.rpc('deduct_credits', {
      p_user_id: user.id,
      p_amount: creditCost
    })
    
    if (creditError || !hasCredits) {
      return NextResponse.json({ error: 'Yetersiz kredi. Lütfen kredi satın alın.' }, { status: 402 })
    }

    // 2. Generation kaydı oluştur
    const { data: generation, error: genError } = await supabaseAdmin
      .from('generations')
      .insert({
        user_id: user.id,
        original_image_url: imageUrl,
        ethnicity,
        concept,
        status: 'processing',
        credits_used: creditCost
      })
      .select()
      .single()

    if (genError) throw genError

    // 3. FASHN.ai product-to-model — TEK API ÇAĞRISI ile 4 görsel üret
    // Eski 2 aşamalı pipeline (Flux Pro + VTON) tamamen kaldırıldı.
    const ethnicityPrompt = ETHNICITY_CONFIG[ethnicity].modelPrompt
    const conceptPrompt = CONCEPT_CONFIG[concept].bgPrompt
    const prompt = `${ethnicityPrompt}, ${conceptPrompt}`

    let imageUrls: string[] = []

    try {
      imageUrls = await productToModel({
        productImageUrl: imageUrl,
        prompt,
        faceReferenceUrl,
        numImages: 4,
        aspectRatio: '3:4',
        resolution: '1k',
      })
    } catch (apiError: any) {
      console.error('FASHN.ai API error:', apiError)
      await supabaseAdmin.from('generations').update({ status: 'failed' }).eq('id', generation.id)
      return NextResponse.json({ 
        error: `Görsel üretimi başarısız: ${apiError.message || 'FASHN.ai servisi yanıt vermedi.'}` 
      }, { status: 500 })
    }

    // 4. Sonuçları kaydet
    if (imageUrls.length === 0) {
      await supabaseAdmin.from('generations').update({ status: 'failed' }).eq('id', generation.id)
      return NextResponse.json({ error: 'Görsel üretimi başarısız oldu.' }, { status: 500 })
    }

    const generatedImages = imageUrls.map((url, index) => ({
      image_url: url,
      variation_index: index,
      pose_description: `FASHN product-to-model variation ${index + 1}`,
      generation_id: generation.id,
    }))

    await supabaseAdmin.from('generated_images').insert(generatedImages)

    // 5. Status güncelle
    await supabaseAdmin
      .from('generations')
      .update({ status: 'completed' })
      .eq('id', generation.id)

    return NextResponse.json({
      generationId: generation.id,
      images: generatedImages,
      totalGenerated: generatedImages.length
    })

  } catch (error: any) {
    console.error('Generation API error:', error)
    return NextResponse.json({ error: error.message || 'Üretim hatası' }, { status: 500 })
  }
}
