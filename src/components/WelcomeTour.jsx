import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, ChevronLeft, Crown, Target } from 'lucide-react';

const WelcomeTour = ({ isOpen, onComplete }) => {
    const [step, setStep] = useState(0);
    const [targetRect, setTargetRect] = useState(null);
    const [displayText, setDisplayText] = useState('');
    const [assistantPos, setAssistantPos] = useState({ top: '2rem', left: '50%', transform: 'translateX(-50%)' });
    const typingTimeoutRef = useRef();

    useEffect(() => {
        if (isOpen) {
            setStep(0);
            console.log("🦁 SOLEMIA ROYAL GHOST V13 - EL SISTEMA CORONADO");
        }
    }, [isOpen]);

    const steps = [
        {
            title: "Royal Command",
            description: "Bienvenido a la cima. Tu Dashboard ha sido coronado. Déjame guiarte por tu nuevo imperio digital.",
            element: null
        },
        {
            title: "Pulso Estratégico",
            description: "Tus métricas clave. Diseñadas para que veas el éxito antes de que ocurra. Precisión absoluta.",
            element: ".tour-metrics"
        },
        {
            title: "Inteligencia Fluida",
            description: "Tu buscador maestro. Encuentra legados y pacientes con la velocidad del pensamiento.",
            element: ".tour-search"
        },
        {
            title: "Arquitectura de Pacientes",
            description: "Crea nuevos expedientes con la ayuda de mi IA. Cada dato es un pilar de tu legado.",
            element: ".tour-add-patient"
        },
        {
            title: "Núcleo Zen",
            description: "Ajusta tu universo. Solemia se pliega a tu voluntad profesional.",
            element: ".tour-settings"
        }
    ];

    // Royal Typewriter: Elegante y con presencia
    useEffect(() => {
        setDisplayText('');
        let i = 0;
        const text = steps[step].description;

        const type = () => {
            if (i < text.length) {
                setDisplayText(text.substring(0, i + 1));
                i++;
                typingTimeoutRef.current = setTimeout(type, 18);
            }
        };

        const initialTimeout = setTimeout(type, 300);
        return () => {
            clearTimeout(initialTimeout);
            clearTimeout(typingTimeoutRef.current);
        };
    }, [step]);

    // ROYAL ANCHORING: Inteligencia de Posicionamiento (Smart Avoidance)
    useEffect(() => {
        if (!isOpen) return;

        const timer = setInterval(() => {
            const currentStep = steps[step];
            if (currentStep.element) {
                const el = document.querySelector(currentStep.element);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    setTargetRect(rect);

                    // Lógica de Anclaje de Lujo: Evitar solapamientos y buscar estética
                    const isTooHigh = rect.top < 300;
                    const isTooLeft = rect.left < 400;
                    const isTooRight = rect.left > window.innerWidth - 600;

                    let finalLeft = rect.left + rect.width / 2;
                    let finalTop = isTooHigh ? rect.bottom + 60 : rect.top - 200;

                    // Ajustes laterales para evitar salirse de pantalla
                    if (isTooLeft) finalLeft = Math.max(280, finalLeft);
                    if (isTooRight) finalLeft = Math.min(window.innerWidth - 280, finalLeft);

                    setAssistantPos({
                        top: `${finalTop}px`,
                        left: `${finalLeft}px`,
                        transform: 'translateX(-50%)',
                        opacity: 1
                    });
                }
            } else {
                setTargetRect(null);
                setAssistantPos({ top: '30%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 1 });
            }
        }, 100);

        return () => clearInterval(timer);
    }, [isOpen, step]);

    if (!isOpen) return null;

    return (
        <div className="solemia-ghost-container" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 11000 }}>
            <div className="solemia-guide-v4-overlay" />

            <div className="nutripal-v4-container" style={{ ...assistantPos, pointerEvents: 'all' }}>
                {targetRect && <div className="ghost-spotlight-glow" style={{
                    top: targetRect.top - 15,
                    left: targetRect.left - 15,
                    width: targetRect.width + 30,
                    height: targetRect.height + 30,
                    position: 'fixed'
                }} />}

                <div className="nutripal-v4-speech">
                    <div className="nutripal-v4-orb">
                        {step === 0 ? <Crown size={20} /> : <Target size={20} />}
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900, color: 'var(--solemia-plum)', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            {steps[step].title}
                        </h4>
                        <p style={{ fontSize: '0.95rem', color: '#1e293b', lineHeight: 1.6, margin: 0, fontWeight: 600, letterSpacing: '-0.2px' }}>
                            {displayText}
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', borderLeft: '1px solid rgba(225,29,72,0.1)', paddingLeft: '2rem' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            {steps.map((_, i) => (
                                <div key={i} className={`tour-indicator-dot ${i === step ? 'active' : ''}`} />
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            {step > 0 && (
                                <button onClick={() => setStep(step - 1)} className="tour-btn-back">
                                    <ChevronLeft size={18} />
                                </button>
                            )}
                            <button onClick={() => step < steps.length - 1 ? setStep(step + 1) : onComplete()} className="tour-btn-next">
                                <span>{step === steps.length - 1 ? 'REINAR' : 'SIGUIENTE'}</span>
                                <ArrowRight size={16} style={{ marginLeft: '8px' }} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeTour;
