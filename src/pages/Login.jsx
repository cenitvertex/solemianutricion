import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) setError(error.message);
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
                    <h2 className="auth-title" style={{ fontSize: '2.5rem', color: 'var(--solemia-plum)', fontWeight: '800', fontFamily: 'var(--font-display)', letterSpacing: '-2px', marginBottom: '0.5rem', lineHeight: 1 }}>Bienvenido</h2>
                    <p className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px', color: '#94a3b8' }}>Ecosistema Solemia Nutrición</p>
                </div>

                {error && (
                    <div className="animate-premium" style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#fff1f2', borderRadius: '1rem', border: '1px solid rgba(225, 29, 72, 0.15)', overflow: 'hidden', marginBottom: '1.5rem', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 0.8rem' }}>
                            <AlertCircle size={14} style={{ color: '#e11d48', flexShrink: 0 }} />
                            <span style={{ color: '#e11d48', fontSize: '11px', fontWeight: '800', lineHeight: '1.2' }}>{error}</span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px', marginLeft: '1rem' }}>Email profesional</label>
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

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginLeft: '1rem', marginRight: '0.5rem' }}>
                            <label className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px' }}>Contraseña</label>
                            <Link to="/forgot-password" style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '1px', color: 'var(--solemia-plum)', textDecoration: 'none', opacity: 0.7 }}>
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                required
                                type="password"
                                className="input-field"
                                style={{ paddingLeft: '3.5rem', borderRadius: '1.5rem', background: '#f8fafc', border: 'none' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
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
                            marginTop: '1.5rem',
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
                        {loading ? 'Cargando...' : (
                            <>Iniciar sesión <LogIn size={18} /></>
                        )}
                    </button>

                    <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem' }}>
                        <p style={{ color: '#94a3b8', fontWeight: '500' }}>
                            ¿No tienes cuenta?{' '}
                            <Link to="/signup" style={{ color: 'var(--solemia-plum)', fontWeight: '800', textDecoration: 'none' }}>
                                Regístrate aquí
                            </Link>
                        </p>
                    </div>
                </form>

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
