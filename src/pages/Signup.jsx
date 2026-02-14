import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { UserPlus, Mail, Lock, AlertCircle, CheckCircle, User, Phone, MessageSquare } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Signup() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [countryCode, setCountryCode] = useState('+52');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Crear usuario en Auth
            const { data: authData, error: signupError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (signupError) throw signupError;

            const user = authData.user;
            if (user) {
                const cleanPhone = whatsapp.replace(/\D/g, '');
                const finalPhone = `${countryCode}${cleanPhone}`;

                // 2. Crear registro en tenants inmediatamente
                const { error: tenantError } = await supabase.from('tenants').insert({
                    id: user.id,
                    name: name,
                    email: email,
                    phone_number: finalPhone,
                    system_prompt: 'Eres el asistente virtual personal de un nutriólogo profesional.',
                    is_active: true,
                    instance_id: `nutri_${user.id.slice(0, 8)}`
                });

                if (tenantError) {
                    console.error('Error creating tenant:', tenantError);
                    // Si falla el insert del tenant, el usuario ya existe en auth.
                    // No bloqueamos el proceso pero informamos.
                }
                setSuccess(true);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="layout-auth">
                <div className="card glass animate-fade-in" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '3rem' }}>
                    <CheckCircle size={64} color="#10b981" style={{ marginBottom: '1.5rem' }} />
                    <h2 style={{ fontSize: '2rem', color: 'var(--solemia-plum)', fontFamily: 'Outfit', fontWeight: '900' }}>¡Bienvenido, {name.split(' ')[0]}!</h2>
                    <p style={{ margin: '1.5rem 0', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                        Tu cuenta ha sido creada exitosamente. Hemos enviado un correo de confirmación a <strong>{email}</strong>.
                    </p>
                    <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '1rem', marginBottom: '2rem', fontSize: '0.875rem', textAlign: 'left' }}>
                        <strong>Nota:</strong> Es necesario verificar tu correo para poder acceder a todas las funciones.
                    </div>
                    <Link to="/login" className="btn btn-primary" style={{ width: '100%', borderRadius: '1.5rem', padding: '1.25rem' }}>
                        IR AL INICIO DE SESIÓN
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="layout-auth">
            <div className="card glass animate-fade-in" style={{ maxWidth: '600px', width: '100%', padding: '3rem 4rem', borderRadius: '3.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <img src={logo} alt="Solemia" style={{ height: '60px', objectFit: 'contain', marginBottom: '1.5rem' }} />
                    <h1 style={{ fontSize: '2.5rem', color: 'var(--solemia-plum)', marginBottom: '0.5rem', fontFamily: 'Outfit', fontWeight: '900' }}>Nueva Cuenta</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>CONFIGURA TU CONSULTORIO INTELIGENTE</p>
                </div>

                <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px', marginLeft: '1rem' }}>EMAIL PROFESIONAL</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="email"
                                    className="input-field"
                                    placeholder="tu@email.com"
                                    style={{ paddingLeft: '3rem', borderRadius: '1.5rem' }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px', marginLeft: '1rem' }}>CONTRASEÑA</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="password"
                                    className="input-field"
                                    placeholder="Mínimo 6 caracteres"
                                    style={{ paddingLeft: '3rem', borderRadius: '1.5rem' }}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px', marginLeft: '1rem' }}>NOMBRE DEL ESPECIALISTA</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="EJ. LIC. ANDREA PÉREZ"
                                    style={{ paddingLeft: '3rem', borderRadius: '1.5rem', fontWeight: '700' }}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px', marginLeft: '1rem' }}>WHATSAPP</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <select
                                    value={countryCode}
                                    onChange={(e) => setCountryCode(e.target.value)}
                                    className="input-field"
                                    style={{ width: '85px', padding: '0 0.5rem', borderRadius: '1.5rem', fontWeight: '900', fontSize: '0.8rem' }}
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
                                    placeholder="000 000 0000"
                                    style={{ flex: 1, borderRadius: '1.5rem', fontWeight: '700' }}
                                    value={whatsapp}
                                    onChange={(e) => setWhatsapp(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>


                    {error && (
                        <div style={{ display: 'flex', gap: '0.5rem', color: '#e53e3e', fontSize: '0.875rem', alignItems: 'center', backgroundColor: '#fff5f5', padding: '1rem', borderRadius: '1.5rem' }}>
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '1.25rem', borderRadius: '1.5rem', fontSize: '1rem', fontWeight: '900', boxShadow: '0 10px 25px rgba(190, 24, 93, 0.2)' }}>
                        {loading ? 'CREANDO TU CONSULTORIO...' : 'COMENZAR AHORA'}
                        {!loading && <UserPlus size={20} />}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    <p style={{ color: 'var(--text-muted)' }}>
                        ¿Ya eres parte de Solemia?{' '}
                        <Link to="/login" style={{ color: 'var(--solemia-plum)', fontWeight: '800', textDecoration: 'none' }}>
                            INICIA SESIÓN
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
