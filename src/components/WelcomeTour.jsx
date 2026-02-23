import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, ChevronLeft, Crown, Target, Brain, Users, Settings, Search } from 'lucide-react';

const WelcomeTour = ({ isOpen, onComplete }) => {
    const [step, setStep] = useState(0);
    const [targetRect, setTargetRect] = useState(null);
    const [displayText, setDisplayText] = useState('');
    const [assistantPos, setAssistantPos] = useState({ top: '30%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0 });
    const typingTimeoutRef = useRef();

    useEffect(() => {
        if (isOpen) {
            setStep(0);
            console.log("🦁 SOLEMIA SIGNATURE V14 - ALTA COSTURA ACTIVADA");
        }
    }, [isOpen]);

    const steps = [
        {
            title: "Solemia Signature",
            description: "Bienvenido a la cima de la ingeniería clínica. Tu sistema no solo es potente; es una obra de arte diseñada para potenciar tu marca profesional.",
            icon: <Crown size={28} />,
            element: null
        },
        {
            title: "Métricas de Impacto",
            description: "Toma el control absoluto de tus resultados. Tus éxitos ahora se visualizan con elegancia, claridad y precisión absoluta.",
            icon: <Users size={28} />,
            element: ".tour-metrics"
        },
        {
            title: "Búsqueda Maestra",
            description: "Tu base de conocimientos, accesible en microsegundos. La velocidad del sistema responde a tu agilidad profesional.",
            icon: <Search size={28} />,
            element: ".tour-search"
        },
        {
            title: "Arquitectura de Legados",
            description: "Inicia nuevos expedientes con el respaldo de nuestra inteligencia. Cada paciente es el pilar de un gran resultado clínico.",
            icon: <Brain size={28} />,
            element: ".tour-add-patient"
        },
        {
            title: "Configuración Soberana",
            description: "Moldea tu universo de trabajo. Solemia se pliega a tus necesidades profesionales, nunca al revés.",
            icon: <Settings size={28} />,
            element: ".tour-settings"
        }
    ];

    useEffect(() => {
        setDisplayText('');
        let i = 0;
        const text = steps[step].description;

        const type = () => {
            if (i < text.length) {
                setDisplayText(text.substring(0, i + 1));
                i++;
                typingTimeoutRef.current = setTimeout(type, 20);
            }
        };

        const initialTimeout = setTimeout(type, 400);
        return () => {
            clearTimeout(initialTimeout);
            clearTimeout(typingTimeoutRef.current);
        };
    }, [step]);

    // SIGNATURE ANCHORING: Inteligencia de Posicionamiento Editorial
    useEffect(() => {
        if (!isOpen) return;

        const timer = setInterval(() => {
            const currentStep = steps[step];
            if (currentStep.element) {
                const el = document.querySelector(currentStep.element);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    setTargetRect(rect);

                    // Posicionamiento de "Respeto" (Evitar colisiones visuales)
                    const isTooHigh = rect.top < 350;
                    const finalLeft = Math.min(Math.max(rect.left + rect.width / 2, 300), window.innerWidth - 300);
                    const finalTop = isTooHigh ? rect.bottom + 120 : rect.top - 280;

                    setAssistantPos({
                        top: `${finalTop}px`,
                        left: `${finalLeft}px`,
                        transform: 'translateX(-50%)',
                        opacity: 1
                    });
                }
            } else {
                setTargetRect(null);
                setAssistantPos({ top: '40%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 1 });
            }
        }, 100);

        return () => clearInterval(timer);
    }, [isOpen, step]);

    if (!isOpen) return null;

    return (
        <div className="solemia-signature-container" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 11000 }}>
            <div className="solemia-guide-v4-overlay" />

            <div className="nutripal-v4-container" style={{ ...assistantPos, pointerEvents: 'all' }}>
                {targetRect && (
                    <div className="signature-spotlight-aura" style={{
                        top: targetRect.top - 20,
                        left: targetRect.left - 20,
                        width: targetRect.width + 40,
                        height: targetRect.height + 40,
                        position: 'fixed'
                    }} />
                )}

                <div className="nutripal-v4-speech">
                    {/* Icono Sello de Cera (Signature Style) */}
                    <div className="nutripal-v4-orb">
                        {steps[step].icon}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                        <h4 style={{
                            margin: 0,
                            fontSize: '1.15rem',
                            fontWeight: 950,
                            color: 'var(--solemia-plum)',
                            textTransform: 'uppercase',
                            letterSpacing: '5px',
                            textAlign: 'center'
                        }}>
                            {steps[step].title}
                        </h4>
                        <p style={{
                            fontSize: '1.05rem',
                            color: '#1e293b',
                            lineHeight: 1.8,
                            margin: 0,
                            fontWeight: 600,
                            textAlign: 'center',
                            minHeight: '5rem',
                            letterSpacing: '-0.3px'
                        }}>
                            {displayText}
                        </p>
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '2.5rem',
                        borderTop: '1px solid rgba(225,29,72,0.1)',
                        paddingTop: '1.5rem',
                        marginTop: '0.5rem'
                    }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {step > 0 && (
                                <button onClick={() => setStep(step - 1)} className="tour-btn-back">
                                    <ChevronLeft size={24} />
                                </button>
                            )}
                            <div style={{ display: 'flex', gap: '12px', margin: '0 1.5rem' }}>
                                {steps.map((_, i) => (
                                    <div key={i} className={`tour-indicator-dot ${i === step ? 'active' : ''}`} />
                                ))}
                            </div>
                            <button onClick={() => step < steps.length - 1 ? setStep(step + 1) : onComplete()} className="tour-btn-next">
                                <span>{step === steps.length - 1 ? 'REINAR' : 'SIGUIENTE'}</span>
                                <ArrowRight size={20} style={{ marginLeft: '12px' }} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeTour;
