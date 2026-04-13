import { createClient } from '../src/lib/supabase';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkTagsSchema() {
    console.log('--- TAGS SCHEMA CHECK V2 ---');
    const supabase = createClient();
    
    // Try to select specifically
    const { data, error } = await supabase
        .from('tags')
        .select('id, name, color, metadata')
        .limit(1);
    
    if (error) {
        console.error('Tags Error (Detailed):', JSON.stringify(error, null, 2));
    } else {
        console.log('Tags columns verified successfully!');
    }
}

checkTagsSchema().catch(console.error);
