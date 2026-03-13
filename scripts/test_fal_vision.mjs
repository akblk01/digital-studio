import { fal } from '@fal-ai/client';

fal.config({ credentials: process.env.FAL_KEY });

async function main() {
  try {
    const result = await fal.subscribe("fal-ai/llava-next", {
      input: {
        image_url: "https://fal.media/files/monkey/a4a9c69335ae463b84db96a0904d9b62_00000_1024x1024.jpg",
        prompt: "What is the main fabric type in this image? Choose from: cotton, denim, silk, knit, leather, linen, polyester. Respond with just the word."
      }
    });
    console.log("LLAVA Result:", result.output);
  } catch(e) {
    console.error("LLAVA Failed:", e.message);
  }
}

main();
