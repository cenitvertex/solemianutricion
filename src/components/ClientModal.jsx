import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Upload, Save, Phone, User, FileText, Loader2, Check, ChevronLeft } from 'lucide-react';

export default function ClientModal({ isOpen, onClose, onSuccess, client, onBack }) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [countryCode, setCountryCode] = useState('+52');
    const [expediente, setExpediente] = useState(null);
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [existingPatientData, setExistingPatientData] = useState(null);

    useEffect(() => {
        if (client) {
            setName(client.name || '');

            const fullPhone = client.phone || '';
            if (fullPhone.startsWith('+')) {
                const parts = fullPhone.split(' ');
                if (parts.length > 1) {
                    setCountryCode(parts[0]);
                    setPhone(parts.slice(1).join(' '));
                } else {
                    if (fullPhone.startsWith('+52')) {
                        setCountryCode('+52');
                        setPhone(fullPhone.replace('+52', ''));
                    } else {
                        setPhone(fullPhone);
                    }
                }
            } else {
                setPhone(fullPhone);
            }
        }
    }, [client]);

    const uploadFile = async (file, bucket, clientId) => {
        if (!file) return null;
        const fileExt = file.name.split('.').pop();
        const fileName = `${clientId}/${bucket}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('documents')
            .getPublicUrl(fileName);

        return publicUrl;
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!expediente && !client) {
            setError('Por favor, sube al menos el expediente para que el agente IA pueda trabajar.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) throw new Error('No se pudo obtener la sesión del usuario.');

            let clientId = client?.id;
            const cleanPhone = phone.replace(/\D/g, '');
            const finalPhone = `${countryCode}${cleanPhone}`;

            const patientData = {
                name,
                phone: finalPhone,
                tenant_id: user.id,
                is_active: true
            };

            if (!clientId) {
                const { data: existingPatient } = await supabase
                    .from('patients')
                    .select('id, name')
                    .eq('tenant_id', user.id)
                    .eq('phone', finalPhone)
                    .maybeSingle();

                if (existingPatient && !showConfirm) {
                    setExistingPatientData(existingPatient);
                    setShowConfirm(true);
                    setLoading(false);
                    return;
                }
            }

            const finalClientId = clientId || existingPatientData?.id;

            if (finalClientId) {
                const { error: updError } = await supabase.from('patients').update(patientData).eq('id', finalClientId);
                if (updError) throw updError;
                clientId = finalClientId;
            } else {
                const { data, error: insError } = await supabase.from('patients').insert(patientData).select().single();
                if (insError) throw insError;
                clientId = data.id;
            }

            const updates = {};
            try {
                if (expediente) updates.expediente_url = await uploadFile(expediente, 'expediente', clientId);
                if (plan) updates.plan_url = await uploadFile(plan, 'plan', clientId);
            } catch (uploadErr) {
                throw new Error(`Error al subir archivos: ${uploadErr.message}`);
            }

            if (Object.keys(updates).length > 0) {
                const { error: finalError } = await supabase.from('patients').update(updates).eq('id', clientId);
                if (finalError) throw finalError;
            }

            setShowConfirm(false);
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Detailed error:', err);
            setError(err.message || 'Error de conexión desconocido.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'var(--solemia-charcoal)', opacity: 0.2, backdropFilter: 'blur(20px)', zIndex: 999 }}></div>
            <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                <div className="modal-content glass animate-premium" style={{
                    maxWidth: '550px',
                    width: '100%',
                    position: 'relative',
                    padding: '2.5rem 3.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.2)',
                    borderRadius: '3rem',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'var(--solemia-gradient)' }}></div>

                    {onBack && (
                        <button
                            onClick={onBack}
                            style={{
                                position: 'absolute',
                                left: '1.5rem',
                                top: '1.5rem',
                                color: 'var(--solemia-plum)',
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '9px',
                                fontWeight: '900',
                                opacity: 0.6,
                                transition: 'opacity 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                        >
                            <ChevronLeft size={20} /> VOLVER AL PERFIL
                        </button>
                    )}

                    <button onClick={onClose} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', color: '#ccc', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = 'var(--solemia-plum)'} onMouseLeave={(e) => e.target.style.color = '#ccc'}>
                        <X size={22} />
                    </button>

                    <div style={{ marginBottom: '2rem', marginTop: onBack ? '1rem' : '0' }}>
                        <h2 style={{ fontSize: '2.2rem', color: 'var(--solemia-charcoal)', marginBottom: '0.2rem', fontFamily: 'Outfit', fontWeight: '900', lineHeight: 1 }}>{client ? 'ACTUALIZAR' : 'NUEVA PACIENTE'}</h2>
                        <div className="text-detail" style={{ fontSize: '9px', fontWeight: '900', color: 'var(--solemia-plum)', opacity: 0.6 }}>
                            {client ? `MODIFICANDO EXPEDIENTE DE ${client.name.toUpperCase()}` : 'REGISTRA UN NUEVO EXPEDIENTE EN EL DIRECTORIO'}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '1px', opacity: 0.6 }}>NOMBRE COMPLETO *</label>
                            <input type="text" className="input-field" style={{ textTransform: 'uppercase', fontWeight: '700', borderRadius: '1.25rem', padding: '1rem 1.5rem', border: '1px solid #f0f0f0', backgroundColor: '#fafafa' }} placeholder="EJ. MARIANA SÁNCHEZ" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '1px', opacity: 0.6 }}>TELÉFONO WHATSAPP *</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <select
                                    value={countryCode}
                                    onChange={(e) => setCountryCode(e.target.value)}
                                    className="input-field"
                                    style={{ width: '100px', padding: '0 0.75rem', borderRadius: '1.25rem', fontWeight: '700', border: '1px solid #f0f0f0', backgroundColor: '#fafafa' }}
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
                                    <option value="+502">🇬🇹 +502</option>
                                </select>
                                <input
                                    type="tel"
                                    className="input-field"
                                    style={{ flex: 1, fontWeight: '700', borderRadius: '1.25rem', padding: '1rem 1.5rem', border: '1px solid #f0f0f0', backgroundColor: '#fafafa' }}
                                    placeholder="000 000 0000"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '1px', opacity: 0.6 }}>EXPEDIENTE</label>
                                <label style={{
                                    cursor: 'pointer',
                                    height: '80px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    borderRadius: '1.5rem',
                                    position: 'relative',
                                    backgroundColor: '#f8f0f4',
                                    border: '1px dashed #e5d5dc',
                                    transition: 'all 0.2s'
                                }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--solemia-plum)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5d5dc'}>
                                    <Upload size={18} style={{ color: 'var(--solemia-plum)', opacity: 0.8 }} />
                                    <span style={{ fontSize: '0.7rem', marginTop: '4px', fontWeight: '900', color: 'var(--solemia-plum)' }}>{expediente ? 'LISTO' : 'SUBIR PDF'}</span>
                                    <input type="file" hidden accept=".pdf" onChange={(e) => setExpediente(e.target.files[0])} />
                                    {expediente && <span style={{ fontSize: '8px', color: 'var(--solemia-charcoal)', width: '80%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', position: 'absolute', bottom: '8px' }}>{expediente.name}</span>}
                                </label>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '1px', opacity: 0.6 }}>PLAN ALIMENTICIO</label>
                                <label style={{
                                    cursor: 'pointer',
                                    height: '80px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    borderRadius: '1.5rem',
                                    position: 'relative',
                                    backgroundColor: '#f8f0f4',
                                    border: '1px dashed #e5d5dc',
                                    transition: 'all 0.2s'
                                }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--solemia-plum)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5d5dc'}>
                                    <Upload size={18} style={{ color: 'var(--solemia-plum)', opacity: 0.8 }} />
                                    <span style={{ fontSize: '0.7rem', marginTop: '4px', fontWeight: '900', color: 'var(--solemia-plum)' }}>{plan ? 'LISTO' : 'SUBIR PDF'}</span>
                                    <input type="file" hidden accept=".pdf" onChange={(e) => setPlan(e.target.files[0])} />
                                    {plan && <span style={{ fontSize: '8px', color: 'var(--solemia-charcoal)', width: '80%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', position: 'absolute', bottom: '8px' }}>{plan.name}</span>}
                                </label>
                            </div>
                        </div>

                        {error && <div className="text-detail" style={{ color: '#e11d48', backgroundColor: '#fff1f2', padding: '0.75rem 1rem', borderRadius: '1rem', letterSpacing: '0.5px', textTransform: 'none', fontSize: '10px' }}>{error}</div>}

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary"
                                style={{
                                    flex: 1,
                                    borderRadius: '1.25rem',
                                    padding: '1rem',
                                    fontSize: '10px',
                                    fontWeight: '900',
                                    background: 'var(--solemia-gradient)',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    boxShadow: '0 10px 25px rgba(77, 12, 48, 0.2)'
                                }}
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} style={{ margin: '0 auto' }} /> : (client ? 'GUARDAR CAMBIOS' : 'CREAR REGISTRO')}
                            </button>
                        </div>
                    </form>

                    {showConfirm && (
                        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(77,12,48,0.98)', backdropFilter: 'blur(12px)', borderRadius: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem', zIndex: 10, textAlign: 'center' }}>
                            <div className="animate-premium" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'white' }}>
                                <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '50%', width: 'fit-content', margin: '0 auto' }}>
                                    <Phone size={28} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'white', fontFamily: 'Outfit', fontWeight: '900' }}>REGISTRO DUPLICADO</h3>
                                    <p style={{ fontSize: '0.85rem', opacity: 0.8, lineHeight: '1.5' }}>
                                        Ya existe una paciente ({existingPatientData?.name}) con este número. ¿Deseas actualizar sus datos?
                                    </p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <button
                                        onClick={() => handleSubmit()}
                                        className="btn"
                                        style={{ width: '100%', backgroundColor: 'white', color: 'var(--solemia-plum)', padding: '1rem', borderRadius: '1.25rem', fontWeight: '900', fontSize: '10px' }}
                                        disabled={loading}
                                    >
                                        {loading ? '...' : 'SÍ, ACTUALIZAR DATOS'}
                                    </button>
                                    <button
                                        onClick={() => { setShowConfirm(false); setExistingPatientData(null); }}
                                        style={{ width: '100%', backgroundColor: 'transparent', color: 'white', padding: '0.8rem', border: 'none', fontSize: '9px', fontWeight: '900', opacity: 0.6, cursor: 'pointer' }}
                                    >
                                        CANCELAR
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
