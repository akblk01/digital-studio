require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkCredits() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabaseAdmin = createClient(supabaseUrl, serviceKey);

  const { data: users, error: authError } = await supabaseAdmin.auth.admin.listUsers();
  console.log("Auth users:", users?.map(u => ({ id: u.id, email: u.email })));

  const { data: profiles, error: profError } = await supabaseAdmin.from('profiles').select('*');
  console.log("Profiles:", profiles);
}

checkCredits();
