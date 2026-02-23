import React, { useState, useEffect, useRef } from 'react';
import { Star, Users, Brain, Settings, Sparkles, Wand2, ArrowRight, ChevronLeft } from 'lucide-react';

const WelcomeTour = ({ isOpen, onComplete }) => {
    const [step, setStep] = useState(0);
    const [targetRect, setTargetRect] = useState(null);
    const [displayText, setDisplayText] = useState('');
    const [assistantPos, setAssistantPos] = useState({ top: '2rem', left: '50%', transform: 'translateX(-50%)' });
    const typingTimeoutRef = useRef();

    useEffect(() => {
        if (isOpen) {
            setStep(0);
            console.log("⛩️ SOLEMIA ZENITH V11 - PERFECCIÓN ABSOLUTA");
        }
    }, [isOpen]);

    const steps = [
        {
            title: "Zenith: Tu Nuevo Comando",
            description: "No solo estás usando software; estás comandando una clínica de alto rendimiento. Permíteme mostrarte el poder de Solemia.",
            icon: <Wand2 size={24} />,
            element: null
        },
        {
            title: "El Pulso de tus Resultados",
            description: "Toca el corazón de tu consultorio. Aquí es donde los números se convierten en historias de éxito reales.",
            icon: <Users size={24} />,
            element: ".tour-metrics"
        },
        {
            title: "Búsqueda Ultra-Rápida",
            description: "Encuentra cualquier expediente en microsegundos. Tu agilidad mental ahora tiene un motor de búsqueda a su altura.",
            icon: <Sparkles size={24} />,
            element: ".tour-search"
        },
        {
            title: "Ingeniería de Pacientes",
            description: "Añade nuevos legados clínicos. Mi IA analizará cada dato para que siempre tomes la decisión más brillante.",
            icon: <Brain size={24} />,
            element: ".tour-add-patient"
        },
        {
            title: "Ajuste de Precisión",
            description: "Diseña tu entorno de trabajo. El software debe responder a tu ritmo, nunca al revés.",
            icon: <Settings size={24} />,
            element: ".tour-settings"
        },
        {
            title: "Empieza tu Legado",
            description: "La teoría ha terminado. El consultorio del futuro te pertenece. Hazlo brillar.",
            icon: <Star size={24} />,
            element: null
        }
    ];

    // Zenith Typewriter: Ritmo maestro
    useEffect(() => {
        setDisplayText('');
        let i = 0;
        const text = steps[step].description;

        const type = () => {
            if (i < text.length) {
                const Char = text.charAt(i);
                setDisplayText(prev => prev + Char);
                i++;
                const speed = Char === '.' || Char === ',' ? 180 : 15;
                typingTimeoutRef.current = setTimeout(type, speed);
            }
        };

        const initialTimeout = setTimeout(type, 200);
        return () => {
            clearTimeout(initialTimeout);
            clearTimeout(typingTimeoutRef.current);
        };
    }, [step]);

    // ZENITH: Posicionamiento Contextual "Flying"
    useEffect(() => {
        if (!isOpen) return;

        const timer = setInterval(() => {
            const currentStep = steps[step];
            if (currentStep.element) {
                const el = document.querySelector(currentStep.element);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    setTargetRect({
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height
                    });

                    // Lógica de posicionamiento inteligente (Dynamic Positioning)
                    const isTooHigh = rect.top < 300;
                    const isTooRight = rect.left > window.innerWidth - 400;

                    setAssistantPos({
                        top: isTooHigh ? `${rect.bottom + 40}px` : `${rect.top - 220}px`,
                        left: isTooRight ? `${rect.right - 200}px` : `${rect.left + rect.width / 2}px`,
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

    // ZENITH: Clip-Path Dinámico para nitidez 1:1 (Literalmente recorta el overlay)
    const getClipPath = () => {
        if (!targetRect) return 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
        const { left, top, width, height } = targetRect;
        const p = 15; // Padding
        const l = left - p;
        const t = top - p;
        const w = width + p * 2;
        const h = height + p * 2;

        // Inversión de máscara con clip-path: crea una caja transparente
        return `polygon(
            0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%, 
            ${l}px ${t}px, ${l + w}px ${t}px, ${l + w}px ${t + h}px, ${l}px ${t + h}px, ${l}px ${t}px
        )`;
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                className="solemia-guide-v4-overlay"
                style={{
                    pointerEvents: 'none',
                    clipPath: getClipPath(),
                    WebkitClipPath: getClipPath()
                }}
            />

            <div className="nutripal-v4-container" style={assistantPos}>
                {targetRect && <div className="zenith-spotlight-focus" style={{
                    top: targetRect.top - 15,
                    left: targetRect.left - 15,
                    width: targetRect.width + 30,
                    height: targetRect.height + 30,
                    position: 'fixed'
                }} />}

                <div className="nutripal-v4-speech">
                    <div className="nutripal-v4-orb">
                        {steps[step].icon}
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: 'var(--solemia-plum)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                            {steps[step].title}
                        </h4>
                        <p style={{ fontSize: '0.92rem', color: '#1e293b', lineHeight: 1.6, margin: 0, fontWeight: 500, minHeight: '3rem' }}>
                            {displayText}
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', borderLeft: '1px solid rgba(0,0,0,0.06)', paddingLeft: '2.5rem' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {steps.map((_, i) => (
                                <div key={i} className={`tour-indicator-dot ${i === step ? 'active' : ''}`} />
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                            {step > 0 && (
                                <button onClick={() => setStep(step - 1)} className="tour-btn-back">
                                    <ChevronLeft size={18} />
                                </button>
                            )}
                            <button onClick={() => step < steps.length - 1 ? setStep(step + 1) : onComplete()} className="tour-btn-next">
                                <span>{step === steps.length - 1 ? 'EMPEZAR' : 'SIGUIENTE'}</span>
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default WelcomeTour;
