import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'URL_AQUI';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'KEY_AQUI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUrls() {
    const { data, error } = await supabase.from('patients').select('name, expediente_url, plan_url').limit(5);
    console.log('Error:', error);
    console.log('Data:', JSON.stringify(data, null, 2));
}

checkUrls();
