import React from 'react';
import { X, ExternalLink, Download, FileText } from 'lucide-react';

export default function PreviewModal({ isOpen, onClose, url, title }) {
    if (!isOpen || !url) return null;

    return (
        <>
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'var(--solemia-charcoal)', opacity: 0.2, backdropFilter: 'blur(20px)', zIndex: 999 }}></div>
            <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
                <div className="modal-content glass animate-premium" style={{
                    maxWidth: '1000px',
                    width: '100%',
                    height: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    padding: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '3.5rem',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.3)'
                }}>
                    {/* Beauty Accent */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', background: 'var(--solemia-gradient)', zIndex: 10 }}></div>

                    {/* Header */}
                    <div style={{ padding: '2rem 3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', borderBottom: '1px solid #f0f0f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '16px', backgroundColor: '#f8f0f4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--solemia-plum)' }}>
                                <FileText size={24} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--solemia-plum)', fontFamily: 'Outfit', fontWeight: '900', lineHeight: 1.1 }}>{title || 'Documento'}</h3>
                                <div className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '1px', marginTop: '4px' }}>VISTA PREVIA OFICIAL</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#aaa', padding: '0.5rem' }} title="Abrir externo">
                                <ExternalLink size={20} />
                            </a>
                            <button onClick={onClose} style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', backgroundColor: '#f8f0f4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--solemia-plum)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, backgroundColor: '#fcfcfd', position: 'relative' }}>
                        <iframe
                            src={`${url}#toolbar=0`}
                            title="PDF Preview"
                            style={{ width: '100%', height: '100%', border: 'none' }}
                        />
                    </div>

                    {/* Footer (Actions) */}
                    <div style={{ padding: '2rem 3rem', display: 'flex', justifyContent: 'center', gap: '2rem', backgroundColor: 'white', borderTop: '1px solid #f0f0f0' }}>
                        <button onClick={onClose} className="btn" style={{ minWidth: '180px', color: '#aaa', fontSize: '9px', fontWeight: '900' }}>REGRESAR</button>
                        <a href={url} download className="btn btn-primary" style={{ minWidth: '250px', borderRadius: '1.5rem', padding: '1.25rem', fontSize: '10px' }}>
                            <Download size={18} /> DESCARGAR PDF
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
