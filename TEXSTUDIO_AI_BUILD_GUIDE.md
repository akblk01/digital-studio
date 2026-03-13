# 🚀 TEXSTUDİO AI — TAM UYGULAMA TALİMATI (Claude Code İçin)

> **Bu dosyayı Claude Code'a yükle ve "Bu talimatı uygula" de. Başka bir şey yapmana gerek yok.**

---

## 📌 PROJE ÖZETİ

**TexStudio AI**, tekstil toptancılarının cep telefonuyla çektikleri basit ürün fotoğraflarını, yapay zeka ile profesyonel moda kataloğuna dönüştüren bir SaaS uygulamasıdır.

**Hedef Kullanıcı:** Merter, Laleli, Güngören'deki tekstil esnafı.  
**Temel Değer:** 1 ürün fotoğrafından → 4 profesyonel katalog görseli ($0.30/oturum).  
**Pipeline:** FASHN.ai `product-to-model` tek çağrı (düz zemin ürün → manken üzerinde profesyonel görsel).  
**Tutarlı Manken:** `face_reference` ile aynı yüz kimliği tüm üretimlerde korunur.  
**Kumasch Fizik:** 7 kumasch tipi için Physics-Aware Draping prompt katmanı.

---

## 🧱 TEKNOLOJİ YIĞINI

| Katman | Teknoloji | Versiyon / Not |
|--------|-----------|----------------|
| Frontend | Next.js (App Router) | 14+ |
| UI Kit | Shadcn UI + Tailwind CSS | v4 |
| Backend/Auth/DB | Supabase | Auth + PostgreSQL + Storage |
| AI — Ana Pipeline | FASHN.ai Direct API | `product-to-model` (tek çağrı) |
| AI — Tutarlı Yüz | FASHN.ai `face_reference` | Aynı manken kimliği |
| AI — Hayalet Manken | FASHN.ai `background-remove` | Cansız manken silme |
| AI — Fallback | fal.ai → `fal-ai/flux-pro` | (Legacy, yedek) |
| Ödeme | Stripe | (Henüz entegre edilmedi) |
| Deployment | Vercel | Next.js hosting |

---

## 📁 PROJE DOSYA YAPISI

```
texstudio-ai/
├── .env.local                          # Tüm API anahtarları
├── next.config.ts
├── tailwind.config.ts
├── package.json
├── middleware.ts                        # Supabase Auth middleware
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Browser Supabase client
│   │   ├── server.ts                   # Server-side Supabase client
│   │   └── admin.ts                    # Service role client (kredi işlemleri)
│   ├── fashn.ts                       # ⭐ FASHN.ai Direct API client
│   ├── fal.ts                         # Fal.ai (legacy/fallback)
│   ├── stripe.ts                      # Stripe config
│   └── utils.ts                       # Genel yardımcı fonksiyonlar
│
├── types/
│   └── index.ts                        # Tipler + FABRIC_CONFIG (Physics-Aware)
│
├── components/
│   ├── ui/                             # Shadcn UI bileşenleri
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── MobileNav.tsx
│   ├── studio/
│   │   ├── EthnicitySelector.tsx
│   │   ├── ConceptSelector.tsx
│   │   ├── GenerationProgress.tsx
│   │   └── ResultGallery.tsx           # 4'lü sonuç galerisi + Report buton
│   ├── billing/
│   │   ├── PricingCard.tsx
│   │   ├── CreditBalance.tsx
│   │   └── PurchaseCredits.tsx
│   └── auth/
│       ├── LoginForm.tsx
│       └── RegisterForm.tsx
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx                        # Landing page
│   ├── globals.css
│   │
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── studio/page.tsx             # ANA SAYFA — Fotoğraf yükle + üret
│   │   ├── gallery/page.tsx
│   │   ├── profile/page.tsx
│   │   └── billing/page.tsx
│   │
│   └── api/
│       ├── generate/route.ts           # ⭐ FASHN product-to-model endpoint
│       ├── ghost-mannequin/route.ts    # Hayalet manken (arka plan silme)
│       ├── batch/route.ts              # Toplu işleme (50 ürün/seferde)
│       ├── refund/route.ts             # Kredi iade mekanizması
│       ├── webhooks/
│       │   └── stripe/route.ts
│       ├── credits/
│       │   └── deduct/route.ts
│       └── download/
│           └── route.ts
```

