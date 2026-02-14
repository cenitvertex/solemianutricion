import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
    Users,
    Plus,
    LogOut,
    Search,
    Phone,
    FileText,
    Trash2,
    Edit,
    Brain,
    UserCheck,
    TrendingUp,
    Heart,
    Star,
    ChevronRight,
    Filter,
    ArrowUpDown,
    Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ClientModal from '../components/ClientModal';
import LogsModal from '../components/LogsModal';
import PreviewModal from '../components/PreviewModal';
import SettingsModal from '../components/SettingsModal';
import logo from '../assets/logo.png';

export default function Dashboard({ session }) {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLogsOpen, setIsLogsOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [editingPatient, setEditingPatient] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState({ url: '', title: '' });
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive'

    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkIdentity = async () => {
            const user = session?.user;
            if (!user) return;

            console.log('--- Identidad Logueada ---');
            console.log('ID:', user.id);
            console.log('Email:', user.email);

            try {
                // 1. Buscamos si el ID existe en la tabla Maestra de Admins
                const { data: adminRecord, error: adminError } = await supabase
                    .from('admins')
                    .select('id, email')
                    .eq('id', user.id)
                    .maybeSingle();

                if (adminError) {
                    console.error('Error verificando rango admin:', adminError);
                }

                const isUserAdmin = !!adminRecord;
                console.log('¿Es Administrador?:', isUserAdmin);

                setIsAdmin(isUserAdmin);

                // 2. SOLO si NO es admin, procedemos a asegurar que tenga perfil de Nutriólogo
                if (!isUserAdmin) {
                    console.log('Usuario normal detectado, asegurando perfil de nutriólogo...');
                    await ensureTenantExists(user);
                } else {
                    console.log('Acceso Admin detectado. No se creará perfil de nutriólogo.');
                }
            } catch (err) {
                console.error('Fallo crítico en validación de identidad:', err);
            }

            fetchPatients();
        };

        checkIdentity();
    }, [session]);

    const ensureTenantExists = async (user) => {
        try {
            // Verificamos si ya existe para no duplicar
            const { data: tenant, error: selectError } = await supabase
                .from('tenants')
                .select('id')
                .eq('id', user.id)
                .maybeSingle();

            if (!tenant && !selectError) {
                console.log('Creando nuevo perfil de nutriólogo para:', user.email);
                const { error: insertError } = await supabase.from('tenants').insert({
                    id: user.id,
                    name: 'Mi Consultorio',
                    email: user.email,
                    is_active: true,
                    instance_id: `nutri_${user.id.slice(0, 8)}`,
                    system_prompt: 'Eres el asistente virtual personal de un nutriólogo profesional.'
                });

                if (insertError) console.error('Error al insertar nutriólogo:', insertError);
            }
        } catch (err) {
            console.error('Unexpected error in ensureTenantExists:', err);
        }
    };

    const fetchPatients = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('patients')
            .select('*')
            .eq('tenant_id', session.user.id)
            .order('created_at', { ascending: false });

        if (!error) setPatients(data || []);
        setLoading(false);
    };

    const handleLogout = () => supabase.auth.signOut();

    const deletePatient = async () => {
        if (!patientToDelete) return;

        const { error } = await supabase.from('patients').delete().eq('id', patientToDelete.id);
        if (!error) {
            setPatients(patients.filter(p => p.id !== patientToDelete.id));
            setIsDeleteModalOpen(false);
            setPatientToDelete(null);
        } else {
            alert('Error al eliminar paciente: ' + error.message);
        }
    };

    const filteredPatients = patients
        .filter(patient => {
            const matchesSearch = patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.phone?.includes(searchTerm);

            if (filterStatus === 'all') return matchesSearch;
            if (filterStatus === 'active') return matchesSearch && patient.is_active;
            if (filterStatus === 'inactive') return matchesSearch && !patient.is_active;
            return matchesSearch;
        })
        .sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.name.localeCompare(b.name);
            } else {
                return b.name.localeCompare(a.name);
            }
        });

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    const stats = [
        { label: 'DIRECTORIO', value: patients.length, sub: 'PERFILES TOTALES', icon: <Users size={20} />, color: 'var(--solemia-plum)' },
        { label: 'ACTIVOS', value: patients.filter(p => p.is_active).length, sub: 'PACIENTES DE ALTA', icon: <UserCheck size={20} />, color: 'var(--solemia-emerald)' },
        { label: 'NUEVOS', value: patients.filter(p => new Date(p.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length, sub: 'ÚLTIMA SEMANA', icon: <Star size={20} />, color: 'var(--solemia-pink)' }
    ];

    return (
        <div className="layout-dashboard animate-premium">
            <header className="glass" style={{ padding: '1rem 0', position: 'sticky', top: 0, zIndex: 100, borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderRadius: 0 }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: '250px 1fr 250px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img src={logo} alt="Solemia" style={{ height: '42px', objectFit: 'contain' }} />
                        <h1 style={{ fontSize: '1.4rem', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--solemia-plum)', fontFamily: 'Outfit' }}>
                            Nutrición
                        </h1>
                    </div>

                    <div style={{ flex: 1 }} className="hide-mobile">
                        {/* Empty space for balance */}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', justifyContent: 'flex-end' }}>
                        <div className="hide-mobile" style={{ textAlign: 'right' }}>
                            <div className="text-detail" style={{ fontSize: '0.65rem', fontWeight: '900', letterSpacing: '1px' }}>GESTIÓN PROFESIONAL</div>
                            <div style={{ fontWeight: '900', fontSize: '1.1rem', color: 'var(--solemia-charcoal)', fontFamily: 'Outfit', textTransform: 'uppercase' }}>{session.user.email.split('@')[0]}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                title="Configuración"
                                style={{ width: '44px', height: '44px', borderRadius: '14px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--solemia-plum)', backgroundColor: 'white' }}
                            >
                                <Settings size={20} />
                            </button>
                            <button
                                onClick={handleLogout}
                                title="Salir"
                                style={{ width: '44px', height: '44px', borderRadius: '14px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', backgroundColor: 'var(--solemia-plum)' }}
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container">
                <div style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '2.8rem', marginBottom: '0.5rem', fontFamily: 'Outfit', fontWeight: '900', letterSpacing: '-1px' }}>Expedientes</h2>
                    <div className="text-detail" style={{ color: 'var(--solemia-plum)', opacity: 0.8 }}>
                        <Users size={14} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                        Registro clínico profesional
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '3.5rem', flexWrap: 'wrap' }}>
                    {stats.map((stat, i) => (
                        <div key={i} className="stat-card" style={{ padding: '1.5rem', height: '100%', minWidth: '220px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div style={{ backgroundColor: `${stat.color}10`, color: stat.color, padding: '0.6rem', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {stat.icon}
                                </div>
                            </div>
                            <div>
                                <div className="text-detail" style={{ fontSize: '9px', marginBottom: '6px', opacity: 0.7 }}>{stat.label}</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--solemia-charcoal)', fontFamily: 'Outfit', lineHeight: 0.9, marginBottom: '6px' }}>{stat.value}</div>
                                <div className="text-detail" style={{ fontSize: '10px', textTransform: 'none', letterSpacing: '0', opacity: 0.5 }}>{stat.sub}</div>
                            </div>
                        </div>
                    ))}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <button
                            onClick={() => { setEditingPatient(null); setIsModalOpen(true); }}
                            className="btn btn-primary"
                            style={{ padding: '1.25rem 3rem', fontSize: '10px', boxShadow: '0 10px 30px rgba(225, 29, 72, 0.4)', borderRadius: '1.5rem' }}
                        >
                            <Plus size={18} />
                            NUEVO PACIENTE
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '2rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className="btn btn-outline"
                            style={{
                                padding: '0.6rem 1.5rem',
                                backgroundColor: sortOrder !== 'asc' ? 'var(--solemia-plum)' : 'white',
                                color: sortOrder !== 'asc' ? 'white' : 'var(--solemia-charcoal)'
                            }}
                        >
                            <ArrowUpDown size={16} /> {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                        </button>
                        <button
                            onClick={() => {
                                if (filterStatus === 'all') setFilterStatus('active');
                                else if (filterStatus === 'active') setFilterStatus('inactive');
                                else setFilterStatus('all');
                            }}
                            className="btn btn-outline"
                            style={{
                                padding: '0.6rem 1.5rem',
                                backgroundColor: filterStatus !== 'all' ? 'var(--solemia-plum)' : 'white',
                                color: filterStatus !== 'all' ? 'white' : 'var(--solemia-charcoal)'
                            }}
                        >
                            <Filter size={16} /> {filterStatus === 'all' ? 'TODOS' : filterStatus === 'active' ? 'ACTIVOS' : 'INACTIVOS'}
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem', minWidth: '350px' }}>
                        <div className="text-detail" style={{ fontSize: '0.65rem' }}>
                            {filteredPatients.length} COINCIDENCIAS
                        </div>
                        <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--solemia-plum)', opacity: 0.5 }} />
                            <input
                                type="text"
                                className="input-field glass"
                                placeholder="Buscar por nombre o número"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ paddingLeft: '3rem', border: 'none' }}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '2rem' }}>
                    {loading ? (
                        <p style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', fontFamily: 'Outfit', fontSize: '1.2rem' }}>Cargando directorio...</p>
                    ) : filteredPatients.length === 0 ? (
                        <div className="card-premium" style={{ textAlign: 'center', padding: '6rem' }}>
                            <Users size={64} style={{ color: '#eee', marginBottom: '2rem' }} />
                            <h3 style={{ color: 'var(--text-muted)', fontWeight: '500' }}>No se encontraron pacientes registrados.</h3>
                        </div>
                    ) : (
                        <div className="animate-premium">
                            {filteredPatients.map(patient => (
                                <div
                                    key={patient.id}
                                    className="client-card group"
                                    style={{
                                        position: 'relative',
                                        padding: '1.5rem 2.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '2.5rem',
                                        borderRadius: '2.5rem',
                                        overflow: 'hidden',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => { setEditingPatient(patient); setIsModalOpen(true); }}
                                >
                                    {/* Brand Accent */}
                                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: 'var(--solemia-plum)' }}></div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1.5, minWidth: '300px' }}>
                                        <div className="avatar-initial" style={{ width: '64px', height: '64px', borderRadius: '24px', backgroundColor: '#f8f0f4', color: 'var(--solemia-plum)', border: '2px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                                            {getInitials(patient.name)}
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ fontWeight: '900', fontSize: '1.2rem', color: 'var(--solemia-charcoal)', fontFamily: 'Outfit', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{patient.name}</div>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '100px',
                                                    fontSize: '8px',
                                                    fontWeight: '900',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '1px',
                                                    backgroundColor: patient.is_active ? '#ecfdf5' : '#fef2f2',
                                                    color: patient.is_active ? '#10b981' : '#ef4444'
                                                }}>
                                                    {patient.is_active ? 'ACTIVO' : 'INACTIVO'}
                                                </span>
                                            </div>
                                            <div className="text-detail" style={{ fontSize: '9px', marginTop: '6px', opacity: 0.5 }}>
                                                ÚLTIMA ALTA: {new Date(patient.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="hide-mobile" style={{ flex: 1, minWidth: '150px' }}>
                                        <div className="text-detail" style={{ fontSize: '8px', marginBottom: '6px' }}>TELÉFONO</div>
                                        <div style={{ fontWeight: '900', fontSize: '1.1rem', color: 'var(--solemia-plum)', fontFamily: 'Outfit' }}>{patient.phone}</div>
                                    </div>

                                    <div className="hide-mobile" style={{ flex: 1, minWidth: '180px' }}>
                                        <div className="text-detail" style={{ fontSize: '8px', marginBottom: '6px' }}>ALERGIAS</div>
                                        <div style={{ fontWeight: '900', fontSize: '0.9rem', color: 'var(--solemia-charcoal)', opacity: 0.8, fontFamily: 'Outfit' }}>
                                            {Array.isArray(patient.allergies) && patient.allergies.length > 0
                                                ? patient.allergies.join(', ').toUpperCase()
                                                : 'SIN ALERGIAS'}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginLeft: 'auto' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginRight: '1.5rem' }}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (patient.expediente_url) {
                                                        setPreviewData({ url: patient.expediente_url, title: `Expediente: ${patient.name}` });
                                                        setIsPreviewOpen(true);
                                                    }
                                                }}
                                                className="btn"
                                                style={{ padding: '0.7rem', backgroundColor: '#f8f0f4', color: patient.expediente_url ? 'var(--solemia-plum)' : '#ddd', borderRadius: '14px', transition: 'all' }}
                                                disabled={!patient.expediente_url}
                                            >
                                                <FileText size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedPatient(patient);
                                                    setIsLogsOpen(true);
                                                }}
                                                className="btn"
                                                style={{ padding: '0.7rem', backgroundColor: '#f8f0f4', color: 'var(--solemia-plum)', borderRadius: '14px', transition: 'all' }}
                                            >
                                                <Brain size={18} />
                                            </button>
                                        </div>
                                        <button
                                            className="btn"
                                            style={{
                                                padding: '0.8rem 1.75rem',
                                                backgroundColor: '#f8f8f8',
                                                color: 'var(--solemia-plum)',
                                                fontSize: '9px',
                                                borderRadius: '12px',
                                                fontFamily: 'Outfit',
                                                fontWeight: '900',
                                                letterSpacing: '1px'
                                            }}
                                        >
                                            VER PERFIL <ChevronRight size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPatientToDelete(patient);
                                                setIsDeleteModalOpen(true);
                                            }}
                                            className="btn"
                                            style={{ padding: '0.7rem', color: '#ffafaf', border: 'none', backgroundColor: 'transparent' }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {isModalOpen && (
                <ClientModal
                    isOpen={isModalOpen}
                    onClose={() => { setIsModalOpen(false); setEditingPatient(null); }}
                    onSuccess={fetchPatients}
                    client={editingPatient}
                />
            )}

            {isLogsOpen && (
                <LogsModal
                    isOpen={isLogsOpen}
                    onClose={() => { setIsLogsOpen(false); setSelectedPatient(null); }}
                    patient={selectedPatient}
                />
            )}

            {isDeleteModalOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(142,45,79,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120, padding: '1rem' }}>
                    <div className="card animate-scale-in" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '2rem' }}>
                        <div style={{ backgroundColor: '#fff5f5', color: '#e53e3e', padding: '1rem', borderRadius: '50%', width: 'fit-content', margin: '0 auto 1.5rem' }}>
                            <Trash2 size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--text)' }}>¿Eliminar Paciente?</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.875rem' }}>
                            Estás por eliminar a <strong>{patientToDelete?.name}</strong>. Esta acción no se puede deshacer.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <button onClick={deletePatient} className="btn" style={{ backgroundColor: '#e53e3e', color: 'white', width: '100%' }}>Sí, eliminar</button>
                            <button onClick={() => { setIsDeleteModalOpen(false); setPatientToDelete(null); }} className="btn btn-outline" style={{ width: '100%' }}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {isPreviewOpen && (
                <PreviewModal
                    isOpen={isPreviewOpen}
                    onClose={() => setIsPreviewOpen(false)}
                    url={previewData.url}
                    title={previewData.title}
                />
            )}

            {isSettingsOpen && (
                <SettingsModal
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    session={session}
                />
            )}
        </div >
    );
}
