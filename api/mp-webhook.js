import { MercadoPagoConfig, Payment, PreApproval } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

// Inicialización de Supabase con Service Role para bypass de RLS en el server
const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Necesaria para actualizar tenants sin sesión de usuario
);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { type, data, action } = req.body;
    const accessToken = process.env.MP_ACCESS_TOKEN;
    const client = new MercadoPagoConfig({ accessToken });

    console.log('Webhook recibido:', { type, action, id: data?.id });

    try {
        // 1. Manejo de PAGOS ÚNICOS (Plan Semestral)
        if (type === 'payment') {
            const payment = new Payment(client);
            const paymentData = await payment.get({ id: data.id });

            if (paymentData.status === 'approved') {
                const userId = paymentData.external_reference;
                const planType = paymentData.metadata?.plan_type;

                if (!userId) {
                    console.error('Pago aprobado sin external_reference (userId)');
                    return res.status(200).send('OK'); // MP seguirá reintentando si enviamos 400
                }

                // Calcular fecha de vencimiento (180 días para semestral)
                const days = planType === 'founder_semiannual' ? 180 : 30;
                const accessUntil = new Date();
                accessUntil.setDate(accessUntil.getDate() + days);

                console.log(`Activando usuario ${userId} por ${days} días...`);

                const { error } = await supabaseAdmin
                    .from('tenants')
                    .update({
                        subscription_status: 'active',
                        access_until: accessUntil.toISOString(),
                        plan_type: planType || 'founder_semiannual'
                    })
                    .eq('id', userId);

                if (error) throw error;
            }
        }

        // 2. Manejo de SUSCRIPCIONES (PreApproval / Recurring)
        if (type === 'subscription_preapproval' || type === 'preapproval') {
            const preapproval = new PreApproval(client);
            const subData = await preapproval.get({ id: data.id });

            if (subData.status === 'authorized') {
                const userId = subData.external_reference;
                const reason = subData.reason || '';
                const isSemiannual = reason.toLowerCase().includes('semestral');

                // Calcular fecha de vencimiento con margen de gracia
                const daysToAdd = isSemiannual ? 185 : 32;
                const accessUntil = new Date();
                accessUntil.setDate(accessUntil.getDate() + daysToAdd);

                console.log(`Renovando suscripción (${isSemiannual ? 'Semestral' : 'Mensual'}) para usuario ${userId}...`);

                const { error } = await supabaseAdmin
                    .from('tenants')
                    .update({
                        subscription_status: 'active',
                        access_until: accessUntil.toISOString(),
                        plan_type: isSemiannual ? 'founder_semiannual' : 'monthly'
                    })
                    .eq('id', userId);

                if (error) throw error;
            }
        }

        return res.status(200).send('OK');

    } catch (error) {
        console.error('Error en Webhook:', error);
        // Respondemos 200 para evitar que MP nos bombardee con reintentos si el error es de lógica/DB
        // pero lo logueamos para debuggear.
        return res.status(200).send('Error internally logged');
    }
}
