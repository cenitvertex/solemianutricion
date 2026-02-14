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
    ChevronRight,
    ArrowLeft,
    TrendingUp,
    MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
                activeTenants: enrichedTenants.filter(t => t.is_active).length,
                totalPatients: patientsData.length
            });

        } catch (err) {
            console.error('Error fetching admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleTenantStatus = async (tenantId, currentStatus) => {
        try {
            const { error } = await supabase
                .from('tenants')
                .update({ is_active: !currentStatus })
                .eq('id', tenantId);

            if (error) throw error;

            // Update local state
            setTenants(tenants.map(t =>
                t.id === tenantId ? { ...t, is_active: !currentStatus } : t
            ));
        } catch (err) {
            alert('Error al cambiar estatus: ' + err.message);
        }
    };

    const filteredTenants = tenants.filter(t =>
        t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dashboard-container" style={{ padding: '0' }}>
            {/* Header / Sidebar Sidebar mockup inside main view */}
            <div style={{ display: 'flex', minHeight: '100vh' }}>

                {/* Lateral Admin Menu */}
                <aside style={{
                    width: '300px',
                    background: 'white',
                    padding: '3rem 2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2.5rem',
                    borderRight: '1px solid #f0f0f0'
                }}>
                    <img src={logo} alt="Solemia" style={{ height: '40px', objectFit: 'contain', width: 'fit-content' }} />

                    <div style={{ marginTop: '2rem' }}>
                        <div className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px', color: '#94a3b8', marginBottom: '1.5rem' }}>MENU SUPERADMIN</div>
                        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem 1.5rem',
                                background: 'var(--solemia-plum-light)',
                                color: 'var(--solemia-plum)',
                                borderRadius: '1.5rem',
                                fontWeight: '700',
                                cursor: 'pointer'
                            }}>
                                <Users size={20} /> Nutriólogos
                            </div>
                            <div
                                onClick={() => navigate('/')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '1rem 1.5rem',
                                    color: '#64748b',
                                    borderRadius: '1.5rem',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}>
                                <ArrowLeft size={20} /> Volver a mi App
                            </div>
                        </nav>
                    </div>

                    <div style={{ marginTop: 'auto', padding: '1.5rem', background: '#f8fafc', borderRadius: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                            <Shield size={20} color="var(--solemia-plum)" />
                            <span style={{ fontWeight: '800', fontSize: '0.8rem', color: 'var(--solemia-plum)' }}>SODO ADMIN</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4' }}>Control total del ecosistema Solemia Nutrición.</p>
                    </div>
                </aside>

                {/* Main Content */}
                <main style={{ flex: 1, padding: '4rem 5rem', background: '#fafbfc', overflowY: 'auto' }}>

                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem' }}>
                        <div>
                            <h1 style={{ fontSize: '3rem', color: 'var(--solemia-plum)', marginBottom: '0.5rem', fontFamily: 'Outfit', fontWeight: '900', lineHeight: 1 }}>Panel de Control</h1>
                            <div className="text-detail" style={{ fontSize: '10px', fontWeight: '900', letterSpacing: '2px' }}>SUPERVISIÓN GLOBAL DE NUTRIÓLOGOS</div>
                        </div>

                        <div style={{ position: 'relative', width: '350px' }}>
                            <Search size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="text"
                                placeholder="Buscar especialista o email..."
                                className="input-field"
                                style={{ paddingLeft: '3.5rem', borderRadius: '2rem', background: 'white', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '4rem' }}>
                        <div className="card glass" style={{ padding: '2rem', borderRadius: '2.5rem', border: 'none', background: 'white' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ background: '#f0f4ff', padding: '0.75rem', borderRadius: '1rem' }}><Users size={24} color="#3b82f6" /></div>
                                <span style={{ fontWeight: '800', fontSize: '0.8rem', color: '#94a3b8', letterSpacing: '1px' }}>TOTAL ESPECIALISTAS</span>
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1e293b' }}>{stats.totalTenants}</div>
                        </div>
                        <div className="card glass" style={{ padding: '2rem', borderRadius: '2.5rem', border: 'none', background: 'white' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ background: '#f0fdf4', padding: '0.75rem', borderRadius: '1rem' }}><Activity size={24} color="#22c55e" /></div>
                                <span style={{ fontWeight: '800', fontSize: '0.8rem', color: '#94a3b8', letterSpacing: '1px' }}>CUENTAS ACTIVAS</span>
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1e293b' }}>{stats.activeTenants}</div>
                        </div>
                        <div className="card glass" style={{ padding: '2rem', borderRadius: '2.5rem', border: 'none', background: 'white' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ background: '#fff1f2', padding: '0.75rem', borderRadius: '1rem' }}><TrendingUp size={24} color="#f43f5e" /></div>
                                <span style={{ fontWeight: '800', fontSize: '0.8rem', color: '#94a3b8', letterSpacing: '1px' }}>PACIENTES TOTALES</span>
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1e293b' }}>{stats.totalPatients}</div>
                        </div>
                    </div>

                    {/* Tenants Table */}
                    <div className="card glass" style={{ padding: '2.5rem', borderRadius: '3.5rem', border: 'none', background: 'white' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 1rem' }}>
                            <thead>
                                <tr style={{ textAlign: 'left' }}>
                                    <th className="text-detail" style={{ fontSize: '9px', fontWeight: '900', padding: '0 1.5rem', color: '#94a3b8' }}>ESPECIALISTA / EMAIL</th>
                                    <th className="text-detail" style={{ fontSize: '9px', fontWeight: '900', padding: '0 1.5rem', color: '#94a3b8' }}>MÉTRICAS</th>
                                    <th className="text-detail" style={{ fontSize: '9px', fontWeight: '900', padding: '0 1.5rem', color: '#94a3b8' }}>ESTATUS</th>
                                    <th className="text-detail" style={{ fontSize: '9px', fontWeight: '900', padding: '0 1.5rem', color: '#94a3b8' }}>ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '4rem' }}>
                                            <div style={{ color: 'var(--solemia-plum)', fontWeight: '700' }}>Cargando datos maestros...</div>
                                        </td>
                                    </tr>
                                ) : filteredTenants.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '4rem' }}>
                                            <div style={{ color: '#94a3b8' }}>No se encontraron registros.</div>
                                        </td>
                                    </tr>
                                ) : filteredTenants.map(tenant => (
                                    <tr key={tenant.id} style={{ background: '#fafbfc', borderRadius: '2rem' }}>
                                        <td style={{ padding: '1.5rem', borderRadius: '2rem 0 0 2rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: '800', color: '#1e293b', fontSize: '1rem' }}>{tenant.name || 'Sin nombre'}</span>
                                                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{tenant.email}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem' }}>
                                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Users size={14} color="#64748b" />
                                                    <span style={{ fontWeight: '700', color: '#1e293b' }}>{tenant.patientCount}</span>
                                                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Pacientes</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <MessageSquare size={14} color="#64748b" />
                                                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Actividad</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem' }}>
                                            {tenant.is_active ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#22c55e', background: '#f0fdf4', padding: '0.4rem 1rem', borderRadius: '1rem', width: 'fit-content', fontSize: '0.75rem', fontWeight: '800' }}>
                                                    <CheckCircle2 size={14} /> ACTIVO
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f43f5e', background: '#fff1f2', padding: '0.4rem 1rem', borderRadius: '1rem', width: 'fit-content', fontSize: '0.75rem', fontWeight: '800' }}>
                                                    <XCircle size={14} /> SUSPENDIDO
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '1.5rem', borderRadius: '0 2rem 2rem 0' }}>
                                            <button
                                                onClick={() => toggleTenantStatus(tenant.id, tenant.is_active)}
                                                style={{
                                                    padding: '0.75rem 1.5rem',
                                                    borderRadius: '1.25rem',
                                                    border: 'none',
                                                    background: tenant.is_active ? '#fff1f2' : '#f0fdf4',
                                                    color: tenant.is_active ? '#f43f5e' : '#22c55e',
                                                    fontWeight: '900',
                                                    fontSize: '0.75rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <Power size={14} />
                                                {tenant.is_active ? 'SUSPENDER' : 'ACTIVAR'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
}
