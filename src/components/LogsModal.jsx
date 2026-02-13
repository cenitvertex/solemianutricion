import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, MessageSquare, Clock, Brain, User } from 'lucide-react';

export default function LogsModal({ isOpen, onClose, patient }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && patient) {
            fetchLogs();
        }
    }, [isOpen, patient]);

    const fetchLogs = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('recommendation_logs')
            .select('*')
            .eq('patient_id', patient.id)
            .order('created_at', { ascending: false })
            .limit(10);

        if (!error) setLogs(data || []);
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <>
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'var(--solemia-charcoal)', opacity: 0.2, backdropFilter: 'blur(20px)', zIndex: 999 }}></div>
            <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
                <div className="modal-content glass animate-premium" style={{
                    maxWidth: '800px',
                    width: '100%',
                    position: 'relative',
                    maxHeight: '90vh',
                    padding: '4rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.2)',
                    borderRadius: '3.5rem',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Beauty Accent */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', background: 'var(--solemia-gradient)' }}></div>

                    <button onClick={onClose} style={{ position: 'absolute', right: '2rem', top: '2.5rem', color: '#ddd', backgroundColor: 'transparent', width: '36px', height: '36px', border: 'none', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>

                    <div style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '2.5rem', color: 'var(--solemia-plum)', marginBottom: '0.2rem', fontFamily: 'Outfit', fontWeight: '900', lineHeight: 1 }}>Actividad IA</h2>
                        <div className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px' }}>
                            HISTORIAL CLÍNICO DE {patient.name.toUpperCase()}
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', paddingRight: '1rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }} className="custom-scrollbar">
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '4rem', fontFamily: 'Outfit', color: 'var(--text-muted)' }}>Analizando registros...</div>
                        ) : logs.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)', opacity: 0.6 }}>
                                No hay actividad registrada aún.
                            </div>
                        ) : (
                            logs.map(log => (
                                <div key={log.id} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingLeft: '2rem', position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'var(--solemia-gradient)', borderRadius: '2px', opacity: 0.3 }}></div>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '1px', color: 'var(--solemia-plum)' }}>
                                            {new Date(log.created_at).toLocaleString().toUpperCase()}
                                        </div>
                                        <span style={{ fontSize: '8px', padding: '4px 12px', borderRadius: '100px', background: 'var(--solemia-gradient)', color: 'white', fontWeight: '900', letterSpacing: '1px' }}>
                                            {log.input_type || 'WHATSAPP'}
                                        </span>
                                    </div>

                                    <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '2.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                                        <div className="text-detail" style={{ color: 'var(--solemia-pink)', fontSize: '8px', marginBottom: '1rem' }}>CONSULTA DE LA PACIENTE</div>
                                        <p style={{ fontSize: '1.1rem', fontStyle: 'italic', color: 'var(--solemia-charcoal)', lineHeight: '1.6', marginBottom: '2rem' }}>"{log.user_intention}"</p>

                                        <div style={{ height: '1px', background: '#f0f0f0', margin: '2rem 0' }}></div>

                                        <div className="text-detail" style={{ color: 'var(--solemia-emerald)', fontSize: '8px', marginBottom: '1rem' }}>RESPUESTA DEL ASISTENTE</div>
                                        <p style={{ fontSize: '1rem', whiteSpace: 'pre-wrap', color: 'var(--solemia-charcoal)', opacity: 0.9, lineHeight: '1.8' }}>{log.bot_response}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                        <button onClick={onClose} className="btn btn-primary" style={{ padding: '1rem 3.5rem', borderRadius: '1.5rem', fontSize: '10px' }}>ENTENDIDO</button>
                    </div>
                </div>
            </div>
        </>
    );
}
