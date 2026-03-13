require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function confirmUsers() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey);

  console.log('Fetching users...');
  
  // Try using admin api
  const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (usersError) {
    console.error('Error fetching users:', usersError);
    process.exit(1);
  }

  const users = usersData.users;

  let count = 0;
  for (const user of users) {
    if (!user.email_confirmed_at) {
       console.log(`Confirming email for ${user.email}...`);
       const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
         email_confirm: true
       });
       if (error) {
         console.error(`Failed to confirm ${user.email}:`, error);
       } else {
         console.log(`Successfully confirmed ${user.email}`);
         count++;
       }
    }
  }

  console.log(`Finished. Confirmed ${count} users.`);
}

confirmUsers();
