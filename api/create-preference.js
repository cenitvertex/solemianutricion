import { MercadoPagoConfig, Preference } from 'mercadopago';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { title, unit_price, quantity, type } = req.body;
    const accessToken = process.env.MP_ACCESS_TOKEN;

    if (!accessToken) {
        return res.status(500).json({ error: 'Missing MP_ACCESS_TOKEN' });
    }

    const baseUrl = process.env.VITE_APP_URL || 'https://solemianutricion-m338.vercel.app';

    try {
        // 1. SUSCRIPCIÓN MENSUAL (Uso de fetch directo para evitar errores de SDK)
        if (type === 'monthly') {
            console.log("Iniciando creación de suscripción via API directa...");
            const mpResponse = await fetch('https://api.mercadopago.com/preapproval', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    reason: title || 'Suscripción Mensual Solemia',
                    auto_recurring: {
                        frequency: 1,
                        frequency_type: 'months',
                        transaction_amount: Number(unit_price),
                        currency_id: 'MXN'
                    },
                    payer_email: 'cliente_nuevo@solemia.com', // Email genérico para evitar conflictos de cuenta
                    back_url: `${baseUrl}/signup`,
                    status: 'pending'
                })
            });

            const result = await mpResponse.json();

            if (!mpResponse.ok) {
                console.error("Error directo de MP Preapproval:", result);
                return res.status(mpResponse.status).json({
                    error: 'Mercado Pago Error',
                    details: result.message || 'Error en validación de suscripción',
                    fullError: JSON.stringify(result)
                });
            }

            return res.status(200).json({
                id: result.id,
                init_point: result.init_point,
                type: 'subscription'
            });
        }

        // 2. PAGOS ÚNICOS (Contado y MSI)
        const client = new MercadoPagoConfig({ accessToken });
        const preference = new Preference(client);

        let preferenceBody = {
            items: [{
                title: title || 'Plan Solemia',
                unit_price: Number(unit_price),
                quantity: Number(quantity) || 1,
                currency_id: 'MXN'
            }],
            back_urls: {
                success: `${baseUrl}/signup`,
                failure: `${baseUrl}/#pricing`,
                pending: `${baseUrl}/#pricing`
            },
            auto_return: 'approved',
        };

        // Si es MSI, habilitamos explícitamente las cuotas
        if (type === 'founder_msi') {
            preferenceBody.payment_methods = {
                installments: 6,
                default_installments: 6
            };
        }

        const result = await preference.create({ body: preferenceBody });

        res.status(200).json({
            id: result.id,
            init_point: result.init_point,
            type: 'preference'
        });

    } catch (error) {
        console.error('CRITICAL SERVER ERROR:', error);
        res.status(500).json({
            error: 'Server Error',
            details: error.message
        });
    }
}
