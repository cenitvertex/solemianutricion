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
            console.log("🦁 SOLEMIA ZENITH REBORN V15 ACTIVADO");
        }
    }, [isOpen]);

    const steps = [
        {
            title: "Zenith Reborn",
            description: "Bienvenido a Solemia. He recuperado la claridad para que tu sistema brille con propósito profesional.",
            icon: <Crown size={24} />,
            element: null
        },
        {
            title: "Métricas Vitales",
            description: "Visualiza tus resultados con precisión quirúrgica. Todo el poder de tus datos en un solo lugar.",
            icon: <Users size={24} />,
            element: ".tour-metrics"
        },
        {
            title: "Buscador Maestro",
            description: "Encuentra pacientes y expedientes al instante. Tu historial está siempre a tu voluntad.",
            icon: <Search size={24} />,
            element: ".tour-search"
        },
        {
            title: "Nuevo Legado",
            description: "Crea expedientes digitales con la vanguardia de nuestra arquitectura funcional.",
            icon: <Brain size={24} />,
            element: ".tour-add-patient"
        },
        {
            title: "Configuración Zen",
            description: "Ajusta tu entorno de trabajo. El software se adapta a la forma de tu maestría clínica.",
            icon: <Settings size={24} />,
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

        const initialTimeout = setTimeout(type, 200);
        return () => {
            clearTimeout(initialTimeout);
            clearTimeout(typingTimeoutRef.current);
        };
    }, [step]);

    // ZENITH SAFE ZONE ANCHORING
    useEffect(() => {
        if (!isOpen) return;

        const timer = setInterval(() => {
            const currentStep = steps[step];
            if (currentStep.element) {
                const el = document.querySelector(currentStep.element);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    setTargetRect(rect);

                    // Lógica de Posicionamiento Horizontal Ultra-Compacta
                    const screenH = window.innerHeight;
                    const screenW = window.innerWidth;

                    let finalTop = rect.top - 140; // Por defecto arriba
                    if (finalTop < 20) finalTop = rect.bottom + 40; // Si no hay espacio arriba, abajo

                    // Asegurar que no se salga de los bordes
                    finalTop = Math.min(Math.max(finalTop, 20), screenH - 180);
                    let finalLeft = Math.min(Math.max(rect.left + rect.width / 2, 350), screenW - 350);

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
        <div className="solemia-zenith-reborn" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 11000 }}>
            <div className="solemia-guide-v4-overlay" />

            <div className="nutripal-v4-container" style={{ ...assistantPos, pointerEvents: 'all' }}>
                {targetRect && (
                    <div className="ghost-spotlight-glow" style={{
                        top: targetRect.top - 15,
                        left: targetRect.left - 15,
                        width: targetRect.width + 30,
                        height: targetRect.height + 30,
                        position: 'fixed'
                    }} />
                )}

                <div className="nutripal-v4-speech">
                    <div className="nutripal-v4-orb">
                        {steps[step].icon}
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 950, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            {steps[step].title}
                        </h4>
                        <p style={{ fontSize: '0.95rem', color: '#f1f5f9', lineHeight: 1.5, margin: 0, fontWeight: 600 }}>
                            {displayText}
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {steps.map((_, i) => (
                                <div key={i} className={`tour-indicator-dot ${i === step ? 'active' : ''}`} />
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            {step > 0 && (
                                <button onClick={() => setStep(step - 1)} className="tour-btn-back">
                                    <ChevronLeft size={20} />
                                </button>
                            )}
                            <button onClick={() => step < steps.length - 1 ? setStep(step + 1) : onComplete()} className="tour-btn-next">
                                <span>{step === steps.length - 1 ? 'REINAR' : 'SIGUIENTE'}</span>
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
