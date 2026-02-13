import React, { useState, useEffect } from 'react';
import { X, Save, User, Building, Landmark, Phone, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';

const SettingsModal = ({ isOpen, onClose, session }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        nutritionist_name: '',
        professional_id: '',
        whatsapp: '',
        welcome_message: ''
    });

    useEffect(() => {
        if (isOpen && session?.user?.id) {
            fetchSettings();
        }
    }, [isOpen, session]);

    const fetchSettings = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('tenants')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

        if (data && !error) {
            setFormData({
                name: data.name || '',
                nutritionist_name: data.config?.nutritionist_name || '',
                professional_id: data.config?.professional_id || '',
                whatsapp: data.config?.whatsapp || '',
                welcome_message: data.system_prompt || ''
            });
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
            .from('tenants')
            .update({
                name: formData.name,
                system_prompt: formData.welcome_message,
                config: {
                    nutritionist_name: formData.nutritionist_name,
                    professional_id: formData.professional_id,
                    whatsapp: formData.whatsapp
                }
            })
            .eq('id', session.user.id);

        if (!error) {
            onClose();
        } else {
            alert('Error al guardar configuración: ' + error.message);
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <>
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'var(--solemia-charcoal)', opacity: 0.2, backdropFilter: 'blur(20px)', zIndex: 999 }}></div>
            <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
                <div className="modal-content glass animate-premium" style={{
                    maxWidth: '700px',
                    width: '100%',
                    position: 'relative',
                    padding: '4rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.2)',
                    borderRadius: '3.5rem',
                    overflow: 'hidden'
                }}>
                    {/* Beauty Accent */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', background: 'var(--solemia-gradient)' }}></div>

                    <button onClick={onClose} style={{ position: 'absolute', right: '2rem', top: '2.5rem', color: '#ddd', backgroundColor: 'transparent', width: '36px', height: '36px', border: 'none', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>

                    <div style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '2.5rem', color: 'var(--solemia-plum)', marginBottom: '0.2rem', fontFamily: 'Outfit', fontWeight: '900', lineHeight: 1 }}>Configuración</h2>
                        <div className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px' }}>
                            PERSONALIZACIÓN DEL CONSULTORIO Y ASISTENTE IA
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <label className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px', marginLeft: '1rem' }}>CLÍNICA / CONSULTORIO</label>
                                <input
                                    className="input-field"
                                    style={{ borderRadius: '1.5rem', padding: '1.25rem 2rem', fontWeight: '900' }}
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="EJ. SOLEMIA NUTRICIÓN"
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <label className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px', marginLeft: '1rem' }}>ESPECIALISTA</label>
                                <input
                                    className="input-field"
                                    style={{ borderRadius: '1.5rem', padding: '1.25rem 2rem', fontWeight: '900' }}
                                    value={formData.nutritionist_name}
                                    onChange={e => setFormData({ ...formData, nutritionist_name: e.target.value })}
                                    placeholder="EJ. LIC. ANDREA PÉREZ"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <label className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px', marginLeft: '1rem' }}>CÉDULA PROFESIONAL</label>
                                <input
                                    className="input-field"
                                    style={{ borderRadius: '1.5rem', padding: '1.25rem 2rem', fontWeight: '900' }}
                                    value={formData.professional_id}
                                    onChange={e => setFormData({ ...formData, professional_id: e.target.value })}
                                    placeholder="NÚMERO OFICIAL"
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <label className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px', marginLeft: '1rem' }}>WHATSAPP DE CONTACTO</label>
                                <input
                                    className="input-field"
                                    style={{ borderRadius: '1.5rem', padding: '1.25rem 2rem', fontWeight: '900' }}
                                    value={formData.whatsapp}
                                    onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                                    placeholder="+52 000 000 0000"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <label className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px', marginLeft: '1rem' }}>INSTRUCCIONES PARA LA IA</label>
                            <textarea
                                className="input-field"
                                style={{ minHeight: '120px', borderRadius: '1.5rem', padding: '1.5rem 2rem', fontWeight: '500', lineHeight: '1.6' }}
                                value={formData.welcome_message}
                                onChange={e => setFormData({ ...formData, welcome_message: e.target.value })}
                                placeholder="DEFINE CÓMO DEBE COMPORTARSE EL ASISTENTE..."
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
                            <button type="button" onClick={onClose} className="btn" style={{ flex: 1, color: '#aaa', fontSize: '9px', fontWeight: '900' }}>DESCARTAR</button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary"
                                style={{
                                    flex: 2,
                                    borderRadius: '1.5rem',
                                    padding: '1.25rem',
                                    fontSize: '10px',
                                    boxShadow: '0 10px 30px rgba(77, 12, 48, 0.2)'
                                }}
                            >
                                {loading ? 'GUARDANDO CAMBIOS...' : 'ACTUALIZAR CONFIGURACIÓN'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default SettingsModal;
