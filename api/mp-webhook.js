import { MercadoPagoConfig, Payment, PreApproval } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

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
    const webhookSecret = process.env.MP_WEBHOOK_SECRET;
    const client = new MercadoPagoConfig({ accessToken });

    // --- VERIFICACIÓN DE FIRMA (SECURITY P0) ---
    const xSignature = req.headers['x-signature'];
    const xRequestId = req.headers['x-request-id'];

    if (webhookSecret && xSignature && xRequestId) {
        try {
            const parts = xSignature.split(',');
            let ts = '';
            let v1 = '';

            parts.forEach(part => {
                const [key, value] = part.split('=');
                if (key === 'ts') ts = value;
                if (key === 'v1') v1 = value;
            });

            const manifest = `id:${data.id};request-id:${xRequestId};ts:${ts};`;
            const hmac = crypto.createHmac('sha256', webhookSecret);
            hmac.update(manifest);
            const sha = hmac.digest('hex');

            if (sha !== v1) {
                console.error('❌ Firma de webhook inválida');
                return res.status(401).json({ message: 'Invalid signature' });
            }
            console.log('✅ Firma de webhook verificada');
        } catch (err) {
            console.error('Error verificando firma:', err);
            // Seguir procesando si hay error técnico pero avisar
        }
    } else if (!webhookSecret) {
        console.warn('⚠️ MP_WEBHOOK_SECRET no configurado. Saltando verificación de firma.');
    }
    // -------------------------------------------

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
                const subscriptionId = subData.id; // El ID para cancelar después
                const reason = subData.reason || '';
                const isSemiannual = reason.toLowerCase().includes('semestral');

                // Calcular fecha de vencimiento con margen de gracia
                const daysToAdd = isSemiannual ? 185 : 32;
                const accessUntil = new Date();
                accessUntil.setDate(accessUntil.getDate() + daysToAdd);

                console.log(`Renovando suscripción (${isSemiannual ? 'Semestral' : 'Mensual'}) para usuario ${userId} (ID: ${subscriptionId})...`);

                const { error } = await supabaseAdmin
                    .from('tenants')
                    .update({
                        subscription_status: 'active',
                        subscription_id: subscriptionId, // Guardamos el ID de MP
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
