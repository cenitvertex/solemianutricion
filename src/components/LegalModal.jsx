import React from 'react';
import { X } from 'lucide-react';

export default function LegalModal({ isOpen, onClose, title, content }) {
    if (!isOpen) return null;

    return (
        <>
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'var(--solemia-charcoal)',
                    opacity: 0.2,
                    backdropFilter: 'blur(20px)',
                    zIndex: 999
                }}
            ></div>
            <div style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
            }}>
                <div className="modal-content glass animate-premium" style={{
                    maxWidth: '800px',
                    width: '100%',
                    position: 'relative',
                    maxHeight: '85vh',
                    padding: '2.5rem 3.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.2)',
                    borderRadius: '3rem',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '2rem',
                        borderBottom: '1px solid rgba(0,0,0,0.05)',
                        paddingBottom: '1.5rem'
                    }}>
                        <div>
                            <h2 style={{
                                fontSize: '1.75rem',
                                color: 'var(--solemia-plum)',
                                fontWeight: '900',
                                fontFamily: 'var(--font-outfit)',
                                margin: 0,
                                letterSpacing: '-0.5px'
                            }}>{title}</h2>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', opacity: 0.5 }}>Actualizado Febrero 2026</p>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'rgba(0,0,0,0.03)',
                                border: 'none',
                                padding: '12px',
                                borderRadius: '18px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.06)'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)'}
                        >
                            <X size={24} color="var(--solemia-plum)" />
                        </button>
                    </div>

                    <div className="custom-scrollbar" style={{
                        overflowY: 'auto',
                        flex: 1,
                        paddingRight: '1rem',
                        fontSize: '0.95rem',
                        lineHeight: '1.7',
                        color: 'var(--solemia-plum)',
                        opacity: 0.8
                    }}>
                        {content}
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            onClick={onClose}
                            className="btn"
                            style={{
                                borderRadius: '1.5rem',
                                padding: '1rem 2.5rem',
                                background: 'var(--solemia-gradient)',
                                color: 'white',
                                fontWeight: '900',
                                letterSpacing: '1px',
                                fontSize: '0.8rem'
                            }}
                        >
                            ENTENDIDO
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
