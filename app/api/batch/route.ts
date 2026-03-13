import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { productToModel } from '@/lib/fashn'
import { ETHNICITY_CONFIG, CONCEPT_CONFIG } from '@/types'
import type { Ethnicity, Concept } from '@/types'

export const maxDuration = 300

/**
 * Batch Processing API
 * 
 * Birden fazla ürün fotoğrafını tek seferde işler.
 * Her ürün için FASHN product-to-model çağrısı yapar.
 * Sonuçları Supabase'de batch olarak kaydeder.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { items, ethnicity, concept, faceReferenceUrl } = await req.json() as {
      items: { imageUrl: string; productName?: string }[]
      ethnicity: Ethnicity
      concept: Concept
      faceReferenceUrl?: string
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'En az 1 ürün gerekli' }, { status: 400 })
    }

    if (items.length > 50) {
      return NextResponse.json({ error: 'Tek seferde maksimum 50 ürün işlenebilir' }, { status: 400 })
    }

    // Kredi hesaplama: her ürün için 4 görsel × kredi
    const creditsPerItem = faceReferenceUrl ? 16 : 4
    const totalCredits = items.length * creditsPerItem

    // Kredi kontrolü
    const { data: hasCredits, error: creditError } = await supabaseAdmin.rpc('deduct_credits', {
      p_user_id: user.id,
      p_amount: totalCredits
    })

    if (creditError || !hasCredits) {
      return NextResponse.json({ 
        error: `Yetersiz kredi. Bu işlem ${totalCredits} kredi gerektirir.`,
        required: totalCredits
      }, { status: 402 })
    }

    const ethnicityPrompt = ETHNICITY_CONFIG[ethnicity].modelPrompt
    const conceptPrompt = CONCEPT_CONFIG[concept].bgPrompt
    const prompt = `${ethnicityPrompt}, ${conceptPrompt}`

    // Sıralı işleme (rate limit'e takılmamak için)
    const batchResults: {
      productName: string
      generationId: string
      images: string[]
      status: 'completed' | 'failed'
      error?: string
    }[] = []

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const productName = item.productName || `Ürün ${i + 1}`

      try {
        // Generation kaydı
        const { data: generation, error: genError } = await supabaseAdmin
          .from('generations')
          .insert({
            user_id: user.id,
            original_image_url: item.imageUrl,
            ethnicity,
            concept,
            status: 'processing',
            credits_used: creditsPerItem
          })
          .select()
          .single()

        if (genError) throw genError

        // FASHN.ai product-to-model
        const imageUrls = await productToModel({
          productImageUrl: item.imageUrl,
          prompt,
          faceReferenceUrl,
          numImages: 4,
          aspectRatio: '3:4',
          resolution: '1k',
        })

        // Sonuçları kaydet
        if (imageUrls.length > 0) {
          await supabaseAdmin.from('generated_images').insert(
            imageUrls.map((url, idx) => ({
              image_url: url,
              variation_index: idx,
              pose_description: `Batch ${productName} - variation ${idx + 1}`,
              generation_id: generation.id,
            }))
          )
          await supabaseAdmin.from('generations').update({ status: 'completed' }).eq('id', generation.id)
          
          batchResults.push({
            productName,
            generationId: generation.id,
            images: imageUrls,
            status: 'completed'
          })
        } else {
          await supabaseAdmin.from('generations').update({ status: 'failed' }).eq('id', generation.id)
          batchResults.push({
            productName,
            generationId: generation.id,
            images: [],
            status: 'failed',
            error: 'Görsel üretilemedi'
          })
        }
      } catch (itemError: any) {
        console.error(`Batch item ${i} error:`, itemError)
        batchResults.push({
          productName,
          generationId: '',
          images: [],
          status: 'failed',
          error: itemError.message
        })
      }
    }

    const completed = batchResults.filter(r => r.status === 'completed').length
    const failed = batchResults.filter(r => r.status === 'failed').length

    return NextResponse.json({
      totalItems: items.length,
      completed,
      failed,
      results: batchResults
    })

  } catch (error: any) {
    console.error('Batch Processing API error:', error)
    return NextResponse.json({ error: error.message || 'Toplu işlem hatası' }, { status: 500 })
  }
}
