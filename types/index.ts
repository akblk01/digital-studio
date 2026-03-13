export type Ethnicity = 'slavic' | 'middle_eastern' | 'european' | 'turkish'
export type Concept = 'minimal_studio' | 'street_fashion' | 'luxury_showroom'
export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type FabricType = 'cotton' | 'denim' | 'silk' | 'knit' | 'leather' | 'linen' | 'polyester'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  credits: number
  subscription_status: 'active' | 'inactive' | 'canceled'
  subscription_plan: 'none' | 'monthly'
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  current_period_end: string | null
  created_at: string
  updated_at: string
}

export interface Generation {
  id: string
  user_id: string
  original_image_url: string
  ethnicity: Ethnicity
  concept: Concept
  status: GenerationStatus
  credits_used: number
  created_at: string
  generated_images?: GeneratedImage[]
}

export interface GeneratedImage {
  id: string
  generation_id: string
  image_url: string
  variation_index: number
  pose_description: string | null
  created_at: string
}

export interface CreditTransaction {
  id: string
  user_id: string
  amount: number
  type: 'subscription' | 'purchase' | 'generation' | 'refund'
  description: string | null
  created_at: string
}

// Fal.ai prompt yapılandırması
export const ETHNICITY_CONFIG: Record<Ethnicity, { label: string; modelPrompt: string }> = {
  slavic: {
    label: 'Slavic / Russian',
    modelPrompt: 'beautiful slavic female model, natural pale skin with subtle pores, light expressive eyes, realistic facial symmetry'
  },
  middle_eastern: {
    label: 'Middle Eastern / Arab',
    modelPrompt: 'striking middle eastern female model, natural olive skin texture, dark hair, authentic elegant features, real person'
  },
  european: {
    label: 'European / Western',
    modelPrompt: 'beautiful western european female model, natural skin texture, everyday professional look, candid'
  },
  turkish: {
    label: 'Turkish / Local',
    modelPrompt: 'beautiful turkish female model, genuine mediterranean features, warm natural skin tone with slight imperfections'
  }
}

export const CONCEPT_CONFIG: Record<Concept, { label: string; bgPrompt: string }> = {
  minimal_studio: {
    label: 'Minimal Stüdyo',
    bgPrompt: 'clean soft grey studio background, professional softbox lighting, subtle physical shadows on the floor, Vogue editorial style'
  },
  street_fashion: {
    label: 'Street Fashion',
    bgPrompt: 'blurred city street background, shallow depth of field, bokeh, beautiful natural sunlight, candid lifestyle fashion shot'
  },
  luxury_showroom: {
    label: 'Luxury Showroom',
    bgPrompt: 'out-of-focus luxury boutique interior background, warm elegant ambient lighting, cinematic depth, premium fashion aesthetic'
  }
}

export const POSE_VARIATIONS = [
  'standing front view, hands at sides',
  'standing front view, one hand on hip',
  'slight three-quarter turn, looking at camera',
  'walking pose, mid-stride, confident',
  'standing with crossed arms, smiling',
  'side profile view, looking over shoulder',
  'leaning against wall, casual pose',
  'sitting on high stool, legs crossed',
  'standing back view, looking over shoulder',
  'dynamic walking pose, hair flowing',
  'standing with hand in pocket, relaxed',
  'full body front view, slight smile',
  'three-quarter view from left side',
  'three-quarter view from right side',
  'standing with one foot forward, editorial pose',
  'close-up upper body, detailed fabric view',
  'standing in doorway, natural lighting',
  'seated pose, elegant posture',
  'walking towards camera, confident stride',
  'standing back view, full garment display'
]

// ─── P2: Physics-Aware Draping ───
// Her kumaş tipi için fiziksel döküm talimatları.
// FASHN product-to-model prompt'una enjekte edilerek
// AI'ın kumaşın gerçek fiziksel davranışını simüle etmesini sağlar.
export const FABRIC_CONFIG: Record<FabricType, { label: string; drapePrompt: string }> = {
  cotton: {
    label: 'Pamuk (Cotton)',
    drapePrompt: 'lightweight cotton fabric with natural soft drape, gentle creases at joints, breathable relaxed fit, subtle wrinkles at elbow and waist'
  },
  denim: {
    label: 'Denim',
    drapePrompt: 'rigid heavyweight denim fabric, structured stiff drape, visible selvedge texture, crisp fold lines, minimal stretch, industrial stitching details visible'
  },
  silk: {
    label: 'İpek (Silk)',
    drapePrompt: 'fluid silk fabric with luxurious liquid drape, smooth flowing silhouette, light-catching sheen, elegant bias-cut folds, weightless cascading movement'
  },
  knit: {
    label: 'Triko (Knit)',
    drapePrompt: 'soft knit fabric with stretchy body-hugging fit, visible knit texture pattern, gentle ribbing at cuffs and hem, cozy relaxed drape'
  },
  leather: {
    label: 'Deri (Leather)',
    drapePrompt: 'supple leather with structured heavy drape, visible grain texture, sharp creases at bends, slight sheen, stiff collar and lapels'
  },
  linen: {
    label: 'Keten (Linen)',
    drapePrompt: 'natural linen fabric with characteristic irregular wrinkles, relaxed loose drape, visible weave texture, casual rumpled elegance'
  },
  polyester: {
    label: 'Polyester',
    drapePrompt: 'smooth polyester blend fabric with crisp structured drape, wrinkle-resistant surface, slight synthetic sheen, clean sharp lines'
  }
}

