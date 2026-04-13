import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const manualUserId = process.env.NEXT_PUBLIC_MANUAL_PROFILE_ID;

if (!supabaseUrl || !supabaseKey || !manualUserId) {
  console.error('Error: Missing environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteAllTransactions() {
  console.log(`--- [CLEANUP] Starting deletion for user: ${manualUserId} ---`);
  
  const { count, error } = await supabase
    .from('transactions')
    .delete({ count: 'exact' })
    .eq('user_id', manualUserId);

  if (error) {
    console.error('CRITICAL ERROR DURING DELETION:', error);
    process.exit(1);
  }

  console.log(`--- [CLEANUP] Successfully deleted ${count} transactions. ---`);
  console.log('Database is now clean for re-testing.');
}

deleteAllTransactions().catch(console.error);
