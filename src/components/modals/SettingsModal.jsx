import React, { useState, useEffect } from 'react';
import { X, Save, User, Building, Landmark, Phone, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const SettingsModal = ({ isOpen, onClose, session, onRestartTour }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        whatsapp: '',
        welcome_message: ''
    });
    const [countryCode, setCountryCode] = useState('+52');

    const [subscription, setSubscription] = useState({
        status: 'inactive',
        plan: 'none',
        validUntil: null,
        cancelling: false,
        patientCount: 0
    });

    useEffect(() => {
        if (isOpen && session?.user?.id) {
            fetchSettings();
        }
    }, [isOpen, session]);

    const fetchSettings = async () => {
        setLoading(true);
        // 1. Fetch Tenant Data
        const { data, error } = await supabase
            .from('tenants')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

        // 2. Fetch Patient Count
        const { count: pCount } = await supabase
            .from('patients')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', session.user.id);

        if (data && !error) {
            let phone = data.phone_number || '';
            let code = '+52';
            let localPart = phone;

            if (phone.startsWith('+')) {
                const commonCodes = ['+52', '+1', '+34', '+54', '+55', '+56', '+57', '+51', '+593', '+502'];
                const matchedCode = commonCodes.find(c => phone.startsWith(c));

                if (matchedCode) {
                    code = matchedCode;
                    localPart = phone.replace(matchedCode, '').trim();
                }
            }

            setFormData({
                name: data.name || '',
                whatsapp: localPart,
                welcome_message: data.system_prompt || ''
            });
            setCountryCode(code);
            setSubscription({
                status: data.subscription_status || 'inactive',
                plan: data.plan_type || 'none',
                validUntil: data.access_until,
                cancelling: false,
                patientCount: pCount || 0
            });
        }
        setLoading(false);
    };

    const handleCancelSubscription = async () => {
        if (!confirm('¿Estás seguro de que deseas cancelar tu suscripción? Seguirás teniendo acceso hasta la fecha de vencimiento, pero no se realizarán más cargos automáticos.')) return;

        setSubscription(prev => ({ ...prev, cancelling: true }));
        try {
            const response = await fetch('/api/cancel-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: session.user.id })
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                fetchSettings(); // Recargar datos
            } else {
                alert('Error al cancelar: ' + (result.error || result.details));
            }
        } catch (error) {
            alert('Error de conexión al intentar cancelar.');
        } finally {
            setSubscription(prev => ({ ...prev, cancelling: false }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const cleanPhone = formData.whatsapp.replace(/\D/g, '');
        const finalPhone = `${countryCode}${cleanPhone}`;

        const { error } = await supabase
            .from('tenants')
            .update({
                name: formData.name,
                phone_number: finalPhone,
                system_prompt: formData.welcome_message
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
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'var(--solemia-charcoal)', opacity: 0.2, backdropFilter: 'blur(20px)', zIndex: 9998 }}></div>
            <div className="modal-overlay-responsive" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1.5rem' }}>
                <div className="modal-content glass animate-premium modal-content-responsive modal-padded-responsive" style={{
                    maxWidth: '700px',
                    width: '100%',
                    position: 'relative',
                    padding: '3rem 4rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.2)',
                    borderRadius: '3.5rem',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    margin: 'auto'
                }}>
                    {/* Beauty Accent */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', background: 'var(--solemia-gradient)' }}></div>

                    <button onClick={onClose} style={{ position: 'absolute', right: '2rem', top: '2.5rem', color: '#ddd', backgroundColor: 'transparent', width: '36px', height: '36px', border: 'none', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '2.2rem', color: 'var(--solemia-plum)', marginBottom: '0.2rem', fontFamily: 'var(--font-display)', fontWeight: '900', lineHeight: 1 }}>Configuración</h2>
                        <div className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px' }}>
                            Cuenta, suscripción y asistente IA
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* 1. Información de la Cuenta y Suscripción */}
                        <div style={{ padding: '1.5rem', borderRadius: '2rem', background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    < Landmark size={18} color="var(--solemia-pink)" />
                                    <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--solemia-plum)', textTransform: 'uppercase', letterSpacing: '1px' }}>Suscripción Solemia</span>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <button
                                        type="button"
                                        onClick={onRestartTour}
                                        style={{
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            fontSize: '8px',
                                            fontWeight: '900',
                                            backgroundColor: '#f1f5f9',
                                            color: '#64748b',
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        VER TUTORIAL
                                    </button>
                                    <div style={{
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        fontSize: '9px',
                                        fontWeight: '900',
                                        backgroundColor: subscription.status === 'active' ? '#ecfdf5' : '#fff1f2',
                                        color: subscription.status === 'active' ? '#059669' : '#e11d48'
                                    }}>
                                        {subscription.status === 'active' ? '● ACTIVA' : '● ' + subscription.status.toUpperCase()}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <div style={{ fontSize: '8px', color: '#94a3b8', fontWeight: '900', marginBottom: '4px' }}>PLAN ACTUAL</div>
                                    <div style={{ fontSize: '13px', fontWeight: '900', color: 'var(--solemia-charcoal)' }}>
                                        {subscription.plan === 'monthly' ? 'Mensual Nutriólogo' : subscription.plan === 'founder_semiannual' ? 'Semestral Emprendedor' : 'Sin Plan Activo'}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '8px', color: '#94a3b8', fontWeight: '900', marginBottom: '4px' }}>PRÓXIMO VENCIMIENTO</div>
                                    <div style={{ fontSize: '13px', fontWeight: '900', color: 'var(--solemia-charcoal)' }}>
                                        {subscription.validUntil ? new Date(subscription.validUntil).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                                    </div>
                                </div>
                            </div>

                            {/* Consumo de Pacientes */}
                            <div style={{ marginTop: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <div style={{ fontSize: '8px', color: '#94a3b8', fontWeight: '900' }}>PACIENTES REGISTRADOS</div>
                                    <div style={{ fontSize: '9px', fontWeight: '900', color: 'var(--solemia-plum)' }}>{subscription.patientCount} / 30</div>
                                </div>
                                <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${Math.min((subscription.patientCount / 30) * 100, 100)}%`,
                                        background: 'var(--solemia-gradient)',
                                        borderRadius: '2px',
                                        transition: 'width 0.5s ease'
                                    }}></div>
                                </div>
                            </div>

                            {subscription.status === 'active' && (
                                <button
                                    type="button"
                                    onClick={handleCancelSubscription}
                                    disabled={subscription.cancelling}
                                    style={{
                                        alignSelf: 'flex-start',
                                        background: 'none',
                                        border: 'none',
                                        color: '#e11d48',
                                        fontSize: '9px',
                                        fontWeight: '900',
                                        cursor: 'pointer',
                                        padding: '4px 0',
                                        textDecoration: 'underline'
                                    }}
                                >
                                    {subscription.cancelling ? 'Procesando...' : 'Cancelar renovación automática'}
                                </button>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <label className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px', marginLeft: '1rem' }}>Tu nombre profesional</label>
                                <input
                                    className="input-field"
                                    style={{ borderRadius: '1.5rem', padding: '1rem 1.5rem', fontWeight: '700', fontSize: '12px' }}
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej. Lic. Andrea Pérez"
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <label className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px', marginLeft: '1rem' }}>WhatsApp (Pacientes)</label>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <select
                                        value={countryCode}
                                        onChange={(e) => setCountryCode(e.target.value)}
                                        className="input-field"
                                        style={{ width: '80px', padding: '0 0.5rem', borderRadius: '1.25rem', fontWeight: '700', fontSize: '12px' }}
                                    >
                                        <option value="+52">🇲🇽 +52</option>
                                        <option value="+1">🇺🇸 +1</option>
                                        <option value="+34">🇪🇸 +34</option>
                                        <option value="+54">🇦🇷 +54</option>
                                        <option value="+55">🇧🇷 +55</option>
                                        <option value="+56">🇨🇱 +56</option>
                                        <option value="+57">🇨🇴 +57</option>
                                        <option value="+51">🇵🇪 +51</option>
                                        <option value="+593">🇪🇨 +593</option>
                                        <option value="+502">🇬 +502</option>
                                    </select>
                                    <input
                                        className="input-field"
                                        style={{ flex: 1, borderRadius: '1.25rem', padding: '1rem 1.5rem', fontWeight: '700', fontSize: '12px' }}
                                        value={formData.whatsapp}
                                        onChange={e => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setFormData({ ...formData, whatsapp: value });
                                        }}
                                        placeholder="000 000 0000"
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <label className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px', marginLeft: '1rem' }}>Instrucciones personalizadas para la IA</label>
                            <textarea
                                className="input-field"
                                style={{ minHeight: '100px', borderRadius: '1.5rem', padding: '1.25rem 1.75rem', fontWeight: '500', lineHeight: '1.6', fontSize: '12px' }}
                                value={formData.welcome_message}
                                onChange={e => setFormData({ ...formData, welcome_message: e.target.value })}
                                placeholder="Define cómo debe comportarse el asistente al analizar a tus pacientes..."
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
                            <button type="button" onClick={onClose} className="btn" style={{ flex: 1, color: '#aaa', fontSize: '9px', fontWeight: '900' }}>Cancelar</button>
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
                                {loading ? 'Guardando...' : 'Guardar configuración'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default SettingsModal;
