export type Ethnicity = 'slavic' | 'middle_eastern' | 'european' | 'turkish'
export type Concept = 'minimal_studio' | 'street_fashion' | 'luxury_showroom'
export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed'

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
    modelPrompt: 'beautiful slavic female model, light skin, light eyes, high cheekbones'
  },
  middle_eastern: {
    label: 'Middle Eastern / Arab',
    modelPrompt: 'beautiful middle eastern female model, olive skin, dark hair, elegant features'
  },
  european: {
    label: 'European / Western',
    modelPrompt: 'beautiful western european female model, professional look'
  },
  turkish: {
    label: 'Turkish / Local',
    modelPrompt: 'beautiful turkish female model, mediterranean features, warm skin tone'
  }
}

export const CONCEPT_CONFIG: Record<Concept, { label: string; bgPrompt: string }> = {
  minimal_studio: {
    label: 'Minimal Stüdyo',
    bgPrompt: 'clean white studio background, soft professional lighting, fashion photography'
  },
  street_fashion: {
    label: 'Street Fashion',
    bgPrompt: 'upscale city street, Nisantasi Istanbul style, European boulevard, natural daylight, fashion editorial'
  },
  luxury_showroom: {
    label: 'Luxury Showroom',
    bgPrompt: 'luxury fashion showroom interior, marble floors, elegant lighting, high-end boutique'
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
