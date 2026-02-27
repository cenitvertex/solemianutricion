/**
 * SCRIPT PARA CREAR PACIENTE FANTASMA (VALENTINA VEGA)
 * 🔬 Objetivo: Poblar la DB con datos realistas para la Demo 1:1.
 * 
 * Instrucciones:
 * 1. Asegúrate de tener las variables de entorno en tu .env o cámbialas aquí.
 * 2. Ejecuta: node create_demo_data.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); // Si usas dotenv

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const myTenantId = '83280f10-793e-4353-9054-2709d5735728'; // Tu ID Localizado

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDemo() {
    console.log('🚀 Iniciando creación de Paciente Demo...');

    // 1. Crear a Valentina Vega
    const { data: patient, error: pError } = await supabase
        .from('patients')
        .insert({
            tenant_id: myTenantId,
            name: 'Valentina Vega',
            phone: '+52 999 456 7890',
            is_active: true,
            allergies: ['Nueces', 'Lactosa'],
            expediente_url: 'https://ejemplo.com/expediente_valentina.pdf',
            objective_and_params: 'Reducción de grasa visceral y control de inflamación por sensibilidad a lactosa.'
        })
        .select()
        .single();

    if (pError) {
        console.error('❌ Error creando paciente:', pError.message);
        return;
    }

    console.log('✅ Valentina Vega creada.');

    // 2. Crear Historial de Logs (La Caja Negra)
    const logs = [
        {
            patient_id: patient.id,
            user_intention: 'Estoy en una boda y hay buffet de postres, ¿puedo comer algo?',
            bot_response: 'Valentina, recuerda que estamos cuidando el pico de insulina. Elige la fruta fresca o el mousse de frutos rojos (sin chocolate). Evita el pastel de bodas por hoy.',
            input_type: 'text',
            created_at: new Date(Date.now() - 86400000 * 2).toISOString() // Hace 2 días
        },
        {
            patient_id: patient.id,
            user_intention: 'Me dio un atascón de pizza anoche, me siento fatal y culpable.',
            bot_response: 'No te juzgo, Valentina. Lo importante es no abandonar. Bebe 2 litros de agua hoy y sigue con el desayuno proteico que te marcó tu nutriólogo.',
            input_type: 'text',
            created_at: new Date(Date.now() - 86400000).toISOString() // Ayer
        }
    ];

    const { error: lError } = await supabase
        .from('recommendation_logs')
        .insert(logs);

    if (lError) console.error('❌ Error logs:', lError.message);
    else console.log('✅ Logs de la Caja Negra activados.');

    console.log('\n✨ TODO LISTO PARA TU DEMO 1:1 ✨');
}

if (myTenantId === 'TU_USER_ID_AQUÍ') {
    console.error('⚠️ POR FAVOR, EDITA EL SCRIPT Y PON TU USER_ID (TENANT_ID) ⚠️');
} else {
    setupDemo();
}
