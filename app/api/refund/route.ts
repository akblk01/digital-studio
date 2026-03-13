import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * Kredi İade Mekanizması
 * 
 * Kullanıcı bozuk/hatalı görsel bildirdiğinde
 * otomatik kredi iadesi yapar. Günlük limit: 10 iade/kullanıcı.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { generationId, imageId, reason } = await req.json() as {
      generationId: string
      imageId?: string
      reason?: string
    }

    if (!generationId) {
      return NextResponse.json({ error: 'generationId gerekli' }, { status: 400 })
    }

    // Generation'ın kullanıcıya ait olduğunu doğrula
    const { data: generation } = await supabaseAdmin
      .from('generations')
      .select('*')
      .eq('id', generationId)
      .eq('user_id', user.id)
      .single()

    if (!generation) {
      return NextResponse.json({ error: 'Geçersiz generation' }, { status: 404 })
    }

    // Günlük iade limitini kontrol et
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { count: todayRefunds } = await supabaseAdmin
      .from('credit_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('type', 'refund')
      .gte('created_at', today.toISOString())

    const DAILY_REFUND_LIMIT = 10
    if ((todayRefunds || 0) >= DAILY_REFUND_LIMIT) {
      return NextResponse.json({ 
        error: `Günlük iade limitine ulaşıldı (${DAILY_REFUND_LIMIT}).` 
      }, { status: 429 })
    }

    // Bu generation daha önce iade edilmiş mi?
    const { data: existingRefund } = await supabaseAdmin
      .from('credit_transactions')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'refund')
      .eq('description', `Refund: ${generationId}`)
      .maybeSingle()

    if (existingRefund) {
      return NextResponse.json({ error: 'Bu üretim zaten iade edilmiş' }, { status: 409 })
    }

    // Krediyi iade et
    const refundAmount = generation.credits_used || 4

    // Profil kredisini artır (manuel)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single()
    
    if (profile) {
      await supabaseAdmin
        .from('profiles')
        .update({ credits: profile.credits + refundAmount })
        .eq('id', user.id)
    }

    // İşlem kaydı
    await supabaseAdmin.from('credit_transactions').insert({
      user_id: user.id,
      amount: refundAmount,
      type: 'refund',
      description: `Refund: ${generationId}${reason ? ` - ${reason}` : ''}`
    })

    return NextResponse.json({
      refunded: refundAmount,
      message: `${refundAmount} kredi iade edildi.`
    })

  } catch (error: any) {
    console.error('Refund API error:', error)
    return NextResponse.json({ error: error.message || 'İade hatası' }, { status: 500 })
  }
}