---

## 🗄️ SUPABASE VERİTABANI ŞEMASI

Aşağıdaki SQL'i **Supabase SQL Editor**'de çalıştır:

```sql
-- 1. Profiller tablosu (auth.users ile otomatik eşlenir)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  credits INTEGER NOT NULL DEFAULT 0,
  subscription_status TEXT NOT NULL DEFAULT 'inactive'
    CHECK (subscription_status IN ('active', 'inactive', 'canceled')),
  subscription_plan TEXT DEFAULT 'none'
    CHECK (subscription_plan IN ('none', 'monthly')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Üretimler tablosu (her bir üretim oturumu)
CREATE TABLE public.generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  original_image_url TEXT NOT NULL,
  ethnicity TEXT NOT NULL
    CHECK (ethnicity IN ('slavic', 'middle_eastern', 'european', 'turkish')),
  concept TEXT NOT NULL
    CHECK (concept IN ('minimal_studio', 'street_fashion', 'luxury_showroom')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  credits_used INTEGER NOT NULL DEFAULT 20,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Üretilen görseller tablosu
CREATE TABLE public.generated_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  generation_id UUID REFERENCES public.generations(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  variation_index INTEGER NOT NULL,
  pose_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Kredi işlem geçmişi
CREATE TABLE public.credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('subscription', 'purchase', 'generation', 'refund')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. RLS Politikaları
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own generations"
  ON public.generations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own generations"
  ON public.generations FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own images"
  ON public.generated_images FOR SELECT
  USING (
    generation_id IN (
      SELECT id FROM public.generations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own transactions"
  ON public.credit_transactions FOR SELECT USING (auth.uid() = user_id);

-- 6. Yeni kullanıcı kayıt olduğunda otomatik profil oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, credits)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    50  -- Hoşgeldin bonusu: 50 ücretsiz kredi
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Kredi düşme fonksiyonu (atomik işlem)
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_credits INTEGER;
BEGIN
  SELECT credits INTO v_current_credits
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_current_credits >= p_amount THEN
    UPDATE public.profiles
    SET credits = credits - p_amount, updated_at = NOW()
    WHERE id = p_user_id;

    INSERT INTO public.credit_transactions (user_id, amount, type, description)
    VALUES (p_user_id, -p_amount, 'generation', p_amount || ' kredi kullanıldı - görsel üretimi');

    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Supabase Storage Bucket oluştur:** `product-images` adında public bucket oluştur.

---

## 🔐 ENV DEĞİŞKENLERİ (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Fal.ai
FAL_KEY=fal_xxxxxxxxxxxxxxxx

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx
STRIPE_MONTHLY_PRICE_ID=price_xxxxxxxx
STRIPE_CREDIT_PRICE_ID=price_xxxxxxxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## ⚙️ ADIM ADIM UYGULAMA TALİMATLARI

### ADIM 1: Proje Kurulumu

```bash
npx -y create-next-app@latest texstudio-ai --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --turbopack
cd texstudio-ai
npx -y shadcn@latest init -d
npx -y shadcn@latest add button card input label select dialog dropdown-menu avatar badge progress toast tabs separator sheet
npm install @supabase/supabase-js @supabase/ssr @fal-ai/client stripe @stripe/stripe-js jszip file-saver lucide-react framer-motion
npm install -D @types/file-saver
```

---

### ADIM 2: Supabase Client Kurulumu

**`lib/supabase/client.ts`** — Tarayıcı tarafı:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**`lib/supabase/server.ts`** — Sunucu tarafı:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch { /* Server Component'te yazma hatası — ignore */ }
        },
      },
    }
  )
}
```

