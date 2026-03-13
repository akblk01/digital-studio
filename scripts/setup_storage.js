require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function setupStorage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey);

  console.log('Checking storage buckets...');
  
  const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
  
  if (bucketsError) {
    console.error('Error fetching buckets:', bucketsError);
    process.exit(1);
  }

  const bucketExists = buckets.find(b => b.name === 'product-images');

  if (!bucketExists) {
    console.log('Creating "product-images" bucket...');
    const { data, error } = await supabaseAdmin.storage.createBucket('product-images', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
    });

    if (error) {
       console.error('Failed to create bucket:', error);
    } else {
       console.log('Bucket "product-images" created successfully.');
    }
  } else {
    console.log('Bucket "product-images" already exists.');
    
    // update to make sure it's public
    await supabaseAdmin.storage.updateBucket('product-images', {
      public: true,
      fileSizeLimit: 10485760,
    });
    console.log('Bucket updated to ensure it is public.');
  }

  console.log('Finished storage setup.');
}

setupStorage();
