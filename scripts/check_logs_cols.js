import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = {};
const envFile = fs.readFileSync('.env', 'utf8');
envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function checkCols() {
    const { data: logRow } = await supabase.from('recommendation_logs').select('*').limit(1);
    console.log('--- Columns in "recommendation_logs" ---');
    console.log(Object.keys(logRow?.[0] || {}));
}

checkCols();
