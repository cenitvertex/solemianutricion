import { MercadoPagoConfig, Preference, PreApproval } from 'mercadopago';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { title, unit_price, quantity, type } = req.body;
    const accessToken = process.env.MP_ACCESS_TOKEN;

    if (!accessToken) {
        return res.status(500).json({ error: 'Configuración faltante: MP_ACCESS_TOKEN' });
    }

    const client = new MercadoPagoConfig({ accessToken });
    const baseUrl = process.env.VITE_APP_URL || 'https://solemianutricion-m338.vercel.app';

    try {
        // 1. SUSCRIPCIÓN MENSUAL (RECURRENTE)
        if (type === 'monthly') {
            const preapproval = new PreApproval(client);
            const result = await preapproval.create({
                body: {
                    reason: title || 'Suscripción Mensual Solemia',
                    auto_recurring: {
                        frequency: 1,
                        frequency_type: 'months',
                        transaction_amount: Number(unit_price),
                        currency_id: 'MXN'
                    },
                    back_url: `${baseUrl}/signup`,
                    status: 'pending',
                    // En Sandbox de MP, el payer_email debe ser de un USUARIO DE PRUEBA 
                    // creado en el panel de desarrolladores.
                    payer_email: 'test_user_123@testuser.com'
                }
            });

            return res.status(200).json({
                id: result.id,
                init_point: result.init_point,
                type: 'subscription'
            });
        }

        // 2. PAGOS ÚNICOS (Contado y MSI)
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

        // Configuración de MSI para México
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
        console.error('SERVER ERROR MP:', error);
        // Devolvemos el mensaje de error mas limpio
        const errorDetail = error.message || 'Error desconocido en Mercado Pago';
        res.status(500).json({
            error: 'Mercado Pago Error',
            details: errorDetail
        });
    }
}