**`lib/supabase/admin.ts`** — Service role (kredi işlemleri):
```typescript
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

**`middleware.ts`** — Auth koruması:
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()

  if (!user && request.nextUrl.pathname.startsWith('/studio')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
  if (!user && request.nextUrl.pathname.startsWith('/gallery')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
  if (!user && request.nextUrl.pathname.startsWith('/profile')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
  if (!user && request.nextUrl.pathname.startsWith('/billing')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)'],
}
```

---

### ADIM 3: TypeScript Tipleri

**`types/index.ts`:**
```typescript
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
```

---

### ADIM 4: Fal.ai API Entegrasyonu

**`lib/fal.ts`:**
```typescript
import { fal } from '@fal-ai/client'

fal.config({ credentials: process.env.FAL_KEY! })

// ─── NEGATIVE PROMPT (Anatomik hata engelleyici) ───
const NEGATIVE_PROMPT = [
  'deformed fingers', 'extra limbs', 'bad anatomy', 'fused fingers',
  'plastic skin', 'poreless skin', 'waxy skin', 'dead eyes',
  'extra buttons', 'extra pockets', 'CGI render', 'illustration'
].join(', ')

// ─── VTON v1.6 — Kıyafeti mankene giydirme (864x1296) ───
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
// VTON'a girdi olacak dikişsiz, sade kıyafetli manken üretir.
export async function generateBaseModel(
  ethnicityPrompt: string,
  conceptPrompt: string,
  poseDescription: string
): Promise<string> {
  const prompt = `RAW candid fashion photography, Fujifilm XT4, 35mm lens, natural available light, visible skin pores, real human. ${ethnicityPrompt}, wearing a tight-fitting seamless plain neutral grey tank top and simple dark trousers. Absolutely NO buttons, NO pockets, NO zippers, NO seams visible on upper body. ${poseDescription}. ${conceptPrompt}. Hyper-realistic, editorial quality, subtle depth of field.`

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
```

---

### ADIM 5: Ana API Endpoint — Görsel Üretimi

**`app/api/generate/route.ts`:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { generateCatalogImage } from '@/lib/fal'
import { ETHNICITY_CONFIG, CONCEPT_CONFIG, POSE_VARIATIONS } from '@/types'
import type { Ethnicity, Concept } from '@/types'

