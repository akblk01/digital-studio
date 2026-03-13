import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import JSZip from 'jszip'

export async function GET(req: NextRequest) {
  const generationId = req.nextUrl.searchParams.get('generationId')
  if (!generationId) {
    return NextResponse.json({ error: 'Missing generationId' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
    try {
      const response = await fetch(img.image_url)
      const buffer = await response.arrayBuffer()
      zip.file(`texstudio_${img.variation_index + 1}.png`, buffer)
    } catch (e) {
      console.error(`Error downloading image ${img.image_url}:`, e)
    }
  }

  const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' })
  return new NextResponse(zipBuffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="texstudio_catalog_${generationId}.zip"`,
    },
  })
}
