import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Phone, User, FileText, Brain, ChevronRight, Edit, Heart, Activity, Save, Check } from 'lucide-react';

export default function PatientProfileModal({ isOpen, onClose, patient, onEdit }) {
    const [isEditingAnalysis, setIsEditingAnalysis] = useState(false);
    const [analysisText, setAnalysisText] = useState('');
    const [isEditingAllergies, setIsEditingAllergies] = useState(false);
    const [allergiesText, setAllergiesText] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [localPatient, setLocalPatient] = useState(patient);

    useEffect(() => {
        if (patient) {
            setLocalPatient(patient);
            setAnalysisText(patient.objective_and_params || '');
            setAllergiesText(Array.isArray(patient.allergies) ? patient.allergies.join(', ') : '');
        }
    }, [patient]);

    if (!isOpen || !localPatient) return null;

    const initials = localPatient.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const formatPhoneNumber = (phone) => {
        if (!phone) return '';
        const cleaned = phone.replace(/[^\d+]/g, '');
        if (cleaned.startsWith('+52') && cleaned.length === 13) {
            return `+52 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
        }
        return cleaned;
    };

    const handleWhatsAppClick = () => {
        const cleanPhone = localPatient.phone.replace(/\D/g, '');
        window.open(`https://wa.me/${cleanPhone}`, '_blank');
    };

    const handleSaveField = async (field, value, setIsEditing) => {
        setIsSaving(true);
        try {
            const updates = {};
            if (field === 'allergies') {
                updates.allergies = value.split(',').map(s => s.trim()).filter(s => s);
            } else {
                updates[field] = value;
            }

            const { error } = await supabase
                .from('patients')
                .update(updates)
                .eq('id', localPatient.id);

            if (error) throw error;

            setLocalPatient({ ...localPatient, ...updates });
            setIsEditing(false);
        } catch (err) {
            console.error(`Error saving ${field}:`, err);
            alert('Error al guardar los cambios.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'var(--solemia-charcoal)', opacity: 0.2, backdropFilter: 'blur(20px)', zIndex: 999 }}></div>
            <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                <div className="modal-content glass animate-premium" style={{
                    maxWidth: '850px',
                    width: '100%',
                    position: 'relative',
                    maxHeight: '92vh',
                    padding: '2.5rem 3.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.2)',
                    borderRadius: '3rem',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Beauty Accent */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'var(--solemia-gradient)' }}></div>

                    <button onClick={onClose} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', color: '#ccc', backgroundColor: 'transparent', width: '32px', height: '32px', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--solemia-plum)'} onMouseLeave={(e) => e.target.style.color = '#ccc'}>
                        <X size={22} />
                    </button>

                    {/* Header Section */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2.5rem' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '28px',
                            backgroundColor: '#f8f0f4',
                            color: 'var(--solemia-plum)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.75rem',
                            fontWeight: '900',
                            fontFamily: 'Outfit',
                            border: '3px solid white',
                            boxShadow: '0 10px 25px rgba(142,45,79,0.08)'
                        }}>
                            {initials}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                <h2 style={{ fontSize: '2.2rem', color: 'var(--solemia-charcoal)', fontFamily: 'Outfit', fontWeight: '900', lineHeight: 1, margin: 0 }}>{localPatient.name.toUpperCase()}</h2>
                                <span style={{
                                    padding: '4px 12px',
                                    borderRadius: '100px',
                                    fontSize: '9px',
                                    fontWeight: '900',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    backgroundColor: localPatient.is_active ? '#ecfdf5' : '#fef2f2',
                                    color: localPatient.is_active ? '#10b981' : '#ef4444'
                                }}>
                                    {localPatient.is_active ? 'ACTIVA' : 'INACTIVA'}
                                </span>
                            </div>
                            <div className="text-detail" style={{ fontSize: '9px', color: 'var(--solemia-plum)', opacity: 0.6 }}>
                                EXPEDIENTE DESDE EL {new Date(localPatient.created_at).toLocaleDateString()}
                            </div>
                        </div>
                        <button
                            onClick={onEdit}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.25rem',
                                borderRadius: '1.25rem',
                                border: '1px solid #f0f0f0',
                                backgroundColor: 'white',
                                color: 'var(--solemia-plum)',
                                fontWeight: '900',
                                fontSize: '9px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontFamily: 'Outfit'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8f0f4'; e.currentTarget.style.borderColor = 'var(--solemia-plum)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.borderColor = '#f0f0f0'; }}
                        >
                            <Edit size={14} /> EDITAR PERFIL
                        </button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '2.5rem', minHeight: 0 }} className="custom-scrollbar">
                        {/* Left Column: Analysis & Health */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <section>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <Brain size={18} style={{ color: 'var(--solemia-plum)' }} />
                                        <h3 style={{ fontSize: '1rem', fontWeight: '900', fontFamily: 'Outfit', color: 'var(--solemia-charcoal)', margin: 0, letterSpacing: '0.5px' }}>ANÁLISIS Y OBJETIVOS</h3>
                                    </div>
                                    {!isEditingAnalysis ? (
                                        <button
                                            onClick={() => setIsEditingAnalysis(true)}
                                            style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--solemia-plum)', cursor: 'pointer', opacity: 0.6, borderRadius: '8px', padding: '4px' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; }}
                                            title="Editar análisis"
                                        >
                                            <Edit size={16} />
                                        </button>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => handleSaveField('objective_and_params', analysisText, setIsEditingAnalysis)} disabled={isSaving} style={{ backgroundColor: 'var(--solemia-plum)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '8px', padding: '4px 10px', fontSize: '9px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {isSaving ? '...' : <><Check size={12} /> GUARDAR</>}
                                            </button>
                                            <button onClick={() => { setIsEditingAnalysis(false); setAnalysisText(localPatient.objective_and_params || ''); }} style={{ backgroundColor: '#f5f5f5', border: 'none', color: '#999', cursor: 'pointer', borderRadius: '8px', padding: '4px 10px', fontSize: '9px', fontWeight: '900' }}>
                                                CANCELAR
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div style={{
                                    backgroundColor: 'white',
                                    padding: '1.75rem',
                                    borderRadius: '2rem',
                                    boxShadow: '0 8px 25px rgba(0,0,0,0.02)',
                                    border: '1px solid #f2f2f2',
                                    minHeight: '180px',
                                    display: 'flex'
                                }}>
                                    {isEditingAnalysis ? (
                                        <textarea
                                            value={analysisText}
                                            onChange={(e) => setAnalysisText(e.target.value)}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                minHeight: '150px',
                                                border: 'none',
                                                fontFamily: 'inherit',
                                                fontSize: '0.95rem',
                                                lineHeight: '1.6',
                                                color: 'var(--solemia-charcoal)',
                                                outline: 'none',
                                                resize: 'none',
                                                backgroundColor: 'transparent'
                                            }}
                                            autoFocus
                                        />
                                    ) : (
                                        <p style={{
                                            fontSize: '0.95rem',
                                            lineHeight: '1.6',
                                            color: 'var(--solemia-charcoal)',
                                            opacity: 0.85,
                                            margin: 0,
                                            whiteSpace: 'pre-wrap'
                                        }}>
                                            {localPatient.objective_and_params || 'No hay un análisis detallado disponible.'}
                                        </p>
                                    )}
                                </div>
                            </section>

                            <section>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <Heart size={18} style={{ color: 'var(--solemia-pink)' }} />
                                        <h3 style={{ fontSize: '1rem', fontWeight: '900', fontFamily: 'Outfit', color: 'var(--solemia-charcoal)', margin: 0, letterSpacing: '0.5px' }}>CONDICIONES Y ALERGIAS</h3>
                                    </div>
                                    {!isEditingAllergies ? (
                                        <button
                                            onClick={() => setIsEditingAllergies(true)}
                                            style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--solemia-plum)', cursor: 'pointer', opacity: 0.6, borderRadius: '8px', padding: '4px' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; }}
                                            title="Editar alergias"
                                        >
                                            <Edit size={16} />
                                        </button>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => handleSaveField('allergies', allergiesText, setIsEditingAllergies)} disabled={isSaving} style={{ backgroundColor: 'var(--solemia-plum)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '8px', padding: '4px 10px', fontSize: '9px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {isSaving ? '...' : <><Check size={12} /> GUARDAR</>}
                                            </button>
                                            <button onClick={() => { setIsEditingAllergies(false); setAllergiesText(Array.isArray(localPatient.allergies) ? localPatient.allergies.join(', ') : ''); }} style={{ backgroundColor: '#f5f5f5', border: 'none', color: '#999', cursor: 'pointer', borderRadius: '8px', padding: '4px 10px', fontSize: '9px', fontWeight: '900' }}>
                                                CANCELAR
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {isEditingAllergies ? (
                                    <div style={{
                                        backgroundColor: 'white',
                                        padding: '1.25rem',
                                        borderRadius: '1.5rem',
                                        boxShadow: '0 8px 25px rgba(0,0,0,0.02)',
                                        border: '1px solid var(--solemia-plum)',
                                        display: 'flex'
                                    }}>
                                        <input
                                            type="text"
                                            value={allergiesText}
                                            onChange={(e) => setAllergiesText(e.target.value)}
                                            placeholder="Ej. NUEZ, LACTOSA, GLUTEN (Separar por comas)"
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                fontFamily: 'inherit',
                                                fontSize: '0.9rem',
                                                color: 'var(--solemia-charcoal)',
                                                outline: 'none',
                                                backgroundColor: 'transparent',
                                                fontWeight: '900',
                                                textTransform: 'uppercase'
                                            }}
                                            autoFocus
                                        />
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                                        {Array.isArray(localPatient.allergies) && localPatient.allergies.length > 0 ? (
                                            localPatient.allergies.map((allergy, i) => (
                                                <span key={i} style={{
                                                    padding: '8px 16px',
                                                    borderRadius: '0.75rem',
                                                    backgroundColor: '#fff1f2',
                                                    color: '#e11d48',
                                                    fontSize: '10px',
                                                    fontWeight: '900',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {allergy}
                                                </span>
                                            ))
                                        ) : (
                                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', opacity: 0.5 }}>Sin alergias reportadas.</span>
                                        )}
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* Right Column: Contact & Files */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <section>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                                    <Phone size={18} style={{ color: 'var(--solemia-plum)' }} />
                                    <h3 style={{ fontSize: '1rem', fontWeight: '900', fontFamily: 'Outfit', color: 'var(--solemia-charcoal)', margin: 0, letterSpacing: '0.5px' }}>CONTACTO DIRECTO</h3>
                                </div>
                                <button
                                    onClick={handleWhatsAppClick}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '1.25rem 1.75rem',
                                        borderRadius: '1.75rem',
                                        backgroundColor: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        cursor: 'pointer',
                                        boxShadow: '0 8px 15px rgba(16,185,129,0.15)',
                                        transition: 'transform 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontSize: '8px', fontWeight: '900', opacity: 0.8, letterSpacing: '1px' }}>WHATSAPP</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '900', fontFamily: 'Outfit' }}>{formatPhoneNumber(localPatient.phone)}</div>
                                    </div>
                                    <ChevronRight size={20} />
                                </button>
                            </section>

                            <section>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                                    <FileText size={18} style={{ color: 'var(--solemia-plum)' }} />
                                    <h3 style={{ fontSize: '1rem', fontWeight: '900', fontFamily: 'Outfit', color: 'var(--solemia-charcoal)', margin: 0, letterSpacing: '0.5px' }}>DOCUMENTACIÓN</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <a
                                        href={localPatient.expediente_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.8rem',
                                            padding: '1rem',
                                            borderRadius: '1.25rem',
                                            backgroundColor: localPatient.expediente_url ? '#fcf8fa' : '#f9f9f9',
                                            color: localPatient.expediente_url ? 'var(--solemia-plum)' : '#ccc',
                                            textDecoration: 'none',
                                            border: '1px solid',
                                            borderColor: localPatient.expediente_url ? '#f5eef1' : '#f0f0f0',
                                            pointerEvents: localPatient.expediente_url ? 'auto' : 'none'
                                        }}
                                    >
                                        <FileText size={18} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '9px', fontWeight: '900' }}>EXPEDIENTE CLÍNICO</div>
                                            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{localPatient.expediente_url ? 'Consultar PDF' : 'No disponible'}</div>
                                        </div>
                                        {localPatient.expediente_url && <ChevronRight size={14} />}
                                    </a>

                                    <a
                                        href={localPatient.plan_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.8rem',
                                            padding: '1rem',
                                            borderRadius: '1.25rem',
                                            backgroundColor: localPatient.plan_url ? '#fcf8fa' : '#f9f9f9',
                                            color: localPatient.plan_url ? 'var(--solemia-plum)' : '#ccc',
                                            textDecoration: 'none',
                                            border: '1px solid',
                                            borderColor: localPatient.plan_url ? '#f5eef1' : '#f0f0f0',
                                            pointerEvents: localPatient.plan_url ? 'auto' : 'none'
                                        }}
                                    >
                                        <Activity size={18} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '9px', fontWeight: '900' }}>PLAN ALIMENTICIO</div>
                                            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{localPatient.plan_url ? 'Consultar PDF' : 'No disponible'}</div>
                                        </div>
                                        {localPatient.plan_url && <ChevronRight size={14} />}
                                    </a>
                                </div>
                            </section>
                        </div>
                    </div>

                    <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
                        <button onClick={onClose} className="btn" style={{ padding: '0.8rem 3rem', borderRadius: '1.25rem', fontSize: '9px', fontWeight: '900', color: '#bbb', backgroundColor: '#fcfcfc', border: '1px solid #f0f0f0' }}>CERRAR VISTA</button>
                    </div>
                </div>
            </div>
        </>
    );
}
