import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { generateCatalogImage } from '@/lib/fal'
import { ETHNICITY_CONFIG, CONCEPT_CONFIG, POSE_VARIATIONS } from '@/types'
import type { Ethnicity, Concept } from '@/types'

export const maxDuration = 300 // 5 dakika timeout (Vercel pro için geçerli, dev ortamında local limite tabi)

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { imageUrl, ethnicity, concept } = await req.json() as {
      imageUrl: string
      ethnicity: Ethnicity
      concept: Concept
    }

    // 1. Kredi kontrolü ve düşme (atomik)
    const { data: hasCredits, error: creditError } = await supabaseAdmin.rpc('deduct_credits', {
      p_user_id: user.id,
      p_amount: 20
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
        credits_used: 20
      })
      .select()
      .single()

    if (genError) throw genError

    // 3. 20 varyasyon üret (paralel gruplar halinde)
    const ethnicityPrompt = ETHNICITY_CONFIG[ethnicity].modelPrompt
    const conceptPrompt = CONCEPT_CONFIG[concept].bgPrompt
    const batchSize = 4 // Her defasında 4 tanesi paralel çalışacak şekilde

    const generatedImages: { image_url: string; variation_index: number; pose_description: string }[] = []

    for (let i = 0; i < POSE_VARIATIONS.length; i += batchSize) {
      const batch = POSE_VARIATIONS.slice(i, i + batchSize)
      const results = await Promise.allSettled(
        batch.map(async (pose, batchIndex) => {
          const index = i + batchIndex
          const resultUrl = await generateCatalogImage(imageUrl, ethnicityPrompt, conceptPrompt, pose)
          return { image_url: resultUrl, variation_index: index, pose_description: pose }
        })
      )
      
      results.forEach(r => {
        if (r.status === 'fulfilled') {
          generatedImages.push(r.value)
        } else {
          console.error("Fal.ai generation error for a variation:", r.reason)
        }
      })
    }

    // 4. Sonuçları kaydet
    if (generatedImages.length > 0) {
      await supabaseAdmin.from('generated_images').insert(
        generatedImages.map(img => ({ ...img, generation_id: generation.id }))
      )
    }

    // 5. Status güncelle
    await supabaseAdmin
      .from('generations')
      .update({ status: generatedImages.length > 0 ? 'completed' : 'failed' })
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
