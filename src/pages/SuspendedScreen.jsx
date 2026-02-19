import React from 'react';
import { supabase } from '../lib/supabase';
import { ShieldAlert, LifeBuoy, LogOut } from 'lucide-react';
import logo from '../assets/logo.png';

export default function SuspendedScreen() {
    return (
        <div style={{
            height: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #fdf2f8 0%, #fff1f2 100%)',
            fontFamily: 'var(--font-inter)'
        }}>
            <div style={{
                maxWidth: '450px',
                width: '90%',
                padding: '3rem',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                borderRadius: '3.5rem',
                border: '1px solid white',
                boxShadow: '0 25px 50px -12px rgba(77, 12, 48, 0.1)',
                textAlign: 'center'
            }}>
                <img src={logo} alt="Solemia" style={{ height: '40px', marginBottom: '2rem' }} />

                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '2rem',
                    backgroundColor: '#fff1f2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem auto'
                }}>
                    <ShieldAlert size={40} color="#f43f5e" />
                </div>

                <h2 style={{
                    fontSize: '1.8rem',
                    fontWeight: '800',
                    color: '#0f172a',
                    marginBottom: '1rem',
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '-1px'
                }}>
                    Cuenta Suspendida
                </h2>

                <p style={{
                    color: '#64748b',
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    marginBottom: '2.5rem'
                }}>
                    Tu acceso a la plataforma Solemia ha sido restringido temporalmente. Si crees que esto es un error o deseas reactivar tu cuenta, contacta a soporte.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                        onClick={() => window.open('https://wa.me/message/YOUR_WHATSAPP_LINK', '_blank')}
                        style={{
                            padding: '1rem',
                            borderRadius: '1.5rem',
                            border: 'none',
                            background: 'linear-gradient(135deg, var(--solemia-plum) 0%, var(--solemia-pink) 100%)',
                            color: 'white',
                            fontWeight: '900',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 10px 20px rgba(77, 12, 48, 0.2)'
                        }}
                    >
                        <LifeBuoy size={18} /> Contactar Soporte
                    </button>

                    <button
                        onClick={() => supabase.auth.signOut()}
                        style={{
                            padding: '1rem',
                            borderRadius: '1.5rem',
                            border: '1px solid #e2e8f0',
                            background: 'white',
                            color: '#64748b',
                            fontWeight: '800',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <LogOut size={18} /> Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    );
}
