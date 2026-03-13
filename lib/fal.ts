import { fal } from '@fal-ai/client'

// Server-side credential setup
if (process.env.FAL_KEY) {
  fal.config({ credentials: process.env.FAL_KEY })
}

// ─── NEGATIVE PROMPT ───
// Otomatik olarak her üretim çağrısına eklenir.
// Anatomik hataları, plastik cilt dokusunu ve AI artifact'larını engeller.
const NEGATIVE_PROMPT = [
  'deformed fingers', 'extra limbs', 'bad anatomy', 'fused fingers', 'missing limbs',
  'plastic skin', 'poreless skin', 'waxy skin', 'dead eyes', 'asymmetric face',
  'blurry', 'low quality', 'watermark', 'text overlay', 'cropped head',
  'extra buttons', 'extra pockets', 'deformed clothing details',
  'CGI render', 'illustration', '3d render', 'cartoon', 'painting'
].join(', ')

// ─── VTON v1.6 — Kıyafeti mankene giydirme (864x1296 çözünürlük) ───
export async function virtualTryOn(
  garmentImageUrl: string,
  modelImageUrl: string
): Promise<string> {
  const result = await fal.subscribe('fal-ai/fashn/tryon/v1.6', {
    input: {
      model_image: modelImageUrl,
      garment_image: garmentImageUrl,
      category: 'auto',
    },
    logs: true,
  })
  return (result.data as any).images[0].url
}

// ─── Flux Pro — Nötr baz model üretimi ───
// Base model, VTON'a girdi olacak bir "tuval" manken üretir.
// Kıyafet tamamen sade ve dikişsiz olmalıdır, böylece VTON
// yalnızca kullanıcının yüklediği gerçek ürünü yerleştirir.
export async function generateBaseModel(
  ethnicityPrompt: string,
  conceptPrompt: string,
  poseDescription: string
): Promise<string> {
  const prompt = `RAW candid fashion photography, Fujifilm XT4, 35mm lens, natural available light, visible skin pores, subtle freckles, real human. ${ethnicityPrompt}, wearing a tight-fitting seamless plain neutral grey tank top and simple dark trousers. Absolutely NO buttons, NO pockets, NO zippers, NO seams, NO waistbands visible on upper body — completely smooth featureless fabric. ${poseDescription}. ${conceptPrompt}. Hyper-realistic, editorial quality, subtle depth of field.`

  const result = await fal.subscribe('fal-ai/flux-pro', {
    input: {
      prompt,
      num_inference_steps: 28,
      guidance_scale: 2.0,
      image_size: 'portrait_4_3',
      safety_tolerance: '2',
    },
    logs: true,
  })
  return (result.data as any).images[0].url
}
