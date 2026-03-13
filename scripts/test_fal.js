require('dotenv').config({ path: '.env.local' });
const { fal } = require('@fal-ai/client');

fal.config({ credentials: process.env.FAL_KEY });

async function testFal() {
  try {
    console.log("Testing generateBaseModel...");
    const prompt = `Professional fashion catalog photo. beautiful slavic female model, wearing a plain basic t-shirt. standing. minimal studio. Ultra high quality.`;
    
    // Testing base model
    const baseResult = await fal.subscribe('fal-ai/flux-pro', {
      input: {
        prompt,
        num_inference_steps: 10, // speed up tests
        guidance_scale: 3.5,
        image_size: 'portrait_4_3',
      },
    });
    
    const baseImageUrl = baseResult.data.images[0].url;
    console.log("Base image generated:", baseImageUrl);

    console.log("Testing Fashn VTON...");
    const garmentImage = "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000";
    
    const vtonResult = await fal.subscribe('fal-ai/fashn/tryon/v1.5', {
      input: {
        model_image: baseImageUrl,
        garment_image: garmentImage,
        category: 'tops',
      },
    });
    
    console.log("VTON result:", vtonResult.data);
  } catch (err) {
    console.error("Error during Fal test:");
    console.error(err);
  }
}

testFal();
