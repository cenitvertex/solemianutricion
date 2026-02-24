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
            console.log("🦁 SOLEMIA EXTREME SHIELD V21.2 - VACUUM SEAL ACTIVE");

            // Bloqueo Global por Captura Agresivo (Nivel Sistema)
            const blocker = (e) => {
                const tourContent = document.getElementById('solemia-precision-tour-content');
                if (tourContent && !tourContent.contains(e.target)) {
                    e.stopPropagation();
                    e.stopImmediatePropagation(); // Detiene incluso a otros listeners
                    e.preventDefault();
                    return false;
                }
            };

            const events = ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'contextmenu', 'dblclick'];
            events.forEach(evt => window.addEventListener(evt, blocker, { capture: true, passive: false }));

            return () => {
                events.forEach(evt => window.removeEventListener(evt, blocker, { capture: true }));
            };
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
            element: ".tour-metrics",
            layout: 'wide'
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

    // DIRECTED DESIGN ENGINE V18.7 (MANUAL OPTIMIZATION)
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
                    const safetyMargin = 30;

                    let finalTop;
                    let finalLeft;

                    // LÓGICA DE UBICACIÓN DIRIGIDA POR PASO V18.9
                    switch (step) {
                        case 1: // MÉTRICAS (Ancho y abajo)
                            finalTop = rect.bottom + 45;
                            finalLeft = screenW / 2;
                            break;
                        case 2: // BÚSQUEDA (A la IZQUIERDA)
                            finalTop = rect.top + rect.height / 2 - tooltipRect.height / 2;
                            finalLeft = rect.left - 210; // Posición izquierda
                            break;
                        case 3: // NUEVO PACIENTE (A la IZQUIERDA)
                            finalTop = rect.top + rect.height / 2 - tooltipRect.height / 2;
                            finalLeft = rect.left - 250; // Posición izquierda
                            break;
                        case 4: // CONFIGURACIÓN (Top Right)
                            finalTop = rect.bottom + 45;
                            finalLeft = rect.left - 150;
                            break;
                        default:
                            finalTop = (screenH - tooltipRect.height) / 2;
                            finalLeft = screenW / 2;
                    }

                    // CLAMPING INTELIGENTE (No salirse, pero respetar la indicación)
                    const halfW = tooltipRect.width / 2;
                    finalTop = Math.max(safetyMargin, Math.min(finalTop, screenH - tooltipRect.height - safetyMargin));
                    finalLeft = Math.max(halfW + safetyMargin, Math.min(finalLeft, screenW - halfW - safetyMargin));

                    setAssistantPos({
                        top: `${finalTop}px`,
                        left: `${finalLeft}px`,
                        opacity: 1,
                        isCentered: true,
                        layout: currentStep.layout || 'normal'
                    });
                }
            } else {
                setTargetRect(null);
                setAssistantPos({ top: '35%', left: '50%', opacity: 1, isCentered: true, layout: 'normal' });
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
        <div
            id="solemia-precision-tour"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'auto', zIndex: 2147483647 }}
        >
            {/* SPOTLIGHT ADAPTATIVO V18.7 */}
            {targetRect && (
                <div className="ghost-spotlight-glow" style={{
                    top: targetRect.top - 8,
                    left: targetRect.left - 8,
                    width: targetRect.width + 16,
                    height: targetRect.height + 16,
                    borderRadius: targetRect.radius || '1rem',
                    position: 'fixed',
                    pointerEvents: 'none',
                    zIndex: 10999
                }} />
            )}

            <div
                className="solemia-guide-v4-overlay"
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
            />

            <div className="nutripal-v4-container" style={{
                top: assistantPos.top,
                left: assistantPos.left,
                transform: 'translate(-50%, 0)',
                opacity: assistantPos.opacity,
                pointerEvents: 'all',
                zIndex: 11000,
                position: 'fixed',
                transition: 'top 0.7s cubic-bezier(0.16, 1, 0.3, 1), left 0.7s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease'
            }}>
                <div
                    ref={tooltipRef}
                    id="solemia-precision-tour-content"
                    className="nutripal-v4-speech"
                    style={{
                        maxWidth: assistantPos.layout === 'wide' ? '550px' : '370px',
                        padding: assistantPos.layout === 'wide' ? '1.5rem 2.2rem' : '1.25rem 1.6rem',
                        pointerEvents: 'all' // Aseguramos que la burbuja sí reciba eventos
                    }}
                >
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
                                <span style={{
                                    fontSize: '0.95rem',
                                    textTransform: 'lowercase',
                                    fontFamily: 'var(--font-display)',
                                    fontWeight: '800',
                                    letterSpacing: '0.01em'
                                }}>
                                    {step === steps.length - 1 ? 'comenzar' : 'siguiente'}
                                </span>
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
