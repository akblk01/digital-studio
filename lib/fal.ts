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
  const result = await fal.subscribe('fal-ai/fashn/tryon/v1.5', {
    input: {
      model_image: modelImageUrl,
      garment_image: garmentImageUrl,
      category: 'auto',
    },
    logs: true,
  })
  return (result.data as any).images[0].url
}

// Flux Pro — Arka plan ve atmosfer ile baz model üretimi (Kıyafetsiz/Basit kıyafetli manken)
export async function generateBaseModel(
  ethnicityPrompt: string,
  conceptPrompt: string,
  poseDescription: string
): Promise<string> {
  // CRITICAL: Base model must wear a seamless, tight neutral garment to prevent VTON from hallucinating pockets/buttons from the base image onto the final garment.
  // CRITICAL: Photography keywords added to prevent "plastic AI" look.
  const prompt = `RAW candid style fashion photography, shot on Fujifilm XT4, 35mm lens, natural lighting, subtle skin texture, minor facial imperfections, unretouched, hyper-realistic fashion editorial. ${ethnicityPrompt}, wearing a tight-fitting seamless neutral grey tank top and simple tailored trousers. NO buttons, NO pockets, NO zippers, NO waistbands, completely smooth and seamless upper body clothing. ${poseDescription}. ${conceptPrompt}. Ultra high quality, 8k, sharp details, realistic lighting and shadows.`

  const result = await fal.subscribe('fal-ai/flux-pro', {
    input: {
      prompt,
      num_inference_steps: 28,
      guidance_scale: 2.5, // Lower guidance scale reduces the "plastic/CGI" AI aesthetic
      image_size: 'portrait_4_3',
      safety_tolerance: '2',
    },
    logs: true,
  })
  return (result.data as any).images[0].url
}
