import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, ChevronLeft, Crown, Brain, Users, Settings, Search } from 'lucide-react';

const WelcomeTour = ({ isOpen, onComplete }) => {
    const [step, setStep] = useState(0);
    const [targetRect, setTargetRect] = useState(null);
    const [displayText, setDisplayText] = useState('');
    const [assistantPos, setAssistantPos] = useState({ top: '30%', left: '50%', opacity: 0, isCentered: true });

    const typingTimeoutRef = useRef();
    const tooltipRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setStep(0);
            console.log("🦁 SOLEMIA LAYER ARCHITECTURE V18.6 - ZERO-COLLISION MODE");
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
                typingTimeoutRef.current = setTimeout(type, 10);
            }
        };

        const initialTimeout = setTimeout(type, 400);
        return () => {
            clearTimeout(initialTimeout);
            clearTimeout(typingTimeoutRef.current);
        };
    }, [step]);

    // LAYER ARCHITECTURE ENGINE V18.6 (OPPOSITE-SIDE LOGIC)
    useEffect(() => {
        if (!isOpen) return;

        let animationFrameId;
        const updatePosition = () => {
            const currentStep = steps[step];
            const tooltipEl = tooltipRef.current;

            if (currentStep.element && tooltipEl) {
                const el = document.querySelector(currentStep.element);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    const tooltipRect = tooltipEl.getBoundingClientRect();
                    const style = window.getComputedStyle(el);

                    setTargetRect({
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height,
                        radius: style.borderRadius
                    });

                    const screenW = window.innerWidth;
                    const screenH = window.innerHeight;
                    const safetyMargin = 30; // Margen de pantalla más amplio

                    let finalTop;
                    let finalLeft = screenW / 2; // Siempre centrado horizontalmente para evitar cortes laterales

                    // LÓGICA DE "LADO OPUESTO" V18.6
                    // En lugar de pegarse al elemento, el tooltip se aleja de él
                    if (rect.top > screenH / 2) {
                        // El elemento está ABAJO -> Tooltip ARRIBA con margen fijo
                        finalTop = safetyMargin + 20;
                    } else {
                        // El elemento está ARRIBA -> Tooltip ABAJO con margen fijo
                        finalTop = screenH - tooltipRect.height - safetyMargin - 20;
                    }

                    setAssistantPos({
                        top: `${finalTop}px`,
                        left: `${finalLeft}px`,
                        opacity: 1,
                        isCentered: true // Forzar centrado vía transform
                    });
                } else {
                    setTargetRect(null);
                    setAssistantPos({ top: '35%', left: '50%', opacity: 1, isCentered: true });
                }
            } else if (!currentStep.element) {
                setTargetRect(null);
                setAssistantPos({ top: '35%', left: '50%', opacity: 1, isCentered: true });
            }

            animationFrameId = requestAnimationFrame(updatePosition);
        };

        animationFrameId = requestAnimationFrame(updatePosition);
        window.addEventListener('resize', updatePosition);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen, step]);

    if (!isOpen) return null;

    return (
        <div id="solemia-precision-tour" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 10997 }}>
            {/* SPOTLIGHT ADAPTATIVO V18.6 */}
            {targetRect && (
                <div className="ghost-spotlight-glow" style={{
                    top: targetRect.top - 5,
                    left: targetRect.left - 5,
                    width: targetRect.width + 10,
                    height: targetRect.height + 10,
                    borderRadius: targetRect.radius || '0.8rem',
                    position: 'fixed',
                    pointerEvents: 'none',
                    zIndex: 10999
                }} />
            )}

            <div className="solemia-guide-v4-overlay" />

            <div className="nutripal-v4-container" style={{
                top: assistantPos.top,
                left: assistantPos.left,
                transform: 'translate(-50%, 0)', // Solo centrado horizontal
                opacity: assistantPos.opacity,
                pointerEvents: 'all',
                zIndex: 11000,
                position: 'fixed',
                transition: 'top 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease'
            }}>
                <div ref={tooltipRef} className="nutripal-v4-speech">
                    <div className="nutripal-v4-orb">
                        {steps[step].icon}
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.6rem' }}>
                        <h4 style={{ margin: 0, fontSize: '0.65rem', fontWeight: 950, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '4px' }}>
                            {steps[step].title}
                        </h4>
                        <p style={{ fontSize: '1.05rem', color: 'white', lineHeight: 1.45, margin: 0, fontWeight: 500, letterSpacing: '-0.3px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                            {displayText}
                        </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.2rem', marginTop: '0.2rem' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {steps.map((_, i) => (
                                <div key={i} className={`tour-indicator-dot ${i === step ? 'active' : ''}`} />
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '0.7rem', alignItems: 'center' }}>
                            {step > 0 && (
                                <button onClick={() => setStep(step - 1)} className="tour-btn-back" title="Anterior">
                                    <ChevronLeft size={16} />
                                </button>
                            )}
                            <button onClick={() => step < steps.length - 1 ? setStep(step + 1) : onComplete()} className="tour-btn-next">
                                <span style={{ fontSize: '0.8rem' }}>{step === steps.length - 1 ? 'COMENZAR' : 'SIGUIENTE'}</span>
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
