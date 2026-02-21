import React, { useState, useEffect, useRef } from 'react';
import { Star, Users, Brain, Settings, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

const WelcomeTour = ({ isOpen, onComplete }) => {
    const [step, setStep] = useState(0);
    const [targetRect, setTargetRect] = useState(null);
    const [bubblePos, setBubblePos] = useState({ top: 0, left: 0, arrow: 'bubble-top' });
    const requestRef = useRef();

    const steps = [
        {
            title: "¡Bienvenida a Solemia!",
            description: "Soy Nutri-Pal, tu asistente de inteligencia clínica. No soy una ventana de ayuda, soy parte de tu equipo. Permíteme mostrarte cómo domino tu consultorio.",
            icon: <Sparkles size={24} />,
            element: null // Centrado inicial
        },
        {
            title: "El Pulso de tu Clínica",
            description: "Aquí monitoreamos la salud de tu negocio. Pacientes agendados, ventas y crecimiento. Si estos números suben, tu impacto sube.",
            icon: <Users size={24} />,
            element: ".tour-metrics"
        },
        {
            title: "Tu Biblioteca de Pacientes",
            description: "Encuentra cualquier expediente en milisegundos. La potencia de Solemia está en la organización impecable.",
            icon: <Sparkles size={24} />,
            element: ".tour-search"
        },
        {
            title: "Asistente de IA Clínica",
            description: "Este es el corazón tecnológico. Aquí es donde agregas pacientes y donde yo analizo sus datos para darte recomendaciones de élite.",
            icon: <Brain size={24} />,
            element: ".tour-add-patient"
        },
        {
            title: "Tu Centro de Mando",
            description: "Personaliza tu experiencia, gestiona tu suscripción y ajusta tus preferencias aquí. Tú tienes el control total.",
            icon: <Settings size={24} />,
            element: ".tour-settings"
        },
        {
            title: "¡Lista para Despegar!",
            description: "Ya conoces los puntos vitales. Recuerda que siempre estaré aquí para ayudarte a escalar tu consulta al siguiente nivel.",
            icon: <Star size={24} />,
            element: null
        }
    ];

    const updatePosition = () => {
        if (!isOpen) return;

        const currentStep = steps[step];
        if (currentStep.element) {
            const el = document.querySelector(currentStep.element);
            if (el) {
                const rect = el.getBoundingClientRect();
                setTargetRect(rect);

                // Calcular posición de la burbuja
                const padding = 20;
                let top = rect.bottom + padding;
                let left = rect.left;
                let arrow = 'bubble-top';

                // Ajuste si se sale por abajo
                if (top + 250 > window.innerHeight) {
                    top = rect.top - 250 - padding;
                    arrow = 'bubble-bottom';
                }

                // Ajuste horizontal
                if (left + 320 > window.innerWidth) {
                    left = window.innerWidth - 340;
                }
                if (left < 20) left = 20;

                setBubblePos({ top, left, arrow });
            }
        } else {
            setTargetRect(null);
            // Centrado en pantalla
            setBubblePos({
                top: window.innerHeight / 2 - 125,
                left: window.innerWidth / 2 - 160,
                arrow: 'none'
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
        <div className="solemia-guide-overlay" style={{ pointerEvents: 'all' }}>
            {/* SVG Mask for Spotlight */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                <defs>
                    <mask id="spotlight-mask">
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        {targetRect && (
                            <rect
                                x={targetRect.left - 10}
                                y={targetRect.top - 10}
                                width={targetRect.width + 20}
                                height={targetRect.height + 20}
                                rx="20"
                                fill="black"
                                style={{ transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
                            />
                        )}
                    </mask>
                </defs>
                <rect x="0" y="0" width="100%" height="100%" fill="rgba(77, 12, 48, 0.65)" mask="url(#spotlight-mask)" />
            </svg>

            {/* Pulse Ring */}
            {targetRect && (
                <div className="tour-pulse-ring" style={{
                    top: targetRect.top - 10,
                    left: targetRect.left - 10,
                    width: targetRect.width + 20,
                    height: targetRect.height + 20,
                    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                }} />
            )}

            {/* Nutri-Pal Speech Bubble */}
            <div
                className={`nutripal-speech-bubble ${bubblePos.arrow}`}
                style={{
                    top: bubblePos.top,
                    left: bubblePos.left,
                    opacity: 1,
                    transform: 'scale(1)',
                    zIndex: 10002
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="nutripal-orb">
                        {steps[step].icon}
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--solemia-plum)' }}>{steps[step].title}</h4>
                        <div style={{ fontSize: '0.65rem', fontWeight: '800', opacity: 0.5 }}>GUÍA SOLEMIA</div>
                    </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
                    {steps[step].description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8' }}>
                        Paso {step + 1} de {steps.length}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {step > 0 && (
                            <button onClick={handleBack} className="btn-outline" style={{ padding: '0.5rem', borderRadius: '0.75rem', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ChevronLeft size={16} />
                            </button>
                        )}
                        <button onClick={handleNext} className="tour-btn-next" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {step === steps.length - 1 ? '¡Listo!' : 'Siguiente'} <ChevronRight size={14} />
                        </button>
                    </div>
                </div>

                <button
                    onClick={onComplete}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        color: '#cbd5e1',
                        cursor: 'pointer'
                    }}
                >
                    <Sparkles size={14} />
                </button>
            </div>
        </div>
    );
};

export default WelcomeTour;
