import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Download, FileText, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function PreviewModal({ isOpen, onClose, url, title }) {
    const [viewUrl, setViewUrl] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSignedUrl = async () => {
            if (!url) {
                setViewUrl('');
                return;
            }

            // Si no es de Supabase, usarla tal cual
            if (!url.includes('supabase.co')) {
                setViewUrl(url);
                return;
            }

            setLoading(true);
            try {
                let bucketName = 'documents';
                let filePath = url;

                try {
                    const urlObj = new URL(url);
                    const pathname = urlObj.pathname;
                    const publicIndex = pathname.indexOf('/public/');
                    if (publicIndex !== -1) {
                        const afterPublic = pathname.substring(publicIndex + 8);
                        const parts = afterPublic.split('/');
                        bucketName = parts[0];
                        filePath = decodeURIComponent(parts.slice(1).join('/'));
                    } else {
                        // Fallback fallback
                        if (url.includes('/documents/')) {
                            filePath = decodeURIComponent(url.split('/documents/').pop().split('?')[0]);
                        } else {
                            filePath = decodeURIComponent(url.split('/').slice(-2).join('/'));
                        }
                    }
                } catch (e) {
                    console.error("Error parsing URL string", e);
                }

                const { data, error } = await supabase.storage
                    .from(bucketName)
                    .createSignedUrl(filePath, 3600); // 1 hora de validez

                if (error || !data?.signedUrl) {
                    console.error('Error generando URL firmada en PreviewModal para', filePath, 'en bucket', bucketName, ':', error);
                    // IMPORTANTE: Si la URL firmada falla, a veces la original tampoco funciona en iframes
                    // pero la usamos como último recurso
                    setViewUrl(url);
                } else {
                    setViewUrl(data.signedUrl);
                }
            } catch (err) {
                console.error('Error procesando url de documento en PreviewModal:', err);
                setViewUrl(url);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchSignedUrl();
        } else {
            setViewUrl('');
        }
    }, [isOpen, url]);

    if (!isOpen || !url) return null;

    return (
        <>
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'var(--solemia-charcoal)', opacity: 0.2, backdropFilter: 'blur(20px)', zIndex: 9998 }}></div>
            <div className="modal-overlay-responsive" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1.5rem' }}>
                <div className="modal-content glass animate-premium modal-content-responsive" style={{
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
                    boxShadow: '0 40px 100px rgba(0,0,0,0.3)',
                    margin: 'auto'
                }}>
                    {/* Beauty Accent */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', background: 'var(--solemia-gradient)', zIndex: 10 }}></div>

                    {/* Header */}
                    <div className="preview-header-responsive" style={{ padding: '2rem 3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', borderBottom: '1px solid #f0f0f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '16px', backgroundColor: '#f8f0f4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--solemia-plum)' }}>
                                <FileText size={24} />
                            </div>
                            <div className="preview-title-container-responsive">
                                <h3 className="preview-title-responsive" style={{ fontSize: '1.5rem', margin: 0, color: 'var(--solemia-plum)', fontFamily: 'var(--font-display)', fontWeight: '900', lineHeight: 1.1 }}>{title || 'Documento'}</h3>
                                <div className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '1px', marginTop: '4px' }}>Vista previa oficial</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <a href={viewUrl || url} target="_blank" rel="noopener noreferrer" style={{ color: '#aaa', padding: '0.5rem', pointerEvents: viewUrl ? 'auto' : 'none', opacity: viewUrl ? 1 : 0.5 }} title="Abrir externo">
                                <ExternalLink size={20} />
                            </a>
                            <button onClick={onClose} style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', backgroundColor: '#f8f0f4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--solemia-plum)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, backgroundColor: '#fcfcfd', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {loading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--solemia-plum)' }}>
                                <Loader2 size={40} className="animate-spin" />
                                <span style={{ fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: '14px' }}>Desencriptando documento...</span>
                            </div>
                        ) : viewUrl ? (
                            <div className="pdf-container-responsive" style={{
                                width: '100%',
                                height: '100%',
                                overflowAnchor: 'none',
                                WebkitOverflowScrolling: 'touch',
                                overflowY: 'auto',
                                position: 'relative'
                            }}>
                                {/* Mobile alert for iOS Safari limitation */}
                                <div className="ios-pdf-alert" style={{
                                    display: 'none', // Shown via CSS on mobile
                                    backgroundColor: '#ebf5ff',
                                    color: '#0066cc',
                                    padding: '1rem',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    textAlign: 'center',
                                    borderBottom: '1px solid #bae6fd'
                                }}>
                                    📱 En iPhone/iPad, la vista previa solo muestra la página 1. Toca "Abrir Completo" abajo para leer todo el documento.
                                </div>
                                <object
                                    data={`${viewUrl}#view=FitH`}
                                    type="application/pdf"
                                    style={{ width: '100%', height: '100%', minHeight: '80vh', border: 'none' }}
                                >
                                    <iframe
                                        src={`${viewUrl}#view=FitH`}
                                        title="PDF Preview"
                                        style={{ width: '100%', height: '100%', minHeight: '80vh', border: 'none' }}
                                    >
                                        <p>Tu navegador no soporta la previsualización de PDFs. <a href={viewUrl} target="_blank" rel="noopener noreferrer">Abre el PDF aquí</a>.</p>
                                    </iframe>
                                </object>
                            </div>
                        ) : (
                            <div style={{ color: '#aaa', fontSize: '14px', fontWeight: 600 }}>Error al cargar el documento</div>
                        )}
                    </div>

                    {/* Footer (Actions) */}
                    <div className="preview-footer-responsive" style={{ padding: '2rem 3rem', display: 'flex', justifyContent: 'center', gap: '2rem', backgroundColor: 'white', borderTop: '1px solid #f0f0f0' }}>
                        <button onClick={onClose} className="btn" style={{ minWidth: '180px', color: '#aaa', fontSize: '9px', fontWeight: '900' }}>Regresar</button>
                        <a href={viewUrl || url} target="_blank" rel="noopener noreferrer" className="btn btn-primary preview-download-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', minWidth: '250px', borderRadius: '1.5rem', padding: '1.25rem', fontSize: '10px', pointerEvents: viewUrl ? 'auto' : 'none', opacity: viewUrl ? 1 : 0.5, textDecoration: 'none' }}>
                            <ExternalLink size={16} /> <span>Descargar PDF</span>
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
