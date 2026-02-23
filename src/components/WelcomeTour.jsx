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
            console.log("🚀 NUTRI-PAL V7 INVERSIONISTA LOADED - SYSTEM FIRST ABSOLUTE");
        }
    }, [isOpen]);

    const steps = [
        {
            title: "¡Hola! Soy Nutri-Pal",
            description: "No soy una ventana de ayuda. Soy tu asistente de inteligencia clínica. Permíteme mostrarte cómo dominamos tu consultorio juntos.",
            icon: <Wand2 size={24} />,
            element: null
        },
        {
            title: "Métricas de Élite",
            description: "Aquí monitoreamos el pulso de tu éxito. Tus pacientes agendados y tu crecimiento, siempre a la vista.",
            icon: <Users size={24} />,
            element: ".tour-metrics"
        },
        {
            title: "Búsqueda Instantánea",
            description: "Encuentra cualquier expediente en milisegundos. La potencia de Solemia está en la organización impecable de tus datos.",
            icon: <Sparkles size={24} />,
            element: ".tour-search"
        },
        {
            title: "El Cerebro Clínico",
            description: "Aquí es donde ocurre la magia. Agrega pacientes y deja que mi IA analice sus datos para darte recomendaciones de alta precisión.",
            icon: <Brain size={24} />,
            element: ".tour-add-patient"
        },
        {
            title: "Tu Centro de Control",
            description: "Personaliza tu experiencia y ajusta tus preferencias. Aquí tú tienes las riendas de tu plataforma.",
            icon: <Settings size={24} />,
            element: ".tour-settings"
        },
        {
            title: "¡Manos a la obra!",
            description: "Ya conoces los puntos vitales. Estoy listo para ayudarte a escalar tu consulta al siguiente nivel. ¡A brillar!",
            icon: <Star size={24} />,
            element: null
        }
    ];

    // Efecto Typewriter V7
    useEffect(() => {
        setDisplayText('');
        let i = 0;
        const text = steps[step].description;

        const type = () => {
            if (i < text.length) {
                const Char = text.charAt(i);
                setDisplayText(prev => prev + Char);
                i++;
                typingTimeoutRef.current = setTimeout(type, 10);
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
            {/* V7: Foco absoluto sobre el sistema - CERO interferencia visual */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                <defs>
                    <mask id="spotlight-mask-final-v4">
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        {targetRect && (
                            <rect
                                x={targetRect.left - 25}
                                y={targetRect.top - 25}
                                width={targetRect.width + 50}
                                height={targetRect.height + 50}
                                rx="1.5rem"
                                fill="black"
                                style={{ transition: 'all 0.6s cubic-bezier(0.19, 1, 0.22, 1)' }}
                            />
                        )}
                    </mask>
                </defs>
                <rect x="0" y="0" width="100%" height="100%" fill="rgba(0, 0, 0, 0.6)" mask="url(#spotlight-mask-final-v4)" />
            </svg>

            {/* ASISTENTE NUTRI-PAL V7 (INVERSIONISTA) - CONSOLA FIJA */}
            <div className="nutripal-v4-container">
                <div className="nutripal-v4-orb">
                    {steps[step].icon}
                </div>

                <div className="nutripal-v4-speech">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--solemia-plum)', fontFamily: 'var(--font-display)' }}>
                            {steps[step].title}
                        </h4>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            {steps.map((_, i) => (
                                <div key={i} className={`tour-indicator-dot ${i === step ? 'active' : ''}`} style={{ width: i === step ? '16px' : '6px', height: '6px' }} />
                            ))}
                        </div>
                    </div>

                    <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.6, margin: 0, minHeight: '5rem' }}>
                        {displayText}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                        <div>
                            {step > 0 && (
                                <button onClick={handleBack} className="btn-outline" style={{ padding: '0.6rem 1rem', fontSize: '0.75rem', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                                    Atrás
                                </button>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={handleNext} className="tour-btn-next" style={{ padding: '0.7rem 1.5rem', fontSize: '0.8rem', borderRadius: '1.25rem' }}>
                                {step === steps.length - 1 ? '¡Vamos a ello!' : 'Siguiente'}
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={onComplete}
                        style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', opacity: 0.3 }}
                    >
                        <Sparkles size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeTour;
