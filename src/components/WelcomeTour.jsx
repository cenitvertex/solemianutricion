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

    // Efecto Typewriter
    useEffect(() => {
        setDisplayText('');
        let i = 0;
        const text = steps[step].description;

        const type = () => {
            if (i < text.length) {
                setDisplayText(prev => prev + text.charAt(i));
                i++;
                typingTimeoutRef.current = setTimeout(type, 10);
            }
        };

        type();
        return () => clearTimeout(typingTimeoutRef.current);
    }, [step]);

    const updatePosition = () => {
        if (!isOpen) return;

        const currentStep = steps[step];
        if (currentStep.element) {
            const el = document.querySelector(currentStep.element);
            if (el) {
                const rect = el.getBoundingClientRect();
                setTargetRect(rect);

                const isTop = rect.top > window.innerHeight / 2;
                const top = isTop ? rect.top - 340 : rect.bottom + 40;
                let left = rect.left + (rect.width / 2) - 200;

                if (left < 20) left = 20;
                if (left + 400 > window.innerWidth) left = window.innerWidth - 420;

                setContainerPos({
                    top: `${top}px`,
                    left: `${left}px`,
                    transform: 'none',
                    arrowClass: isTop ? 'v4-arrow-bottom' : 'v4-arrow-top'
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
            {/* SVG Mask Suave v4 */}
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
                                rx="40"
                                fill="black"
                                style={{ transition: 'all 0.6s cubic-bezier(0.19, 1, 0.22, 1)' }}
                            />
                        )}
                    </mask>
                </defs>
                <rect x="0" y="0" width="100%" height="100%" fill="rgba(0, 0, 0, 0.55)" mask="url(#spotlight-mask-final-v4)" />
            </svg>

            {/* ASISTENTE NUTRI-PAL V4 (FINAL INTEGRADO) */}
            <div className="nutripal-v4-container" style={{
                top: containerPos.top,
                left: containerPos.left,
                transform: containerPos.transform
            }}>
                <div className={`nutripal-v4-speech ${containerPos.arrowClass}`}>
                    {/* ENCABEZADO CON ORBE INTEGRADO V4 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div className="nutripal-v4-orb">
                            {steps[step].icon}
                        </div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--solemia-plum)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
                                {steps[step].title}
                            </h4>
                            <div style={{ fontSize: '0.7rem', fontWeight: '800', opacity: 0.35, letterSpacing: '0.05em' }}>NUTRI-PAL v4.0</div>
                        </div>
                    </div>

                    <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: 1.65, margin: 0, minHeight: '5rem' }}>
                        {displayText}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {steps.map((_, i) => (
                                <div key={i} className={`tour-indicator-dot ${i === step ? 'active' : ''}`} />
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            {step > 0 && (
                                <button onClick={handleBack} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', fontSize: '0.85rem', borderRadius: '1.25rem' }}>
                                    Atrás
                                </button>
                            )}
                            <button onClick={handleNext} className="tour-btn-next" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '1rem 2rem', fontSize: '0.9rem' }}>
                                {step === steps.length - 1 ? '¡Listo!' : 'Siguiente'} <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={onComplete}
                        style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', opacity: 0.5 }}
                    >
                        <Sparkles size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeTour;
