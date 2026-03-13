import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { removeBackground } from '@/lib/fashn'

export const maxDuration = 120

/**
 * Ghost Mannequin (Hayalet Manken) API
 * 
 * Cansız mankene giydirilmiş ürün fotoğrafından mankeni silip
 * arkalarını şeffaf (PNG cutout) yaparak e-ticaret görseli oluşturur.
 * 
 * İleriki versiyonda: İç yaka rekonstrüksiyonu (hollow 3D efekti)
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { imageUrl } = await req.json() as { imageUrl: string }

    if (!imageUrl) {
      return NextResponse.json({ error: 'imageUrl gerekli' }, { status: 400 })
    }

    // FASHN.ai background-remove ile mankeni sil
    const resultUrls = await removeBackground(imageUrl)

    if (!resultUrls || resultUrls.length === 0) {
      return NextResponse.json({ error: 'Arka plan silme başarısız' }, { status: 500 })
    }

    return NextResponse.json({
      originalUrl: imageUrl,
      processedUrl: resultUrls[0],
      message: 'Hayalet manken işlemi tamamlandı'
    })

  } catch (error: any) {
    console.error('Ghost Mannequin API error:', error)
    return NextResponse.json({ error: error.message || 'İşlem hatası' }, { status: 500 })
  }
}
