
import { MercadoPagoConfig, Preference } from 'mercadopago';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { title, unit_price, quantity } = req.body;

    const client = new MercadoPagoConfig({
        accessToken: process.env.MP_ACCESS_TOKEN
    });

    const preference = new Preference(client);

    try {
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
                    success: `${process.env.VITE_APP_URL || 'http://localhost:5173'}/signup`,
                    failure: `${process.env.VITE_APP_URL || 'http://localhost:5173'}/#pricing`,
                    pending: `${process.env.VITE_APP_URL || 'http://localhost:5173'}/#pricing`
                },
                auto_return: 'approved',
            }
        });

        res.status(200).json({ id: result.id });
    } catch (error) {
        console.error('Error creating preference:', error);
        res.status(500).json({ error: 'Failed to create preference' });
    }
}
