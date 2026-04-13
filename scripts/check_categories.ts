import { createClient } from '../src/lib/supabase';
import * as dotenv from 'dotenv';
dotenv.config();

async function checkCategories() {
    const supabase = createClient();
    const { data: categories, error } = await supabase.from('categories').select('*');
    if (error) {
        console.error(error);
        return;
    }
    console.log('CATEGORIES:', JSON.stringify(categories, null, 2));
}

checkCategories();
