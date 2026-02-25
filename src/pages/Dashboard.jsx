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
    Settings,
    ClipboardList,
    Bell,
    MessageCircle,
    Power,
    Zap,
    History,
    LifeBuoy,
    CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ClientModal from '../components/ClientModal';
import PatientProfileModal from '../components/PatientProfileModal';
import LogsModal from '../components/LogsModal';
import PreviewModal from '../components/PreviewModal';
import SettingsModal from '../components/SettingsModal';
import LegalModal from '../components/LegalModal';
import logo from '../assets/logo.png';
import WelcomeTour from '../components/WelcomeTour';

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
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [sortOrder, setSortOrder] = useState('name-asc'); // 'name-asc', 'name-desc', 'recent', 'count-desc', 'count-asc'
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive'
    const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'today', 'week', 'month'
    const [activeView, setActiveView] = useState('directory'); // 'directory', 'hoy'
    const [recentLogs, setRecentLogs] = useState([]);
    const [consultationCounts, setConsultationCounts] = useState({});
    const [toasts, setToasts] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null); // 'sort', 'time' or null
    const [tenantName, setTenantName] = useState('');
    const [legalConfig, setLegalConfig] = useState({ isOpen: false, title: '', content: null });
    const [lastConsultationDates, setLastConsultationDates] = useState({});

    // Estados de Suscripción
    const [subscriptionStatus, setSubscriptionStatus] = useState('pending'); // 'active', 'pending', 'expired'
    const [accessUntil, setAccessUntil] = useState(null);
    const [isPaywallOpen, setIsPaywallOpen] = useState(false);
    const [planType, setPlanType] = useState(null);

    // Bloqueo de scroll cuando hay un modal abierto
    useEffect(() => {
        const anyModalOpen = isModalOpen || isSettingsOpen || isProfileOpen || isDeleteModalOpen || !!editingPatient || isLogsOpen || isPreviewOpen || legalConfig.isOpen || isPaywallOpen;
        if (anyModalOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.height = '100vh';
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.height = 'auto';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isModalOpen, isSettingsOpen, isProfileOpen, isDeleteModalOpen, editingPatient, isLogsOpen, isPreviewOpen, legalConfig.isOpen]);

    const showToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    };

    useEffect(() => {
        const checkIdentity = async () => {
            if (!session?.user) return;

            // 1. Fetch tenant info (Name & Subscription & Tour)
            // Usamos select('*') para evitar errores si faltan columnas nuevas (has_seen_tour, is_active)
            const { data, error } = await supabase
                .from('tenants')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();

            if (data && !error) {
                setTenantName(data.name || '');
                setSubscriptionStatus(data.subscription_status || 'pending');
                setAccessUntil(data.access_until);
                setPlanType(data.plan_type);

                // Check access
                const now = new Date();
                const validUntil = data.access_until ? new Date(data.access_until) : null;
                const isExpired = validUntil && now > validUntil;

                // LÓGICA DE ACCESO MAESTRA:
                // Permitimos acceso si:
                // 1. Es un bypass de administrador (cortesía) o plan premium
                // 2. La suscripción está activa y no ha vencido
                const hasAdminBypass = data.plan_type === 'admin_bypass';
                const hasActiveSubscription = (data.subscription_status === 'active' || data.subscription_status === 'authorized') && !isExpired;
                const hasAccess = hasAdminBypass || hasActiveSubscription;

                // Solo bloqueamos si explícitamente no hay acceso o está baneado
                if (!hasAccess || data.is_active === false) {
                    setIsPaywallOpen(true);
                } else {
                    setIsPaywallOpen(false); // Aseguramos que se cierre
                    fetchPatients();

                }
            } else {
                // Si hay error en la query (ej. tabla vacía o error de red), 
                // pero tenemos sesión, intentamos cargar pacientes de todos modos
                // para no bloquear al usuario injustamente.
                console.warn('Tenant record not found or error, defaulting to limited access');
                fetchPatients();
            }
        };
        checkIdentity();
    }, [session]);

    const togglePatientStatus = async (patientId, currentStatus) => {
        const newStatus = !currentStatus;

        // Optimistic update
        setPatients(prev => prev.map(p => p.id === patientId ? { ...p, is_active: newStatus } : p));

        const { error } = await supabase
            .from('patients')
            .update({ is_active: newStatus })
            .eq('id', patientId);

        if (error) {
            console.error('Error updating patient status:', error);
            // Rollback
            setPatients(prev => prev.map(p => p.id === patientId ? { ...p, is_active: currentStatus } : p));
            showToast('Error al actualizar el estado', 'error');
        } else {
            showToast('Estado IA actualizado con éxito');
        }
    };

    // === REALTIME SYNC EFFECT ===
    useEffect(() => {
        if (!session?.user?.id) return;

        console.log('🔗 [Realtime] Intentando suscripción para tenant:', session.user.id);

        // Creamos un canal único para el usuario
        const channel = supabase
            .channel(`patients_sync_${session.user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'patients'
                    // Quitamos el filtro server-side para evitar problemas de Replica Identity
                },
                (payload) => {
                    console.log('⚡ [Realtime] Cambio detectado:', payload);
                    const updatedPatient = payload.new;

                    // Verificamos que sea de nuestro tenant (doble check de RLS)
                    if (updatedPatient.tenant_id !== session.user.id) return;

                    // 1. Actualizar lista global
                    setPatients(current =>
                        current.map(p => p.id === updatedPatient.id ? { ...p, ...updatedPatient } : p)
                    );

                    // 2. Actualizar perfil si está abierto
                    setEditingPatient(current => {
                        if (current && current.id === updatedPatient.id) {
                            console.log('🔄 [Realtime] Perfil actualizado en vivo:', updatedPatient.name);
                            return { ...current, ...updatedPatient };
                        }
                        return current;
                    });
                }
            )
            .subscribe((status, err) => {
                console.log(`📡 [Realtime] Estado del canal: ${status}`, err || '');
                if (status === 'CHANNEL_ERROR') {
                    console.error('❌ [Realtime] Error de conexión. Verifica si el servicio está activo.');
                }
            });

        return () => {
            console.log('📴 [Realtime] Limpiando suscripción');
            supabase.removeChannel(channel);
        };
    }, [session?.user?.id]);

    // === SMART POLLING FALLBACK ===
    // Si hay pacientes en estado "Analizando...", refrescamos cada 5s como respaldo a Realtime
    useEffect(() => {
        const hasPatientsAnalyzing = patients.some(p =>
            p.objective_and_params?.startsWith('⏳') ||
            (Array.isArray(p.allergies) && p.allergies.some(a => a?.startsWith('⏳')))
        );

        if (hasPatientsAnalyzing) {
            console.log('🚜 [Smart Polling] Detectada actividad IA (Análisis/Alergias), activando respaldo...');
            const interval = setInterval(() => {
                // Refresco silencioso (sin setLoading)
                supabase
                    .from('patients')
                    .select('*')
                    .eq('tenant_id', session.user.id)
                    .then(({ data }) => {
                        if (data) {
                            setPatients(data);
                            // Sincronizar también el modal si está abierto
                            setEditingPatient(current => {
                                if (current) {
                                    const updated = data.find(p => p.id === current.id);
                                    if (updated && (
                                        updated.objective_and_params !== current.objective_and_params ||
                                        JSON.stringify(updated.allergies) !== JSON.stringify(current.allergies)
                                    )) {
                                        return { ...current, ...updated };
                                    }
                                }
                                return current;
                            });
                        }
                    });
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [patients, session?.user?.id]);

    const handleTourComplete = async () => {
        setIsTourOpen(false);
        // Marcamos como visto en la DB
        const { error } = await supabase
            .from('tenants')
            .update({ has_seen_tour: true })
            .eq('id', session.user.id);

        if (error) {
            console.error('Error al guardar progreso del tour:', error);
        }
    };

    const handleResetTour = async () => {
        setIsTourOpen(true);
        setIsSettingsOpen(false); // Cerramos config para que vea el tour
        // Opcional: Podríamos dejar el flag en true en la DB y solo abrir el tour localmente
        // pero es mejor resetearlo por si recarga en medio del tour.
        await supabase
            .from('tenants')
            .update({ has_seen_tour: false })
            .eq('id', session.user.id);
    };

    const fetchPatients = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('patients')
            .select('*')
            .eq('tenant_id', session.user.id);

        if (!error) {
            setPatients(data || []);
            fetchCountsAndLogs(data || []);
        }
        setLoading(false);
    };

    const fetchCountsAndLogs = async (patientsList) => {
        const patientIds = patientsList.map(p => p.id);
        if (patientIds.length === 0) return;

        const { data: logsData, error: logsError } = await supabase
            .from('recommendation_logs')
            .select('patient_id, created_at, user_intention')
            .in('patient_id', patientIds)
            .order('created_at', { ascending: false });

        if (!logsError && logsData) {
            const counts = {};
            const lastDates = {};

            logsData.forEach(log => {
                const pid = log.patient_id;
                counts[pid] = (counts[pid] || 0) + 1;

                const logDate = new Date(log.created_at);
                if (!lastDates[pid] || logDate > lastDates[pid]) {
                    lastDates[pid] = logDate;
                }
            });

            console.log('Consultation Stats:', { counts, lastDates });
            setConsultationCounts(counts);
            setLastConsultationDates(lastDates);
            setRecentLogs(logsData.slice(0, 15));
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    const deletePatient = async () => {
        if (!patientToDelete) return;

        const { error } = await supabase.from('patients').delete().eq('id', patientToDelete.id);
        if (!error) {
            setPatients(patients.filter(p => p.id !== patientToDelete.id));
            setIsDeleteModalOpen(false);
            setPatientToDelete(null);
            showToast('Paciente eliminado correctamente');
        } else {
            showToast('Error al eliminar paciente: ' + error.message, 'error');
        }
    };

    const filteredPatients = patients
        .filter(patient => {
            const matchesSearch = patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.phone?.includes(searchTerm);

            if (filterStatus === 'active' && !patient.is_active) return false;
            if (filterStatus === 'inactive' && patient.is_active) return false;

            // Filtro de Tiempo (Actividad)
            if (timeFilter !== 'all') {
                const lastDate = lastConsultationDates[patient.id];
                if (!lastDate) return false;

                const now = new Date();
                const diffMs = now - lastDate;
                const diffDays = diffMs / (1000 * 60 * 60 * 24);

                if (timeFilter === 'today' && diffDays > 1) return false;
                if (timeFilter === 'week' && diffDays > 7) return false;
                if (timeFilter === 'month' && diffDays > 30) return false;
            }

            return matchesSearch;
        })
        .sort((a, b) => {
            if (sortOrder === 'name-asc') return a.name.localeCompare(b.name);
            if (sortOrder === 'name-desc') return b.name.localeCompare(a.name);

            if (sortOrder === 'recent') {
                const dateA = lastConsultationDates[a.id] || new Date(0);
                const dateB = lastConsultationDates[b.id] || new Date(0);
                return dateB - dateA; // Más reciente primero
            }

            if (sortOrder === 'count-desc') {
                return (consultationCounts[b.id] || 0) - (consultationCounts[a.id] || 0);
            }

            if (sortOrder === 'count-asc') {
                return (consultationCounts[a.id] || 0) - (consultationCounts[b.id] || 0);
            }

            return 0;
        });

    const getInitials = (name) => {
        if (!name) return '';
        return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    };

    const formatPhoneNumber = (phone) => {
        if (!phone) return '';
        const cleaned = phone.replace(/[^\d+]/g, '');
        if (cleaned.startsWith('+52') && cleaned.length === 13) {
            return `+52 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
        }
        return cleaned;
    };

    const stats = [
        { label: 'Directorio', value: patients.length, sub: 'Perfiles totales', icon: <Users size={20} />, color: 'var(--solemia-plum)' },
        { label: 'Activos', value: patients.filter(p => p.is_active).length, sub: 'Pacientes en alta', icon: <UserCheck size={20} />, color: 'var(--solemia-emerald)' },
        { label: 'Nuevos', value: patients.filter(p => new Date(p.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length, sub: 'Última semana', icon: <Star size={20} />, color: 'var(--solemia-pink)' }
    ];

    const handleMP = async (plan) => {
        const planDetails = {
            monthly: { title: "Solemia Plan Mensual", price: 1349 },
            founder_semiannual: { title: "Solemia Pase Fundador (Semestral)", price: 5000 }
        };

        const selectedPlan = planDetails[plan];
        const mpKey = import.meta.env.VITE_MP_PUBLIC_KEY;

        try {
            const response = await fetch('/api/create-preference', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    title: selectedPlan.title,
                    unit_price: selectedPlan.price,
                    quantity: 1,
                    type: plan,
                    userId: session.user.id
                })
            });

            if (!response.ok) throw new Error('Error al crear preferencia');
            const data = await response.json();

            if (data.init_point) {
                window.location.href = data.init_point;
            }
        } catch (error) {
            console.error("Error Mercado Pago:", error);
            alert("No se pudo iniciar el proceso de pago.");
        }
    };

    return (
        <>
            <div className="layout-dashboard animate-premium">
                <style>{`
                @keyframes shimmer {
                    0% { background-position: -468px 0 }
                    100% { background-position: 468px 0 }
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideInUp {
                    from { transform: translateY(10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .skeleton {
                    background: #f6f7f8;
                    background-image: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
                    background-repeat: no-repeat;
                    background-size: 800px 104px;
                    display: inline-block;
                    position: relative;
                    animation: shimmer 1s linear infinite forwards;
                }
                .dropdown-item:hover {
                    background-color: rgba(77, 12, 48, 0.08) !important;
                }
            `}</style>

                {/* Toasts Container */}
                <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.75rem', pointerEvents: 'none' }}>
                    {toasts.map(toast => (
                        <div key={toast.id} className="glass" style={{
                            padding: '1rem 1.5rem',
                            borderRadius: '1.25rem',
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            animation: 'slideInRight 0.3s ease-out',
                            pointerEvents: 'auto'
                        }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: toast.type === 'error' ? 'var(--solemia-pink)' : 'var(--solemia-emerald)'
                            }}></div>
                            <span style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--solemia-charcoal)', fontFamily: 'var(--font-inter)' }}>{toast.message}</span>
                        </div>
                    ))}
                </div>

                <header style={{
                    background: 'linear-gradient(135deg, rgba(77, 12, 48, 0.94) 0%, rgba(225, 29, 72, 0.94) 100%)',
                    padding: '1rem 0 3.25rem 0', // Espacio extendido para el desvanecimiento seda
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    boxShadow: '0 10px 50px rgba(77, 12, 48, 0.04)',
                    border: 'none',
                    borderRadius: 0,
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    // Máscara ultra-suave (Silk Easing) con 8 paradas para integración total
                    maskImage: 'linear-gradient(to bottom, black 0%, black 35%, rgba(0,0,0,0.98) 45%, rgba(0,0,0,0.9) 55%, rgba(0,0,0,0.7) 65%, rgba(0,0,0,0.4) 75%, rgba(0,0,0,0.15) 88%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 35%, rgba(0,0,0,0.98) 45%, rgba(0,0,0,0.9) 55%, rgba(0,0,0,0.7) 65%, rgba(0,0,0,0.4) 75%, rgba(0,0,0,0.15) 88%, transparent 100%)',
                    marginBottom: '-2.25rem', // Compensación para que el fade no aleje el contenido
                    pointerEvents: 'none'
                }}>
                    <div className="container" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', pointerEvents: 'auto' }}>
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
                                marginTop: '2px' // Ajuste fino manual para balancear con el logo
                            }}>
                                Nutrición
                            </h1>
                        </div>

                        <div style={{ flex: 1 }} className="hide-mobile"></div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', justifyContent: 'flex-end' }}>
                            <div className="hide-mobile" style={{ textAlign: 'right', borderRight: '1px solid rgba(255,255,255,0.2)', paddingRight: '1.25rem' }}>
                                <div style={{ fontWeight: '900', fontSize: '1.1rem', color: 'white', fontFamily: 'var(--font-inter)', whiteSpace: 'nowrap' }}>
                                    {tenantName || session.user.email.split('@')[0]}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    onClick={() => setIsSettingsOpen(true)}
                                    title="Configuración"
                                    className="tour-settings"
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
                                    <Settings size={20} />
                                </button>
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
                                    onClick={handleLogout}
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

                <main className="container" style={{ marginTop: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                        <div>
                            <h2 style={{ fontSize: '2.8rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)', fontWeight: '800', letterSpacing: '-2px' }}>
                                {activeView === 'directory' ? 'Expedientes' : 'Actividad de hoy'}
                            </h2>
                            <div className="text-detail" style={{ color: 'var(--solemia-plum)', opacity: 0.8 }}>
                                {activeView === 'directory' ?
                                    <><Users size={14} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Expedientes digitales</> :
                                    <><History size={14} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Últimas consultas IA</>
                                }
                            </div>
                        </div>

                        <div className="nav-tab-container" style={{ marginTop: '1rem' }}>
                            <button
                                className={`nav-tab-btn ${activeView === 'directory' ? 'active' : ''}`}
                                onClick={() => setActiveView('directory')}
                            >
                                <Users size={14} style={{ marginRight: '6px' }} />
                                Directorio
                            </button>
                            <button
                                className={`nav-tab-btn ${activeView === 'hoy' ? 'active' : ''}`}
                                onClick={() => setActiveView('hoy')}
                            >
                                <Zap size={14} style={{ marginRight: '6px' }} />
                                Hoy
                            </button>
                        </div>
                    </div>

                    {activeView === 'directory' ? (
                        <div className="animate-premium">
                            <div className="tour-metrics" style={{ display: 'flex', gap: '1.5rem', marginBottom: '3.5rem', flexWrap: 'wrap' }}>
                                {stats.map((stat, i) => (
                                    <div key={i} className="stat-card" style={{ padding: '1.5rem', height: '100%', minWidth: '220px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                            <div style={{ backgroundColor: `${stat.color}10`, color: stat.color, padding: '0.6rem', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {stat.icon}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-detail" style={{ fontSize: '11px', marginBottom: '8px', opacity: 0.7 }}>{stat.label}</div>
                                            <div style={{ fontSize: '2.8rem', fontWeight: '900', color: 'var(--solemia-charcoal)', fontFamily: 'var(--font-inter)', lineHeight: 0.9, marginBottom: '8px' }}>{stat.value}</div>
                                            <div className="text-detail" style={{ fontSize: '12px', textTransform: 'none', letterSpacing: '0', opacity: 0.5 }}>{stat.sub}</div>
                                        </div>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                                    <button
                                        onClick={() => { setEditingPatient(null); setIsModalOpen(true); }}
                                        className="btn btn-primary tour-add-patient"
                                        style={{ padding: '1.4rem 4rem', fontSize: '13px', boxShadow: '0 10px 30px rgba(225, 29, 72, 0.4)', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                                    >
                                        <Plus size={20} /> Nuevo paciente
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '2rem' }}>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ position: 'relative' }}>
                                        <div
                                            onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
                                            className="select-premium tour-sort-by"
                                            style={{
                                                height: '44px',
                                                padding: '0 2.5rem 0 1.25rem',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                fontWeight: '800',
                                                backgroundColor: sortOrder !== 'name-asc' ? 'rgba(77, 12, 48, 0.06)' : '#f8fafc',
                                                color: sortOrder !== 'name-asc' ? 'var(--solemia-plum)' : 'var(--solemia-charcoal)',
                                                borderRadius: '1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                userSelect: 'none',
                                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='${sortOrder !== 'name-asc' ? '%234d0c30' : 'currentColor'}' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'right 0.75rem center',
                                                backgroundSize: '1rem',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {sortOrder === 'name-asc' ? 'A-Z (Nombre)' :
                                                sortOrder === 'name-desc' ? 'Z-A (Nombre)' :
                                                    sortOrder === 'recent' ? 'Consulta Reciente' :
                                                        sortOrder === 'count-desc' ? 'Mayor nº Consultas' : 'Menor nº Consultas'}
                                        </div>
                                        {openDropdown === 'sort' && (
                                            <>
                                                <div style={{ position: 'fixed', inset: 0, zIndex: 100 }} onClick={() => setOpenDropdown(null)} />
                                                <div className="glass" style={{
                                                    position: 'absolute',
                                                    top: 'calc(100% + 8px)',
                                                    left: 0,
                                                    minWidth: '220px',
                                                    backgroundColor: 'rgba(255,255,255,0.95)',
                                                    backdropFilter: 'blur(15px)',
                                                    borderRadius: '1.25rem',
                                                    boxShadow: '0 15px 40px rgba(0,0,0,0.1)',
                                                    border: '1px solid rgba(255,255,255,0.5)',
                                                    padding: '0.5rem',
                                                    zIndex: 101,
                                                    animation: 'slideInUp 0.2s ease-out'
                                                }}>
                                                    {[
                                                        { val: 'name-asc', label: 'A-Z (Nombre)' },
                                                        { val: 'name-desc', label: 'Z-A (Nombre)' },
                                                        { val: 'recent', label: 'Consulta Reciente' },
                                                        { val: 'count-desc', label: 'Mayor nº Consultas' },
                                                        { val: 'count-asc', label: 'Menor nº Consultas' }
                                                    ].map(opt => (
                                                        <div
                                                            key={opt.val}
                                                            onClick={() => { setSortOrder(opt.val); setOpenDropdown(null); }}
                                                            style={{
                                                                padding: '0.75rem 1rem',
                                                                borderRadius: '0.75rem',
                                                                fontSize: '0.8rem',
                                                                fontWeight: sortOrder === opt.val ? '800' : '600',
                                                                color: sortOrder === opt.val ? 'var(--solemia-plum)' : 'var(--solemia-charcoal)',
                                                                backgroundColor: sortOrder === opt.val ? 'rgba(77, 12, 48, 0.04)' : 'transparent',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.15s'
                                                            }}
                                                            className="dropdown-item"
                                                        >
                                                            {opt.label}
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div style={{ position: 'relative' }}>
                                        <div
                                            onClick={() => setOpenDropdown(openDropdown === 'time' ? null : 'time')}
                                            className="select-premium tour-time-filter"
                                            style={{
                                                height: '44px',
                                                padding: '0 2.5rem 0 1.25rem',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                fontWeight: '800',
                                                backgroundColor: timeFilter !== 'all' ? 'rgba(77, 12, 48, 0.06)' : '#f8fafc',
                                                color: timeFilter !== 'all' ? 'var(--solemia-plum)' : 'var(--solemia-charcoal)',
                                                borderRadius: '1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                userSelect: 'none',
                                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='${timeFilter !== 'all' ? '%234d0c30' : 'currentColor'}' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'right 0.75rem center',
                                                backgroundSize: '1rem',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {timeFilter === 'all' ? 'Toda la actividad' :
                                                timeFilter === 'today' ? 'Consultados hoy' :
                                                    timeFilter === 'week' ? 'Última semana' : 'Último mes'}
                                        </div>
                                        {openDropdown === 'time' && (
                                            <>
                                                <div style={{ position: 'fixed', inset: 0, zIndex: 100 }} onClick={() => setOpenDropdown(null)} />
                                                <div className="glass" style={{
                                                    position: 'absolute',
                                                    top: 'calc(100% + 8px)',
                                                    left: 0,
                                                    minWidth: '200px',
                                                    backgroundColor: 'rgba(255,255,255,0.95)',
                                                    backdropFilter: 'blur(15px)',
                                                    borderRadius: '1.25rem',
                                                    boxShadow: '0 15px 40px rgba(0,0,0,0.1)',
                                                    border: '1px solid rgba(255,255,255,0.5)',
                                                    padding: '0.5rem',
                                                    zIndex: 101,
                                                    animation: 'slideInUp 0.2s ease-out'
                                                }}>
                                                    {[
                                                        { val: 'all', label: 'Toda la actividad' },
                                                        { val: 'today', label: 'Consultados hoy' },
                                                        { val: 'week', label: 'Última semana' },
                                                        { val: 'month', label: 'Último mes' }
                                                    ].map(opt => (
                                                        <div
                                                            key={opt.val}
                                                            onClick={() => { setTimeFilter(opt.val); setOpenDropdown(null); }}
                                                            style={{
                                                                padding: '0.75rem 1rem',
                                                                borderRadius: '0.75rem',
                                                                fontSize: '0.8rem',
                                                                fontWeight: timeFilter === opt.val ? '800' : '600',
                                                                color: timeFilter === opt.val ? 'var(--solemia-plum)' : 'var(--solemia-charcoal)',
                                                                backgroundColor: timeFilter === opt.val ? 'rgba(77, 12, 48, 0.04)' : 'transparent',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.15s'
                                                            }}
                                                            className="dropdown-item"
                                                        >
                                                            {opt.label}
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (filterStatus === 'all') setFilterStatus('active');
                                            else if (filterStatus === 'active') setFilterStatus('inactive');
                                            else setFilterStatus('all');
                                        }}
                                        className="btn-filter-premium tour-status-filter"
                                        style={{
                                            height: '44px',
                                            padding: '0 1.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.8rem',
                                            fontWeight: '800',
                                            cursor: 'pointer',
                                            fontFamily: 'var(--font-inter)',
                                            border: 'none',
                                            outline: 'none',
                                            backgroundColor: filterStatus !== 'all' ? 'rgba(77, 12, 48, 0.06)' : '#f8fafc',
                                            color: filterStatus !== 'all' ? 'var(--solemia-plum)' : 'var(--solemia-charcoal)',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <Filter size={16} />
                                        <span>{filterStatus === 'all' ? 'Todos' : filterStatus === 'active' ? 'Activos' : 'Inactivos'}</span>
                                    </button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem', minWidth: '350px' }}>
                                    <div className="text-detail" style={{ fontSize: '0.65rem' }}>
                                        {filteredPatients.length} coincidencias
                                    </div>
                                    <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }} className="tour-search">
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

                            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {loading ? (
                                    // Skeleton State - 5 cards
                                    [1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="client-card" style={{ padding: '1.5rem 2.5rem', display: 'flex', alignItems: 'center', gap: '2.5rem', borderRadius: '2.5rem', backgroundColor: 'white' }}>
                                            <div className="skeleton" style={{ width: '56px', height: '56px', borderRadius: '20px' }}></div>
                                            <div style={{ flex: 1.2 }}>
                                                <div className="skeleton" style={{ width: '150px', height: '1.2rem', borderRadius: '4px', marginBottom: '8px' }}></div>
                                                <div className="skeleton" style={{ width: '80px', height: '0.6rem', borderRadius: '4px' }}></div>
                                            </div>
                                            <div className="skeleton" style={{ flex: 1, height: '1.2rem', borderRadius: '4px' }}></div>
                                            <div className="skeleton" style={{ width: '100px', height: '40px', borderRadius: '12px' }}></div>
                                        </div>
                                    ))
                                ) : filteredPatients.length === 0 ? (
                                    // Empty State
                                    <div style={{
                                        padding: '6rem 2rem',
                                        textAlign: 'center',
                                        backgroundColor: '#f8fafc',
                                        borderRadius: '3.5rem',
                                        border: '2px dashed #e2e8f0',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '1.5rem'
                                    }}>
                                        <div style={{ opacity: 0.2 }}>
                                            <Users size={64} color="var(--solemia-plum)" />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--solemia-charcoal)', marginBottom: '0.5rem' }}>
                                                {searchTerm ? 'No hay coincidencias' : 'Directorio vacío'}
                                            </div>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--solemia-charcoal)', opacity: 0.6, maxWidth: '300px', margin: '0 auto' }}>
                                                {searchTerm
                                                    ? 'Intenta con otros términos o limpia los filtros para encontrar lo que buscas.'
                                                    : 'Tu consulta comienza aquí. Agreguemos a tu primer paciente para empezar.'}
                                            </p>
                                        </div>
                                        {!searchTerm && (
                                            <button
                                                onClick={() => { setEditingPatient(null); setIsModalOpen(true); }}
                                                className="btn btn-primary"
                                                style={{ marginTop: '1rem', padding: '1rem 2.5rem' }}
                                            >
                                                <Plus size={18} /> Agregar paciente
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    // Real Data
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
                                                onClick={() => { setEditingPatient(patient); setIsProfileOpen(true); }}
                                            >
                                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: 'var(--solemia-plum)' }}></div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1.2 }}>
                                                    <div className="avatar-initial" style={{ width: '56px', height: '56px', borderRadius: '20px', backgroundColor: '#f8f0f4', color: 'var(--solemia-plum)', border: '2px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', fontSize: '1.2rem' }}>
                                                        {getInitials(patient.name)}
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                                            <span style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--solemia-charcoal)', fontFamily: 'var(--font-inter)' }}>{patient.name}</span>
                                                            {consultationCounts[patient.id] > 0 ? (
                                                                <div className="consult-badge" style={{ animation: 'pulse 2s infinite' }}>
                                                                    {consultationCounts[patient.id]} consultas
                                                                </div>
                                                            ) : (
                                                                <div className="text-detail" style={{ fontSize: '7px', opacity: 0.3 }}>Sin consultas</div>
                                                            )}
                                                        </div>
                                                        <div className="text-detail" style={{ fontSize: '8px', opacity: 0.5 }}>
                                                            Alta: {new Date(patient.created_at).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="hide-mobile" style={{ flex: 1, minWidth: '150px' }}>
                                                    <div className="text-detail" style={{ fontSize: '7px', marginBottom: '4px', opacity: 0.5 }}>Teléfono</div>
                                                    <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--solemia-charcoal)', fontFamily: 'var(--font-inter)', opacity: 0.8 }}>{formatPhoneNumber(patient.phone)}</div>
                                                </div>

                                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginLeft: 'auto' }}>
                                                    {/* AI Status Switch */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem' }}>
                                                        <label className="switch-ia" title={patient.is_active ? "IA Activa para este paciente" : "IA Desactivada"} onClick={(e) => e.stopPropagation()}>
                                                            <input
                                                                type="checkbox"
                                                                checked={patient.is_active}
                                                                onChange={() => togglePatientStatus(patient.id, patient.is_active)}
                                                            />
                                                            <span className="slider-ia"></span>
                                                        </label>
                                                    </div>

                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (patient.expediente_url) {
                                                                    setPreviewData({ url: patient.expediente_url, title: `Expediente: ${patient.name}` });
                                                                    setIsPreviewOpen(true);
                                                                }
                                                            }}
                                                            className="btn"
                                                            title="Expediente Clínico"
                                                            style={{ width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f0f4', color: patient.expediente_url ? 'var(--solemia-plum)' : '#cbd5e1', borderRadius: '12px', border: 'none' }}
                                                            disabled={!patient.expediente_url}
                                                        >
                                                            <FileText size={18} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (patient.plan_url) {
                                                                    setPreviewData({ url: patient.plan_url, title: `Plan Nutricional: ${patient.name}` });
                                                                    setIsPreviewOpen(true);
                                                                }
                                                            }}
                                                            className="btn"
                                                            title="Plan Nutricional"
                                                            style={{ width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f0f4', color: patient.plan_url ? 'var(--solemia-pink)' : '#cbd5e1', borderRadius: '12px', border: 'none' }}
                                                            disabled={!patient.plan_url}
                                                        >
                                                            <ClipboardList size={18} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedPatient(patient);
                                                                setIsLogsOpen(true);
                                                            }}
                                                            className="btn"
                                                            title="Brain Logs"
                                                            style={{ width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f4f5', color: 'var(--solemia-plum)', borderRadius: '12px', border: 'none' }}
                                                        >
                                                            <Brain size={18} />
                                                        </button>
                                                    </div>

                                                    <button
                                                        className="btn btn-outline"
                                                        style={{ padding: '0.6rem 1rem', fontSize: '8px', borderRadius: '10px', height: '40px' }}
                                                        onClick={(e) => { e.stopPropagation(); setEditingPatient(patient); setIsProfileOpen(true); }}
                                                    >
                                                        Ver perfil <ChevronRight size={12} style={{ marginLeft: '4px' }} />
                                                    </button>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setPatientToDelete(patient);
                                                            setIsDeleteModalOpen(true);
                                                        }}
                                                        className="btn"
                                                        style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffafaf', border: 'none', backgroundColor: 'transparent' }}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="animate-premium">
                            {recentLogs.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ marginBottom: '2rem' }}>
                                        <div className="text-detail" style={{ fontSize: '10px', marginBottom: '0.5rem', color: 'var(--solemia-plum)' }}>Actividad reciente</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Pacientes con interacciones vía WhatsApp hoy</div>
                                    </div>

                                    {Array.from(new Set(recentLogs.map(log => log.patient_id))).map(patientId => {
                                        const patient = patients.find(p => p.id === patientId);
                                        if (!patient) return null;

                                        return (
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
                                                onClick={() => { setEditingPatient(patient); setIsProfileOpen(true); }}
                                            >
                                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: 'var(--solemia-plum)' }}></div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1.2 }}>
                                                    <div className="avatar-initial" style={{ width: '56px', height: '56px', borderRadius: '20px', backgroundColor: '#f8f0f4', color: 'var(--solemia-plum)', border: '2px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', fontSize: '1.2rem' }}>
                                                        {getInitials(patient.name)}
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                                            <span style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--solemia-charcoal)', fontFamily: 'var(--font-inter)' }}>{patient.name}</span>
                                                            {consultationCounts[patient.id] > 0 ? (
                                                                <div className="consult-badge" style={{ animation: 'pulse 2s infinite' }}>
                                                                    {consultationCounts[patient.id]} consultas
                                                                </div>
                                                            ) : (
                                                                <div className="text-detail" style={{ fontSize: '7px', opacity: 0.3 }}>Sin consultas</div>
                                                            )}
                                                        </div>
                                                        <div className="text-detail" style={{ fontSize: '8px', opacity: 0.5 }}>
                                                            Alta: {new Date(patient.created_at).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="hide-mobile" style={{ flex: 1, minWidth: '150px' }}>
                                                    <div className="text-detail" style={{ fontSize: '7px', marginBottom: '4px', opacity: 0.5 }}>Teléfono</div>
                                                    <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--solemia-charcoal)', fontFamily: 'var(--font-inter)', opacity: 0.8 }}>{formatPhoneNumber(patient.phone)}</div>
                                                </div>

                                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginLeft: 'auto' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem' }}>
                                                        <label className="switch-ia" title={patient.is_active ? "IA Activa para este paciente" : "IA Desactivada"} onClick={(e) => e.stopPropagation()}>
                                                            <input
                                                                type="checkbox"
                                                                checked={patient.is_active}
                                                                onChange={() => togglePatientStatus(patient.id, patient.is_active)}
                                                            />
                                                            <span className="slider-ia"></span>
                                                        </label>
                                                    </div>

                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (patient.expediente_url) {
                                                                    setPreviewData({ url: patient.expediente_url, title: `Expediente: ${patient.name}` });
                                                                    setIsPreviewOpen(true);
                                                                }
                                                            }}
                                                            className="btn"
                                                            title="Expediente Clínico"
                                                            style={{ width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f0f4', color: patient.expediente_url ? 'var(--solemia-plum)' : '#cbd5e1', borderRadius: '12px', border: 'none' }}
                                                            disabled={!patient.expediente_url}
                                                        >
                                                            <FileText size={18} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (patient.plan_url) {
                                                                    setPreviewData({ url: patient.plan_url, title: `Plan Nutricional: ${patient.name}` });
                                                                    setIsPreviewOpen(true);
                                                                }
                                                            }}
                                                            className="btn"
                                                            title="Plan Nutricional"
                                                            style={{ width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f0f4', color: patient.plan_url ? 'var(--solemia-pink)' : '#cbd5e1', borderRadius: '12px', border: 'none' }}
                                                            disabled={!patient.plan_url}
                                                        >
                                                            <ClipboardList size={18} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedPatient(patient);
                                                                setIsLogsOpen(true);
                                                            }}
                                                            className="btn"
                                                            title="Brain Logs"
                                                            style={{ width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f4f5', color: 'var(--solemia-plum)', borderRadius: '12px', border: 'none' }}
                                                        >
                                                            <Brain size={18} />
                                                        </button>
                                                    </div>

                                                    <button
                                                        className="btn btn-outline"
                                                        style={{ padding: '0.6rem 1rem', fontSize: '8px', borderRadius: '10px', height: '40px' }}
                                                        onClick={(e) => { e.stopPropagation(); setEditingPatient(patient); setIsProfileOpen(true); }}
                                                    >
                                                        Ver perfil <ChevronRight size={12} style={{ marginLeft: '4px' }} />
                                                    </button>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setPatientToDelete(patient);
                                                            setIsDeleteModalOpen(true);
                                                        }}
                                                        className="btn"
                                                        style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffafaf', border: 'none', backgroundColor: 'transparent' }}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'white', borderRadius: '3rem', boxShadow: 'var(--shadow-premium)' }}>
                                    <Bell size={48} style={{ color: '#e2e8f0', marginBottom: '1.5rem' }} />
                                    <h3 style={{ fontSize: '1.2rem', color: 'var(--solemia-plum)', marginBottom: '0.5rem' }}>Sin actividad hoy</h3>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No hay interacciones recientes de la IA para mostrar.</p>
                                </div>
                            )}
                        </div>
                    )}
                </main>

                <footer style={{ marginTop: 'auto', padding: '3rem 0 4rem', borderTop: '1px solid rgba(0,0,0,0.03)' }}>
                    <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
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
                                    title: 'Aviso de Privacidad',
                                    content: (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <p>En <strong>SOLEMIA</strong>, la privacidad de tus datos y los de tus pacientes es nuestra máxima prioridad. Este sistema ha sido diseñado bajo los estándares más estrictos de seguridad digital.</p>
                                            <p><strong>Recopilación de Datos:</strong> Solo almacenamos la información necesaria para el seguimiento nutricional (nombres, medidas, objetivos y registros de progreso). Nunca compartiremos esta información con terceros.</p>
                                            <p><strong>Seguridad:</strong> Toda la información está encriptada y protegida mediante Supabase Auth y protocolos de seguridad de nivel industrial. Tú eres el único dueño de la información de tus pacientes.</p>
                                            <p><strong>Derechos ARCO:</strong> Puedes consultar, rectificar o eliminar cualquier registro directamente desde el panel de control en cualquier momento.</p>
                                        </div>
                                    )
                                })}
                                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                                className="footer-link"
                            >
                                <div className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '1px' }}>Aviso de privacidad</div>
                            </button>
                            <button
                                onClick={() => setLegalConfig({
                                    isOpen: true,
                                    title: 'Términos de Servicio',
                                    content: (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <p>Bienvenido al Ecosistema Digital de <strong>SOLEMIA</strong>. Al utilizar esta plataforma, aceptas nuestros términos de uso profesional.</p>
                                            <p><strong>Propiedad Intelectual:</strong> El software, las plantillas de seguimiento y la algoritmo de IA son propiedad exclusiva de Solemia. El contenido ingresado por el profesional es propiedad del mismo.</p>
                                            <p><strong>Uso Responsable:</strong> Esta herramienta es un apoyo para el profesional de la nutrición. El criterio clínico final siempre corresponde al nutriólogo a cargo.</p>
                                            <p><strong>Disponibilidad:</strong> Nos esforzamos por mantener el sistema en línea el 99.9% del tiempo, garantizando que siempre tengas acceso a tus expedientes clínicos.</p>
                                        </div>
                                    )
                                })}
                                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                                className="footer-link"
                            >
                                <div className="text-detail" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '1px' }}>Términos</div>
                            </button>
                        </div>
                    </div>
                </footer>

            </div>

            {/* Muro de Pago (Paywall) Overlay - Fuera del contenedor animado */}
            {isPaywallOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'white',
                    zIndex: 99999,
                    display: 'flex',
                    alignItems: 'flex-start', // Forzamos que empiece arriba
                    justifyContent: 'center',
                    paddingTop: '8vh', // Centrado visual en el cuadrante superior
                    overflow: 'hidden'
                }}>
                    {/* Logout button for Admins/Switching accounts */}
                    <button
                        onClick={() => supabase.auth.signOut()}
                        style={{
                            position: 'absolute',
                            top: '1.5rem',
                            right: '2rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.6rem 1.1rem',
                            borderRadius: '1rem',
                            border: '1px solid #eee',
                            background: 'white',
                            color: '#64748b',
                            fontWeight: '700',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            zIndex: 100000
                        }}
                    >
                        <LogOut size={14} />
                        Cerrar Sesión
                    </button>

                    <div className="card glass animate-scale-in" style={{
                        maxWidth: '720px',
                        width: '100%',
                        padding: '1.5rem 2rem',
                        textAlign: 'center',
                        boxShadow: '0 30px 60px -12px rgba(0,0,0,0.1)',
                        border: '1px solid #f1f5f9',
                        position: 'relative'
                    }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <h1 style={{ fontSize: '1.5rem', color: 'var(--solemia-plum)', fontWeight: '900', marginBottom: '0.25rem', letterSpacing: '-1px', lineHeight: 1.1 }}>
                                Activa tu Consultorio Élite
                            </h1>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '450px', margin: '0 auto 1rem' }}>
                                Elige el plan que mejor se adapte a tu crecimiento.
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            {/* Tarjeta Mensual */}
                            <div className="stat-card" style={{ padding: '1.25rem', textAlign: 'left', border: '1px solid #eee' }}>
                                <h3 style={{ fontSize: '1rem', marginBottom: '0.1rem' }}>Mensual</h3>
                                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--solemia-plum)', marginBottom: '0.4rem' }}>
                                    $1,349 <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>MXN / mes</span>
                                </div>
                                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem' }}><CheckCircle2 size={11} color="var(--solemia-emerald)" /> 30 pacientes</li>
                                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem' }}><CheckCircle2 size={11} color="var(--solemia-emerald)" /> IA Ilimitada</li>
                                </ul>
                                <button onClick={() => handleMP('monthly')} className="btn btn-primary" style={{ width: '100%', padding: '0.6rem', fontSize: '0.75rem' }}>Elegir Mensual</button>
                            </div>

                            {/* Tarjeta Semestral */}
                            <div className="stat-card" style={{ padding: '1.25rem', textAlign: 'left', border: '2px solid var(--solemia-pink)', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '-8px', right: '12px', backgroundColor: 'var(--solemia-pink)', color: 'white', padding: '2px 7px', borderRadius: '6px', fontSize: '7px', fontWeight: '900' }}>RECOMENDADO</div>
                                <h3 style={{ fontSize: '1rem', marginBottom: '0.1rem' }}>Semestral</h3>
                                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--solemia-plum)', marginBottom: '0.4rem' }}>
                                    $5,000 <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>MXN / 6 meses</span>
                                </div>
                                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem' }}><CheckCircle2 size={11} color="var(--solemia-emerald)" /> <strong>Ahorro de $3,094</strong></li>
                                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem' }}><CheckCircle2 size={11} color="var(--solemia-emerald)" /> SEO Premium</li>
                                </ul>
                                <button onClick={() => handleMP('founder_semiannual')} className="btn btn-primary" style={{ width: '100%', padding: '0.6rem', fontSize: '0.75rem', background: 'var(--solemia-charcoal)' }}>Activar Semestral</button>
                            </div>
                        </div>

                        <div style={{ marginTop: '1rem', opacity: 0.5, fontSize: '0.6rem' }}>
                            © {new Date().getFullYear()} Solemia Nutrición. Pagos vía Mercado Pago.
                        </div>
                    </div>
                </div>
            )
            }

            {isModalOpen && (
                <ClientModal
                    isOpen={isModalOpen}
                    onClose={() => { setIsModalOpen(false); setEditingPatient(null); }}
                    onSuccess={fetchPatients}
                    client={editingPatient}
                />
            )}

            {isProfileOpen && (
                <PatientProfileModal
                    isOpen={isProfileOpen}
                    onClose={() => { setIsProfileOpen(false); setEditingPatient(null); }}
                    patient={editingPatient}
                    onEdit={() => {
                        setIsProfileOpen(false);
                        setIsModalOpen(true);
                    }}
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
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(142,45,79,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
                    <div className="card animate-scale-in" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '2.5rem', borderRadius: '3rem', backgroundColor: 'white', boxShadow: '0 40px 100px rgba(0,0,0,0.2)' }}>
                        <div style={{ backgroundColor: '#fff5f5', color: '#e53e3e', padding: '1rem', borderRadius: '50%', width: 'fit-content', margin: '0 auto 1.5rem' }}>
                            <Trash2 size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--solemia-plum)', fontWeight: '900', fontFamily: 'var(--font-display)' }}>¿Eliminar Paciente?</h3>
                        <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.875rem' }}>
                            Estás por eliminar a <strong>{patientToDelete?.name}</strong>. Esta acción no se puede deshacer.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <button onClick={deletePatient} className="btn" style={{ backgroundColor: '#e53e3e', color: 'white', width: '100%', borderRadius: '1.25rem', padding: '1rem' }}>Sí, eliminar</button>
                            <button onClick={() => { setIsDeleteModalOpen(false); setPatientToDelete(null); }} className="btn btn-outline" style={{ width: '100%', borderRadius: '1.25rem', padding: '1rem' }}>Cancelar</button>
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
                    onResetTour={handleResetTour}
                    onRestartTour={() => {
                        setIsSettingsOpen(false);
                        if (window.solemiaRestartTour) window.solemiaRestartTour();
                    }}
                />
            )}

            {legalConfig.isOpen && (
                <LegalModal
                    isOpen={legalConfig.isOpen}
                    onClose={() => setLegalConfig({ ...legalConfig, isOpen: false })}
                    title={legalConfig.title}
                    content={legalConfig.content}
                />
            )}

        </>
    );
}
