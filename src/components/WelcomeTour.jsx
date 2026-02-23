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
            console.log("🦁 SOLEMIA LUMINOUS GLASS V17 - LA REDENCIÓN TOTAL");
        }
    }, [isOpen]);

    const steps = [
        {
            title: "Solemia Luminous Glass",
            description: "Bienvenido a tu universo clínico. He rediseñado el sistema para que cada paso sea una experiencia de maestría y claridad absoluta.",
            icon: <Crown size={30} />,
            element: null
        },
        {
            title: "Métricas de Impacto",
            description: "Visualiza el pulso de tu éxito. Tus datos ahora se presentan con la jerarquía que un profesional de tu nivel merece.",
            icon: <Users size={30} />,
            element: ".tour-metrics"
        },
        {
            title: "Búsqueda Maestra",
            description: "Accede al instante a todo tu historial. La velocidad del pensamiento aplicada a tu gestión de pacientes diaria.",
            icon: <Search size={30} />,
            element: ".tour-search"
        },
        {
            title: "Nuevo Legado",
            description: "Crea expedientes digitales que reflejen la vanguardia de tu práctica clínica y el inicio de grandes resultados.",
            icon: <Brain size={30} />,
            element: ".tour-add-patient"
        },
        {
            title: "Ajustes de Universo",
            description: "Personaliza Solemia a tu voluntad profesional. Porque el software debe ser siempre una extensión de tu maestría.",
            icon: <Settings size={30} />,
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

        const initialTimeout = setTimeout(type, 400);
        return () => {
            clearTimeout(initialTimeout);
            clearTimeout(typingTimeoutRef.current);
        };
    }, [step]);

    // PRECISION ANCHORING V17 - NARRATIVE HIERARCHY
    useEffect(() => {
        if (!isOpen) return;

        const timer = setInterval(() => {
            const currentStep = steps[step];
            if (currentStep.element) {
                const el = document.querySelector(currentStep.element);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    setTargetRect(rect);

                    // Lógica de Posicionamiento Narrative-First (Vertical Prioritario)
                    const screenH = window.innerHeight;
                    const screenW = window.innerWidth;

                    let finalTop = rect.top - 280; // Caja más alta para jerarquía de texto
                    if (finalTop < 50) finalTop = rect.bottom + 60;

                    finalTop = Math.min(Math.max(finalTop, 50), screenH - 320);
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
        <div id="solemia-luminous-tour" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 11000 }}>
            <div className="solemia-guide-v4-overlay" />

            <div className="nutripal-v4-container" style={{ ...assistantPos, pointerEvents: 'all' }}>
                {targetRect && (
                    <div className="ghost-spotlight-glow" style={{
                        top: targetRect.top,
                        left: targetRect.left,
                        width: targetRect.width,
                        height: targetRect.height,
                        position: 'fixed'
                    }} />
                )}

                <div className="nutripal-v4-speech">
                    {/* Sello de Marca (Top Left) */}
                    <div className="nutripal-v4-orb">
                        {steps[step].icon}
                    </div>

                    {/* JERARQUÍA NARRATIVA (PROTAGONISMO TOTAL DEL TEXTO) */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.25rem' }}>
                        <h4 style={{
                            margin: 0,
                            fontSize: '1rem',
                            fontWeight: 950,
                            color: '#fb7185', // Rosa Solemia Vibrante para el título
                            textTransform: 'uppercase',
                            letterSpacing: '5px'
                        }}>
                            {steps[step].title}
                        </h4>
                        <p style={{
                            fontSize: '1.3rem',
                            color: 'white',
                            lineHeight: 1.6,
                            margin: 0,
                            fontWeight: 600,
                            letterSpacing: '-0.3px',
                            minHeight: '6rem'
                        }}>
                            {displayText}
                        </p>
                    </div>

                    {/* BARRA DE CONTROL MINIMALISTA (Base) */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '1px solid rgba(255,255,255,0.2)',
                        paddingTop: '1.5rem',
                        marginTop: '0.5rem'
                    }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            {steps.map((_, i) => (
                                <div key={i} className={`tour-indicator-dot ${i === step ? 'active' : ''}`} />
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                            {step > 0 && (
                                <button onClick={() => setStep(step - 1)} className="tour-btn-back">
                                    <ChevronLeft size={24} />
                                </button>
                            )}
                            <button onClick={() => step < steps.length - 1 ? setStep(step + 1) : onComplete()} className="tour-btn-next">
                                <span>{step === steps.length - 1 ? 'REINAR' : 'SIGUIENTE'}</span>
                                <ArrowRight size={22} style={{ marginLeft: '12px' }} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeTour;
