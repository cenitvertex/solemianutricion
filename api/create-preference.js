import { MercadoPagoConfig, Preference, PreApproval } from 'mercadopago';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { title, unit_price, quantity, type } = req.body;

    const accessToken = process.env.MP_ACCESS_TOKEN;

    if (!accessToken) {
        console.error('CRITICAL: MP_ACCESS_TOKEN is missing in server environment');
        return res.status(500).json({ error: 'Server configuration error: Missing Access Token' });
    }

    // DEBUG LOG: Verificar el tipo de token sin exponerlo completo
    console.log(`Token Type Check: ${accessToken.substring(0, 8)}...`);

    const client = new MercadoPagoConfig({
        accessToken: accessToken
    });

    try {
        const baseUrl = process.env.VITE_APP_URL || 'https://solemianutricion-m338.vercel.app';

        // 1. Lógica para SUSCRIPCIÓN MENSUAL (RECURRENTE)
        if (type === 'monthly') {
            const preapproval = new PreApproval(client);
            // Intentamos crear la suscripción sin email forzado para que MP lo pida al usuario si es necesario
            const result = await preapproval.create({
                body: {
                    reason: title || 'Suscripción Mensual Solemia',
                    auto_recurring: {
                        frequency: 1,
                        frequency_type: 'months',
                        transaction_amount: Number(unit_price),
                        currency_id: 'MXN',
                    },
                    back_url: `${baseUrl}/signup`,
                    status: 'pending',
                    external_reference: 'solemia-monthly-recurring'
                }
            });

            console.log("Subscription created successfully:", result.id);
            return res.status(200).json({
                id: result.id,
                init_point: result.init_point,
                type: 'subscription'
            });
        }

        // 2. Lógica para PAGOS ÚNICOS (Contado y MSI)
        const preference = new Preference(client);
        let preferenceBody = {
            items: [
                {
                    title: title || 'Plan Solemia',
                    unit_price: Number(unit_price),
                    quantity: Number(quantity) || 1,
                    currency_id: 'MXN'
                }
            ],
            back_urls: {
                success: `${baseUrl}/signup`,
                failure: `${baseUrl}/#pricing`,
                pending: `${baseUrl}/#pricing`
            },
            auto_return: 'approved',
        };

        // Si es el plan de MSI, forzamos cuotas y excluimos otros medios
        if (type === 'founder_msi') {
            preferenceBody.payment_methods = {
                excluded_payment_types: [
                    { id: "ticket" },
                    { id: "atm" },
                    { id: "bank_transfer" }
                ],
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
        console.error('Mercado Pago Error Detail:', error);
        res.status(500).json({
            error: 'Mercado Pago Error',
            details: error.message || 'Unknown Error',
            fullError: JSON.stringify(error) // Enviamos más info al front para ver el problema real
        });
    }
}
