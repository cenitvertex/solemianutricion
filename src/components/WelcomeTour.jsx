import React, { useState, useEffect, useRef } from 'react';
import { Star, Users, Brain, Settings, ChevronRight, Sparkles, Wand2 } from 'lucide-react';

const WelcomeTour = ({ isOpen, onComplete }) => {
    const [step, setStep] = useState(0);
    const [targetRect, setTargetRect] = useState(null);
    const [containerPos, setContainerPos] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
    const requestRef = useRef();
    const [displayText, setDisplayText] = useState('');
    const typingTimeoutRef = useRef();

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
                typingTimeoutRef.current = setTimeout(type, 15);
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

                // Posicionar el contenedor completo (orbe + burbuja)
                const isTop = rect.top > window.innerHeight / 2;
                const top = isTop ? rect.top - 280 : rect.bottom + 40;
                let left = rect.left + (rect.width / 2) - 170;

                // Límites de pantalla
                if (left < 20) left = 20;
                if (left + 340 > window.innerWidth) left = window.innerWidth - 360;

                setContainerPos({
                    top: `${top}px`,
                    left: `${left}px`,
                    transform: 'none',
                    flexDirection: isTop ? 'column' : 'column-reverse'
                });
            }
        } else {
            setTargetRect(null);
            setContainerPos({
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                flexDirection: 'column'
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

    return (
        <div className="solemia-guide-overlay" style={{ pointerEvents: 'all' }}>
            {/* SVG Mask para el Spotlight Pro */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                <defs>
                    <mask id="spotlight-mask-v3">
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        {targetRect && (
                            <rect
                                x={targetRect.left - 15}
                                y={targetRect.top - 15}
                                width={targetRect.width + 30}
                                height={targetRect.height + 30}
                                rx="30"
                                fill="black"
                                style={{ transition: 'all 0.6s cubic-bezier(0.19, 1, 0.22, 1)' }}
                            />
                        )}
                    </mask>
                </defs>
                <rect x="0" y="0" width="100%" height="100%" fill="rgba(26, 26, 26, 0.85)" mask="url(#spotlight-mask-v3)" />
            </svg>

            {/* PULSE RING V3 */}
            {targetRect && (
                <div className="tour-pulse-ring" style={{
                    top: targetRect.top - 15,
                    left: targetRect.left - 15,
                    width: targetRect.width + 30,
                    height: targetRect.height + 30,
                    borderRadius: '30px',
                    transition: 'all 0.6s cubic-bezier(0.19, 1, 0.22, 1)'
                }} />
            )}

            {/* ASISTENTE NUTRI-PAL V3 */}
            <div className="nutripal-container" style={containerPos}>

                {/* Burbuja de Diálogo */}
                <div className="nutripal-speech-v3">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ background: 'rgba(77, 12, 48, 0.05)', padding: '0.5rem', borderRadius: '12px' }}>
                            {steps[step].icon}
                        </div>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: 'var(--solemia-plum)', fontFamily: 'var(--font-display)' }}>
                            {steps[step].title}
                        </h4>
                    </div>

                    <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6, margin: '0 0 1.5rem 0', minHeight: '4.5rem' }}>
                        {displayText}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            {steps.map((_, i) => (
                                <div key={i} className={`tour-indicator-dot ${i === step ? 'active' : ''}`} />
                            ))}
                        </div>

                        <button onClick={handleNext} className="tour-btn-next" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
                            {step === steps.length - 1 ? '¡Vamos!' : 'Siguiente'} <ChevronRight size={16} />
                        </button>
                    </div>

                    <button
                        onClick={onComplete}
                        style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', opacity: 0.5 }}
                    >
                        <Sparkles size={16} />
                    </button>
                </div>

                {/* El Orbe Maestro */}
                <div className="nutripal-orb-v3">
                    <Wand2 size={24} color="white" />
                </div>

            </div>
        </div>
    );
};

export default WelcomeTour;
