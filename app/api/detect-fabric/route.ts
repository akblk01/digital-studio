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
          content: `You are an expert textile analyst. Look closely at the garment image.
1) Identify the main fabric category from: ${validFabrics.join(', ')}.
2) Provide a highly detailed description of the physical texture and pattern. Focus on small details like heathering, melange, ribs, slubs, speckles, crinkles, weave type, or print patterns.
Respond ONLY with a valid JSON object in this exact format:
{
  "fabric": "one of the allowed words",
  "textureDetails": "Ex: subtle speckled melange pattern with dark blue heathering / crisp flat surface / thick ribbed knit structure"
}`
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
      response_format: { type: "json_object" },
      max_tokens: 150,
      temperature: 0.1,
    })

    const rawContent = response.choices[0]?.message?.content?.trim() || "{}"
    const parsed = JSON.parse(rawContent)
    
    // Validate that the AI returned a valid key
    if (parsed.fabric && validFabrics.includes(parsed.fabric)) {
      return NextResponse.json({ 
        fabric: parsed.fabric as FabricType,
        textureDetails: parsed.textureDetails || ""
      })
    }
    
    return NextResponse.json({ fabric: null, textureDetails: "", message: "Could not decisively identify fabric" })
    
  } catch (error: any) {
    console.error('Fabric detection error:', error)
    return NextResponse.json({ error: error.message || 'Fabric detection failed' }, { status: 500 })
  }
}
