const fal = require('@fal-ai/client').fal;

fal.config({ credentials: process.env.FAL_KEY });

async function run() {
  const result = await fal.subscribe("fal-ai/flux/dev/image-to-image", {
    input: {
      image_url: "https://fal.media/files/kangaroo/NbxqF1aWwEa3N9Fz9VzCg.jpeg",
      prompt: "make it blue",
      strength: 0.88,
    },
    logs: true
  });
  console.log(JSON.stringify(result, null, 2));
}

run().catch(console.error);
