import React, { useState, useEffect, useRef } from 'react';
import { Star, Users, Brain, Settings, ChevronRight, Sparkles, Wand2 } from 'lucide-react';

const WelcomeTour = ({ isOpen, onComplete }) => {
    const [step, setStep] = useState(0);
    const [targetRect, setTargetRect] = useState(null);
    const [containerPos, setContainerPos] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
    const requestRef = useRef();
    const [displayText, setDisplayText] = useState('');
    const typingTimeoutRef = useRef();

    // Forzar el inicio desde el paso 0 cada vez que se abre
    useEffect(() => {
        if (isOpen) {
            setStep(0);
            console.log("🚀 NUTRI-PAL V4 FINAL LOADED - CACHE-BUSTED & RESET");
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

    // Efecto Typewriter V6 (Fluidez total)
    useEffect(() => {
        setDisplayText('');
        let i = 0;
        const text = steps[step].description;
        const type = () => {
            if (i < text.length) {
                setDisplayText(prev => prev + text.charAt(i));
                i++;
                typingTimeoutRef.current = setTimeout(type, 12);
            }
        };
        const initialTimeout = setTimeout(type, 30);
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

                const isTopHalf = rect.top < window.innerHeight * 0.4;

                // Lógica de evitación V6: Colocar el asistente lejos del elemento central
                let top, left;
                let arrowClass = '';

                if (isTopHalf) {
                    // Si el elemento está arriba, el asistente va abajo
                    top = rect.bottom + 45;
                    arrowClass = 'v4-arrow-top';
                } else {
                    // Si el elemento está abajo, el asistente va arriba
                    top = rect.top - 240;
                    arrowClass = 'v4-arrow-bottom';
                }

                // Centrado lateral inteligente (380px de ancho)
                left = rect.left + (rect.width / 2) - 190;

                // Límites de pantalla
                if (left < 20) left = 20;
                if (left + 400 > window.innerWidth) left = window.innerWidth - 400;
                if (top < 20) top = 20;
                if (top + 320 > window.innerHeight) top = window.innerHeight - 320;

                setContainerPos({
                    top: `${top}px`,
                    left: `${left}px`,
                    transform: 'none',
                    arrowClass
                });
            }
        } else {
            setTargetRect(null);
            setContainerPos({
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                arrowClass: ''
            });
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
            {/* ANILLO DE PULSO V6 - EL FOCO PROTAGONISTA */}
            {targetRect && (
                <div className="tour-pulse-ring-v6" style={{
                    top: targetRect.top - 10,
                    left: targetRect.left - 10,
                    width: targetRect.width + 20,
                    height: targetRect.height + 20,
                    borderRadius: '1.5rem',
                    transition: 'all 0.6s cubic-bezier(0.19, 1, 0.22, 1)'
                }} />
            )}

            {/* SVG Mask Nitro-Focus V6 */}
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
                                rx="30"
                                fill="black"
                                style={{ transition: 'all 0.6s cubic-bezier(0.19, 1, 0.22, 1)' }}
                            />
                        )}
                    </mask>
                </defs>
                <rect x="0" y="0" width="100%" height="100%" fill="rgba(0, 0, 0, 0.82)" mask="url(#spotlight-mask-final-v4)" />
            </svg>

            {/* ASISTENTE NUTRI-PAL V6 (NITRO) */}
            <div className="nutripal-v4-container" style={{
                top: containerPos.top,
                left: containerPos.left,
                transform: containerPos.transform
            }}>
                <div className={`nutripal-v4-speech ${containerPos.arrowClass}`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="nutripal-v4-orb">
                            {steps[step].icon}
                        </div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--solemia-plum)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
                                {steps[step].title}
                            </h4>
                            <div style={{ fontSize: '0.65rem', fontWeight: '800', opacity: 0.35, letterSpacing: '0.05em' }}>NUTRI-PAL POWER v6.0</div>
                        </div>
                    </div>

                    <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
                        {displayText}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            {steps.map((_, i) => (
                                <div key={i} className={`tour-indicator-dot ${i === step ? 'active' : ''}`} />
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {step > 0 && (
                                <button onClick={handleBack} className="btn-outline" style={{ padding: '0.6rem 1.2rem', fontSize: '0.75rem', borderRadius: '1rem' }}>
                                    Atrás
                                </button>
                            )}
                            <button onClick={handleNext} className="tour-btn-next">
                                {step === steps.length - 1 ? '¡Listo!' : 'Siguiente'}
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={onComplete}
                        style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', opacity: 0.5 }}
                    >
                        <Sparkles size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeTour;
