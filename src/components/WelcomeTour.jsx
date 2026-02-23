import React, { useState, useEffect, useRef } from 'react';
import { Star, Users, Brain, Settings, Sparkles, Wand2 } from 'lucide-react';

const WelcomeTour = ({ isOpen, onComplete }) => {
    const [step, setStep] = useState(0);
    const [targetRect, setTargetRect] = useState(null);
    const requestRef = useRef();
    const [displayText, setDisplayText] = useState('');
    const typingTimeoutRef = useRef();

    // Forzar el inicio desde el paso 0 cada vez que se abre
    useEffect(() => {
        if (isOpen) {
            setStep(0);
            console.log("🚀 NUTRI-PAL V8 ESENCIA LOADED - MINIMALISMO ABSOLUTO");
        }
    }, [isOpen]);

    const steps = [
        {
            title: "Nutri-Pal: Tu Esencia",
            description: "No soy una ventana de ayuda. Soy tu asistente clínico. Dominemos tu consultorio juntos.",
            icon: <Wand2 size={24} />,
            element: null
        },
        {
            title: "Métricas de Élite",
            description: "Aquí monitoreamos tu éxito. Pacientes y crecimiento, siempre a la vista.",
            icon: <Users size={24} />,
            element: ".tour-metrics"
        },
        {
            title: "Búsqueda Instantánea",
            description: "Encuentra cualquier expediente en milisegundos con total precisión.",
            icon: <Sparkles size={24} />,
            element: ".tour-search"
        },
        {
            title: "Cerebro Clínico",
            description: "Agrega pacientes y deja que mi IA analice sus datos con alta fidelidad.",
            icon: <Brain size={24} />,
            element: ".tour-add-patient"
        },
        {
            title: "Centro de Control",
            description: "Personaliza tu experiencia y ajusta tus preferencias a tu medida.",
            icon: <Settings size={24} />,
            element: ".tour-settings"
        },
        {
            title: "¡Brillemos!",
            description: "Ya conoces los puntos vitales. Vamos a escalar tu consulta al próximo nivel.",
            icon: <Star size={24} />,
            element: null
        }
    ];

    // Efecto Typewriter V8
    useEffect(() => {
        setDisplayText('');
        let i = 0;
        const text = steps[step].description;

        const type = () => {
            if (i < text.length) {
                const Char = text.charAt(i);
                setDisplayText(prev => prev + Char);
                i++;
                typingTimeoutRef.current = setTimeout(type, 8); // Un poco más rápido
            }
        };

        const initialTimeout = setTimeout(type, 50);
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
            {/* V8: Foco de Alta Fidelidad - Escenario 100% protagónico */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                <defs>
                    <mask id="spotlight-mask-final-v4">
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        {targetRect && (
                            <rect
                                x={targetRect.left - 20}
                                y={targetRect.top - 20}
                                width={targetRect.width + 40}
                                height={targetRect.height + 40}
                                rx="1.25rem"
                                fill="black"
                                style={{ transition: 'all 0.8s cubic-bezier(0.19, 1, 0.22, 1)' }}
                            />
                        )}
                    </mask>
                </defs>
                <rect x="0" y="0" width="100%" height="100%" fill="rgba(0, 0, 0, 0.5)" mask="url(#spotlight-mask-final-v4)" />
            </svg>

            {/* ASISTENTE NUTRI-PAL V8 (ESENCIA) - BARRA HORIZONTAL DE CRISTAL */}
            <div className="nutripal-v4-container">
                <div className="nutripal-v4-orb">
                    {steps[step].icon}
                </div>

                <div className="nutripal-v4-speech">
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900, color: 'var(--solemia-plum)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {steps[step].title}
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: '#4d0c30', opacity: 0.8, lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
                            {displayText}
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: '1px solid rgba(0,0,0,0.08)', paddingLeft: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {steps.map((_, i) => (
                                <div key={i} className={`tour-indicator-dot ${i === step ? 'active' : ''}`} />
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {step > 0 && (
                                <button onClick={handleBack} className="btn-outline" style={{ background: 'transparent', padding: '0.5rem 0.8rem', fontSize: '0.75rem', fontWeight: 'bold', border: 'none', color: '#4d0c30', opacity: 0.5 }}>
                                    Atrás
                                </button>
                            )}
                            <button onClick={handleNext} className="tour-btn-next">
                                {step === steps.length - 1 ? '¡Empieza ya!' : 'Siguiente'}
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={onComplete}
                        style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', opacity: 0.3 }}
                    >
                        <Sparkles size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeTour;
