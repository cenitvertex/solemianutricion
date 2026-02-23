import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, ChevronLeft, Crown, Brain, Users, Settings, Search } from 'lucide-react';

const WelcomeTour = ({ isOpen, onComplete }) => {
    const [step, setStep] = useState(0);
    const [targetRect, setTargetRect] = useState(null);
    const [displayText, setDisplayText] = useState('');
    const [assistantPos, setAssistantPos] = useState({ top: '30%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0 });
    const typingTimeoutRef = useRef();

    useEffect(() => {
        if (isOpen) {
            setStep(0);
            console.log("🦁 SOLEMIA PRECISION GLASS V18 - MINIMALISMO ABSOLUTO");
        }
    }, [isOpen]);

    const steps = [
        {
            title: "Sistema Solemia",
            description: "Tu práctica clínica, elevada por una arquitectura digital de vanguardia diseñada para expertos.",
            icon: <Crown size={22} />,
            element: null
        },
        {
            title: "Pulso del Éxito",
            description: "Métricas críticas de rentabilidad y salud clínica en un solo vistazo estratégico.",
            icon: <Users size={22} />,
            element: ".tour-metrics"
        },
        {
            title: "Gestión Fluida",
            description: "Búsqueda instantánea de expedientes para una atención sin fricción técnica.",
            icon: <Search size={22} />,
            element: ".tour-search"
        },
        {
            title: "Nuevo Legado",
            description: "Inicia hoy mismo el registro digital de tus pacientes con precisión absoluta.",
            icon: <Brain size={22} />,
            element: ".tour-add-patient"
        },
        {
            title: "Tu Universo",
            description: "Personaliza Solemia para que sea una extensión perfecta de tu voluntad profesional.",
            icon: <Settings size={22} />,
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
                typingTimeoutRef.current = setTimeout(type, 15);
            }
        };

        const initialTimeout = setTimeout(type, 300);
        return () => {
            clearTimeout(initialTimeout);
            clearTimeout(typingTimeoutRef.current);
        };
    }, [step]);

    // PRECISION AVOIDANCE ANCHORING V18
    useEffect(() => {
        if (!isOpen) return;

        const timer = setInterval(() => {
            const currentStep = steps[step];
            if (currentStep.element) {
                const el = document.querySelector(currentStep.element);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    setTargetRect(rect);

                    const screenH = window.innerHeight;
                    const screenW = window.innerWidth;

                    // DISTANCIA DE RESPETO: 60px de margen con el spotlight
                    let finalTop = rect.top - 200;
                    if (finalTop < 40) finalTop = rect.bottom + 60;

                    finalTop = Math.min(Math.max(finalTop, 40), screenH - 220);
                    let finalLeft = Math.min(Math.max(rect.left + rect.width / 2, 220), screenW - 220);

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
        <div id="solemia-precision-tour" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 11000 }}>
            <div className="solemia-guide-v4-overlay" />

            <div className="nutripal-v4-container" style={{ ...assistantPos, pointerEvents: 'all' }}>
                {targetRect && (
                    <div className="ghost-spotlight-glow" style={{
                        top: targetRect.top - 12,
                        left: targetRect.left - 12,
                        width: targetRect.width + 24,
                        height: targetRect.height + 24,
                        position: 'fixed'
                    }} />
                )}

                <div className="nutripal-v4-speech">
                    <div className="nutripal-v4-orb">
                        {steps[step].icon}
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '1rem' }}>
                        <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 950, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '3px' }}>
                            {steps[step].title}
                        </h4>
                        <p style={{ fontSize: '1.05rem', color: 'white', lineHeight: 1.5, margin: 0, fontWeight: 500, letterSpacing: '-0.2px' }}>
                            {displayText}
                        </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.25rem', marginTop: '0.2rem' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {steps.map((_, i) => (
                                <div key={i} className={`tour-indicator-dot ${i === step ? 'active' : ''}`} />
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            {step > 0 && (
                                <button onClick={() => setStep(step - 1)} className="tour-btn-back">
                                    <ChevronLeft size={20} />
                                </button>
                            )}
                            <button onClick={() => step < steps.length - 1 ? setStep(step + 1) : onComplete()} className="tour-btn-next">
                                <span>{step === steps.length - 1 ? 'LISTO' : 'SIGUIENTE'}</span>
                                <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeTour;
