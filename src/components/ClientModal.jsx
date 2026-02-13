import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Upload, Save, Phone, User, FileText, Loader2, Check } from 'lucide-react';

export default function ClientModal({ isOpen, onClose, onSuccess, client }) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [countryCode, setCountryCode] = useState('+52');
    const [allergies, setAllergies] = useState('');
    const [objective, setObjective] = useState('');
    const [expediente, setExpediente] = useState(null);
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [existingPatientData, setExistingPatientData] = useState(null);

    useEffect(() => {
        if (client) {
            setName(client.name || '');
            setAllergies(Array.isArray(client.allergies) ? client.allergies.join(', ') : '');
            setObjective(client.objective_and_params || '');

            // Intentar separar el código de país del teléfono
            const fullPhone = client.phone || '';
            if (fullPhone.startsWith('+')) {
                // Buscamos el primer espacio o los primeros 3-4 caracteres
                const parts = fullPhone.split(' ');
                if (parts.length > 1) {
                    setCountryCode(parts[0]);
                    setPhone(parts.slice(1).join(' '));
                } else {
                    // Si no hay espacio, intentamos detectar si es +52 u otro
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
        // Path: id-paciente/tipo-doc.pdf
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
            if (userError || !user) throw new Error('No se pudo obtener la sesión del usuario. Intenta cerrar sesión y volver a entrar.');

            let clientId = client?.id;
            const cleanPhone = phone.replace(/\D/g, ''); // Solo números del input principal
            const finalPhone = `${countryCode}${cleanPhone}`;

            const patientData = {
                name,
                phone: finalPhone,
                tenant_id: user.id,
                is_active: true,
                allergies: allergies ? allergies.split(',').map(s => s.trim()).filter(s => s) : [],
                objective_and_params: objective || '⏳ En proceso de análisis por el Agente IA...'
            };

            // 1. Verificar Duplicados (Solo si estamos creando nuevo)
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

            // 2. Crear/Actualizar registro
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

            // 3. Subir Archivos
            const updates = {};
            try {
                if (expediente) updates.expediente_url = await uploadFile(expediente, 'expediente', clientId);
                if (plan) updates.plan_url = await uploadFile(plan, 'plan', clientId);
            } catch (uploadErr) {
                throw new Error(`Error al subir archivos: ${uploadErr.message || 'Verifica los permisos del bucket "documents"'}`);
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
            <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
                <div className="modal-content glass animate-premium" style={{
                    maxWidth: '600px',
                    width: '100%',
                    position: 'relative',
                    padding: '3rem 4rem',
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
                        <h2 style={{ fontSize: '2.5rem', color: 'var(--solemia-plum)', marginBottom: '0.2rem', fontFamily: 'Outfit', fontWeight: '900', lineHeight: 1 }}>{client ? 'Actualizar' : 'Nueva Clienta'}</h2>
                        <div className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px' }}>
                            REGISTRA UN NUEVO EXPEDIENTE EN EL DIRECTORIO
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <label className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px', marginLeft: '1rem' }}>IDENTIDAD DE LA PACIENTE *</label>
                            <input type="text" className="input-field" style={{ textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '900', borderRadius: '1.5rem', padding: '1.25rem 2rem' }} placeholder="EJ. MARIANA SÁNCHEZ" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <label className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px', marginLeft: '1rem' }}>TELÉFONO WHATSAPP *</label>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <select
                                    value={countryCode}
                                    onChange={(e) => setCountryCode(e.target.value)}
                                    className="input-field"
                                    style={{ width: '120px', padding: '0 1rem', borderRadius: '1.5rem', fontWeight: '900' }}
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
                                    style={{ flex: 1, fontWeight: '900', letterSpacing: '0.5px', borderRadius: '1.5rem', padding: '1.25rem 2rem' }}
                                    placeholder="000 000 0000"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginTop: '0.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <label className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px', marginLeft: '1rem' }}>EXPEDIENTE</label>
                                <label className="btn" style={{ cursor: 'pointer', height: '110px', flexDirection: 'column', textAlign: 'center', borderRadius: '1.5rem', position: 'relative', backgroundColor: '#f8f0f4', border: 'none' }}>
                                    <Upload size={22} style={{ color: 'var(--solemia-plum)', opacity: 0.8 }} />
                                    <span style={{ fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 'normal' }}>{expediente ? 'Archivo Listo' : 'PDF'}</span>
                                    <input type="file" hidden accept=".pdf" onChange={(e) => setExpediente(e.target.files[0])} />
                                    {expediente && <span style={{ fontSize: '9px', width: '80%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', position: 'absolute', bottom: '10px' }}>{expediente.name}</span>}
                                </label>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <label className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px', marginLeft: '1rem' }}>PLAN ALIMENTICIO</label>
                                <label className="btn" style={{ cursor: 'pointer', height: '110px', flexDirection: 'column', textAlign: 'center', borderRadius: '1.5rem', position: 'relative', backgroundColor: '#f8f0f4', border: 'none' }}>
                                    <Upload size={22} style={{ color: 'var(--solemia-plum)', opacity: 0.8 }} />
                                    <span style={{ fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 'normal' }}>{plan ? 'Plan Listo' : 'PDF'}</span>
                                    <input type="file" hidden accept=".pdf" onChange={(e) => setPlan(e.target.files[0])} />
                                    {plan && <span style={{ fontSize: '9px', width: '80%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', position: 'absolute', bottom: '10px' }}>{plan.name}</span>}
                                </label>
                            </div>
                        </div>

                        {error && <div className="text-detail" style={{ color: '#e11d48', backgroundColor: '#fff1f2', padding: '1rem', borderRadius: '1.5rem', letterSpacing: '0.5px', textTransform: 'none' }}>{error}</div>}

                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
                            <button type="button" onClick={onClose} className="btn" style={{ flex: 1, color: '#aaa', fontSize: '9px', fontWeight: '900' }}>CANCELAR</button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary"
                                style={{
                                    flex: 1.5,
                                    borderRadius: '1.5rem',
                                    padding: '1.25rem',
                                    fontSize: '10px',
                                    boxShadow: '0 10px 30px rgba(77, 12, 48, 0.2)'
                                }}
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : (client ? 'ACTUALIZAR EXPEDIENTE' : 'CREAR EXPEDIENTE')}
                            </button>
                        </div>
                    </form>

                    {/* Custom Confirmation Modal */}
                    {showConfirm && (
                        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(77,12,48,0.95)', backdropFilter: 'blur(12px)', borderRadius: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', zIndex: 10, textAlign: 'center' }}>
                            <div className="animate-premium" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', color: 'white' }}>
                                <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '1.25rem', borderRadius: '50%', width: 'fit-content', margin: '0 auto' }}>
                                    <Phone size={32} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: 'white', fontFamily: 'Outfit', fontWeight: '900' }}>Registro Duplicado</h3>
                                    <p style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: '1.5' }}>
                                        Ya existe un paciente ({existingPatientData?.name}) con este número.
                                    </p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <button
                                        onClick={() => handleSubmit()}
                                        className="btn"
                                        style={{ width: '100%', backgroundColor: 'white', color: 'var(--solemia-plum)', padding: '1.1rem', borderRadius: '1.5rem' }}
                                        disabled={loading}
                                    >
                                        {loading ? 'Actualizando...' : 'SÍ, ACTUALIZAR DATOS'}
                                    </button>
                                    <button
                                        onClick={() => { setShowConfirm(false); setExistingPatientData(null); }}
                                        className="btn"
                                        style={{ width: '100%', backgroundColor: 'transparent', color: 'white', padding: '0.8rem', border: '1px solid rgba(255,255,255,0.2)', fontSize: '8px' }}
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