export const maxDuration = 300 // 5 dakika timeout

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { imageUrl, ethnicity, concept } = await req.json() as {
      imageUrl: string
      ethnicity: Ethnicity
      concept: Concept
    }

    // 1. Kredi kontrolü ve düşme (atomik)
    const { data: hasCredits } = await supabaseAdmin.rpc('deduct_credits', {
      p_user_id: user.id,
      p_amount: 20
    })
    if (!hasCredits) {
      return NextResponse.json({ error: 'Yetersiz kredi. Lütfen kredi satın alın.' }, { status: 402 })
    }

    // 2. Generation kaydı oluştur
    const { data: generation, error: genError } = await supabaseAdmin
      .from('generations')
      .insert({
        user_id: user.id,
        original_image_url: imageUrl,
        ethnicity,
        concept,
        status: 'processing',
        credits_used: 20
      })
      .select()
      .single()

    if (genError) throw genError

    // 3. 20 varyasyon üret (paralel gruplar halinde)
    const ethnicityPrompt = ETHNICITY_CONFIG[ethnicity].modelPrompt
    const conceptPrompt = CONCEPT_CONFIG[concept].bgPrompt
    const batchSize = 4

    const generatedImages: { image_url: string; variation_index: number; pose_description: string }[] = []

    for (let i = 0; i < POSE_VARIATIONS.length; i += batchSize) {
      const batch = POSE_VARIATIONS.slice(i, i + batchSize)
      const results = await Promise.allSettled(
        batch.map(async (pose, batchIndex) => {
          const index = i + batchIndex
          const resultUrl = await generateCatalogImage(imageUrl, ethnicityPrompt, conceptPrompt, pose)
          return { image_url: resultUrl, variation_index: index, pose_description: pose }
        })
      )
      results.forEach(r => {
        if (r.status === 'fulfilled') generatedImages.push(r.value)
      })
    }

    // 4. Sonuçları kaydet
    if (generatedImages.length > 0) {
      await supabaseAdmin.from('generated_images').insert(
        generatedImages.map(img => ({ ...img, generation_id: generation.id }))
      )
    }

    // 5. Status güncelle
    await supabaseAdmin
      .from('generations')
      .update({ status: generatedImages.length > 0 ? 'completed' : 'failed' })
      .eq('id', generation.id)

    return NextResponse.json({
      generationId: generation.id,
      images: generatedImages,
      totalGenerated: generatedImages.length
    })

  } catch (error: any) {
    console.error('Generation error:', error)
    return NextResponse.json({ error: error.message || 'Üretim hatası' }, { status: 500 })
  }
}
```

---

### ADIM 6: Zip İndirme Endpoint

**`app/api/download/route.ts`:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import JSZip from 'jszip'

export async function GET(req: NextRequest) {
  const generationId = req.nextUrl.searchParams.get('generationId')
  if (!generationId) return NextResponse.json({ error: 'Missing generationId' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: images } = await supabase
    .from('generated_images')
    .select('*')
    .eq('generation_id', generationId)
    .order('variation_index')

  if (!images || images.length === 0) {
    return NextResponse.json({ error: 'No images found' }, { status: 404 })
  }

  const zip = new JSZip()
  for (const img of images) {
    const response = await fetch(img.image_url)
    const buffer = await response.arrayBuffer()
    zip.file(`texstudio_${img.variation_index + 1}.png`, buffer)
  }

  const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' })
  return new NextResponse(zipBuffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="texstudio_catalog_${generationId}.zip"`,
    },
  })
}
```

---

### ADIM 7: Stripe Ödeme Entegrasyonu

**`lib/stripe.ts`:**
```typescript
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})
```

**`app/api/webhooks/stripe/route.ts`:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  let event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any
      const userId = session.metadata.user_id
      const type = session.metadata.type // 'subscription' or 'credits'

      if (type === 'subscription') {
        await supabaseAdmin.from('profiles').update({
          subscription_status: 'active',
          subscription_plan: 'monthly',
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          credits: 1000,
        }).eq('id', userId)

        await supabaseAdmin.from('credit_transactions').insert({
          user_id: userId, amount: 1000, type: 'subscription',
          description: 'Aylık abonelik — 1000 kredi'
        })
      } else if (type === 'credits') {
        const creditAmount = parseInt(session.metadata.credit_amount)
        await supabaseAdmin.rpc('deduct_credits', { p_user_id: userId, p_amount: -creditAmount })
        await supabaseAdmin.from('credit_transactions').insert({
          user_id: userId, amount: creditAmount, type: 'purchase',
          description: `${creditAmount} kredi satın alındı`
        })
      }
      break
    }
    case 'invoice.paid': {
      const invoice = event.data.object as any
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
      const userId = subscription.metadata.user_id
      if (userId) {
        await supabaseAdmin.from('profiles').update({ credits: 1000 }).eq('id', userId)
        await supabaseAdmin.from('credit_transactions').insert({
          user_id: userId, amount: 1000, type: 'subscription',
          description: 'Aylık abonelik yenilendi — 1000 kredi'
        })
      }
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as any
      const userId = sub.metadata.user_id
      if (userId) {
        await supabaseAdmin.from('profiles').update({
          subscription_status: 'canceled', subscription_plan: 'none'
        }).eq('id', userId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
```

---

### ADIM 8: Ana Stüdyo Sayfası (UI)

**`app/(dashboard)/studio/page.tsx`** — Bu uygulamanın kalbi:

