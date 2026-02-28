import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Upload, Save, Phone, User, FileText, Loader2, Check, ChevronLeft, Info } from 'lucide-react';

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
    const [isExpedienteProcessed, setIsExpedienteProcessed] = useState(false);
    const [isPlanProcessed, setIsPlanProcessed] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [expedienteUrl, setExpedienteUrl] = useState('');
    const [planUrl, setPlanUrl] = useState('');
    const [expedientePath, setExpedientePath] = useState('');
    const [planPath, setPlanPath] = useState('');

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
        if (!file) return { url: null, path: null };
        const fileExt = file.name.split('.').pop();
        const fileName = `${clientId}/${bucket}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('documents')
            .getPublicUrl(fileName);

        return { url: publicUrl, path: fileName };
    };

    const handleProcessFiles = async () => {
        if (!expediente && !plan) return;
        setIsProcessing(true);
        setError(null);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (expediente && !isExpedienteProcessed) {
                const { url, path } = await uploadFile(expediente, 'expediente', user.id);
                setExpedienteUrl(url);
                setExpedientePath(path);
                setIsExpedienteProcessed(true);
            }
            if (plan && !isPlanProcessed) {
                const { url, path } = await uploadFile(plan, 'plan', user.id);
                setPlanUrl(url);
                setPlanPath(path);
                setIsPlanProcessed(true);
            }
        } catch (err) {
            setError('Error al procesar archivos. Revisa tu conexión.');
        } finally {
            setIsProcessing(false);
        }
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
            if (userError || !user) throw new Error('No pudimos verificar tu sesión. Por favor, intenta entrar de nuevo.');

            let clientId = client?.id;
            const cleanPhone = phone.replace(/\D/g, '');
            const finalPhone = `${countryCode}${cleanPhone}`;

            const patientData = {
                name,
                phone: finalPhone,
                tenant_id: user.id,
                is_active: true,
                // Si hay nuevos archivos, forzamos placeholders de "Analizando..."
                // de lo contrario mantenemos lo que hay.
                allergies: (isExpedienteProcessed || isPlanProcessed)
                    ? ['⏳ Analizando...']
                    : (client?.allergies || ['⏳ Analizando...']),
                objective_and_params: (isExpedienteProcessed || isPlanProcessed)
                    ? '⏳ En proceso de análisis por el Agente IA...'
                    : (client?.objective_and_params || '⏳ En proceso de análisis por el Agente IA...')
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
            if (isExpedienteProcessed && expedienteUrl) updates.expediente_url = expedienteUrl;
            if (isPlanProcessed && planUrl) updates.plan_url = planUrl;

            if (Object.keys(updates).length > 0) {
                const { error: finalError } = await supabase.from('patients').update(updates).eq('id', clientId);
                if (finalError) throw finalError;

                // Disparar workflow de ingesta para procesar documentos con IA
                console.log('🤖 Disparando Webhook de Ingesta IA para paciente:', clientId);

                try {
                    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;

                    // Generar URLs firmadas para n8n (1 hora de validez)
                    // Esto permite que n8n lea los archivos aunque el bucket sea privado
                    let expedienteSignedUrl = null;
                    let planSignedUrl = null;

                    if (isExpedienteProcessed && expedientePath) {
                        const { data } = await supabase.storage.from('documents').createSignedUrl(expedientePath, 3600);
                        expedienteSignedUrl = data?.signedUrl;
                    }

                    if (isPlanProcessed && planPath) {
                        const { data } = await supabase.storage.from('documents').createSignedUrl(planPath, 3600);
                        planSignedUrl = data?.signedUrl;
                    }

                    await fetch(webhookUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            patientId: clientId,
                            tenantId: user.id,
                            expedienteUrl: expedienteSignedUrl,
                            planUrl: planSignedUrl,
                            // Mantenemos los paths por si el workflow de n8n los usa directamente
                            expedientePath: isExpedienteProcessed ? expedientePath : null,
                            planPath: isPlanProcessed ? planPath : null
                        }),
                        keepalive: true
                    });
                    console.log('✅ Webhook de Ingesta IA enviado con éxito a:', webhookUrl);
                } catch (fetchErr) {
                    console.warn('⚠️ Error enviando Webhook n8n:', fetchErr);
                }
            }

            setShowConfirm(false);
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Detailed error:', err);
            let userFriendlyMessage = 'Ups, algo salió mal. Por favor, inténtalo de nuevo.';

            if (err.message?.includes('not-null constraint')) {
                userFriendlyMessage = 'Faltan algunos datos necesarios para completar el registro.';
            } else if (err.message?.includes('network')) {
                userFriendlyMessage = 'Parece que hay un problema con tu conexión a internet.';
            } else if (err.message) {
                userFriendlyMessage = err.message;
            }

            setError(userFriendlyMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'var(--solemia-charcoal)', opacity: 0.2, backdropFilter: 'blur(20px)', zIndex: 9998 }}></div>
            <div className="modal-overlay-responsive" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
                <div className="modal-content glass animate-premium modal-content-responsive modal-padded-responsive" style={{
                    maxWidth: '550px',
                    width: '100%',
                    position: 'relative',
                    padding: '2.5rem 3.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.2)',
                    borderRadius: '3rem',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    margin: 'auto'
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
                            <ChevronLeft size={20} /> Volver al perfil
                        </button>
                    )}

                    <button onClick={onClose} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', color: '#ccc', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = 'var(--solemia-plum)'} onMouseLeave={(e) => e.target.style.color = '#ccc'}>
                        <X size={22} />
                    </button>

                    <div style={{ marginBottom: '2rem', marginTop: onBack ? '1rem' : '0' }}>
                        <h2 style={{ fontSize: '2.2rem', color: 'var(--solemia-charcoal)', marginBottom: '0.2rem', fontFamily: 'var(--font-display)', fontWeight: '900', lineHeight: 1 }}>{client ? 'Actualizar' : 'Nueva paciente'}</h2>
                        <div className="text-detail" style={{ fontSize: '9px', fontWeight: '900', color: 'var(--solemia-plum)', opacity: 0.6 }}>
                            {client ? `Modificando expediente de ${client.name}` : 'Registra un nuevo expediente en el directorio'}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '1px', opacity: 0.6 }}>Nombre completo *</label>
                            <input type="text" className="input-field" style={{ fontWeight: '700', borderRadius: '1.25rem', padding: '1rem 1.5rem', border: '1px solid #f0f0f0', backgroundColor: '#fafafa' }} placeholder="Ej. Mariana Sánchez" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '1px', opacity: 0.6 }}>Teléfono WhatsApp *</label>
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
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        setPhone(value);
                                    }}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '1px', opacity: 0.6 }}>Expediente</label>
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
                                    backgroundColor: isExpedienteProcessed ? '#ecfdf5' : '#f8f0f4',
                                    border: isExpedienteProcessed ? '1px solid #10b981' : '1px dashed #e5d5dc',
                                    transition: 'all 0.2s'
                                }} onMouseEnter={(e) => !isExpedienteProcessed && (e.currentTarget.style.borderColor = 'var(--solemia-plum)')} onMouseLeave={(e) => !isExpedienteProcessed && (e.currentTarget.style.borderColor = '#e5d5dc')}>
                                    <Upload size={18} style={{ color: isExpedienteProcessed ? '#10b981' : 'var(--solemia-plum)', opacity: 0.8 }} />
                                    <span style={{ fontSize: '0.7rem', marginTop: '4px', fontWeight: '900', color: isExpedienteProcessed ? '#10b981' : 'var(--solemia-plum)' }}>
                                        {isExpedienteProcessed ? 'Procesado' : (expediente ? 'Click para cambiar' : 'Subir archivo')}
                                    </span>
                                    <input type="file" hidden accept=".pdf,image/jpeg,image/png" onChange={(e) => { setExpediente(e.target.files[0]); setIsExpedienteProcessed(false); }} />
                                    {expediente && <span style={{ fontSize: '8px', color: 'var(--solemia-charcoal)', width: '80%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', position: 'absolute', bottom: '8px' }}>{expediente.name}</span>}
                                    {isExpedienteProcessed && <Check size={12} style={{ position: 'absolute', top: '8px', right: '8px', color: '#10b981' }} />}
                                </label>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '1px', opacity: 0.6 }}>Plan alimenticio</label>
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
                                    backgroundColor: isPlanProcessed ? '#ecfdf5' : '#f8f0f4',
                                    border: isPlanProcessed ? '1px solid #10b981' : '1px dashed #e5d5dc',
                                    transition: 'all 0.2s'
                                }} onMouseEnter={(e) => !isPlanProcessed && (e.currentTarget.style.borderColor = 'var(--solemia-plum)')} onMouseLeave={(e) => !isPlanProcessed && (e.currentTarget.style.borderColor = '#e5d5dc')}>
                                    <Upload size={18} style={{ color: isPlanProcessed ? '#10b981' : 'var(--solemia-plum)', opacity: 0.8 }} />
                                    <span style={{ fontSize: '0.7rem', marginTop: '4px', fontWeight: '900', color: isPlanProcessed ? '#10b981' : 'var(--solemia-plum)' }}>
                                        {isPlanProcessed ? 'Procesado' : (plan ? 'Click para cambiar' : 'Subir archivo')}
                                    </span>
                                    <input type="file" hidden accept=".pdf,image/jpeg,image/png" onChange={(e) => { setPlan(e.target.files[0]); setIsPlanProcessed(false); }} />
                                    {plan && <span style={{ fontSize: '8px', color: 'var(--solemia-charcoal)', width: '80%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', position: 'absolute', bottom: '8px' }}>{plan.name}</span>}
                                    {isPlanProcessed && <Check size={12} style={{ position: 'absolute', top: '8px', right: '8px', color: '#10b981' }} />}
                                </label>
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '0.75rem',
                            backgroundColor: '#f1f5f9',
                            padding: '1rem',
                            borderRadius: '1.25rem',
                            marginTop: '-0.5rem',
                            border: '1px solid #e2e8f0',
                            marginBottom: '1rem'
                        }}>
                            <Info size={18} style={{ color: '#64748b', flexShrink: 0, marginTop: '2px' }} />
                            <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4', margin: 0, fontWeight: '500' }}>
                                Si necesitas corregir o cambiar un archivo, simplemente pulsa de nuevo sobre el botón para seleccionar uno nuevo.
                            </p>
                        </div>

                        {((expediente && !isExpedienteProcessed) || (plan && !isPlanProcessed)) && (
                            <button
                                type="button"
                                onClick={handleProcessFiles}
                                disabled={isProcessing}
                                style={{
                                    width: '100%',
                                    padding: '0.85rem',
                                    borderRadius: '1.25rem',
                                    border: '1px solid var(--solemia-plum)',
                                    background: 'transparent',
                                    color: 'var(--solemia-plum)',
                                    fontSize: '10px',
                                    fontWeight: '900',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    marginTop: '-0.5rem'
                                }}
                            >
                                {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <><FileText size={16} /> Procesar archivos seleccionados</>}
                            </button>
                        )}

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
                                    boxShadow: '0 10px 25px rgba(77, 12, 48, 0.2)',
                                    opacity: ((expediente && !isExpedienteProcessed) || (plan && !isPlanProcessed)) ? 0.5 : 1
                                }}
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} style={{ margin: '0 auto' }} /> :
                                    ((expediente && !isExpedienteProcessed) || (plan && !isPlanProcessed)) ? 'Procesa archivos primero' :
                                        (client ? 'Guardar cambios' : 'Crear registro')}
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
                                    <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'white', fontFamily: 'var(--font-display)', fontWeight: '900' }}>Registro duplicado</h3>
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
                                        {loading ? '...' : 'Sí, actualizar datos'}
                                    </button>
                                    <button
                                        onClick={() => { setShowConfirm(false); setExistingPatientData(null); }}
                                        style={{ width: '100%', backgroundColor: 'transparent', color: 'white', padding: '0.8rem', border: 'none', fontSize: '9px', fontWeight: '900', opacity: 0.6, cursor: 'pointer' }}
                                    >
                                        Cancelar
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
