import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShieldCheck,
    Brain,
    TrendingUp,
    Target,
    Zap,
    Heart,
    ArrowRight,
    CheckCircle2,
    Lock,
    MessageSquare
} from 'lucide-react';
import PricingCard from '../components/PricingCard';
import logo from '../assets/logo.png';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { supabase } from '../lib/supabase';

export default function LandingPage() {
    const navigate = useNavigate();
    const [session, setSession] = React.useState(null);

    React.useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const mpKey = import.meta.env.VITE_MP_PUBLIC_KEY;
        if (mpKey) {
            initMercadoPago(mpKey);
            console.log("Mercado Pago Initialized with:", mpKey);
        } else {
            console.warn("Mercado Pago Public Key is missing!");
        }
    }, []);

    const featuresMonthly = [
        "Hasta 30 pacientes activos",
        "Dashboard de Honestidad",
        "Análisis de IA Clínica",
        "Soporte Multiformato (PDF/IMG)",
        "Consultas Ilimitadas"
    ];

    const featuresFounderCash = [
        ...featuresMonthly,
        "Máximo Ahorro Directo ($3,094)",
        "Directorio SEO Solemia Premium",
        "Acceso Prioritario a Funciones Beta",
        "Soporte Concierge 24/7"
    ];

    const featuresFounderMSI = [
        ...featuresMonthly,
        "Opción de 3 o 6 Meses Sin Intereses",
        "Directorio SEO Solemia Premium",
        "Garantía de Satisfacción Blindada",
        "Soporte Prioritario"
    ];

    const [preferenceId, setPreferenceId] = React.useState(null);

    const handleMP = async (plan) => {
        const planDetails = {
            monthly: { title: "Solemia Plan Mensual", price: 1349 },
            founder_cash: { title: "Solemia Pase Fundador (Contado)", price: 5000 },
            founder_msi: { title: "Solemia Pase Fundador (MSI)", price: 5500 }
        };

        const selectedPlan = planDetails[plan];
        const mpKey = import.meta.env.VITE_MP_PUBLIC_KEY;

        if (!mpKey) {
            console.error("CRITICAL: VITE_MP_PUBLIC_KEY is not defined in the environment.");
            alert("Error de configuración: No se encontró la llave pública de Mercado Pago.");
            return;
        }

        try {
            console.log(`Iniciando pago para plan: ${plan}...`);
            const response = await fetch('/api/create-preference', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: selectedPlan.title,
                    unit_price: selectedPlan.price,
                    quantity: 1,
                    type: plan // Enviamos el tipo de plan (monthly, founder_cash, founder_msi)
                })
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Error API (${response.status}): ${errorBody}`);
            }

            const data = await response.json();
            console.log("Cobro iniciado con éxito:", data.id);

            if (data.id) {
                // Si es suscripción (monthly), usamos redirección directa al init_point
                if (plan === 'monthly' && data.init_point) {
                    window.location.href = data.init_point;
                    return;
                }

                if (window.MercadoPago) {
                    const mp = new window.MercadoPago(mpKey, {
                        locale: 'es-MX'
                    });
                    mp.checkout({
                        preference: { id: data.id },
                        autoOpen: true
                    });
                } else {
                    console.error("SDK de Mercado Pago no cargado en window.");
                    alert("El sistema de pagos no se cargó correctamente. Por favor, refresca la página.");
                }
            } else {
                throw new Error("La respuesta de la API no contiene un ID de transacción.");
            }
        } catch (error) {
            console.error("Error al procesar el pago:", error);
            // Intentamos extraer el detalle técnico si viene de nuestra API
            let detailMsg = error.message;
            try {
                // Si el error tiene formato JSON (enviado por nuestra API)
                if (error.message.includes('{')) {
                    const parsed = JSON.parse(error.message.split('): ')[1]);
                    detailMsg = parsed.details || parsed.fullError || error.message;
                }
            } catch (e) { }
            alert(`No se pudo iniciar el pago: ${detailMsg}`);
        }
    };

    return (
        <div className="layout-dashboard" style={{ overflowX: 'hidden' }}>
            {/* Navbar Minimalista */}
            <nav style={{
                padding: '1.5rem 3rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'absolute',
                width: '100%',
                zIndex: 10
            }}>
                <img src={logo} alt="Solemia" style={{ height: '32px' }} />
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <button onClick={() => navigate(session ? '/app' : '/login')} className="btn-outline" style={{ background: 'transparent', fontWeight: '700' }}>
                        {session ? 'Ir a mi Dashboard' : 'Iniciar Sesión'}
                    </button>
                    <button onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })} className="btn btn-primary">
                        Empezar Ahora
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                padding: '6rem 0'
            }}>
                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ maxWidth: '750px' }}>
                        <div className="text-detail" style={{ color: 'var(--solemia-pink)', marginBottom: '1rem', display: 'block' }}>
                            REVOLUCIÓN EN ADHERENCIA NUTRICIONAL
                        </div>
                        <h1 style={{ fontSize: '4.5rem', lineHeight: '1.1', marginBottom: '1.5rem', color: 'var(--solemia-plum)' }}>
                            Nutrición con <span style={{ color: 'var(--solemia-pink)' }}>Adherencia</span> sin Juicios.
                        </h1>
                        <p style={{ fontSize: '1.25rem', color: 'var(--solemia-charcoal)', opacity: 0.8, marginBottom: '2.5rem', maxWidth: '600px' }}>
                            Solemia Nutri-Pal es el cómplice inteligente que guía a tus pacientes en sus momentos críticos, eliminando la culpa y elevando tus resultados clínicos.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
                                className="btn btn-primary"
                                style={{ padding: '1.25rem 3rem', fontSize: '14px' }}
                            >
                                Ver Planes de Lanzamiento <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Abstract Background Element */}
                <div style={{
                    position: 'absolute',
                    right: '-10%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '60%',
                    height: '80%',
                    background: 'var(--solemia-gradient)',
                    borderRadius: '100px 0 0 100px',
                    opacity: 0.05,
                    zIndex: 1
                }} />
            </section>

            {/* El Problema Section */}
            <section style={{ padding: '8rem 0', background: '#fff' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 5rem' }}>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>El "Abandono por Culpa" detiene tu crecimiento.</h2>
                        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                            El 40% de los pacientes abandonan su tratamiento porque se sienten solos o juzgados ante un fallo. Entre consulta y consulta, el paciente está a la deriva.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
                        <div className="card-premium">
                            <TrendingUp size={40} color="var(--solemia-pink)" style={{ marginBottom: '1.5rem' }} />
                            <h3 style={{ marginBottom: '1rem' }}>Autoridad Blindada</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Conviértete en el experto que siempre está ahí, sin tener que trabajar fines de semana. Tu IA nunca descansa.</p>
                        </div>
                        <div className="card-premium">
                            <ShieldCheck size={40} color="var(--solemia-pink)" style={{ marginBottom: '1.5rem' }} />
                            <h3 style={{ marginBottom: '1rem' }}>Precisión Quirúrgica</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Accede a la "Caja Negra" clínica. Datos reales sobre lo que tus pacientes realmente comen y sienten tras la puerta.</p>
                        </div>
                        <div className="card-premium">
                            <Zap size={40} color="var(--solemia-pink)" style={{ marginBottom: '1.5rem' }} />
                            <h3 style={{ marginBottom: '1rem' }}>Rentabilidad Directa</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Justifica un aumento de honorarios del 20-30% ofreciendo un acompañamiento tecnológico de élite.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* IA Comparison Section */}
            <section style={{ padding: '8rem 0', background: 'var(--solemia-bg)' }}>
                <div className="container">
                    <div className="card-premium" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '4rem', alignItems: 'center', padding: '4rem' }}>
                        <div>
                            <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>¿Por qué no usar ChatGPT?</h2>
                            <ul style={{ listStyle: 'none' }}>
                                <li style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                                    <div style={{ background: '#fee2e2', padding: '10px', borderRadius: '12px', height: 'fit-content' }}>
                                        <Lock size={20} color="#dc2626" />
                                    </div>
                                    <div>
                                        <h4 style={{ marginBottom: '0.5rem' }}>Privacidad y Contexto Clínico</h4>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>ChatGPT no conoce tu plan específico. Solemia actúa bajo TUS reglas y protocolos, protegiendo tu ética profesional.</p>
                                    </div>
                                </li>
                                <li style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                                    <div style={{ background: '#f0f4ff', padding: '10px', borderRadius: '12px', height: 'fit-content' }}>
                                        <Brain size={20} color="#3b82f6" />
                                    </div>
                                    <div>
                                        <h4 style={{ marginBottom: '0.5rem' }}>Cero Alucinaciones</h4>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Nuestra IA está configurada para ser conservadora y referir al paciente contigo ante cualquier duda crítica.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                background: 'var(--solemia-gradient)',
                                padding: '3rem',
                                borderRadius: '3rem',
                                color: 'white',
                                boxShadow: '0 30px 60px -15px rgba(77, 12, 48, 0.3)'
                            }}>
                                <MessageSquare size={32} style={{ marginBottom: '1.5rem', opacity: 0.8 }} />
                                <p style={{ fontSize: '1.5rem', fontStyle: 'italic', lineHeight: '1.4' }}>
                                    "La IA genérica te hace ver amateur. Solemia te posiciona como una clínica de vanguardia."
                                </p>
                                <div style={{ marginTop: '2rem', fontWeight: '900', fontSize: '0.9rem', opacity: 0.8 }}>
                                    — SOLEMIA CORE PRINCIPLE
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" style={{ padding: '8rem 0', background: '#fff' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 5rem' }}>
                        <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Elige tu nivel de impacto.</h2>
                        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                            Únete al Pioneer Group y transforma tu clínica con tecnología de vanguardia.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                        <PricingCard
                            title="Suscripción Mensual"
                            price="$1,349"
                            period="MXN / mes"
                            features={featuresMonthly}
                            buttonText="Empezar Ahora"
                            onAction={() => handleMP('monthly')}
                        />
                        <PricingCard
                            title="Fundador (Contado)"
                            price="$5,000"
                            period="MXN / semestre"
                            highlight="La Opción Más Rentable"
                            features={featuresFounderCash}
                            isPopular={true}
                            buttonText="Obtener Promo Contado"
                            onAction={() => handleMP('founder_cash')}
                        />
                        <PricingCard
                            title="Fundador (MSI)"
                            price="$5,500"
                            period="MXN / semestre"
                            features={featuresFounderMSI}
                            buttonText="Pagar en Mensualidades"
                            onAction={() => handleMP('founder_msi')}
                        />
                    </div>
                </div>
            </section>

            {/* Garantía Section */}
            <section style={{ padding: '8rem 0', background: 'var(--solemia-charcoal)', color: 'white', textAlign: 'center' }}>
                <div className="container">
                    <div className="glass" style={{ padding: '4rem', maxWidth: '900px', margin: '0 auto', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Heart size={48} color="var(--solemia-pink)" style={{ marginBottom: '2rem' }} />
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'white' }}>Garantía Blindada</h2>
                        <p style={{ fontSize: '1.25rem', opacity: 0.8, marginBottom: '2.5rem', lineHeight: '1.8' }}>
                            "Úsalo con tus pacientes más difíciles por 15 días. Si no sientes que tienes más control sobre sus resultados y que ellos se sienten 10x más apoyados, te devolvemos el 100% de tu inversión."
                        </p>
                        <button
                            onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
                            className="btn btn-primary"
                            style={{ padding: '1.25rem 3rem' }}
                        >
                            Probar Solemia Sin Riesgo
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer Minimalista */}
            <footer style={{ padding: '4rem 0', background: 'var(--solemia-bg)', textAlign: 'center' }}>
                <div className="container">
                    <img src={logo} alt="Solemia" style={{ height: '24px', opacity: 0.5, marginBottom: '2rem' }} />
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        © {new Date().getFullYear()} Solemia Nutrición. v1.0.2 - Premium Health Technology.
                    </p>
                </div>
            </footer>
        </div>
    );
}
