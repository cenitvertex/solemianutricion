import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import logo from '../assets/logo.png';

export default function UpdatePassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden. Inténtalo de nuevo.');
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#fafbfc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div className="card glass animate-scale-in auth-card" style={{
                maxWidth: '450px',
                width: '100%',
                padding: 'clamp(2rem, 5vw, 3.5rem)',
                borderRadius: '3.5rem',
                border: 'none',
                background: 'white',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <img src={logo} alt="Solemia" style={{ height: '45px', marginBottom: '1.5rem', objectFit: 'contain' }} />
                    <h2 className="auth-title" style={{ fontSize: '2rem', color: 'var(--solemia-plum)', fontWeight: '800', fontFamily: 'var(--font-display)', letterSpacing: '-2px', marginBottom: '0.5rem', lineHeight: 1 }}>
                        Nueva contraseña
                    </h2>
                    <p className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px', color: '#94a3b8' }}>
                        Ecosistema Solemia Nutrición
                    </p>
                </div>

                {error && (
                    <div className="animate-premium" style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#fff1f2', borderRadius: '1rem', border: '1px solid rgba(225, 29, 72, 0.15)', overflow: 'hidden', marginBottom: '1.5rem', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 0.8rem' }}>
                            <AlertCircle size={14} style={{ color: '#e11d48', flexShrink: 0 }} />
                            <span style={{ color: '#e11d48', fontSize: '11px', fontWeight: '800', lineHeight: '1.2' }}>{error}</span>
                        </div>
                    </div>
                )}

                {success ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', textAlign: 'center' }}>
                        <div className="animate-premium" style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#f0fdf4', borderRadius: '1.5rem', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '1.5rem', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
                            <CheckCircle size={32} style={{ color: '#16a34a' }} />
                            <p style={{ color: '#15803d', fontSize: '0.85rem', fontWeight: '700', lineHeight: 1.5 }}>
                                ¡Contraseña actualizada exitosamente!
                            </p>
                            <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '500' }}>
                                Redirigiendo al inicio de sesión...
                            </p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '500', textAlign: 'center', lineHeight: 1.6, marginTop: '-1rem' }}>
                            Elige una nueva contraseña segura para tu cuenta.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px', marginLeft: '1rem' }}>
                                Nueva contraseña
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    required
                                    type="password"
                                    className="input-field"
                                    style={{ paddingLeft: '3.5rem', borderRadius: '1.5rem', background: '#f8fafc', border: 'none' }}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px', marginLeft: '1rem' }}>
                                Confirmar contraseña
                            </label>
                            <div style={{ position: 'relative' }}>
                                <ShieldCheck size={18} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    required
                                    type="password"
                                    className="input-field"
                                    style={{ paddingLeft: '3.5rem', borderRadius: '1.5rem', background: '#f8fafc', border: 'none' }}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repite tu nueva contraseña"
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                padding: '1.25rem',
                                borderRadius: '1.5rem',
                                marginTop: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                fontSize: '0.9rem',
                                fontWeight: '900',
                                letterSpacing: '1px',
                                background: 'var(--solemia-plum)'
                            }}
                        >
                            {loading ? 'Guardando...' : (
                                <>Guardar nueva contraseña <ShieldCheck size={18} /></>
                            )}
                        </button>
                    </form>
                )}

                <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
                    <div className="text-detail" style={{ fontSize: '9px', opacity: 0.3, letterSpacing: '1px' }}>
                        © 2026 Todos los derechos reservados.<br />
                        v1.0.2
                    </div>
                </div>
            </div>
        </div>
    );
}
