require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function setInfiniteCredits() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey);

  console.log('Fetching all users from profiles table...');
  const { data: profiles, error: selectError } = await supabaseAdmin.from('profiles').select('id, email');
  
  if (selectError) {
    console.error('Error fetching profiles:', selectError);
    process.exit(1);
  }

  console.log(`Found ${profiles.length} profiles. Setting credits to 9999999...`);

  for (const profile of profiles) {
    console.log(`Updating ${profile.email || profile.id}...`);
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ credits: 9999999 })
      .eq('id', profile.id);

    if (updateError) {
      console.error(`Failed to update ${profile.email}:`, updateError);
    } else {
      console.log(`Success.`);
    }
  }

  console.log('All done!');
}

setInfiniteCredits();
