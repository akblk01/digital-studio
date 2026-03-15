const fal = require('@fal-ai/client').fal;
require('dotenv').config({path: '.env.local'});

fal.config({ credentials: process.env.FAL_KEY });

async function run() {
  const result = await fal.subscribe("fal-ai/flux/dev/image-to-image", {
    input: {
      image_url: "https://v3b.fal.media/files/b/0a923471/PPhSnuNiUAdt3SV8i668X.jpg",
      prompt: "Keep the exact same lighting, background, face and human model skeleton. ONLY modify this specific clothing detail: kolları bileğe kadar uzat (extend sleeves to wrist).",
      strength: 0.65,
    },
    logs: false
  });
  console.log(JSON.stringify(result.data, null, 2));
}

run().catch(console.error);
