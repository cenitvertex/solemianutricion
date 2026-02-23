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
            console.log("🦁 SOLEMIA GLASS EDITION V16 - IDENTIDAD TOTAL");
        }
    }, [isOpen]);

    const steps = [
        {
            title: "Solemia Glass",
            description: "Bienvenido a tu nueva era profesional. Un sistema rediseñado para que tu talento sea el único protagonista.",
            icon: <Crown size={28} />,
            element: null
        },
        {
            title: "Métricas de Maestría",
            description: "Visualiza el pulso de tu éxito. Tus datos ahora se presentan con la claridad que tu nivel de experto requiere.",
            icon: <Users size={28} />,
            element: ".tour-metrics"
        },
        {
            title: "Buscador de Legados",
            description: "Accede al instante a todo tu historial clínico. La velocidad del pensamiento aplicada a tu gestión de pacientes.",
            icon: <Search size={28} />,
            element: ".tour-search"
        },
        {
            title: "Nueva Arquitectura",
            description: "Crea expedientes digitales que reflejen la vanguardia de tu práctica clínica diaria.",
            icon: <Brain size={28} />,
            element: ".tour-add-patient"
        },
        {
            title: "Ajustes de Universo",
            description: "Personaliza cada rincón de Solemia. El software debe ser, siempre, una extensión de tu voluntad.",
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
                typingTimeoutRef.current = setTimeout(type, 18);
            }
        };

        const initialTimeout = setTimeout(type, 300);
        return () => {
            clearTimeout(initialTimeout);
            clearTimeout(typingTimeoutRef.current);
        };
    }, [step]);

    // PRECISION ANCHORING V16
    useEffect(() => {
        if (!isOpen) return;

        const timer = setInterval(() => {
            const currentStep = steps[step];
            if (currentStep.element) {
                const el = document.querySelector(currentStep.element);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    setTargetRect(rect);

                    // Lógica de Posicionamiento con Prioridad de Lectura
                    const screenH = window.innerHeight;
                    const screenW = window.innerWidth;

                    let finalTop = rect.top - 240; // Espacio para la nueva caja vertical
                    if (finalTop < 40) finalTop = rect.bottom + 40;

                    finalTop = Math.min(Math.max(finalTop, 40), screenH - 260);
                    let finalLeft = Math.min(Math.max(rect.left + rect.width / 2, 300), screenW - 300);

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
        <div id="solemia-glass-tour" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 11000 }}>
            <div className="solemia-guide-v4-overlay" />

            <div className="nutripal-v4-container" style={{ ...assistantPos, pointerEvents: 'all' }}>
                {targetRect && (
                    <div className="ghost-spotlight-glow" style={{
                        top: targetRect.top - 8,
                        left: targetRect.left - 8,
                        width: targetRect.width + 16,
                        height: targetRect.height + 16,
                        position: 'fixed'
                    }} />
                )}

                <div className="nutripal-v4-speech">
                    <div className="nutripal-v4-orb">
                        {steps[step].icon}
                    </div>

                    {/* ZONA DE TEXTO PRIORITARIA (80% del impacto visual) */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 950, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '4px' }}>
                            {steps[step].title}
                        </h4>
                        <p style={{ fontSize: '1.25rem', color: 'white', lineHeight: 1.6, margin: 0, fontWeight: 600, letterSpacing: '-0.3px' }}>
                            {displayText}
                        </p>
                    </div>

                    {/* ZONA DE CONTROL COMPACTA (La base refinada) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1.5px solid rgba(255,255,255,0.15)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {steps.map((_, i) => (
                                <div key={i} className={`tour-indicator-dot ${i === step ? 'active' : ''}`} />
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            {step > 0 && (
                                <button onClick={() => setStep(step - 1)} className="tour-btn-back">
                                    <ChevronLeft size={22} />
                                </button>
                            )}
                            <button onClick={() => step < steps.length - 1 ? setStep(step + 1) : onComplete()} className="tour-btn-next">
                                <span>{step === steps.length - 1 ? 'REINAR' : 'SIGUIENTE'}</span>
                                <ArrowRight size={20} style={{ marginLeft: '10px' }} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeTour;
