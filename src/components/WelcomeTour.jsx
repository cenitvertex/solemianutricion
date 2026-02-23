import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, ChevronLeft } from 'lucide-react';

const WelcomeTour = ({ isOpen, onComplete }) => {
    const [step, setStep] = useState(0);
    const [targetRect, setTargetRect] = useState(null);
    const [displayText, setDisplayText] = useState('');
    const [assistantPos, setAssistantPos] = useState({ top: '2rem', left: '50%', transform: 'translateX(-50%)' });
    const typingTimeoutRef = useRef();

    useEffect(() => {
        if (isOpen) {
            setStep(0);
            console.log("🏛️ SOLEMIA GHOST V12 - SISTEMA PROTAGONISTA");
        }
    }, [isOpen]);

    const steps = [
        {
            title: "Toma el Mando",
            description: "Tu sistema está listo. Haré que cada clic cuente. Solo observa los resplandores.",
            element: null
        },
        {
            title: "Métricas de Éxito",
            description: "Tu rendimiento en una mirada. La salud de tu consultorio brilla aquí.",
            element: ".tour-metrics"
        },
        {
            title: "Mente Digital",
            description: "Busca y encuentra. Tu historial está siempre a una palabra de distancia.",
            element: ".tour-search"
        },
        {
            title: "Nuevos Legados",
            description: "Crea expedientes con inteligencia. Empieza aquí.",
            element: ".tour-add-patient"
        },
        {
            title: "Configuración ZEN",
            description: "Ajusta tu entorno. Solemia se adapta a ti.",
            element: ".tour-settings"
        }
    ];

    // Ghost Typewriter: Minimalista y rápido
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

        const initialTimeout = setTimeout(type, 100);
        return () => {
            clearTimeout(initialTimeout);
            clearTimeout(typingTimeoutRef.current);
        };
    }, [step]);

    // GHOST: Anclaje de Precisión
    useEffect(() => {
        if (!isOpen) return;

        const timer = setInterval(() => {
            const currentStep = steps[step];
            if (currentStep.element) {
                const el = document.querySelector(currentStep.element);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    setTargetRect(rect);

                    // Posicionamiento de Tooltip (siempre cerca del elemento)
                    const isTooHigh = rect.top < 250;
                    setAssistantPos({
                        top: isTooHigh ? `${rect.bottom + 20}px` : `${rect.top - 160}px`,
                        left: `${rect.left + rect.width / 2}px`,
                        transform: 'translateX(-50%)'
                    });
                }
            } else {
                setTargetRect(null);
                setAssistantPos({ top: '2rem', left: '50%', transform: 'translateX(-50%)' });
            }
        }, 100);

        return () => clearInterval(timer);
    }, [isOpen, step]);

    if (!isOpen) return null;

    return (
        <div className="solemia-ghost-container" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 11000 }}>
            {/* El overlay es transparente en el CSS */}
            <div className="solemia-guide-v4-overlay" />

            <div className="nutripal-v4-container" style={{ ...assistantPos, pointerEvents: 'all' }}>
                {targetRect && <div className="ghost-spotlight-glow" style={{
                    top: targetRect.top - 10,
                    left: targetRect.left - 10,
                    width: targetRect.width + 20,
                    height: targetRect.height + 20,
                    position: 'fixed'
                }} />}

                <div className="nutripal-v4-speech">
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <h4 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 900, color: 'var(--solemia-plum)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                            {steps[step].title}
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.4, margin: 0, fontWeight: 500 }}>
                            {displayText}
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '1px solid rgba(0,0,0,0.05)', paddingLeft: '1rem' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {steps.map((_, i) => (
                                <div key={i} className={`tour-indicator-dot ${i === step ? 'active' : ''}`} />
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {step > 0 && (
                                <button onClick={() => setStep(step - 1)} className="tour-btn-back">
                                    <ChevronLeft size={14} />
                                </button>
                            )}
                            <button onClick={() => step < steps.length - 1 ? setStep(step + 1) : onComplete()} className="tour-btn-next">
                                <span>{step === steps.length - 1 ? 'LISTO' : 'SIGUIENTE'}</span>
                                <ArrowRight size={12} style={{ marginLeft: '4px' }} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeTour;
