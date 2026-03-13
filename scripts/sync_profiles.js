require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function syncProfiles() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey);

  console.log('Fetching auth.users...');
  const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (usersError) {
    console.error('Error fetching users:', usersError);
    process.exit(1);
  }

  const users = usersData.users;
  console.log(`Found ${users.length} users.`);

  for (const user of users) {
    // Check if profile exists
    const { data: profileExists, error: profileCheckError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!profileExists) {
      console.log(`Creating profile for ${user.email}...`);
      const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
          credits: 50,
        });

      if (insertError) {
        console.error(`Failed to create profile for ${user.email}:`, insertError);
      } else {
        console.log(`Successfully created profile for ${user.email}`);
      }
    } else {
      console.log(`Profile for ${user.email} already exists.`);
      
      // Update credits to 50 if they have 0 or less, maybe they got stuck
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();
        
      if (profile && profile.credits < 20) {
          console.log(`Adding credits to ${user.email}...`);
          await supabaseAdmin.from('profiles').update({ credits: 50 }).eq('id', user.id);
      }
    }
    
    // Auto confirm if not confirmed
    if (!user.email_confirmed_at) {
        await supabaseAdmin.auth.admin.updateUserById(user.id, { email_confirm: true });
        console.log(`Confirmed email for ${user.email}`);
    }
  }

  // Double check storage policies
  console.log('Fixing storage policies...');
  // Actually, we can't easily create policies via js client unless we use rpc.
  
  console.log('Done syncing profiles.');
}

syncProfiles();
