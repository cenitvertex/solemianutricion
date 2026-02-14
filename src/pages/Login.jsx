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
            <div className="card glass animate-scale-in" style={{
                maxWidth: '450px',
                width: '100%',
                padding: '3.5rem',
                borderRadius: '3.5rem',
                border: 'none',
                background: 'white',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <img src={logo} alt="Solemia" style={{ height: '45px', marginBottom: '1.5rem', objectFit: 'contain' }} />
                    <h2 style={{ fontSize: '1.8rem', color: 'var(--solemia-plum)', fontWeight: '900', fontFamily: 'Outfit', letterSpacing: '-0.5px', marginBottom: '0.5rem' }}>Bienvenido</h2>
                    <p className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px', color: '#94a3b8' }}>ECOSISTEMA SOLEMIA NUTRICIÓN</p>
                </div>

                {error && (
                    <div style={{
                        background: '#fff1f2',
                        padding: '1rem 1.5rem',
                        borderRadius: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '2rem',
                        border: '1px solid #fee2e2'
                    }}>
                        <AlertCircle size={20} color="#f43f5e" />
                        <span style={{ fontSize: '0.85rem', color: '#e11d48', fontWeight: '600', lineHeight: '1.2' }}>{error}</span>
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px', marginLeft: '1rem' }}>EMAIL PROFESIONAL</label>
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
                        <label className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px', marginLeft: '1rem' }}>CONTRASEÑA</label>
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
                        {loading ? 'CARGANDO...' : (
                            <>INICIAR SESIÓN <LogIn size={18} /></>
                        )}
                    </button>

                    <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem' }}>
                        <p style={{ color: '#94a3b8', fontWeight: '500' }}>
                            ¿No tienes cuenta?{' '}
                            <Link to="/signup" style={{ color: 'var(--solemia-plum)', fontWeight: '800', textDecoration: 'none' }}>
                                REGÍSTRATE AQUÍ
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
