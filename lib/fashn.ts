/**
 * FASHN.ai Direct API Client
 * 
 * Tek API çağrısı ile ürün fotoğrafından profesyonel model görseli üretir.
 * Eski 2 aşamalı pipeline'ın (Flux Pro + VTON) yerine geçer.
 * 
 * Endpoints:
 * - product-to-model: Ürün → model üzerinde görsel
 * - model-create: Prompt ile nötr manken üret (fallback/gelişmiş)
 */

const FASHN_API_BASE = 'https://api.fashn.ai/v1'

function getApiKey(): string {
  const key = process.env.FASHN_API_KEY
  if (!key) throw new Error('FASHN_API_KEY ortam değişkeni tanımlı değil. .env.local dosyasını kontrol edin.')
  return key
}

// ─── Düşük seviye HTTP yardımcıları ───

async function fashnPost(endpoint: string, body: Record<string, any>): Promise<string> {
  const res = await fetch(`${FASHN_API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(`FASHN API Error (${res.status}): ${err.detail || JSON.stringify(err)}`)
  }

  const data = await res.json()
  return data.id // prediction ID
}

async function fashnPoll(predictionId: string, maxWaitMs = 300_000): Promise<string[]> {
  const startTime = Date.now()
  const pollInterval = 3000 // 3 saniye

  while (Date.now() - startTime < maxWaitMs) {
    const res = await fetch(`${FASHN_API_BASE}/status/${predictionId}`, {
      headers: { 'Authorization': `Bearer ${getApiKey()}` },
    })

    if (!res.ok) {
      throw new Error(`FASHN Poll Error (${res.status})`)
    }

    const data = await res.json()

    if (data.status === 'completed') {
      return data.output as string[] // Array of image URLs
    }

    if (data.status === 'failed') {
      throw new Error(`FASHN generation failed: ${data.error || 'Unknown error'}`)
    }

    // Hala processing — bekle
    await new Promise(resolve => setTimeout(resolve, pollInterval))
  }

  throw new Error('FASHN generation timeout (5 dakika)')
}

// ─── Ana fonksiyonlar ───

/**
 * Product-to-Model: Ürün fotoğrafından doğrudan model üzerinde görsel üretir.
 * 
 * Bu fonksiyon eski 2 aşamalı pipeline'ın (Flux Pro + VTON) yerini alır.
 * Tek bir API çağrısı ile:
 * - Ürünü tanır
 * - Gerçekçi bir manken oluşturur
 * - Ürünü mankenin üzerine giydirir
 * - Arka plan ve ışıklandırma ekler
 */
export async function productToModel(options: {
  productImageUrl: string
  backImageUrl?: string       // Arka açı / sırt görseli (opsiyonel)
  prompt?: string
  faceReferenceUrl?: string
  backgroundReferenceUrl?: string
  numImages?: number
  aspectRatio?: string
  resolution?: '1k' | '4k'
}): Promise<string[]> {
  const inputs: Record<string, any> = {
    product_image: options.productImageUrl,
    num_images: options.numImages || 4,
    aspect_ratio: options.aspectRatio || '3:4',
    resolution: options.resolution || '1k',
    output_format: 'jpeg',
    return_base64: false,
  }

  // Prompt enjeksiyonu — anatomi hata engelleyici + kullanıcı prompt'u
  // NOT: FASHN product-to-model negative_prompt parametresi DESTEKLEMIYOR.
  // Negatif ifadeler pozitif prompt içine eklendi.
  const safetyPrompt = 'realistic skin texture, natural lighting, fashion editorial, both arms fully visible, complete arms with hands, full body anatomy'
  
  if (options.prompt) {
    inputs.prompt = `${options.prompt}. ${safetyPrompt}`
  } else {
    inputs.prompt = safetyPrompt
  }

  // NOT: FASHN product-to-model, image_context parametresini DESTEKLEMIYOR.
  // Arka açı görseli şu an sadece prompt ile telafi edilebilir.
  // Bu parametre ileride FASHN'ın farklı bir endpoint'i desteklerse kullanılacak.

  // Face reference (tutarlı model yüzü)
  if (options.faceReferenceUrl) {
    inputs.face_reference = options.faceReferenceUrl
    inputs.face_reference_mode = 'match_base'
  }

  // Background reference
  if (options.backgroundReferenceUrl) {
    inputs.background_reference = options.backgroundReferenceUrl
  }

  const predictionId = await fashnPost('/run', {
    model_name: 'product-to-model',
    inputs,
  })

  return fashnPoll(predictionId)
}


/**
 * Model Create: Prompt ile sıfırdan gerçekçi manken görseli oluşturur.
 * Ghost Mannequin veya özel kullanım senaryoları için.
 */
export async function createModel(options: {
  prompt: string
  faceReferenceUrl?: string
  aspectRatio?: string
  resolution?: '1k' | '4k'
}): Promise<string[]> {
  const inputs: Record<string, any> = {
    prompt: options.prompt,
    aspect_ratio: options.aspectRatio || '3:4',
    resolution: options.resolution || '1k',
    output_format: 'jpeg',
    return_base64: false,
  }

  if (options.faceReferenceUrl) {
    inputs.face_reference = options.faceReferenceUrl
    inputs.face_reference_mode = 'match_base'
  }

  const predictionId = await fashnPost('/run', {
    model_name: 'model-create',
    inputs,
  })

  return fashnPoll(predictionId)
}

/**
 * Background Remove: Arka plan silme (Ghost Mannequin için gerekli).
 */
export async function removeBackground(imageUrl: string): Promise<string[]> {
  const predictionId = await fashnPost('/run', {
    model_name: 'background-remove',
    inputs: {
      image: imageUrl,
      output_format: 'png',
      return_base64: false,
    },
  })

  return fashnPoll(predictionId)
}
