import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { UserPlus, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        } else {
            setSuccess(true);
        }
        setLoading(false);
    };

    if (success) {
        return (
            <div className="layout-auth">
                <div className="card glass animate-fade-in" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                    <CheckCircle size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                    <h2>¡Registro exitoso!</h2>
                    <p style={{ margin: '1rem 0', color: 'var(--text-muted)' }}>
                        Hemos enviado un correo de confirmación. Por favor verifica tu bandeja de entrada para continuar.
                    </p>
                    <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                        Ir al Inicio de Sesión
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="layout-auth">
            <div className="card glass animate-fade-in" style={{ maxWidth: '400px', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <img src={logo} alt="Solemia" style={{ height: '50px', objectFit: 'contain', marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--text-muted)' }}>Únete al ecosistema Solemia</p>
                </div>

                <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Email Profesional</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                className="input-field"
                                placeholder="tu@email.com"
                                style={{ paddingLeft: '2.5rem' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Contraseña</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                className="input-field"
                                placeholder="Mínimo 6 caracteres"
                                style={{ paddingLeft: '2.5rem' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={{ display: 'flex', gap: '0.5rem', color: '#e53e3e', fontSize: '0.875rem', alignItems: 'center', backgroundColor: '#fff5f5', padding: '0.75rem', borderRadius: 'var(--radius)' }}>
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'Registrando...' : 'Crear Cuenta'}
                        {!loading && <UserPlus size={18} />}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    <p style={{ color: 'var(--text-muted)' }}>
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>
                            Inicia sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
