import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { FABRIC_CONFIG } from '@/types'
import type { FabricType } from '@/types'

// Not using standard env var to keep it optional, just check if it exists
// We will also support GEMINI_API_KEY through openai-compatible endpoint if they prefer 
// For now, let's just initialize the standard openAI client if OPENAI_API_KEY is present
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null

export async function POST(req: NextRequest) {
  try {
    if (!openai) {
      return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 400 })
    }

    const { imageUrl, base64Image } = await req.json()
    if (!imageUrl && !base64Image) {
      return NextResponse.json({ error: 'imageUrl or base64Image is required' }, { status: 400 })
    }

    const validFabrics = Object.keys(FABRIC_CONFIG)
    const imagePayload = base64Image ? `data:image/jpeg;base64,${base64Image}` : imageUrl
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a textile expert. Look at the image and identify the main fabric type of the garment. You MUST respond with ONLY one of the following exact words: ${validFabrics.join(', ')}. If you are unsure, pick the closest one. Respond with a single lowercase word.`
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: imagePayload
              }
            }
          ]
        }
      ],
      max_tokens: 10,
      temperature: 0.1,
    })

    const detectedFabric = response.choices[0]?.message?.content?.trim().toLowerCase()
    
    // Validate that the AI returned a valid key
    if (detectedFabric && validFabrics.includes(detectedFabric)) {
      return NextResponse.json({ fabric: detectedFabric as FabricType })
    }
    
    return NextResponse.json({ fabric: null, message: "Could not decisively identify fabric" })
    
  } catch (error: any) {
    console.error('Fabric detection error:', error)
    return NextResponse.json({ error: error.message || 'Fabric detection failed' }, { status: 500 })
  }
}
