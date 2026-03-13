require('dotenv').config({ path: '.env.local' });

const FASHN_API_BASE = 'https://api.fashn.ai/v1';
const API_KEY = process.env.FASHN_API_KEY;

async function testFashn() {
  console.log('Testing FASHN.ai API connection...');
  console.log('API Key:', API_KEY ? `${API_KEY.slice(0, 10)}...` : 'MISSING');

  try {
    // Just test with a simple product image (unsplash t-shirt)
    const res = await fetch(`${FASHN_API_BASE}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model_name: 'product-to-model',
        inputs: {
          product_image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000',
          prompt: 'beautiful female model, minimal studio background, fashion editorial',
          num_images: 1,
          aspect_ratio: '3:4',
          resolution: '1k',
          output_format: 'jpeg',
        }
      })
    });

    const data = await res.json();
    console.log('Submit response:', JSON.stringify(data, null, 2));

    if (!res.ok) {
      console.error('API Error:', data);
      return;
    }

    const predictionId = data.id;
    console.log('Prediction ID:', predictionId);
    console.log('Polling for result...');

    // Poll
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 3000));
      const statusRes = await fetch(`${FASHN_API_BASE}/status/${predictionId}`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
      });
      const statusData = await statusRes.json();
      console.log(`Poll ${i + 1}: status=${statusData.status}`);

      if (statusData.status === 'completed') {
        console.log('SUCCESS! Output URLs:', statusData.output);
        return;
      }
      if (statusData.status === 'failed') {
        console.error('FAILED:', statusData.error);
        return;
      }
    }
    console.log('Timeout after 3 minutes');
  } catch (err) {
    console.error('Error:', err);
  }
}

testFashn();
