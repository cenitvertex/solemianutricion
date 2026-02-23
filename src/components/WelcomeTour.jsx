import React, { useState, useEffect, useRef } from 'react';
import { Star, Users, Brain, Settings, Sparkles, Wand2, ArrowRight, ChevronLeft } from 'lucide-react';

const WelcomeTour = ({ isOpen, onComplete }) => {
    const [step, setStep] = useState(0);
    const [targetRect, setTargetRect] = useState(null);
    const requestRef = useRef();
    const [displayText, setDisplayText] = useState('');
    const typingTimeoutRef = useRef();

    useEffect(() => {
        if (isOpen) {
            setStep(0);
            console.log("💎 SOLEMIA LUX V10 ACTIVATED - REVOLUT STANDARD");
        }
    }, [isOpen]);

    const steps = [
        {
            title: "El Nuevo Estándar",
            description: "Bienvenido a la cima de la nutrición digital. No soy un manual; soy el motor que escalará tu consultorio.",
            icon: <Wand2 size={24} />,
            element: null
        },
        {
            title: "El Pulso de tu Éxito",
            description: "Monitorea tu crecimiento en tiempo real. Aquí es donde tu esfuerzo se transforma en datos de alto rendimiento.",
            icon: <Users size={24} />,
            element: ".tour-metrics"
        },
        {
            title: "Inteligencia al Instante",
            description: "Encuentra cualquier historia clínica con la velocidad de la luz. Tu tiempo es tu activo más valioso.",
            icon: <Sparkles size={24} />,
            element: ".tour-search"
        },
        {
            title: "IA de Grado Clínico",
            description: "Deja que mi Cerebro Artificial analice patrones y optimice tus consultas. Ciencia al servicio de tu talento.",
            icon: <Brain size={24} />,
            element: ".tour-add-patient"
        },
        {
            title: "Tu Comando Central",
            description: "Personaliza tu ecosistema Solemia. Ajustamos el software a tu visión, no al revés.",
            icon: <Settings size={24} />,
            element: ".tour-settings"
        },
        {
            title: "Comienza tu Legado",
            description: "La fase de preparación ha terminado. Es hora de dominar el sector y transformar vidas.",
            icon: <Star size={24} />,
            element: null
        }
    ];

    // Lux Typewriter: Ritmo dinámico para lectura premium
    useEffect(() => {
        setDisplayText('');
        let i = 0;
        const text = steps[step].description;

        const type = () => {
            if (i < text.length) {
                const Char = text.charAt(i);
                setDisplayText(prev => prev + Char);
                i++;
                // Variamos la velocidad para que se sienta más natural/manual
                const speed = Char === '.' || Char === ',' ? 150 : 15;
                typingTimeoutRef.current = setTimeout(type, speed);
            }
        };

        const initialTimeout = setTimeout(type, 300);
        return () => {
            clearTimeout(initialTimeout);
            clearTimeout(typingTimeoutRef.current);
        };
    }, [step]);

    const updatePosition = () => {
        if (!isOpen) return;

        const currentStep = steps[step];
        if (currentStep.element) {
            const el = document.querySelector(currentStep.element);
            if (el) {
                const rect = el.getBoundingClientRect();
                setTargetRect(rect);
            }
        } else {
            setTargetRect(null);
        }
        requestRef.current = requestAnimationFrame(updatePosition);
    };

    useEffect(() => {
        if (isOpen) {
            requestRef.current = requestAnimationFrame(updatePosition);
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [isOpen, step]);

    if (!isOpen) return null;

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            onComplete();
        }
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    return (
        <div className="solemia-guide-v4-overlay" style={{ pointerEvents: 'all' }}>
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                <defs>
                    <mask id="spotlight-mask-final-v10">
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        {targetRect && (
                            <rect
                                x={targetRect.left - 15}
                                y={targetRect.top - 15}
                                width={targetRect.width + 30}
                                height={targetRect.height + 30}
                                rx="1.5rem"
                                fill="black"
                                style={{ transition: 'all 1s cubic-bezier(0.23, 1, 0.32, 1)' }}
                            />
                        )}
                    </mask>
                </defs>
                <rect x="0" y="0" width="100%" height="100%" fill="rgba(0, 0, 0, 0.15)" mask="url(#spotlight-mask-final-v10)" />
            </svg>

            {/* ASISTENTE NUTRI-PAL V10 (LUX) - COMANDO SUPERIOR DINÁMICO */}
            <div className="nutripal-v4-container">
                <div className="nutripal-v4-orb">
                    {steps[step].icon}
                </div>

                <div className="nutripal-v4-speech">
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: 'var(--solemia-plum)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {steps[step].title}
                        </h4>
                        <p style={{ fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.6, margin: 0, fontWeight: 500, minHeight: '2.8rem' }}>
                            {displayText}
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', borderLeft: '1px solid rgba(0,0,0,0.06)', paddingLeft: '2rem' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            {steps.map((_, i) => (
                                <div key={i} className={`tour-indicator-dot ${i === step ? 'active' : ''}`} />
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            {step > 0 && (
                                <button onClick={handleBack} className="tour-btn-back">
                                    <ChevronLeft size={16} />
                                </button>
                            )}
                            <button onClick={handleNext} className="tour-btn-next">
                                <span>{step === steps.length - 1 ? 'EMPEZAR AHORA' : 'SIGUIENTE'}</span>
                                <ArrowRight size={16} style={{ marginLeft: '8px' }} />
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={onComplete}
                        style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', opacity: 0.2 }}
                    >
                        <Sparkles size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeTour;