Bu sayfa şunları içermeli:
1. **Büyük sürükle-bırak fotoğraf yükleme alanı** (mobil uyumlu, kamera erişimi)
2. **Etnik köken seçimi** — 4 kart (Slavic, Middle Eastern, European, Turkish) — her birinde temsili avatar ikonu
3. **Konsept seçimi** — 3 kart (Minimal Studio, Street Fashion, Luxury Showroom) — her birinde atmosfer ikon/görseli
4. **"20 Görsel Üret" butonu** — büyük, gradient, dikkat çekici
5. **İlerleme animasyonu** — üretim sırasında aşamalı mesajlar:
   - "Kıyafet analiz ediliyor..." (0-10%)
   - "Manken seçiliyor..." (10-20%)
   - "Kıyafet mankene giydiriliyor..." (20-50%)
   - "Işık ve gölgeler ayarlanıyor..." (50-70%)
   - "Son rötuşlar yapılıyor..." (70-90%)
   - "Katalog hazır! 🎉" (100%)
6. **Sonuç galerisi** — 4 sütunlu grid (masaüstü), 2 sütunlu (mobil)
7. **"Tümünü İndir (.zip)" butonu**

---

### ADIM 9: Tasarım Kuralları

1. **Renk Paleti:**
   - Primary: `#6C63FF` (Modern mor)
   - Secondary: `#FF6584` (Canlı pembe)
   - Background (Dark): `#0F0F1A`
   - Card Background: `#1A1A2E`
   - Text: `#FFFFFF` / `#A0A0B0`

2. **Font:** Inter (Google Fonts) — tüm uygulamada

3. **Mobil Öncelikli:** Tüm bileşenler önce mobil, sonra masaüstüne uyumlanmalı

4. **Animasyonlar:**
   - Framer Motion ile sayfa geçişleri
   - Kart hover efektleri (scale + shadow)
   - Upload alanında dosya sürüklendiğinde border animasyonu
   - Üretim sırasında pulsing/shimmer efekti

5. **Header:** Sol tarafta logo "TexStudio AI", sağ tarafta kredi göstergesi (ikon + sayı) ve profil dropdown

---

### ADIM 10: Landing Page

**`app/page.tsx`** — Giriş yapmamış kullanıcılar için:

- Hero bölümü: "Tek fotoğraftan profesyonel moda kataloğu" başlığı + CTA butonu
- Öncesi/Sonrası karşılaştırma görselleri
- 3 adımlık süreç açıklaması (Yükle → Seç → Üret)
- Fiyatlandırma kartı (99$/ay — 1000 kredi)
- Footer

---

## 🧪 TEST PLANI

1. Auth akışını test et: kayıt → giriş → profil görüntüleme
2. Fotoğraf yükleme → Supabase Storage'a kayıt kontrolü
3. Kredi düşme: 50 krediden başla, 20'lik üretim sonrası 30 kalmalı
4. Yetersiz kredi uyarısı (0 kredide "Üret" butonunun devre dışı kalması)
5. Stripe checkout → webhook → kredi yüklenmesi
6. Zip indirme fonksiyonu
7. Mobil görüntüleme (responsive kontrol)

---

## 🚀 DEPLOYMENT KONTROL LİSTESİ

1. Vercel'e deploy et
2. Tüm env değişkenlerini Vercel'e ekle
3. Stripe webhook URL'ini güncelle: `https://yourdomain.com/api/webhooks/stripe`
4. Supabase'de Site URL'i güncelle
5. `middleware.ts`'deki yönlendirmeleri test et
6. Custom domain bağla

---

## ⚠️ KRİTİK KURALLAR

1. **Kıyafet deseni korunmalı:** Fal.ai promptlarında her zaman "preserve the exact garment pattern, texture, logo and design" ifadesi olmalı.
2. **Atomik kredi düşme:** Kredi işlemi veritabanı fonksiyonu ile yapılmalı, race condition olmamalı (FOR UPDATE lock kullanılıyor).
3. **Hata yönetimi:** API hataları kullanıcıya Türkçe mesajla gösterilmeli.
4. **Rate limiting:** Bir kullanıcı aynı anda birden fazla üretim başlatamamalı.
5. **Image optimization:** Next.js `<Image>` bileşeni kullanılmalı.

---

> **Bu dokümanı Claude Code'a yükle ve şu komutu ver:**  
> `"Bu TEXSTUDIO_AI_BUILD_GUIDE.md dosyasındaki talimatları sırasıyla uygula. Her adımı tamamladıktan sonra bir sonrakine geç."`
