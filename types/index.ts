export type Ethnicity = 'slavic' | 'middle_eastern' | 'european' | 'turkish'
export type Concept = 
  // Minimal Studio presets
  | 'minimal_white' | 'minimal_wood' | 'minimal_silver' | 'minimal_botanical' | 'minimal_concrete'
  // Street Fashion presets
  | 'street_paris' | 'street_tokyo' | 'street_newyork' | 'street_london' | 'street_sunset'
  // Luxury Showroom presets
  | 'luxury_leather' | 'luxury_marble' | 'luxury_glass' | 'luxury_gold' | 'luxury_velvet'

export type Gender = 'female' | 'male' | 'unisex'
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
  gender: Gender
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

export interface SavedModel {
  id: string
  user_id: string
  model_name: string
  face_image_url: string
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

// Fal.ai / FASHN prompt yapılandırması
export const GENDER_CONFIG: Record<Gender, { label: string; promptModifier: string }> = {
  female: { label: 'Kadın (Female)', promptModifier: 'beautiful female' },
  male: { label: 'Erkek (Male)', promptModifier: 'handsome male' },
  unisex: { label: 'Unisex / Androgynous', promptModifier: 'stylish androgynous' }
}

export const ETHNICITY_CONFIG: Record<Ethnicity, { label: string; modelPrompt: string }> = {
  slavic: {
    label: 'Slavic / Russian',
    modelPrompt: 'slavic model, natural pale skin with subtle pores, light expressive eyes, realistic facial symmetry'
  },
  middle_eastern: {
    label: 'Middle Eastern / Arab',
    modelPrompt: 'middle eastern model, natural olive skin texture, dark hair, authentic elegant features, real person'
  },
  european: {
    label: 'European / Western',
    modelPrompt: 'western european model, natural skin texture, everyday professional look, candid'
  },
  turkish: {
    label: 'Turkish / Local',
    modelPrompt: 'turkish model, genuine mediterranean features, warm natural skin tone with slight imperfections'
  }
}

export const CONCEPT_CONFIG: Record<Concept, { label: string; bgPrompt: string }> = {
  // Minimal Studio
  minimal_white: {
    label: 'Studio - Pure White',
    bgPrompt: 'clean pure white cyclorama studio background, professional softbox lighting, subtle physical shadows on the floor, Vogue editorial style'
  },
  minimal_wood: {
    label: 'Studio - Wooden Stool',
    bgPrompt: 'clean photography studio, aesthetic simple wooden stool prop, soft warm lighting, minimalist fashion aesthetic'
  },
  minimal_silver: {
    label: 'Studio - Silver Podium',
    bgPrompt: 'modern fashion studio, sleek silver metallic podium in background, cool softbox lighting, high-end commercial style'
  },
  minimal_botanical: {
    label: 'Studio - Botanical',
    bgPrompt: 'minimalist light grey studio background, large elegant monstera plant leaves softly framing the background, natural indirect sunlight'
  },
  minimal_concrete: {
    label: 'Studio - Raw Concrete',
    bgPrompt: 'brutalist fashion studio background, raw textured concrete wall, dramatic directional lighting, edgy minimalist aesthetic'
  },
  
  // Street Fashion
  street_paris: {
    label: 'Street - Parisian Cafe',
    bgPrompt: 'blurred Parisian boulevard background, classic French cafe exterior, natural daylight, candid street fashion editorial, bokeh'
  },
  street_tokyo: {
    label: 'Street - Tokyo Neon',
    bgPrompt: 'blurred Tokyo street at night, vibrant neon lights glowing in the background, cinematic cyberpunk aesthetic, wet asphalt reflections'
  },
  street_newyork: {
    label: 'Street - NYC Crosswalk',
    bgPrompt: 'out-of-focus New York city crosswalk background, yellow cabs in distance, daytime urban hustle, 35mm street photography style'
  },
  street_london: {
    label: 'Street - London Classic',
    bgPrompt: 'blurred classic London brick architecture background, overcast soft diffused lighting, elegant European street style'
  },
  street_sunset: {
    label: 'Street - Sunset Boulevard',
    bgPrompt: 'blurred palm tree lined boulevard at golden hour, warm glowing sunset lighting catching the hair, coastal street fashion'
  },
  
  // Luxury Showroom
  luxury_leather: {
    label: 'Luxury - Leather Lounge',
    bgPrompt: 'out-of-focus premium luxury lounge, dark elegant chesterfield leather sofa in background, warm moody spotlighting, high-end boutique'
  },
  luxury_marble: {
    label: 'Luxury - Marble Gallery',
    bgPrompt: 'luxury fashion showroom interior, expansive white marble floors and columns, bright elegant ambient lighting, premium fashion aesthetic'
  },
  luxury_glass: {
    label: 'Luxury - Glass Palace',
    bgPrompt: 'modern architectural glass interior background, contemporary luxury showroom, huge windows with city view, sleek clean lines'
  },
  luxury_gold: {
    label: 'Luxury - Gold Accents',
    bgPrompt: 'high-end boutique interior, warm lighting, elegant brushed brass and gold clothing racks in background, luxurious retail space'
  },
  luxury_velvet: {
    label: 'Luxury - Velvet Drapes',
    bgPrompt: 'elegant showroom backdrop with heavy dark red velvet curtains, cinematic moody lighting, haute couture fitting room atmosphere'
  }
}


export const POSE_CONFIG: Record<string, { label: string; poseUrl: string | null }> = {
  auto: { 
    label: '✨ Bana Bırak (Auto)', 
    poseUrl: null 
  },
  hands_in_pockets: { 
    label: 'Eller Cepte (Hands in Pockets)', 
    poseUrl: 'https://texstudio-ai.vercel.app/poses/hands_in_pocket.jpg' // Lütfen buraya gerçek poz resimlerini ekleyin
  },
  dynamic_walk: { 
    label: 'Dinamik Yürüyüş (Dynamic Walk)', 
    poseUrl: 'https://texstudio-ai.vercel.app/poses/dynamic_walk.jpg'
  },
  looking_back: { 
    label: 'Geriye Bakış (Looking Back)', 
    poseUrl: 'https://texstudio-ai.vercel.app/poses/looking_back.jpg'
  },
  hands_on_hips: { 
    label: 'Eller Belde (Hands on Hips)', 
    poseUrl: 'https://texstudio-ai.vercel.app/poses/hands_on_hips.jpg'
  }
}


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

