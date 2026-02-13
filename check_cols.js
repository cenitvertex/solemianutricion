import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = {};
const envFile = fs.readFileSync('.env', 'utf8');
envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function checkColumns() {
    const { data, error } = await supabase.from('patients').select('*').limit(1);
    if (error) {
        console.error('Error:', error);
        return;
    }
    if (data && data.length > 0) {
        console.log('--- Columns in "patients" table ---');
        console.log(Object.keys(data[0]));
    } else {
        console.log('No data in "patients" table to infer columns.');
        // Try another approach
        const { data: cols } = await supabase.from('patients').select().limit(0);
        console.log('Columns from limit 0:', cols);
    }
}

checkColumns();
