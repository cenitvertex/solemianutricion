
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
    MessageSquare,
    Menu,
    X
} from 'lucide-react';
import PricingCard from '../components/ui/PricingCard';
import logo from '../assets/logo.png';
import LegalModal from '../components/modals/LegalModal';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { supabase } from '../lib/supabase';
import {
    PrivacyPolicyContent,
    TermsAndConditionsContent,
    DataAndAIPolicyContent,
    CookiesPolicyContent
} from '../content/legal';

export default function LandingPage() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = React.useState(false);
    const [session, setSession] = React.useState(null);
    const [isLegalModalOpen, setIsLegalModalOpen] = React.useState(false);
    const [legalModalTitle, setLegalModalTitle] = React.useState('');
    const [legalModalContent, setLegalModalContent] = React.useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    const openLegalModal = (title, contentComp) => {
        setLegalModalTitle(title);
        setLegalModalContent(contentComp);
        setIsLegalModalOpen(true);
    };

    React.useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);

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

        // Intersection Observer for Reveal Animations
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, observerOptions);

        const revealElements = document.querySelectorAll('.reveal');
        revealElements.forEach(el => observer.observe(el));

        return () => {
            window.removeEventListener('scroll', handleScroll);
            revealElements.forEach(el => observer.unobserve(el));
        };
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


    const [preferenceId, setPreferenceId] = React.useState(null);

    const handleMP = async (plan) => {
        const planDetails = {
            monthly: { title: "Solemia Plan Mensual", price: 1349 },
            founder_cash: { title: "Solemia Pase Fundador (Contado)", price: 5000 }
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
                throw new Error(`Error API(${response.status}): ${errorBody} `);
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
            alert(`No se pudo iniciar el pago: ${detailMsg} `);
        }
    };

    return (
        <div className="layout-dashboard" style={{ overflowX: 'hidden', position: 'relative', background: 'transparent', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div className="bg-atmosphere-fixed"></div>
            {/* Navbar Minimalista */}
            <nav
                className={scrolled ? 'nav-sticky' : ''}
                style={{
                    padding: '1.5rem clamp(1rem, 4vw, 3rem)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    zIndex: 100,
                    transition: 'all 0.3s ease'
                }}
            >
                <img src={logo} alt="Solemia Logo" style={{ height: '32px', cursor: 'pointer' }} onClick={() => navigate('/')} />
                {/* Desktop Nav */}
                <div className="hide-mobile" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <button onClick={() => navigate(session ? '/app' : '/login')} className="btn-outline" style={{ background: 'transparent', fontWeight: '700' }}>
                        {session ? 'Ir a mi Dashboard' : 'Iniciar Sesión'}
                    </button>
                    <button onClick={() => navigate('/signup')} className="btn btn-primary shadow-lg" style={{ width: 'auto' }}>
                        Empezar Ahora
                    </button>
                </div>
                {/* Mobile Hamburger */}
                <button
                    className="show-mobile-only"
                    onClick={() => setMobileMenuOpen(true)}
                    style={{
                        display: 'none',
                        background: 'rgba(77, 12, 48, 0.08)',
                        border: 'none',
                        borderRadius: '14px',
                        width: '44px',
                        height: '44px',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'var(--solemia-plum)'
                    }}
                >
                    <Menu size={22} />
                </button>
            </nav>

            {/* Mobile Menu Panel */}
            {mobileMenuOpen && (
                <>
                    <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)} />
                    <div className="mobile-menu-panel">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <img src={logo} alt="Solemia" style={{ height: '28px' }} />
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--solemia-charcoal)', padding: '8px' }}
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                            <button
                                onClick={() => { setMobileMenuOpen(false); navigate(session ? '/app' : '/login'); }}
                                className="btn btn-outline"
                                style={{ width: '100%', justifyContent: 'center', borderRadius: '1rem', background: '#f8f8f8' }}
                            >
                                {session ? 'Ir a mi Dashboard' : 'Iniciar Sesión'}
                            </button>
                            <button
                                onClick={() => { setMobileMenuOpen(false); navigate('/signup'); }}
                                className="btn btn-primary"
                                style={{ width: '100%', justifyContent: 'center', borderRadius: '1rem' }}
                            >
                                Empezar Ahora <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Inline style for mobile burger visibility */}
            <style>{`
                @media (max-width: 768px) {
                    .show-mobile-only { display: flex !important; }
                }
            `}</style>

            {/* Hero Section */}
            <section style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                padding: 'clamp(6rem, 12vw, 8rem) 0 clamp(2rem, 4vw, 4rem)'
            }}>
                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto' }} className="reveal">
                        <div className="text-detail" style={{ color: 'var(--solemia-pink)', marginBottom: '1.5rem', display: 'block', letterSpacing: '3px', fontWeight: '900' }}>
                            ELEVATED CLINICAL INTELLIGENCE
                        </div>
                        <h1 className="landing-hero-title" style={{ fontSize: 'clamp(3.5rem, 10vw, 5.5rem)', lineHeight: '1.0', marginBottom: '2rem', color: 'var(--solemia-plum)', letterSpacing: '-0.05em' }}>
                            Nutrición con <span style={{ color: 'var(--solemia-pink)' }}>Adherencia</span><br />sin Juicios.
                        </h1>
                        <p className="landing-hero-subtitle" style={{ fontSize: '1.4rem', color: 'var(--solemia-charcoal)', opacity: 0.7, marginBottom: '3.5rem', maxWidth: '700px', margin: '0 auto 3.5rem', lineHeight: '1.5' }}>
                            El cómplice inteligente que transforma la "Caja Negra" nutricional en resultados clínicos predecibles.
                        </p>
                        <div className="landing-hero-cta" style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                            <button
                                onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
                                className="btn btn-primary"
                                style={{ padding: '1.5rem 4rem', fontSize: '16px' }}
                            >
                                Empezar Ahora <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bento Grid Showcase */}
            <section style={{ padding: 'clamp(4rem, 10vw, 10rem) 0', background: 'transparent' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 6rem' }} className="reveal">
                        <h2 className="landing-section-title" style={{ fontSize: '3.5rem', marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>El Abandono se detiene aquí.</h2>
                        <p className="landing-section-subtitle" style={{ fontSize: '1.2rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                            Elimina la intermitencia clínica. Tu IA siempre está presente, capturando datos reales y brindando apoyo sin juicios cuando tus pacientes más lo necesitan.
                        </p>
                    </div>

                    <div className="bento-grid">
                        <div className="card-premium bento-card bento-card-lg reveal" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)' }}>
                            <div style={{ maxWidth: '400px' }}>
                                <ShieldCheck size={48} color="var(--solemia-pink)" style={{ marginBottom: '2rem' }} />
                                <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Inteligencia Clínica Profunda</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                                    Accede a la "Caja Negra" clínica. Descubre qué sienten y qué comen realmente tus pacientes entre consulta y consulta.
                                </p>
                            </div>
                            {/* Graphic Placeholder (Circle with gradient) */}
                            <div className="bento-blob-animate bento-blob-hide-mobile" style={{ position: 'absolute', right: '-10%', bottom: '-10%', width: '300px', height: '300px', background: 'var(--solemia-gradient)', borderRadius: '50%', filter: 'blur(40px)', zIndex: 0 }} />
                        </div>

                        <div className="card-premium bento-card bento-card-sm reveal delay-100" style={{ background: 'var(--solemia-plum)', color: 'white' }}>
                            <TrendingUp size={48} color="var(--solemia-pink)" style={{ marginBottom: '2rem' }} />
                            <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'white' }}>Autoridad 24/7</h3>
                            <p style={{ opacity: 0.8 }}>Conviértete en el experto omnipresente sin sacrificar tu tiempo personal.</p>
                        </div>

                        <div className="card-premium bento-card bento-card-sm reveal delay-200">
                            <Zap size={48} color="var(--solemia-pink)" style={{ marginBottom: '2rem' }} />
                            <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Soporte Real</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Cero alucinaciones. Pura eficiencia clínica bajo tus propias reglas nutricionales.</p>
                        </div>

                        <div className="card-premium bento-card bento-card-lg reveal delay-300" style={{ background: 'white' }}>
                            {/* Flex container — stacks on mobile */}
                            <div style={{ display: 'flex', gap: 'clamp(1.5rem, 3vw, 3rem)', alignItems: 'center', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1 }}>
                                    <Heart size={48} color="var(--solemia-pink)" style={{ marginBottom: '1.5rem' }} />
                                    <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Resultados que Inspiran</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>Mejora la adherencia en un 60% reduciendo la culpa y el miedo al juicio del profesional.</p>
                                </div>
                                <div style={{ flex: 1, padding: '2rem', background: '#f8f8f8', borderRadius: '2rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--solemia-plum)' }}>+25%</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--solemia-pink)', fontWeight: '700' }}>HONORARIOS JUSTIFICADOS</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* IA Comparison Section */}
            <section style={{ padding: 'clamp(4rem, 8vw, 8rem) 0', background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(5px)' }}>
                <div className="container">
                    <div className="landing-comparison-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(350px, 100%), 1fr))', gap: 'clamp(2rem, 5vw, 6rem)', alignItems: 'center' }}>
                        <div className="reveal">
                            <h2 className="landing-section-title landing-comparison-title" style={{ fontSize: '3rem', marginBottom: '2.5rem', lineHeight: '1.2', letterSpacing: '-0.02em' }}>¿Por qué no usar <span style={{ color: 'var(--solemia-pink)' }}>IA Genérica</span>?</h2>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                <li style={{ marginBottom: '3rem', display: 'flex', gap: '2rem' }} className="reveal delay-100 landing-comparison-item">
                                    <div style={{ background: '#fff', padding: '16px', borderRadius: '20px', height: 'fit-content', boxShadow: 'var(--shadow-premium)' }}>
                                        <Lock size={24} color="var(--solemia-pink)" />
                                    </div>
                                    <div>
                                        <h4 style={{ marginBottom: '0.75rem', fontSize: '1.25rem', fontWeight: '800' }}>Privacidad y Contexto Clínico</h4>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.7' }}>ChatGPT no conoce tus protocolos. Solemia actúa bajo TUS reglas, protegiendo la confidencialidad y tu ética profesional.</p>
                                    </div>
                                </li>
                                <li style={{ marginBottom: '3rem', display: 'flex', gap: '2rem' }} className="reveal delay-200 landing-comparison-item">
                                    <div style={{ background: '#fff', padding: '16px', borderRadius: '20px', height: 'fit-content', boxShadow: 'var(--shadow-premium)' }}>
                                        <Brain size={24} color="var(--solemia-pink)" />
                                    </div>
                                    <div>
                                        <h4 style={{ marginBottom: '0.75rem', fontSize: '1.25rem', fontWeight: '800' }}>Cero Alucinaciones</h4>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.7' }}>Nuestra IA está blindada para referir al paciente contigo ante dudas críticas, evitando recomendaciones erróneas.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div style={{ position: 'relative' }} className="reveal delay-300">
                            <div className="card-premium landing-quote-card" style={{
                                background: 'var(--solemia-plum)',
                                padding: '4rem',
                                borderRadius: '4rem',
                                color: 'white'
                            }}>
                                <MessageSquare size={40} style={{ marginBottom: '2rem', color: 'var(--solemia-pink)' }} />
                                <p className="landing-quote-text" style={{ fontSize: '2rem', fontWeight: '800', fontStyle: 'italic', lineHeight: '1.3', letterSpacing: '-0.01em' }}>
                                    "La IA genérica te hace ver amateur. Solemia te posiciona como una clínica de élite."
                                </p>
                                <div style={{ marginTop: '2.5rem', fontWeight: '900', fontSize: '0.9rem', color: 'var(--solemia-pink)', letterSpacing: '3px' }}>
                                    — MANIFIESTO SOLEMIA
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" style={{ padding: 'clamp(4rem, 10vw, 10rem) 0', background: 'transparent' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 6rem' }} className="reveal">
                        <h2 className="landing-section-title" style={{ fontSize: '3.5rem', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>Inversión en tu Autoridad.</h2>
                        <p className="landing-section-subtitle" style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
                            Únete al Pioneer Group y lidera la nutrición tecnológica en habla hispana.
                        </p>
                    </div>

                    <div className="landing-pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))', gap: 'clamp(1.5rem, 3vw, 3rem)', maxWidth: '1100px', margin: '0 auto' }}>
                        <div className="reveal delay-100">
                            <PricingCard
                                title="Plan Profesional"
                                price="$1,349"
                                period="MXN / mes"
                                features={featuresMonthly}
                                buttonText="Empezar Ahora"
                                onAction={() => navigate('/signup')}
                            />
                        </div>
                        <div className="reveal delay-200">
                            <PricingCard
                                title="Pase Fundador Elite"
                                price="$5,000"
                                period="MXN / 6 meses"
                                highlight="60% AHORRO DIRECTO"
                                features={featuresFounderCash}
                                isPopular={true}
                                buttonText="Obtener Promo Elite"
                                onAction={() => navigate('/signup')}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Garantía Section */}
            <section style={{ padding: 'clamp(4rem, 8vw, 8rem) 0', background: 'var(--solemia-charcoal)', color: 'white', textAlign: 'center' }}>
                <div className="container">
                    <div className="glass reveal landing-garantia-card" style={{ padding: '4rem', maxWidth: '900px', margin: '0 auto', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
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
            <footer style={{ padding: '4rem 0 3rem', background: 'var(--solemia-bg)', textAlign: 'center' }}>
                <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img src={logo} alt="Solemia" style={{ height: '24px', opacity: 0.5, marginBottom: '2rem' }} />
                    <div className="landing-footer-links" style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button onClick={() => openLegalModal("Términos y Condiciones", <TermsAndConditionsContent />)} className="btn-outline" style={{ border: 'none', background: 'transparent', padding: 0, textDecoration: 'underline', color: 'var(--solemia-plum)', opacity: 0.7, fontSize: '0.85rem' }}>Términos y Condiciones</button>
                        <button onClick={() => openLegalModal("Aviso de Privacidad", <PrivacyPolicyContent />)} className="btn-outline" style={{ border: 'none', background: 'transparent', padding: 0, textDecoration: 'underline', color: 'var(--solemia-plum)', opacity: 0.7, fontSize: '0.85rem' }}>Aviso de Privacidad</button>
                        <button onClick={() => openLegalModal("Política de Uso de Datos e IA", <DataAndAIPolicyContent />)} className="btn-outline" style={{ border: 'none', background: 'transparent', padding: 0, textDecoration: 'underline', color: 'var(--solemia-plum)', opacity: 0.7, fontSize: '0.85rem' }}>Uso de Datos e IA</button>
                        <button onClick={() => openLegalModal("Política de Cookies", <CookiesPolicyContent />)} className="btn-outline" style={{ border: 'none', background: 'transparent', padding: 0, textDecoration: 'underline', color: 'var(--solemia-plum)', opacity: 0.7, fontSize: '0.85rem' }}>Política de Cookies</button>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        © {new Date().getFullYear()} Solemia Nutrición. v1.0.2 - Premium Health Technology.
                    </p>
                </div>
            </footer>

            <LegalModal
                isOpen={isLegalModalOpen}
                onClose={() => setIsLegalModalOpen(false)}
                title={legalModalTitle}
                content={legalModalContent}
            />
        </div>
    );
}
