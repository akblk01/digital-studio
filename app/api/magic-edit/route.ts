import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const maxDuration = 300

const FASHN_API_BASE = 'https://api.fashn.ai/v1'

function getFashnKey(): string {
  const key = process.env.FASHN_API_KEY
  if (!key) throw new Error('FASHN_API_KEY tanımlı değil')
  return key
}

/**
 * FASHN /edit endpoint — görseli bozturmadan prompt tabanlı düzeltme.
 * Kimono kolu kısa kaldıysa, dar kaldıysa vb. freeform metin ile düzeltme.
 */
async function fashnEdit(imageUrl: string, prompt: string): Promise<string[]> {
  // 1. Prediction başlat
  const runRes = await fetch(`${FASHN_API_BASE}/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getFashnKey()}`,
    },
    body: JSON.stringify({
      model_name: 'edit',
      inputs: {
        image: imageUrl,
        prompt: prompt,
      },
    }),
  })

  if (!runRes.ok) {
    const err = await runRes.json().catch(() => ({ detail: runRes.statusText }))
    throw new Error(`FASHN Edit API Error (${runRes.status}): ${err.detail || JSON.stringify(err)}`)
  }

  const { id: predictionId } = await runRes.json()

  // 2. Sonucu poll et
  const startTime = Date.now()
  const maxWaitMs = 240_000 // 4 dakika
  const pollInterval = 3000

  while (Date.now() - startTime < maxWaitMs) {
    await new Promise(r => setTimeout(r, pollInterval))
    
    const statusRes = await fetch(`${FASHN_API_BASE}/status/${predictionId}`, {
      headers: { 'Authorization': `Bearer ${getFashnKey()}` },
    })

    if (!statusRes.ok) {
      throw new Error(`FASHN Poll Error (${statusRes.status})`)
    }

    const statusData = await statusRes.json()

    if (statusData.status === 'completed') {
      return statusData.output as string[]
    }

    if (statusData.status === 'failed') {
      throw new Error(`FASHN edit failed: ${statusData.error || 'Unknown error'}`)
    }
    // processing → devam et
  }

  throw new Error('FASHN Edit timeout (4 dakika)')
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })

    const { imageUrl, prompt, generationId } = await req.json()
    if (!imageUrl || !prompt) {
      return NextResponse.json({ error: 'Görsel ve prompt (metin) zorunludur' }, { status: 400 })
    }

    // 1. Kredi Kontrolü — Magic Edit = 4 kredi
    const requiredCredits = 4
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (!profile || profile.credits < requiredCredits) {
      return NextResponse.json({ error: 'Yetersiz kredi' }, { status: 402 })
    }

    // 2. Kredi Düş (atomik)
    const { data: hasCredits } = await supabaseAdmin.rpc('deduct_credits', {
      p_user_id: user.id,
      p_amount: requiredCredits,
    })

    if (!hasCredits) {
      return NextResponse.json({ error: 'Yetersiz kredi' }, { status: 402 })
    }

    // 3. FASHN /edit çağrısı — orijinal görseli BOZMADAN sadece prompt'u uygular
    let outputUrls: string[]
    try {
      outputUrls = await fashnEdit(imageUrl, prompt)
    } catch (apiError: any) {
      // Hata durumunda krediyi iade et
      const { data: currentProfile } = await supabaseAdmin
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single()

      if (currentProfile) {
        await supabaseAdmin
          .from('profiles')
          .update({ credits: currentProfile.credits + requiredCredits })
          .eq('id', user.id)
        await supabaseAdmin
          .from('credit_transactions')
          .insert({
            user_id: user.id,
            amount: requiredCredits,
            type: 'refund',
            description: 'Magic Edit başarısız — otomatik iade',
          })
      }
      throw apiError
    }

    if (!outputUrls || outputUrls.length === 0) {
      throw new Error('FASHN edit sonuç döndürmedi')
    }

    const outputUrl = outputUrls[0]

    // 4. Sonucu DB'ye ekle
    if (generationId) {
      await supabaseAdmin.from('generated_images').insert({
        generation_id: generationId,
        image_url: outputUrl,
        variation_index: 99,
        pose_description: `Magic Edit: ${prompt}`,
      })
    }

    return NextResponse.json({ imageUrl: outputUrl })

  } catch (error: any) {
    console.error('Magic Edit API error:', error)
    return NextResponse.json(
      { error: error.message || 'Üretim hatası' },
      { status: 500 }
    )
  }
}
