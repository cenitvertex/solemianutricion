
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manually parse .env
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Error: Supabase credentials missing in .env file.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyConnection() {
    console.log('--- Verifying Supabase Connectivity ---');
    console.log(`URL: ${supabaseUrl}`);

    // 1. Check Auth (Session)
    try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        console.log('✅ Auth Service: Accessible');
    } catch (e) {
        console.error('❌ Auth Service:', e.message);
    }

    // 2. Check Tables
    const tables = ['tenants', 'patients', 'recommendation_logs'];
    for (const table of tables) {
        try {
            const { data, error, count } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (error) {
                console.error(`❌ Table "${table}": Access error - ${error.message}`);
            } else {
                console.log(`✅ Table "${table}": Accessible (Approx. ${count} rows)`);
            }
        } catch (e) {
            console.error(`❌ Table "${table}": Unexpected error - ${e.message}`);
        }
    }

    // 3. Storage Bucket Creation/Check
    try {
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        if (listError) throw listError;

        const docBucket = buckets.find(b => b.name === 'documents');
        if (docBucket) {
            console.log('✅ Storage Bucket "documents": Found');
        } else {
            console.log('🏗️ Storage Bucket "documents": Missing. Attempting to create...');
            const { error: createError } = await supabase.storage.createBucket('documents', {
                public: true,
                allowedMimeTypes: ['application/pdf'],
                fileSizeLimit: 5242880 // 5MB
            });
            if (createError) {
                console.error('❌ Storage Bucket: Creation failed -', createError.message);
                console.log('Available buckets:', buckets.map(b => b.name).join(', '));
            } else {
                console.log('✅ Storage Bucket "documents": Created successfully');
            }
        }
    } catch (e) {
        console.error('❌ Storage Service:', e.message);
    }

    // 4. Data Seeding (Optional verification of write access)
    console.log('\n--- Checking Data Seeding ---');
    try {
        const tenantsJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'tenants_rows.json'), 'utf8'));
        const patientsJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'patients_rows.json'), 'utf8'));

        const { data: existingTenants } = await supabase.from('tenants').select('id');
        if (existingTenants.length === 0 && tenantsJson.length > 0) {
            console.log('🌱 Seeding tenants...');
            const { error: tErr } = await supabase.from('tenants').insert(tenantsJson);
            if (tErr) console.error('❌ Tenant seeding error:', tErr.message);
            else console.log('✅ Tenants seeded');
        } else {
            console.log('⏭️ Skipping tenant seeding (Already has data or no backup found)');
        }

        const { data: existingPatients } = await supabase.from('patients').select('id');
        if (existingPatients.length === 0 && patientsJson.length > 0) {
            console.log('🌱 Seeding patients...');
            const fixedPatients = patientsJson.map(p => ({
                ...p,
                allergies: typeof p.allergies === 'string' ? JSON.parse(p.allergies) : p.allergies
            }));
            const { error: pErr } = await supabase.from('patients').insert(fixedPatients);
            if (pErr) console.error('❌ Patient seeding error:', pErr.message);
            else console.log('✅ Patients seeded');
        } else {
            console.log('⏭️ Skipping patient seeding (Already has data or no backup found)');
        }
    } catch (e) {
        console.error('❌ Data Seeding:', e.message);
    }

    console.log('--- Verification Complete ---');
}

verifyConnection();
