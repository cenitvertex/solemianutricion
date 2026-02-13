import React, { useState, useMemo, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import {
    TrendingUp, TrendingDown, Users, DollarSign, Calendar,
    ChevronDown, Search, Filter, Download, Zap, Heart,
    BarChart3, PieChart as PieChartIcon, Activity, Star,
    TrendingUp as TrendingUpIcon, ShoppingBag, Scissors,
    CheckCircle2, Clock, X, ChevronRight, SlidersHorizontal,
    Smile, Percent, Coins, Info, Sparkles, ArrowLeft, Package
} from 'lucide-react';
import {
    format, startOfMonth, endOfMonth, subDays, isWithinInterval,
    parseISO, startOfDay, endOfDay, subMonths, startOfYear,
    isSameDay, addDays, eachDayOfInterval, isAfter, isBefore,
    startOfQuarter, endOfQuarter, subYears
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_HISTORICAL_DATA, STAFF } from '../mockData';

const COLORS = ['#4D0C30', '#E11D48', '#F43F5E', '#10B981', '#F59E0B', '#6366F1'];
const BINARY_COLORS = ['#4D0C30', '#F43F5E']; // Services (Dark Plum), Products (Pink/Rose)
const CATEGORIES = ['Corte', 'Color', 'Uñas', 'Skin', 'Retail'];

const StatCard = ({ title, value, change, icon: Icon, trend, subLabel, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white/60 backdrop-blur-xl border border-white/40 p-5 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:bg-white/80 transition-all group h-full flex flex-col justify-between"
    >
        <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-solemia-plum/5 rounded-2xl text-solemia-plum group-hover:bg-solemia-plum group-hover:text-white transition-all duration-500">
                <Icon className="w-4 h-4" />
            </div>
            {change && (
                <div className={`flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                    {trend === 'up' ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                    {change}
                </div>
            )}
        </div>
        <div className="text-left">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 opacity-70">{title}</p>
            <h3 className="text-xl xl:text-3xl font-black font-outfit text-solemia-charcoal leading-none mb-1.5">{value}</h3>
            <p className="text-[10px] font-medium text-gray-400 truncate">{subLabel}</p>
        </div>
    </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 backdrop-blur-xl border border-gray-100 p-4 rounded-3xl shadow-2xl z-[100] ring-1 ring-black/5 text-left">
                <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">{label}</p>
                <div className="space-y-1.5">
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></div>
                                <span className="text-[10px] font-bold text-gray-500 uppercase">{entry.name}</span>
                            </div>
                            <span className="text-xs font-black text-solemia-plum">
                                {typeof entry.value === 'number' && entry.value > 100
                                    ? `$${entry.value.toLocaleString()}`
                                    : entry.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

export default function StatisticsView({ onNavigateToSales }) {
    const [rangeType, setRangeType] = useState('month');
    const [customRange, setCustomRange] = useState({
        start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd')
    });
    const [showFilters, setShowFilters] = useState(false);
    const [isComparing, setIsComparing] = useState(false);
    const [comparisonType, setComparisonType] = useState('previous'); // 'previous', 'lastYear'

    const [staffFilter, setStaffFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Drill-down state for Sales Profile
    const [pieView, setPieView] = useState('binary'); // 'binary', 'services', 'products'

    const dateInterval = useMemo(() => {
        const today = new Date();
        let start, end = endOfDay(today);

        switch (rangeType) {
            case 'week': start = subDays(today, 7); break;
            case 'month': start = startOfMonth(today); end = endOfMonth(today); break;
            case 'quarter': start = startOfQuarter(today); end = endOfQuarter(today); break;
            case 'year': start = startOfYear(today); break;
            case 'custom':
                start = startOfDay(parseISO(customRange.start));
                end = endOfDay(parseISO(customRange.end));
                break;
            default: start = startOfMonth(today);
        }
        if (isAfter(start, end)) return { start: end, end: start };
        return { start, end };
    }, [rangeType, customRange]);

    const comparisonInterval = useMemo(() => {
        if (!isComparing) return null;

        if (comparisonType === 'lastYear') {
            return {
                start: subYears(dateInterval.start, 1),
                end: subYears(dateInterval.end, 1)
            };
        } else {
            const diff = dateInterval.end.getTime() - dateInterval.start.getTime();
            return {
                start: new Date(dateInterval.start.getTime() - diff - 86400000),
                end: new Date(dateInterval.start.getTime() - 86400000)
            };
        }
    }, [isComparing, dateInterval, comparisonType]);

    const handleRangeClick = (type) => {
        if (type === 'custom') {
            if (rangeType === 'custom') {
                setShowFilters(!showFilters);
            } else {
                setRangeType('custom');
                setShowFilters(true);
            }
        } else {
            setRangeType(type);
        }
    };

    const filteredData = useMemo(() => {
        return MOCK_HISTORICAL_DATA.filter(item => {
            const date = parseISO(item.date);
            const inRange = isWithinInterval(date, dateInterval);
            const staffMatch = staffFilter === 'all' || item.staffName === staffFilter;
            const catMatch = categoryFilter === 'all' || item.category === categoryFilter;
            return inRange && staffMatch && catMatch;
        });
    }, [dateInterval, staffFilter, categoryFilter]);

    const comparisonData = useMemo(() => {
        if (!isComparing || !comparisonInterval) return [];
        return MOCK_HISTORICAL_DATA.filter(item => {
            const date = parseISO(item.date);
            const inRange = isWithinInterval(date, comparisonInterval);
            const staffMatch = staffFilter === 'all' || item.staffName === staffFilter;
            const catMatch = categoryFilter === 'all' || item.category === categoryFilter;
            return inRange && staffMatch && catMatch;
        });
    }, [isComparing, comparisonInterval, staffFilter, categoryFilter]);

    const kpis = useMemo(() => {
        const calc = (data) => {
            const revenue = data.reduce((acc, curr) => acc + curr.amount, 0);
            const apps = data.length;
            const ticket = apps > 0 ? revenue / apps : 0;
            const npsTotal = data.reduce((acc, curr) => acc + parseFloat(curr.nps || 0), 0);
            const avgNps = apps > 0 ? (npsTotal / apps).toFixed(1) : '—';
            const newCl = data.filter(i => i.isNewClient).length;
            const retention = apps > 0 ? (((apps - newCl) / apps) * 100).toFixed(0) : '0';
            return { revenue, apps, ticket, avgNps, retention };
        };

        const current = calc(filteredData);
        const prev = isComparing ? calc(comparisonData) : null;

        const getTrend = (curr, old) => {
            if (!old || old === 0) return { val: null, status: 'up' };
            const c = parseFloat(curr);
            const o = parseFloat(old);
            const pct = (((c - o) / o) * 100).toFixed(1);
            return { val: `${pct > 0 ? '+' : ''}${pct}%`, status: pct >= 0 ? 'up' : 'down' };
        };

        return {
            revenue: { val: `$${current.revenue.toLocaleString()}`, trend: getTrend(current.revenue, prev?.revenue) },
            avgTicket: { val: `$${current.ticket.toFixed(0)}`, trend: getTrend(current.ticket, prev?.ticket) },
            nps: { val: current.avgNps, trend: prev ? getTrend(current.avgNps, prev?.avgNps) : null },
            retention: { val: `${current.retention}%`, trend: getTrend(current.retention, prev?.retention) },
            appointments: { val: current.apps, trend: getTrend(current.apps, prev?.apps) }
        };
    }, [filteredData, comparisonData, isComparing]);

    const staffPerformance = useMemo(() => {
        const map = {};
        filteredData.forEach(item => {
            if (!map[item.staffName]) map[item.staffName] = { revenue: 0, npsTotal: 0, count: 0, commTotal: 0 };
            map[item.staffName].revenue += item.amount;
            map[item.staffName].commTotal += parseFloat(item.commission || 0);
            map[item.staffName].npsTotal += parseFloat(item.nps || 0);
            map[item.staffName].count += 1;
        });
        return Object.keys(map).map(name => ({
            name,
            value: map[name].revenue,
            comm: map[name].commTotal,
            avgNps: (map[name].npsTotal / map[name].count).toFixed(1)
        })).sort((a, b) => b.value - a.value);
    }, [filteredData]);

    const revenueChartData = useMemo(() => {
        try {
            const days = eachDayOfInterval(dateInterval);
            return days.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const currentDayVal = filteredData.filter(i => i.date === dateStr).reduce((a, b) => a + b.amount, 0);
                let res = { date: format(day, 'dd MMM'), actual: currentDayVal };
                if (isComparing && comparisonInterval) {
                    const diff = dateInterval.start.getTime() - comparisonInterval.start.getTime();
                    const prevDay = new Date(day.getTime() - diff);
                    const prevDateStr = format(prevDay, 'yyyy-MM-dd');
                    const prevDayVal = comparisonData.filter(i => i.date === prevDateStr).reduce((a, b) => a + b.amount, 0);
                    res.anterior = prevDayVal;
                }
                return res;
            });
        } catch (e) { return []; }
    }, [filteredData, comparisonData, dateInterval, comparisonInterval, isComparing]);

    // Binary Distribution (Servicios vs Productos)
    const binaryDistribution = useMemo(() => {
        const services = filteredData.filter(i => i.category !== 'Retail');
        const products = filteredData.filter(i => i.category === 'Retail');
        return [
            { name: 'Servicios', value: services.reduce((a, b) => a + b.amount, 0), count: services.length, type: 'services' },
            { name: 'Productos', value: products.reduce((a, b) => a + b.amount, 0), count: products.length, type: 'products' }
        ];
    }, [filteredData]);

    // Specific Sub-category Detail or Product Detail
    const drillDownData = useMemo(() => {
        if (pieView === 'binary') return [];

        const relevantItems = filteredData.filter(item =>
            pieView === 'products' ? item.category === 'Retail' : item.category !== 'Retail'
        );

        const map = {};
        relevantItems.forEach(item => {
            const key = item.serviceName;
            if (!map[key]) map[key] = { name: key, value: 0, count: 0, category: item.category };
            map[key].value += item.amount;
            map[key].count += 1;
        });

        return Object.values(map).sort((a, b) => b.value - a.value);
    }, [filteredData, pieView]);

    const handleDeepDive = (item) => {
        if (onNavigateToSales) {
            onNavigateToSales({
                searchTerm: item.name,
                startDate: format(dateInterval.start, 'yyyy-MM-dd'),
                endDate: format(dateInterval.end, 'yyyy-MM-dd')
            });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700 pb-20 max-w-full overflow-hidden px-4 md:px-0">
            {/* Header & Controls */}
            <header className="space-y-6 text-left">
                <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 px-2">
                    <div className="text-left">
                        <h2 className="text-4xl font-black font-outfit text-solemia-plum leading-tight tracking-tight">Estrategia & Datos</h2>
                        <div className="flex flex-col gap-1 mt-1.5">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-solemia-plum/5 rounded-lg border border-solemia-plum/10 shadow-sm">
                                    <Calendar className="w-3 h-3 text-solemia-plum" />
                                </div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                                    {format(dateInterval.start, 'dd MMM')} — {format(dateInterval.end, 'dd MMM, yyyy')}
                                </p>
                            </div>
                            <AnimatePresence>
                                {isComparing && comparisonInterval && (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 ml-1">
                                        <div className="w-1 h-3 bg-solemia-pink/30 rounded-full"></div>
                                        <p className="text-[9px] font-bold text-solemia-plum/60 uppercase tracking-wider italic">
                                            Vs {format(comparisonInterval.start, 'dd MMM')} - {format(comparisonInterval.end, 'dd MMM')} ({comparisonType === 'previous' ? 'Periodo Inmediato' : 'Año Pasado'})
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-5 py-3 rounded-[1.25rem] flex items-center gap-2.5 transition-all duration-300 border shadow-sm ${showFilters || staffFilter !== 'all' || categoryFilter !== 'all' || isComparing ? 'bg-solemia-plum text-white border-solemia-plum shadow-xl' : 'bg-white text-gray-500 border-gray-100 hover:border-solemia-plum/20 hover:shadow-md'}`}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            <span className="text-[10px] font-black font-outfit uppercase tracking-[0.2em] leading-none">Avanzado</span>
                            {(staffFilter !== 'all' || categoryFilter !== 'all' || isComparing) && (
                                <div className="w-2 h-2 bg-solemia-pink rounded-full ring-2 ring-white ml-1"></div>
                            )}
                        </button>

                        <div className="flex bg-white/70 backdrop-blur-xl p-1.5 rounded-[1.5rem] border border-white/50 shadow-inner">
                            {[
                                { id: 'week', label: '7D' },
                                { id: 'month', label: 'Mes' },
                                { id: 'quarter', label: 'Tri' },
                                { id: 'year', label: 'Año' },
                                { id: 'custom', label: 'Rango' }
                            ].map(btn => (
                                <button
                                    key={btn.id}
                                    onClick={() => handleRangeClick(btn.id)}
                                    className={`px-5 py-2.5 rounded-[1rem] text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${rangeType === btn.id ? 'bg-solemia-plum text-white shadow-lg' : 'text-gray-400 hover:text-solemia-plum hover:bg-white/50'}`}
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-2 overflow-hidden">
                            <div className="p-8 bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[3rem] shadow-sm grid grid-cols-1 md:grid-cols-12 gap-10">
                                {/* Staff Filter */}
                                <div className="md:col-span-3 space-y-4 text-left">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users className="w-3.5 h-3.5 text-solemia-plum/40" />
                                        <label className="text-[10px] font-black uppercase tracking-[0.25em] text-solemia-plum/40">Equipo</label>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {['all', ...STAFF].map(s => (
                                            <button key={s} onClick={() => setStaffFilter(s)} className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${staffFilter === s ? 'bg-solemia-plum text-white shadow-md' : 'bg-white/50 text-gray-500 hover:bg-white'}`}>
                                                {s === 'all' ? 'Todas' : s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Category Filter */}
                                <div className="md:col-span-3 space-y-4 text-left">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Scissors className="w-3.5 h-3.5 text-solemia-plum/40" />
                                        <label className="text-[10px] font-black uppercase tracking-[0.25em] text-solemia-plum/40">Categorías</label>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {['all', ...CATEGORIES].map(c => (
                                            <button key={c} onClick={() => setCategoryFilter(c)} className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${categoryFilter === c ? 'bg-solemia-pink text-white shadow-md' : 'bg-white/50 text-gray-400 hover:bg-white'}`}>
                                                {c === 'all' ? 'Todos' : c}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Comparison Selector */}
                                <div className="md:col-span-3 space-y-4 text-left border-l border-white/20 pl-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-3.5 h-3.5 text-solemia-plum/40" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-solemia-plum/40">Comparativa</span>
                                        </div>
                                        <button onClick={() => setIsComparing(!isComparing)} className={`w-12 h-6 rounded-full relative transition-all duration-500 ${isComparing ? 'bg-solemia-emerald shadow-inner' : 'bg-gray-200 shadow-inner'}`}>
                                            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${isComparing ? 'left-6.5' : 'left-0.5'}`}></div>
                                        </button>
                                    </div>

                                    {isComparing && (
                                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
                                            <div className="flex bg-white/50 p-1.5 rounded-2xl border border-gray-100 shadow-inner">
                                                <button onClick={() => setComparisonType('previous')} className={`flex-1 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${comparisonType === 'previous' ? 'bg-white shadow-sm text-solemia-plum' : 'text-gray-400'}`}>Periodo Inmediato</button>
                                                <button onClick={() => setComparisonType('lastYear')} className={`flex-1 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${comparisonType === 'lastYear' ? 'bg-white shadow-sm text-solemia-plum' : 'text-gray-400'}`}>Mes/Año Ant.</button>
                                            </div>
                                            <div className="p-4 bg-solemia-plum/5 rounded-2xl border border-solemia-plum/10">
                                                <div className="flex items-start gap-2.5 text-[9px] font-bold text-solemia-plum/80 leading-relaxed">
                                                    <div className="mt-1 p-0.5 bg-solemia-pink/10 rounded-md">
                                                        <Info className="w-3 h-3 text-solemia-pink" />
                                                    </div>
                                                    <span>{comparisonType === 'previous'
                                                        ? "Compara contra el bloque inmediato anterior. Ideal para medir crecimiento constante día a día."
                                                        : "Compara estas fechas contra las mismas del año anterior. Ideal para medir estacionalidad."}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Custom Range Picker */}
                                <div className="md:col-span-3 space-y-4 text-left border-l border-white/20 pl-8">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="w-3.5 h-3.5 text-solemia-plum/40" />
                                        <label className="text-[10px] font-black uppercase tracking-[0.25em] text-solemia-plum/40">Personalizar</label>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <div className="group">
                                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter ml-1 group-focus-within:text-solemia-pink transition-colors">Inicio</span>
                                            <input
                                                type="date"
                                                value={customRange.start}
                                                onChange={e => { setCustomRange({ ...customRange, start: e.target.value }); }}
                                                className="w-full bg-white/80 px-4 py-3 rounded-2xl text-[10px] font-bold border border-gray-100 outline-none focus:border-solemia-pink/30 hover:border-gray-300 transition-all shadow-sm"
                                            />
                                        </div>
                                        <div className="group">
                                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter ml-1 group-focus-within:text-solemia-pink transition-colors">Fin</span>
                                            <input
                                                type="date"
                                                value={customRange.end}
                                                onChange={e => { setCustomRange({ ...customRange, end: e.target.value }); }}
                                                className="w-full bg-white/80 px-4 py-3 rounded-2xl text-[10px] font-bold border border-gray-100 outline-none focus:border-solemia-pink/30 hover:border-gray-300 transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* KPI GRID */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 px-2 text-left">
                <StatCard title="Ventas Totales" value={kpis.revenue.val} change={kpis.revenue.trend.val} trend={kpis.revenue.trend.status} icon={DollarSign} subLabel="Recaudación bruta" />
                <StatCard title="Felicidad NPS" value={kpis.nps.val} change={kpis.nps.trend?.val} trend={kpis.nps.trend?.status} icon={Heart} subLabel="Calificación media" delay={0.1} />
                <StatCard title="Retención" value={kpis.retention.val} change={kpis.retention.trend.val} trend={kpis.retention.trend.status} icon={Percent} subLabel="Fidelidad clientas" delay={0.2} />
                <StatCard title="Ticket Medio" value={kpis.avgTicket.val} change={kpis.avgTicket.trend.val} trend={kpis.avgTicket.trend.status} icon={TrendingUpIcon} subLabel="Gasto por visita" delay={0.3} />
                <StatCard title="Agenda" value={kpis.appointments.val} change={kpis.appointments.trend.val} trend={kpis.appointments.trend.status} icon={CheckCircle2} subLabel="Citas realizadas" delay={0.4} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-2">
                {/* Trend Area Chart */}
                <div className="lg:col-span-8 bg-white/60 backdrop-blur-2xl border border-white/40 p-8 rounded-[3rem] shadow-sm flex flex-col h-[400px] hover:shadow-lg transition-all group">
                    <div className="flex items-center justify-between mb-8 px-2 text-left">
                        <div className="text-left">
                            <h3 className="font-bold font-outfit text-xl text-solemia-charcoal leading-none">Flujo Dinámico</h3>
                            <p className="text-[9px] font-bold text-gray-400 uppercase mt-1.5 tracking-widest leading-none">Evolución de ingresos acumulados</p>
                        </div>
                        {isComparing && (
                            <div className="flex gap-4">
                                <span className="flex items-center gap-2 text-[8px] font-black text-solemia-pink uppercase tracking-[0.2em]">
                                    <div className="w-4 h-1 bg-solemia-pink rounded-full"></div> Actual
                                </span>
                                <span className="flex items-center gap-2 text-[8px] font-black text-gray-300 uppercase tracking-[0.2em]">
                                    <div className="w-4 h-1 bg-gray-300 rounded-full opacity-50"></div> Sombra
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 w-full overflow-hidden">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#E11D48" stopOpacity={0.1} /><stop offset="95%" stopColor="#E11D48" stopOpacity={0} /></linearGradient>
                                    <linearGradient id="colorAnterior" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#94a3b8" stopOpacity={0.03} /><stop offset="95%" stopColor="#94a3b8" stopOpacity={0} /></linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#cbd5e1' }} interval="preserveStartEnd" dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#cbd5e1' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="actual" name="Venta Actual" stroke="#E11D48" strokeWidth={4} fillOpacity={1} fill="url(#colorActual)" animationDuration={1500} strokeLinecap="round" />
                                {isComparing && <Area type="monotone" dataKey="anterior" name="Venta Anterior" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="8 6" fillOpacity={1} fill="url(#colorAnterior)" animationDuration={1500} />}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Business Mix Pie - DRILL DOWN IMPLEMENTATION */}
                <div className="lg:col-span-4 bg-white/60 backdrop-blur-2xl border border-white/40 p-8 rounded-[3rem] shadow-sm flex flex-col h-[400px] hover:shadow-lg transition-all relative overflow-hidden text-left overflow-y-auto no-scrollbar">
                    <div className="flex items-center justify-between mb-6 px-2 text-left shrink-0">
                        <div className="text-left">
                            <h3 className="font-bold font-outfit text-xl text-solemia-charcoal leading-none">Perfil de Ventas</h3>
                            <p className="text-[9px] font-bold text-gray-400 uppercase mt-1.5 tracking-widest leading-none">
                                {pieView === 'binary' ? 'Sectores dominantes' : `Detalle: ${pieView === 'services' ? 'Servicios' : 'Productos'}`}
                            </p>
                        </div>
                        {pieView !== 'binary' ? (
                            <button
                                onClick={() => setPieView('binary')}
                                className="p-3 bg-solemia-plum text-white rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-lg"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                        ) : (
                            <div className="p-3 bg-solemia-plum/5 rounded-2xl text-solemia-plum">
                                <PieChartIcon className="w-5 h-5" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 w-full min-h-0">
                        <AnimatePresence mode="wait">
                            {pieView === 'binary' ? (
                                <motion.div
                                    key="pie"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="w-full h-full"
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={binaryDistribution}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={65}
                                                outerRadius={95}
                                                paddingAngle={10}
                                                dataKey="value"
                                                animationDuration={1200}
                                                stroke="none"
                                                onClick={(data) => setPieView(data.type)}
                                                className="cursor-pointer"
                                            >
                                                {binaryDistribution.map((entry, index) => <Cell key={`cell-bin-${index}`} fill={BINARY_COLORS[index % BINARY_COLORS.length]} className="hover:opacity-80 transition-opacity" />)}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend verticalAlign="bottom" height={40} content={({ payload }) => (
                                                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4">
                                                    {payload.map((entry, index) => (
                                                        <div key={index} className="flex items-center gap-2">
                                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{entry.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="list"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-3 pt-2"
                                >
                                    {drillDownData.map((item, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleDeepDive(item)}
                                            className="w-full group bg-white/40 hover:bg-white hover:shadow-md border border-gray-100/50 p-4 rounded-3xl transition-all flex items-center justify-between text-left"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-solemia-plum transition-all ${pieView === 'services' ? 'bg-solemia-plum/5 group-hover:bg-solemia-plum group-hover:text-white' : 'bg-solemia-pink/5 group-hover:bg-solemia-pink group-hover:text-white'}`}>
                                                    {item.category === 'Retail' ? <Package className="w-4 h-4" /> : <Scissors className="w-4 h-4" />}
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-bold text-solemia-charcoal text-sm leading-tight group-hover:text-solemia-plum transition-colors">{item.name}</p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.1em] mt-0.5">{item.count} ventas realizadas</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-base font-black font-outfit text-solemia-plum leading-none group-hover:scale-110 transition-transform">${item.value.toLocaleString()}</p>
                                                <ChevronRight className="w-3.5 h-3.5 text-gray-200 mt-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* STAFF PRODUCTIVITY - WITH CINTILLO INTELIGENTE */}
            <div className="px-2">
                <div className="bg-white/60 backdrop-blur-2xl border border-white/40 p-10 rounded-[4rem] shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6 px-4 text-left">
                        <div className="text-left">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-bold font-outfit text-2xl text-solemia-charcoal leading-none">Eficiencia del Equipo</h3>
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] leading-none text-left">Análisis de competitividad y retorno</p>
                        </div>
                        <button className="flex items-center gap-2.5 px-6 py-3.5 bg-solemia-plum text-white rounded-[1.25rem] font-black font-outfit uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-all">
                            <Download className="w-4 h-4" /> Exportar Desempeño
                        </button>
                    </div>

                    {/* CINTILLO INTELIGENTE (OPTION A) - PLACED AS EXECUTIVE SUBHEADER */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mx-4 mb-10 p-5 bg-gradient-to-r from-solemia-plum/10 via-solemia-plum/5 to-transparent rounded-[2rem] border-l-4 border-l-solemia-pink flex items-center gap-5 group shadow-sm border border-white/20"
                    >
                        <div className="p-2.5 bg-white rounded-xl shadow-md text-solemia-pink group-hover:rotate-12 transition-transform duration-500">
                            <Sparkles className="w-5 h-5 fill-solemia-pink/10" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black text-solemia-plum/40 uppercase tracking-widest mb-1 leading-none">Visión de Negocio Solemia IA</p>
                            <p className="text-xs font-bold text-solemia-charcoal/80 leading-snug">
                                <span className="text-solemia-plum">{staffPerformance[0]?.name}</span> mantiene el ticket más alto. Recomendamos incentivar ventas en retail para <span className="text-solemia-pink font-black underline decoration-solemia-pink/30 underline-offset-4">Carlos E.</span> para subir el retorno de equipo.
                            </p>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                        <div className="xl:col-span-8 h-[400px] bg-white/20 rounded-[3rem] p-8 border border-white/30 shadow-inner">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={staffPerformance} layout="vertical" margin={{ top: 10, right: 40, left: 30, bottom: 5 }} barGap={8}>
                                    <defs>
                                        {COLORS.map((color, i) => (
                                            <linearGradient key={`grad-${i}`} id={`staffBar-${i}`} x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                                                <stop offset="100%" stopColor={color} />
                                            </linearGradient>
                                        ))}
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fontWeight: 900, fill: '#4D0C30', letterSpacing: '0.05em' }}
                                    />
                                    <Tooltip cursor={{ fill: 'rgba(77, 12, 48, 0.02)' }} content={<CustomTooltip />} />
                                    <Bar dataKey="value" name="Ventas" radius={[0, 20, 20, 0]} barSize={28} animationDuration={1800}>
                                        {staffPerformance.map((entry, index) => <Cell key={`staff-v-${index}`} fill={`url(#staffBar-${index % COLORS.length})`} />)}
                                    </Bar>
                                    <Bar dataKey="comm" name="Comisión" radius={[0, 12, 12, 0]} barSize={12} animationDuration={2000} opacity={0.25}>
                                        {staffPerformance.map((entry, index) => <Cell key={`staff-c-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="flex items-center gap-6 mt-6 px-10 text-left">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-2 bg-solemia-plum/20 rounded-full"></div>
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Comisiones Generadas</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-2 bg-solemia-plum rounded-full"></div>
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Venta Bruta</span>
                                </div>
                            </div>
                        </div>

                        <div className="xl:col-span-4 h-full">
                            {/* Refined Top Performer Card */}
                            <div className="p-10 bg-gradient-to-br from-solemia-plum via-[#2D061C] to-black text-white rounded-[3rem] shadow-2xl relative overflow-hidden text-left group border border-white/5 h-full flex flex-col justify-between">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-solemia-pink/10 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-solemia-pink/20 transition-all duration-1000"></div>
                                <div className="relative z-10 h-full flex flex-col">
                                    <div className="flex items-center justify-between mb-8 text-left">
                                        <div className="p-4 bg-white/10 rounded-3xl border border-white/10 shadow-xl group-hover:scale-110 transition-transform">
                                            <Star className="w-8 h-8 text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]" />
                                        </div>
                                        <div className="px-4 py-2 bg-white/10 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] shadow-inner">Nº 1 Staff</div>
                                    </div>

                                    <div className="mb-auto text-left">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 mb-2 leading-none">Estrella del Periodo</h4>
                                        <p className="text-4xl font-black font-outfit tracking-tighter group-hover:text-solemia-pink transition-colors duration-500">{staffPerformance[0]?.name || '—'}</p>
                                    </div>

                                    <div className="space-y-5 pt-8 mt-8 border-t border-white/10 text-left">
                                        <div className="flex items-center justify-between font-outfit text-left">
                                            <div className="flex flex-col text-left">
                                                <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1">Ventas Brutas</span>
                                                <span className="text-2xl font-black text-white tracking-tight">${staffPerformance[0]?.value.toLocaleString() || '0'}</span>
                                            </div>
                                            <div className="flex flex-col text-right">
                                                <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1 text-solemia-emerald font-black">Comisión Estimada</span>
                                                <span className="text-2xl font-black text-solemia-emerald tracking-tight font-outfit">${staffPerformance[0]?.comm.toLocaleString() || '0'}</span>
                                            </div>
                                        </div>
                                        <div className="bg-white/5 backdrop-blur-md p-5 rounded-[2rem] border border-white/5 flex items-center justify-between shadow-inner group-hover:bg-white/10 transition-all">
                                            <div className="text-left flex items-center gap-3">
                                                <div className="p-2 bg-solemia-rose/20 rounded-xl">
                                                    <Heart className="w-4 h-4 text-solemia-rose fill-solemia-rose" />
                                                </div>
                                                <span className="text-[10px] font-black opacity-60 uppercase tracking-widest leading-none">Satisfacción</span>
                                            </div>
                                            <span className="text-2xl font-black font-outfit leading-none">{staffPerformance[0]?.avgNps || '0'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
