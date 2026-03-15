-- TEXSTUDIO AI V3 MIGRATION

-- 1. `generations` tablosuna 'gender' kolonunu ekle (ve eski kayıtlar için female varsayımı yap)
ALTER TABLE public.generations ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'female';
UPDATE public.generations SET gender = 'female' WHERE gender IS NULL;

-- 2. `generations` tablosundaki `concept` ENUM kısıtlamasını kaldır (Çünkü V3'te 15 yeni concept eklendi)
ALTER TABLE public.generations DROP CONSTRAINT IF EXISTS generations_concept_check;

-- 3. Favori Manken Yüzleri için `saved_models` tablosu oluştur
CREATE TABLE IF NOT EXISTS public.saved_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  model_name TEXT NOT NULL,
  face_image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. `saved_models` için Güvenlik (RLS) Politikaları (Sadece kullanıcı kendi yüzlerini görebilir)
ALTER TABLE public.saved_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved models" 
  ON public.saved_models FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved models" 
  ON public.saved_models FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved models" 
  ON public.saved_models FOR DELETE 
  USING (auth.uid() = user_id);
