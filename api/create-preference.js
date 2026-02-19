
import { MercadoPagoConfig, Preference } from 'mercadopago';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { title, unit_price, quantity } = req.body;

    const accessToken = process.env.MP_ACCESS_TOKEN;

    if (!accessToken) {
        console.error('CRITICAL: MP_ACCESS_TOKEN is missing in server environment');
        return res.status(500).json({ error: 'Server configuration error: Missing Access Token' });
    }

    const client = new MercadoPagoConfig({
        accessToken: accessToken
    });

    const preference = new Preference(client);

    try {
        const baseUrl = process.env.VITE_APP_URL || 'https://solemianutricion-m338.vercel.app';

        const result = await preference.create({
            body: {
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
            }
        });

        res.status(200).json({ id: result.id });
    } catch (error) {
        console.error('Error creating preference:', error);
        // Devolvemos el error real de MP si existe
        const mpError = error.cause || error;
        res.status(500).json({
            error: 'Failed to create preference',
            details: mpError.message || 'Unknown MP Error'
        });
    }
}
