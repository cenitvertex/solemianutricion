import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Star, Users, Brain, Settings, CheckCircle2 } from 'lucide-react';

const WelcomeTour = ({ isOpen, onComplete }) => {
    const [step, setStep] = useState(0);

    const steps = [
        {
            title: "¡Bienvenida a Solemia Nutrición!",
            description: "Estamos muy emocionados de acompañarte en la digitalización de tu consultorio. Este breve recorrido te enseñará a dominar tu nueva plataforma en segundos.",
            icon: <Star size={40} color="var(--solemia-pink)" />,
            action: "¡Empecemos!"
        },
        {
            title: "El Pulso de tu Clínica",
            description: "En la sección superior verás tus métricas clave: pacientes agendados, ventas del día y tu crecimiento general. Todo de un vistazo.",
            icon: <Users size={40} color="var(--solemia-plum)" />,
            target: ".metrics-grid" // Selector para resaltar si es posible o simplemente mencionar
        },
        {
            title: "Directorio Inteligente",
            description: "Encuentra a cualquier paciente al instante. Puedes filtrar por nombre o ver quién ha tenido actividad reciente con un solo clic.",
            icon: <CheckCircle2 size={40} color="var(--solemia-emerald)" />,
            target: ".search-container"
        },
        {
            title: "Potencia tu Consulta con IA",
            description: "Al agregar un paciente o subir archivos, nuestra IA analizará todo automáticamente para darte resúmenes clínicos de alta precisión.",
            icon: <Brain size={40} color="var(--solemia-plum)" />,
            target: ".btn-primary"
        },
        {
            title: "Tu Consultorio, Tus Reglas",
            description: "En configuración podrás definir cómo quieres que tu asistente IA te ayude y personalizar tus mensajes de bienvenida.",
            icon: <Settings size={40} color="var(--solemia-pink)" />,
            target: ".btn-settings"
        }
    ];

    if (!isOpen) return null;

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            onComplete();
        }
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    const currentStepData = steps[step];

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(77, 12, 48, 0.4)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
            padding: '2rem'
        }}>
            <div className="card glass animate-scale-in" style={{
                maxWidth: '500px',
                width: '100%',
                padding: '3.5rem',
                borderRadius: '3.5rem',
                textAlign: 'center',
                backgroundColor: 'white',
                boxShadow: '0 50px 100px rgba(0,0,0,0.3)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Accent line */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '10px', background: 'var(--solemia-gradient)' }}></div>

                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
                    <div style={{
                        padding: '1.5rem',
                        borderRadius: '2.5rem',
                        backgroundColor: 'rgba(142,45,79,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {currentStepData.icon}
                    </div>
                </div>

                <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--solemia-plum)', marginBottom: '1rem', fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>
                    {currentStepData.title}
                </h2>

                <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                    {currentStepData.description}
                </p>

                {/* Progress Indicators */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '2.5rem' }}>
                    {steps.map((_, i) => (
                        <div key={i} style={{
                            width: i === step ? '24px' : '8px',
                            height: '8px',
                            borderRadius: '4px',
                            backgroundColor: i === step ? 'var(--solemia-pink)' : '#e2e8f0',
                            transition: 'all 0.3s ease'
                        }}></div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    {step > 0 && (
                        <button
                            onClick={handleBack}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                borderRadius: '1.5rem',
                                border: '1px solid #eee',
                                background: 'white',
                                color: '#94a3b8',
                                fontWeight: '900',
                                fontSize: '11px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <ChevronLeft size={14} /> Atrás
                        </button>
                    )}
                    <button
                        onClick={handleNext}
                        className="btn btn-primary"
                        style={{
                            flex: 2,
                            padding: '1.25rem',
                            borderRadius: '1.5rem',
                            fontSize: '11px',
                            fontWeight: '900',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 15px 30px rgba(77, 12, 48, 0.2)'
                        }}
                    >
                        {step === steps.length - 1 ? '¡Listo, a brillar!' : 'Siguiente'} <ChevronRight size={14} />
                    </button>
                </div>

                {/* Optional: Skip button */}
                <button
                    onClick={onComplete}
                    style={{
                        marginTop: '1.5rem',
                        background: 'none',
                        border: 'none',
                        color: '#cbd5e1',
                        fontSize: '9px',
                        fontWeight: '900',
                        cursor: 'pointer',
                        letterSpacing: '1px'
                    }}
                >
                    SALTAR RECORRIDO
                </button>
            </div>
        </div>
    );
};

export default WelcomeTour;
