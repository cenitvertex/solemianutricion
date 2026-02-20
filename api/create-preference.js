import { MercadoPagoConfig, Preference, PreApproval } from 'mercadopago';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { title, unit_price, quantity, type, userId } = req.body;
    const accessToken = process.env.MP_ACCESS_TOKEN;

    if (!accessToken) {
        return res.status(500).json({ error: 'Configuración faltante: MP_ACCESS_TOKEN' });
    }

    const client = new MercadoPagoConfig({ accessToken });
    const baseUrl = process.env.VITE_APP_URL || 'https://solemianutricion-m338.vercel.app';

    try {
        // En todas las preferencias inyectamos el userId como external_reference
        // Esto permite a Mercado Pago avisarnos qué usuario pagó.

        // 1. SUSCRIPCIONES (RECURRENTE: Mensual o Semestral)
        if (type === 'monthly' || type === 'founder_semiannual') {
            const isSemiannual = type === 'founder_semiannual';
            const frequency = isSemiannual ? 6 : 1;

            const preapproval = new PreApproval(client);
            const result = await preapproval.create({
                body: {
                    reason: title || (isSemiannual ? 'Suscripción Semestral Solemia' : 'Suscripción Mensual Solemia'),
                    external_reference: userId, // Vínculo con el usuario
                    auto_recurring: {
                        frequency: frequency,
                        frequency_type: 'months',
                        transaction_amount: Number(unit_price),
                        currency_id: 'MXN'
                    },
                    back_url: `${baseUrl}/app`, // Regresa al Dashboard
                    status: 'pending',
                    payer_email: 'cliente@ejemplo.com',
                }
            });

            return res.status(200).json({
                id: result.id,
                init_point: result.init_point,
                type: 'subscription'
            });
        }

        // 2. PAGOS ÚNICOS (Semestral)
        const preference = new Preference(client);
        let preferenceBody = {
            external_reference: userId, // Vínculo con el usuario
            items: [{
                title: title || 'Plan Solemia',
                unit_price: Number(unit_price),
                quantity: Number(quantity) || 1,
                currency_id: 'MXN'
            }],
            back_urls: {
                success: `${baseUrl}/app`,
                failure: `${baseUrl}/app`,
                pending: `${baseUrl}/app`
            },
            auto_return: 'approved',
            metadata: {
                user_id: userId,
                plan_type: type
            }
        };

        const result = await preference.create({ body: preferenceBody });

        res.status(200).json({
            id: result.id,
            init_point: result.init_point,
            type: 'preference'
        });

    } catch (error) {
        console.error('SERVER ERROR MP:', error);
        // Devolvemos el mensaje de error mas limpio
        const errorDetail = error.message || 'Error desconocido en Mercado Pago';
        res.status(500).json({
            error: 'Mercado Pago Error',
            details: errorDetail
        });
    }
}
