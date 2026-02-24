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
            description: "Bienvenidos a la cúspide de la nutrición digital. Una arquitectura diseñada para el profesional que no acepta menos que la excelencia.",
            icon: <Crown size={22} />,
            element: null
        },
        {
            title: "Pulso del Éxito",
            description: "Métricas de precisión quirúrgica. Visualice la salud de su práctica clínica y la rentabilidad de su tiempo en tiempo real.",
            icon: <Users size={22} />,
            element: ".tour-metrics"
        },
        {
            title: "Gestión Fluida",
            description: "Acceso instantáneo. El conocimiento de sus pacientes, disponible sin fricciones ni esperas.",
            icon: <Search size={22} />,
            element: ".tour-search"
        },
        {
            title: "Nuevo Legado",
            description: "Digitalización absoluta. Inicie el registro de un nuevo paciente con la seguridad de una infraestructura blindada.",
            icon: <Brain size={22} />,
            element: ".tour-add-patient"
        },
        {
            title: "Tu Universo",
            description: "Identidad Profesional. Solemia se adapta a su firma personal, convirtiéndose en el aliado invisible de su consulta.",
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
                typingTimeoutRef.current = setTimeout(type, 10); // Ligeramente más rápido para mayor fluidez
            }
        };

        const initialTimeout = setTimeout(type, 400); // Espera a que la animación de entrada termine
        return () => {
            clearTimeout(initialTimeout);
            clearTimeout(typingTimeoutRef.current);
        };
    }, [step]);

    // PRECISION ANCHORING V18.3 - ULTRA ÉLITE
    useEffect(() => {
        if (!isOpen) return;

        const updatePosition = () => {
            const currentStep = steps[step];
            if (currentStep.element) {
                const el = document.querySelector(currentStep.element);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    setTargetRect(rect);

                    const screenH = window.innerHeight;
                    const screenW = window.innerWidth;

                    // BUFFER DE SEGURIDAD V18.3: 100px para visibilidad total
                    const buffer = 100;
                    let finalTop;

                    if (rect.top > screenH / 2) {
                        // Tooltip ARRIBA del elemento
                        finalTop = rect.top - 220;
                    } else {
                        // Tooltip DEBAJO del elemento
                        finalTop = rect.bottom + buffer;
                    }

                    // Safe Area Limits
                    finalTop = Math.min(Math.max(finalTop, 20), screenH - 250);
                    let finalLeft = Math.min(Math.max(rect.left + rect.width / 2, 200), screenW - 200);

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
        };

        const timer = setInterval(updatePosition, 100);
        window.addEventListener('resize', updatePosition);

        return () => {
            clearInterval(timer);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen, step]);

    if (!isOpen) return null;

    return (
        <div id="solemia-precision-tour" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10997 }}>
            {/* SPOTLIGHT ETÉREO (Padding ultra-preciso) */}
            {targetRect && (
                <div className="ghost-spotlight-glow" style={{
                    top: targetRect.top - 10,
                    left: targetRect.left - 10,
                    width: targetRect.width + 20,
                    height: targetRect.height + 20,
                    position: 'fixed',
                    pointerEvents: 'none',
                    zIndex: 10999
                }} />
            )}

            <div className="solemia-guide-v4-overlay" />

            <div className="nutripal-v4-container" style={{ ...assistantPos, pointerEvents: 'all', zIndex: 11000 }}>
                <div className="nutripal-v4-speech">
                    <div className="nutripal-v4-orb">
                        {steps[step].icon}
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.8rem' }}>
                        <h4 style={{ margin: 0, fontSize: '0.7rem', fontWeight: 950, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '4.5px' }}>
                            {steps[step].title}
                        </h4>
                        <p style={{ fontSize: '1.1rem', color: 'white', lineHeight: 1.4, margin: 0, fontWeight: 500, letterSpacing: '-0.4px', textShadow: '0 2px 10px rgba(0,0,0,0.4)' }}>
                            {displayText}
                        </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem', marginTop: '0.2rem' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            {steps.map((_, i) => (
                                <div key={i} className={`tour-indicator-dot ${i === step ? 'active' : ''}`} />
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            {step > 0 && (
                                <button onClick={() => setStep(step - 1)} className="tour-btn-back" title="Anterior">
                                    <ChevronLeft size={16} />
                                </button>
                            )}
                            <button onClick={() => step < steps.length - 1 ? setStep(step + 1) : onComplete()} className="tour-btn-next">
                                <span style={{ fontSize: '0.85rem' }}>{step === steps.length - 1 ? 'COMENZAR' : 'SIGUIENTE'}</span>
                                <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeTour;
