import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { userId } = req.body;
    const accessToken = process.env.MP_ACCESS_TOKEN;

    if (!userId) {
        return res.status(400).json({ error: 'userId es requerido' });
    }

    if (!accessToken) {
        return res.status(500).json({ error: 'Configuración de Mercado Pago faltante' });
    }

    try {
        const client = new MercadoPagoConfig({ accessToken });
        const preapproval = new PreApproval(client);

        // 1. Obtener el subscription_id de la base de datos
        const { data: tenant, error: fetchError } = await supabaseAdmin
            .from('tenants')
            .select('subscription_id, plan_type')
            .eq('id', userId)
            .single();

        if (fetchError || !tenant) {
            throw new Error('No se encontró información del tenant o la suscripción.');
        }

        if (!tenant.subscription_id) {
            // Si no hay ID, es probable que sea un pago único o plan manual
            return res.status(400).json({ error: 'No se encontró una suscripción activa para cancelar.' });
        }

        // 2. Cancelar en Mercado Pago
        // Según la documentación de MP, para cancelar se actualiza el status a 'cancelled'
        await preapproval.update({
            id: tenant.subscription_id,
            body: {
                status: 'cancelled'
            }
        });

        // 3. Actualizar estado en Supabase
        const { error: updateError } = await supabaseAdmin
            .from('tenants')
            .update({
                subscription_status: 'cancelled'
                // NOTA: No tocamos access_until, el usuario sigue teniendo acceso hasta que venza.
            })
            .eq('id', userId);

        if (updateError) throw updateError;

        return res.status(200).json({ message: 'Suscripción cancelada exitosamente. El acceso se mantendrá hasta la fecha de caducidad.' });

    } catch (error) {
        console.error('Error al cancelar suscripción:', error);
        return res.status(500).json({
            error: 'Error al procesar la cancelación',
            details: error.message
        });
    }
}
