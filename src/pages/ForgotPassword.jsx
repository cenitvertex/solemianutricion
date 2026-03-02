import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, AlertCircle, CheckCircle, ArrowLeft, KeyRound } from 'lucide-react';
import logo from '../assets/logo.png';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const redirectTo = window.location.origin + '/update-password';

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo,
        });

        if (error) {
            setError(error.message);
        } else {
            setSuccess(true);
        }

        setLoading(false);
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
                    <h2 className="auth-title" style={{ fontSize: '2.2rem', color: 'var(--solemia-plum)', fontWeight: '800', fontFamily: 'var(--font-display)', letterSpacing: '-2px', marginBottom: '0.5rem', lineHeight: 1 }}>
                        Recuperar acceso
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="animate-premium" style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#f0fdf4', borderRadius: '1.5rem', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '1.5rem', alignItems: 'center', textAlign: 'center', gap: '0.75rem' }}>
                            <CheckCircle size={32} style={{ color: '#16a34a' }} />
                            <p style={{ color: '#15803d', fontSize: '0.85rem', fontWeight: '700', lineHeight: 1.5 }}>
                                ¡Listo! Revisa tu correo electrónico. Te enviamos un enlace para cambiar tu contraseña.
                            </p>
                            <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '500' }}>
                                Si no lo encuentras, revisa tu carpeta de spam.
                            </p>
                        </div>
                        <Link
                            to="/login"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                color: 'var(--solemia-plum)',
                                fontWeight: '800',
                                textDecoration: 'none',
                                fontSize: '0.85rem',
                                marginTop: '0.5rem'
                            }}
                        >
                            <ArrowLeft size={16} />
                            Volver al inicio de sesión
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '500', textAlign: 'center', lineHeight: 1.6, marginTop: '-1rem' }}>
                            Ingresa tu correo y te enviaremos un enlace para que puedas crear una nueva contraseña.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px', marginLeft: '1rem' }}>
                                Email profesional
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    required
                                    type="email"
                                    className="input-field"
                                    style={{ paddingLeft: '3.5rem', borderRadius: '1.5rem', background: '#f8fafc', border: 'none' }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@email.com"
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
                                marginTop: '0.5rem',
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
                            {loading ? 'Enviando...' : (
                                <>Cambiar contraseña <KeyRound size={18} /></>
                            )}
                        </button>

                        <div style={{ marginTop: '0.5rem', textAlign: 'center', fontSize: '0.8rem' }}>
                            <Link
                                to="/login"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    color: '#94a3b8',
                                    fontWeight: '700',
                                    textDecoration: 'none'
                                }}
                            >
                                <ArrowLeft size={14} />
                                Volver al inicio de sesión
                            </Link>
                        </div>
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
