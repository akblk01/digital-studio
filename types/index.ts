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

// ─── P2: Physics-Aware Draping (Enhanced) ───
// 3 katmanlı prompt sistemi:
// 1. drapePrompt: Fiziksel ağırlık (oz/gsm) + pozitif görsel tanımlayıcılar
// 2. negativePrompt: Kumaşa-özel "ne olMAMASI gerektiği" talimatları
export const FABRIC_CONFIG: Record<FabricType, {
  label: string
  drapePrompt: string
  negativePrompt: string
  weight: 'ultralight' | 'light' | 'medium' | 'heavy' | 'ultraheavy'
}> = {
  cotton: {
    label: 'Pamuk (Cotton)',
    weight: 'medium',
    drapePrompt: '6oz medium-weight cotton fabric, soft natural drape with gentle body-following silhouette, subtle creases at elbow and waist joints, matte cotton surface texture, slightly rumpled lived-in appearance',
    negativePrompt: 'NOT shiny, NOT stiff like denim, NOT flowing like silk, NO synthetic sheen, NO heavy rigid folds'
  },
  denim: {
    label: 'Denim',
    weight: 'heavy',
    drapePrompt: '14oz heavyweight raw indigo denim, ZERO drape completely stiff structured silhouette, sharp angular creases NOT soft folds, thick coarse diagonal twill weave texture clearly visible, fabric holds its own shape independent of body, heavy substantial material weight visible in how garment hangs straight down',
    negativePrompt: 'absolutely NOT flowing, NOT lightweight, NOT billowing, NOT airy, NOT linen-like texture, NOT soft drape, NO gentle folds, NO sheer quality, NOT like cotton jersey, fabric must NOT move freely'
  },
  silk: {
    label: 'İpek (Silk)',
    weight: 'ultralight',
    drapePrompt: '4mm lightweight charmeuse silk, extremely fluid liquid-like drape cascading over body contours, luminous light-catching satin sheen, weightless flowing movement, delicate bias-cut folds that follow gravity smoothly, semi-transparent quality at thin areas',
    negativePrompt: 'NOT stiff, NOT structured, NOT rigid, NOT creased sharply, NO denim-like heaviness, NO matte surface, NOT coarse texture, NO angular folds'
  },
  knit: {
    label: 'Triko (Knit)',
    weight: 'medium',
    drapePrompt: '8oz medium-weight jersey knit, stretchy body-hugging fit that reveals body contours, visible knit loop texture pattern, soft elastic drape, gentle ribbing visible at cuffs and hemline, relaxed comfortable hang',
    negativePrompt: 'NOT woven texture, NOT stiff, NOT rigid, NOT shiny, NO sharp creases, NO angular folds, NOT like denim or linen'
  },
  leather: {
    label: 'Deri (Leather)',
    weight: 'heavy',
    drapePrompt: '1.2mm thick full-grain leather, heavy structured drape with visible hide grain texture, sharp defined creases at bend points only, slight natural waxy sheen, stiff collar and lapels that hold shape, material does NOT conform to body loosely',
    negativePrompt: 'NOT soft flowing, NOT lightweight, NOT fabric-like drape, NOT wrinkled like linen, NO textile weave visible, NOT matte like cotton'
  },
  linen: {
    label: 'Keten (Linen)',
    weight: 'light',
    drapePrompt: '5oz lightweight linen, characteristic natural irregular wrinkles and creases throughout, relaxed loose drape that does NOT cling to body, visible coarse plain-weave texture, casually rumpled artfully disheveled appearance, breathable airy open structure',
    negativePrompt: 'NOT smooth, NOT structured, NOT stiff like denim, NOT shiny, NO synthetic appearance, NOT body-hugging, NOT perfectly pressed'
  },
  polyester: {
    label: 'Polyester',
    weight: 'light',
    drapePrompt: '4oz lightweight polyester blend, crisp wrinkle-free surface, slight synthetic sheen under light, clean sharp pressed lines, smooth uniform texture without natural irregularities, maintains pressed appearance',
    negativePrompt: 'NOT wrinkled, NOT creased naturally, NOT matte like cotton, NOT heavy like denim, NO natural fiber texture, NOT rumpled'
  }
}

