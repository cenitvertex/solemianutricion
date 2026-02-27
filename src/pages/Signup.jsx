import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { UserPlus, Mail, Lock, AlertCircle, CheckCircle, User, Phone, MessageSquare } from 'lucide-react';
import logo from '../assets/logo.png';
import LegalModal from '../components/modals/LegalModal';
import {
    PrivacyPolicyContent,
    TermsAndConditionsContent,
    DataAndAIPolicyContent
} from '../content/legal';

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
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
    const [legalModalTitle, setLegalModalTitle] = useState('');
    const [legalModalContent, setLegalModalContent] = useState(null);

    const openLegalModal = (title, contentComp) => {
        setLegalModalTitle(title);
        setLegalModalContent(contentComp);
        setIsLegalModalOpen(true);
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        if (!acceptTerms) {
            setError('Debes aceptar los Términos y Condiciones y el Aviso de Privacidad para continuar.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data: authData, error: signupError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (signupError) throw signupError;

            const user = authData.user;
            if (user) {
                const cleanPhone = whatsapp.replace(/\D/g, '');
                const finalPhone = `${countryCode}${cleanPhone}`;

                const { error: tenantError } = await supabase.from('tenants').insert({
                    id: user.id,
                    name: name,
                    email: email,
                    phone_number: finalPhone,
                    system_prompt: 'Eres el asistente virtual personal de un nutriólogo profesional.',
                    subscription_status: 'pending',
                    instance_id: `nutri_${user.id.slice(0, 8)}`
                });

                if (tenantError) {
                    console.error('Error creating tenant:', tenantError);
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
            <div className="layout-auth" style={{ minHeight: '100vh', background: '#fafbfc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--container-padding)' }}>
                <div className="card glass animate-fade-in auth-card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: 'clamp(1.5rem, 5vw, 3rem)', background: 'white', borderRadius: 'var(--glass-radius)' }}>
                    <CheckCircle size={64} color="#10b981" style={{ marginBottom: '1.5rem' }} />
                    <h2 style={{ fontSize: '2rem', color: 'var(--solemia-plum)', fontFamily: 'var(--font-display)', fontWeight: '900' }}>¡Bienvenido, {name.split(' ')[0]}!</h2>
                    <p style={{ margin: '1.5rem 0', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                        Tu cuenta ha sido creada exitosamente. Hemos enviado un correo de confirmación a <strong>{email}</strong>.
                    </p>
                    <Link to="/login" className="btn btn-primary" style={{ width: '100%', borderRadius: '1.5rem', padding: '1.25rem' }}>
                        Ir al inicio de sesión
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-layout" style={{
            minHeight: '100vh',
            background: '#fafbfc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--container-padding)'
        }}>
            <div className="card glass animate-scale-in auth-card signup-card" style={{
                maxWidth: '700px',
                width: '100%',
                padding: 'clamp(1.5rem, 5vw, 4rem)',
                borderRadius: 'var(--glass-radius)',
                border: 'none',
                background: 'white',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <img src={logo} alt="Solemia" className="auth-logo" style={{ height: '45px', marginBottom: '1.5rem', objectFit: 'contain' }} />
                    <h2 className="auth-title" style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', color: 'var(--solemia-plum)', fontWeight: '800', fontFamily: 'var(--font-display)', letterSpacing: '-2px', marginBottom: '0.5rem', lineHeight: 1 }}>Nueva Cuenta</h2>
                    <p className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px', color: '#94a3b8' }}>Configura tu consultorio inteligente</p>
                </div>

                <form onSubmit={handleSignup} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
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
                            <label className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px', marginLeft: '1rem' }}>Contraseña</label>
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
                                    minLength={6}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px', marginLeft: '1rem' }}>Nombre del especialista</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    required
                                    type="text"
                                    className="input-field"
                                    style={{ paddingLeft: '3.5rem', borderRadius: '1.5rem', background: '#f8fafc', border: 'none', fontWeight: '700' }}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ej. Lic. Andrea Pérez"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px', marginLeft: '1rem' }}>WhatsApp</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <select
                                    value={countryCode}
                                    onChange={(e) => setCountryCode(e.target.value)}
                                    className="input-field"
                                    style={{ width: '95px', padding: '0 0.5rem', borderRadius: '1.5rem', background: '#f8fafc', border: 'none', fontWeight: '900', fontSize: '0.8rem' }}
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
                                    required
                                    type="tel"
                                    className="input-field"
                                    style={{ flex: 1, borderRadius: '1.5rem', background: '#f8fafc', border: 'none', fontWeight: '700' }}
                                    value={whatsapp}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        setWhatsapp(value);
                                    }}
                                    placeholder="000 000 0000"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="auth-error-badge" style={{ background: '#fff1f2', padding: '1rem 1.5rem', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem', border: '1px solid #fee2e2' }}>
                            <AlertCircle size={20} color="#f43f5e" />
                            <span style={{ fontSize: '0.85rem', color: '#e11d48', fontWeight: '600', lineHeight: '1.2' }}>{error}</span>
                        </div>
                    )}

                    <div className="auth-terms" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginTop: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '1.5rem' }}>
                        <input
                            type="checkbox"
                            id="acceptTerms"
                            checked={acceptTerms}
                            onChange={(e) => {
                                setAcceptTerms(e.target.checked);
                                if (e.target.checked && error?.includes('Términos')) setError(null);
                            }}
                            style={{ marginTop: '0.2rem', cursor: 'pointer', width: '20px', height: '20px', accentColor: 'var(--solemia-plum)' }}
                        />
                        <label htmlFor="acceptTerms" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5', cursor: 'pointer' }}>
                            He leído y acepto los <span onClick={(e) => { e.preventDefault(); openLegalModal("Términos y Condiciones", <TermsAndConditionsContent />); }} style={{ color: 'var(--solemia-plum)', fontWeight: '700', textDecoration: 'underline' }}>Términos y Condiciones</span>, el <span onClick={(e) => { e.preventDefault(); openLegalModal("Aviso de Privacidad", <PrivacyPolicyContent />); }} style={{ color: 'var(--solemia-plum)', fontWeight: '700', textDecoration: 'underline' }}>Aviso de Privacidad</span> y la <span onClick={(e) => { e.preventDefault(); openLegalModal("Política de Uso de Datos e IA", <DataAndAIPolicyContent />); }} style={{ color: 'var(--solemia-plum)', fontWeight: '700', textDecoration: 'underline' }}>Política de uso de IA</span>.
                        </label>
                    </div>

                    <button
                        disabled={loading}
                        className="btn btn-primary auth-submit-btn"
                        style={{
                            width: '100%',
                            padding: '1.25rem',
                            borderRadius: '1.5rem',
                            marginTop: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            fontSize: '1rem',
                            fontWeight: '900',
                            letterSpacing: '1px',
                            background: 'var(--solemia-plum)'
                        }}
                    >
                        {loading ? 'Creando tu consultorio...' : (
                            <>Comenzar ahora <UserPlus size={20} /></>
                        )}
                    </button>

                    <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
                        <p style={{ color: '#94a3b8', fontWeight: '500' }}>
                            ¿Ya eres parte de Solemia?{' '}
                            <Link to="/login" style={{ color: 'var(--solemia-plum)', fontWeight: '800', textDecoration: 'none' }}>
                                Inicia sesión
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

            <LegalModal
                isOpen={isLegalModalOpen}
                onClose={() => setIsLegalModalOpen(false)}
                title={legalModalTitle}
                content={legalModalContent}
            />
        </div>
    );
}
