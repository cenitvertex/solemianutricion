import React from 'react';
import { X, TrendingUp, Target, Clock, MessageSquare, Zap, Star } from 'lucide-react';

const GuideModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <>
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'var(--solemia-charcoal)', opacity: 0.2, backdropFilter: 'blur(20px)', zIndex: 11000 }} onClick={onClose}></div>
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 11001, padding: '1.5rem', pointerEvents: 'none' }}>
                <div className="modal-content glass animate-premium" style={{
                    maxWidth: '850px',
                    width: '100%',
                    maxHeight: '85vh',
                    position: 'relative',
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    boxShadow: '0 50px 120px rgba(0,0,0,0.25)',
                    borderRadius: '3.5rem',
                    overflowY: 'auto',
                    pointerEvents: 'all',
                    padding: 0
                }}>
                    {/* Header Beauty */}
                    <div style={{ position: 'sticky', top: 0, background: 'white', zIndex: 10, padding: '2.5rem 4rem', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', background: 'var(--solemia-gradient)' }}></div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: '2.4rem', color: 'var(--solemia-plum)', marginBottom: '0.25rem', fontFamily: 'var(--font-display)', fontWeight: '900', lineHeight: 1 }}>
                                    Guía de Éxito Solemia
                                </h2>
                                <div className="text-detail" style={{ fontSize: '10px', fontWeight: '900', letterSpacing: '2px', color: 'var(--solemia-pink)' }}>
                                    ESTRATEGIA PARA GENERAR UN 30% MÁS CON IA
                                </div>
                            </div>
                            <button onClick={onClose} style={{ background: '#f8fafc', border: 'none', padding: '0.75rem', borderRadius: '50%', cursor: 'pointer', color: '#64748b' }}>
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '3rem 4rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>

                        {/* Intro */}
                        <div style={{ padding: '2rem', background: 'rgba(77, 12, 48, 0.03)', borderRadius: '2.5rem', border: '1px solid rgba(77, 12, 48, 0.05)' }}>
                            <p style={{ fontSize: '1.1rem', color: '#334155', lineHeight: '1.8', margin: 0, fontWeight: 500 }}>
                                ¡Felicidades! Tienes en tus manos una herramienta de clase mundial. Pero Solemia no es solo un software; es tu **multiplicador de fuerza**. Esta guía te enseñará cómo aumentar tus ingresos y liberar tu tiempo.
                            </p>
                        </div>

                        {/* Point 1 */}
                        <div style={{ display: 'flex', gap: '2rem' }}>
                            <div style={{ width: '60px', height: '60px', background: '#eff6ff', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Clock size={32} color="#3b82f6" />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1.4rem', fontWeight: '900', marginBottom: '1rem', color: 'var(--solemia-plum)' }}>1. El Costo del "Trabajo de Oficina"</h4>
                                <p style={{ color: '#475569', lineHeight: '1.7', fontSize: '1rem' }}>
                                    Tradicionalmente, un nutriólogo pasa 45-60 min por paciente solo en traspasar datos. Con Solemia, reduces esto a segundos. Atiende <strong>6 pacientes al día</strong> con la misma energía con la que antes atendías 4. Aumento inmediato del **50% en tu capacidad**.
                                </p>
                            </div>
                        </div>

                        {/* Point 2 */}
                        <div style={{ display: 'flex', gap: '2rem' }}>
                            <div style={{ width: '60px', height: '60px', background: '#fef2f2', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Target size={32} color="#f43f5e" />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1.4rem', fontWeight: '900', marginBottom: '1rem', color: 'var(--solemia-plum)' }}>2. Resumen de Impacto Clínica</h4>
                                <p style={{ color: '#475569', lineHeight: '1.7', fontSize: '1rem' }}>
                                    Envía el resumen clínico de la IA a tu paciente <strong>antes de la consulta</strong>. El nivel de profesionalismo percibido justifica una **tarifa Premium 20-30% mayor** que tu competencia. No vendes una dieta, vendes precisión clínica.
                                </p>
                            </div>
                        </div>

                        {/* Point 3 */}
                        <div style={{ display: 'flex', gap: '2rem' }}>
                            <div style={{ width: '60px', height: '60px', background: '#f0fdf4', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <MessageSquare size={32} color="#10b981" />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1.4rem', fontWeight: '900', marginBottom: '1rem', color: 'var(--solemia-plum)' }}>3. Seguimiento Proactivo</h4>
                                <p style={{ color: '#475569', lineHeight: '1.7', fontSize: '1rem' }}>
                                    Usa el Registro de IA para detectar patrones. Si la IA nota que un paciente flaquea, envíale un mensaje de motivación personalizado. Esto **reduce la deserción en un 30%**, manteniendo tu agenda llena.
                                </p>
                            </div>
                        </div>

                        {/* Footer Tip */}
                        <div style={{
                            background: 'var(--solemia-gradient)',
                            padding: '2.5rem',
                            borderRadius: '2.5rem',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1.5rem',
                            marginTop: '1rem',
                            boxShadow: '0 20px 40px rgba(225, 29, 72, 0.2)'
                        }}>
                            <Zap size={40} fill="white" />
                            <div>
                                <div style={{ fontSize: '0.8rem', fontWeight: '900', letterSpacing: '1px', opacity: 0.8, marginBottom: '0.4rem' }}>CONSEJO DE ÉLITE</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: '700', lineHeight: '1.5' }}>
                                    "Tu tiempo es lo más valioso. No lo gastes escribiendo; gástalo transformando vidas. Solemia hace el resto." 🦁💎✨
                                </div>
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', paddingBottom: '2rem' }}>
                            <button onClick={onClose} className="btn btn-primary" style={{ padding: '1.25rem 4rem', borderRadius: '1.5rem', fontSize: '11px' }}>
                                Entendido, vamos a ganar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GuideModal;
