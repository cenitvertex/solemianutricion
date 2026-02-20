import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
    Users,
    Shield,
    Activity,
    Search,
    Power,
    CheckCircle2,
    XCircle,
    Calendar,
    Crown,
    CreditCard,
    ChevronRight,
    ArrowLeft,
    TrendingUp,
    MessageSquare,
    LogOut,
    LifeBuoy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LegalModal from '../components/LegalModal';
import logo from '../assets/logo.png';

export default function Admin({ session }) {
    const navigate = useNavigate();
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        totalTenants: 0,
        activeTenants: 0,
        totalPatients: 0
    });
    const [legalConfig, setLegalConfig] = useState({ isOpen: false, title: '', content: null });

    useEffect(() => {
        checkAdminAccess();
    }, [session]);

    const checkAdminAccess = async () => {
        if (!session?.user?.id) {
            navigate('/login');
            return;
        }

        try {
            const { data: adminRecord, error } = await supabase
                .from('admins')
                .select('id')
                .eq('id', session.user.id)
                .maybeSingle();

            if (error || !adminRecord) {
                console.warn('Unauthorized admin access attempt');
                navigate('/');
                return;
            }

            // If authorized, fetch the data
            fetchAdminData();
        } catch (err) {
            navigate('/');
        }
    };

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            // 1. Fetch all tenants
            const { data: tenantsData, error: tenantsError } = await supabase
                .from('tenants')
                .select('*')
                .order('created_at', { ascending: false });

            if (tenantsError) throw tenantsError;

            // 2. Fetch counts for patients per tenant
            const { data: patientsData, error: patientsError } = await supabase
                .from('patients')
                .select('tenant_id');

            if (patientsError) throw patientsError;

            // 3. Combine data
            const patientCounts = patientsData.reduce((acc, p) => {
                acc[p.tenant_id] = (acc[p.tenant_id] || 0) + 1;
                return acc;
            }, {});

            const enrichedTenants = tenantsData.map(tenant => ({
                ...tenant,
                patientCount: patientCounts[tenant.id] || 0
            }));

            setTenants(enrichedTenants);
            setStats({
                totalTenants: enrichedTenants.length,
                activeTenants: enrichedTenants.filter(t => t.subscription_status === 'active').length,
                totalPatients: patientsData.length
            });

        } catch (err) {
            console.error('Error fetching admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleManualAccess = async (tenantId, currentStatus, currentPlan) => {
        try {
            // Si estamos activando manualmente, damos acceso hasta 2099
            // Si estamos desactivando, volvemos a 'pending' y fecha nula
            const newStatus = currentStatus === 'active' ? 'pending' : 'active';
            const newDate = newStatus === 'active' ? '2099-01-01T00:00:00Z' : null;
            const newPlan = newStatus === 'active' ? 'admin_bypass' : null;

            const { error } = await supabase
                .from('tenants')
                .update({
                    subscription_status: newStatus,
                    access_until: newDate,
                    plan_type: newPlan,
                    is_active: true // Siempre activo a nivel sistema si el admin da paso
                })
                .eq('id', tenantId);

            if (error) throw error;
            fetchAdminData();
        } catch (err) {
            alert('Error al cambiar acceso: ' + err.message);
        }
    };

    const toggleSuspension = async (tenantId, currentSuspension) => {
        try {
            const { error } = await supabase
                .from('tenants')
                .update({ is_active: !currentSuspension })
                .eq('id', tenantId);

            if (error) throw error;
            fetchAdminData();
        } catch (err) {
            alert('Error al suspender: ' + err.message);
        }
    };

    const filteredTenants = tenants.filter(t =>
        t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="layout-dashboard animate-premium">
            <header style={{
                background: 'linear-gradient(135deg, rgba(77, 12, 48, 0.94) 0%, rgba(225, 29, 72, 0.94) 100%)',
                padding: '1rem 0 3.25rem 0',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                boxShadow: '0 10px 50px rgba(77, 12, 48, 0.04)',
                border: 'none',
                borderRadius: 0,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                maskImage: 'linear-gradient(to bottom, black 0%, black 35%, rgba(0,0,0,0.98) 45%, rgba(0,0,0,0.9) 55%, rgba(0,0,0,0.7) 65%, rgba(0,0,0,0.4) 75%, rgba(0,0,0,0.15) 88%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 35%, rgba(0,0,0,0.98) 45%, rgba(0,0,0,0.9) 55%, rgba(0,0,0,0.7) 65%, rgba(0,0,0,0.4) 75%, rgba(0,0,0,0.15) 88%, transparent 100%)',
                marginBottom: '-2.25rem',
                pointerEvents: 'none'
            }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: '250px 1fr 250px', alignItems: 'center', pointerEvents: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src={logo} alt="Solemia" style={{ height: '36px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                        <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.3)', margin: '0 0.25rem' }}></div>
                        <h1 style={{
                            fontSize: '1.2rem',
                            fontWeight: '300',
                            letterSpacing: '1px',
                            color: 'white',
                            fontFamily: 'var(--font-display)',
                            opacity: 0.9,
                            marginTop: '2px'
                        }}>
                            Admin
                        </h1>
                    </div>

                    <div style={{ flex: 1 }} className="hide-mobile"></div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', justifyContent: 'flex-end' }}>
                        <div className="hide-mobile" style={{ textAlign: 'right', borderRight: '1px solid rgba(255,255,255,0.2)', paddingRight: '1.25rem' }}>
                            <div className="text-detail" style={{ fontSize: '0.65rem', fontWeight: '900', letterSpacing: '1px', color: 'rgba(255,255,255,0.7)' }}>Superadministrador</div>
                            <div style={{ fontWeight: '900', fontSize: '1.1rem', color: 'white', fontFamily: 'var(--font-inter)' }}>{session.user.email.split('@')[0]}</div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={() => window.open('https://wa.me/message/YOUR_WHATSAPP_LINK', '_blank')}
                                title="Soporte Técnico"
                                style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '14px',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'white',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    backdropFilter: 'blur(10px)'
                                }}
                            >
                                <LifeBuoy size={20} />
                            </button>
                            <button
                                onClick={() => supabase.auth.signOut()}
                                title="Salir"
                                style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '14px',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'white',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    backdropFilter: 'blur(10px)'
                                }}
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container" style={{ marginTop: '2.5rem' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                    <div>
                        <h2 style={{ fontSize: '2.8rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)', fontWeight: '800', letterSpacing: '-2px', lineHeight: 1 }}>
                            Ecosistema Solemia
                        </h2>
                        <div className="text-detail" style={{ fontSize: '0.75rem', fontWeight: '900', letterSpacing: '2px', color: '#94a3b8' }}>
                            CONTROL GLOBAL DE NUTRIÓLOGOS
                        </div>
                    </div>

                    <div style={{ position: 'relative', width: '350px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Buscar especialista o email..."
                            className="input-field"
                            style={{
                                paddingLeft: '3.5rem',
                                height: '48px',
                                borderRadius: '1.5rem',
                                background: 'white',
                                border: '1px solid #f1f5f9',
                                fontSize: '0.9rem',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
                            }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                    {[
                        { label: 'Especialistas', value: stats.totalTenants, icon: Users, color: '#3b82f6', bg: '#eff6ff' },
                        { label: 'Suscripciones Activas', value: stats.activeTenants, icon: Activity, color: '#10b981', bg: '#ecfdf5' },
                        { label: 'Pacientes Totales', value: stats.totalPatients, icon: TrendingUp, color: '#f43f5e', bg: '#fff1f2' }
                    ].map((item, idx) => (
                        <div key={idx} className="card glass" style={{
                            padding: '2rem',
                            borderRadius: '2.5rem',
                            background: 'white',
                            border: '1px solid #f1f5f9',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.02)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                                <div style={{ background: item.bg, padding: '0.75rem', borderRadius: '1.25rem' }}>
                                    <item.icon size={22} color={item.color} />
                                </div>
                                <span style={{ fontWeight: '800', fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '1px', fontFamily: 'var(--font-inter)' }}>
                                    {item.label.toUpperCase()}
                                </span>
                            </div>
                            <div style={{ fontSize: '2.8rem', fontWeight: '900', color: '#0f172a', fontFamily: 'var(--font-inter)', letterSpacing: '-1px' }}>
                                {item.value}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Table Card */}
                <div className="card glass" style={{
                    padding: '2.5rem',
                    borderRadius: '3.5rem',
                    background: 'white',
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.02)'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.75rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'left' }}>
                                <th className="text-detail" style={{ fontSize: '0.65rem', fontWeight: '900', padding: '0 1.5rem 1rem 1.5rem', color: '#94a3b8', letterSpacing: '2px' }}>ESPECIALISTA / EMAIL</th>
                                <th className="text-detail" style={{ fontSize: '0.65rem', fontWeight: '900', padding: '0 1.5rem 1rem 1.5rem', color: '#94a3b8', letterSpacing: '2px' }}>PAGO (MP)</th>
                                <th className="text-detail" style={{ fontSize: '0.65rem', fontWeight: '900', padding: '0 1.5rem 1rem 1.5rem', color: '#94a3b8', letterSpacing: '2px' }}>REGALAR ACCESO</th>
                                <th className="text-detail" style={{ fontSize: '0.65rem', fontWeight: '900', padding: '0 1.5rem 1rem 1.5rem', color: '#94a3b8', letterSpacing: '2px' }}>BANEAR USUARIO</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '5rem' }}>
                                        <div style={{ color: 'var(--solemia-plum)', fontWeight: '800', fontSize: '1.1rem', letterSpacing: '1px' }}>
                                            Sincronizando datos maestros...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredTenants.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '5rem' }}>
                                        <div style={{ color: '#94a3b8', fontWeight: '600' }}>No se encontraron registros en el ecosistema.</div>
                                    </td>
                                </tr>
                            ) : filteredTenants.map(tenant => (
                                <tr key={tenant.id} style={{ background: '#f8fafc', borderRadius: '1.5rem', transition: 'transform 0.2s ease' }}>
                                    <td style={{ padding: '1.25rem 1.5rem', borderRadius: '1.5rem 0 0 1.5rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.95rem' }}>{tenant.name || 'Especialista Solemia'}</span>
                                            <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '500' }}>{tenant.email}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            {tenant.plan_type === 'admin_bypass' ? (
                                                <span style={{ fontSize: '0.65rem', fontWeight: '900', color: 'var(--solemia-pink)' }}>✨ ACCESO CORTESÍA</span>
                                            ) : (
                                                <>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: tenant.subscription_status === 'active' ? '#10b981' : '#ed406a' }}>
                                                        {tenant.subscription_status === 'active' ? 'PAGADO' : 'PENDIENTE'}
                                                    </span>
                                                    <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>{tenant.plan_type || 'Sin plan'}</span>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <button
                                            onClick={() => toggleManualAccess(tenant.id, tenant.subscription_status, tenant.plan_type)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '1rem',
                                                border: 'none',
                                                background: tenant.subscription_status === 'active' ? '#ecfdf5' : '#f8fafc',
                                                color: tenant.subscription_status === 'active' ? '#10b981' : '#94a3b8',
                                                fontWeight: '900',
                                                fontSize: '0.65rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                border: tenant.subscription_status === 'active' ? '1px solid #10b981' : '1px solid #e2e8f0'
                                            }}
                                            title={tenant.subscription_status === 'active' ? 'Quitar acceso de cortesía' : 'Dar acceso libre ilimitado'}
                                        >
                                            {tenant.subscription_status === 'active' ? <><Crown size={12} /> VIP ACTIVO</> : 'REGALAR ACCESO'}
                                        </button>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', borderRadius: '0 1.5rem 1.5rem 0' }}>
                                        <button
                                            onClick={() => toggleSuspension(tenant.id, tenant.is_active)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '1rem',
                                                border: 'none',
                                                background: tenant.is_active ? '#f8fafc' : '#ed406a',
                                                color: tenant.is_active ? '#94a3b8' : 'white',
                                                fontWeight: '900',
                                                fontSize: '0.65rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                border: '1px solid currentColor'
                                            }}
                                            title={tenant.is_active ? "Baneas al usuario (no podrá ni ver precios)" : "Quitar baneo"}
                                        >
                                            <Power size={14} /> {tenant.is_active ? 'BANEAR' : 'BANEADO'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <footer style={{ marginTop: 'auto', padding: '3rem 0 4rem', borderTop: '1px solid rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <img src="/solemia-logo.png" alt="SOLEMIA" style={{ height: '32px', width: 'auto' }} />
                            </div>
                            <div className="text-detail" style={{ fontSize: '9px', opacity: 0.4 }}>
                                © 2026 Todos los derechos reservados.<br />
                                v1.0.2
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
                            <button
                                onClick={() => setLegalConfig({
                                    isOpen: true,
                                    title: 'Seguridad de Datos',
                                    content: (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <p>Este panel utiliza <strong>Row Level Security (RLS)</strong> de Supabase para garantizar que cada administrador solo acceda a la información permitida.</p>
                                            <p>Toda la comunicación entre el cliente y el servidor está cifrada vía SSL.</p>
                                        </div>
                                    )
                                })}
                                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                                className="footer-link"
                            >
                                <div className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '1px' }}>Seguridad</div>
                            </button>
                            <button
                                onClick={() => setLegalConfig({
                                    isOpen: true,
                                    title: 'Política de Backup',
                                    content: (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <p>Realizamos copias de seguridad automáticas cada 24 horas.</p>
                                            <p>En caso de desastre, el tiempo estimado de recuperación (RTO) es de menos de 1 hora.</p>
                                        </div>
                                    )
                                })}
                                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                                className="footer-link"
                            >
                                <div className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '1px' }}>Backup</div>
                            </button>
                        </div>
                    </div>
                </footer>
            </main>

            {legalConfig.isOpen && (
                <LegalModal
                    isOpen={legalConfig.isOpen}
                    onClose={() => setLegalConfig({ ...legalConfig, isOpen: false })}
                    title={legalConfig.title}
                    content={legalConfig.content}
                />
            )}
        </div>
    );
}
