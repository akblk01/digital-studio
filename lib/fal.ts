import { fal } from '@fal-ai/client'

// client side veya server side kullanılabilir, credential'ı sadece server ortamında kullanmak için fal otomatik ortam değişkenini okur 
// Yine de açıkça belirtmek iyi bir pratiktir, server side için tasarlandığından bunu ayarlıyoruz.
if (process.env.FAL_KEY) {
  fal.config({ credentials: process.env.FAL_KEY })
}

// VTON — Kıyafeti mankene giydirme
export async function virtualTryOn(
  garmentImageUrl: string,
  modelImageUrl: string
): Promise<string> {
  const result = await fal.subscribe('fal-ai/fashn-vton', {
    input: {
      model_image: modelImageUrl,
      garment_image: garmentImageUrl,
      category: 'auto',
    },
    logs: true,
  })
  return (result.data as any).image.url
}

// Flux Pro — Arka plan ve atmosfer ile tam görsel üretimi
export async function generateCatalogImage(
  garmentImageUrl: string,
  ethnicityPrompt: string,
  conceptPrompt: string,
  poseDescription: string
): Promise<string> {
  const prompt = `Professional fashion catalog photo. ${ethnicityPrompt}, wearing the exact garment shown in the reference image. ${poseDescription}. ${conceptPrompt}. Ultra high quality, 8k, sharp details, the garment pattern and texture must be perfectly preserved.`

  const result = await fal.subscribe('fal-ai/flux-pro', {
    input: {
      prompt,
      image_url: garmentImageUrl,
      num_inference_steps: 28,
      guidance_scale: 3.5,
      image_size: 'portrait_4_3',
      safety_tolerance: '2',
    },
    logs: true,
  })
  return (result.data as any).images[0].url
}
