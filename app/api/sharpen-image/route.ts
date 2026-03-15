import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export async function POST(req: NextRequest) {
  try {
    const { base64Image } = await req.json()
    
    if (!base64Image) {
      return NextResponse.json({ error: 'base64Image is required' }, { status: 400 })
    }

    // Convert base64 back to buffer
    const imageBuffer = Buffer.from(base64Image, 'base64')

    // Apply sharpening and local contrast enhancement to make fine textures pop
    // FASHN AI models tend to denoise and smooth out fine details like heathering
    // By artificially sharpening before generation, the AI is forced to see them 
    // and recreate them instead of treating them as image noise. 
    const sharpenedBuffer = await sharp(imageBuffer)
      // Enhance local contrast (Clarity) 
      .clahe({
        width: 50,
        height: 50,
        maxSlope: 3 // Controls the contrast limit. 3 is a good medium bump
      })
      // High-radius unsharp mask to push texture variations
      .sharpen({
        sigma: 1.5,
        m1: 1, // flat area
        m2: 3  // jagged area
      })
      // Increase saturation slightly to ensure speckles aren't lost in greyscale translation
      .modulate({
        saturation: 1.1
      })
      .jpeg({ quality: 95 })
      .toBuffer()

    const sharpenedBase64 = sharpenedBuffer.toString('base64')

    return NextResponse.json({ 
      success: true, 
      sharpenedImage: sharpenedBase64 
    })
    
  } catch (error: any) {
    console.error('Image sharpening error:', error)
    return NextResponse.json({ error: error.message || 'Image processing failed' }, { status: 500 })
  }
}
