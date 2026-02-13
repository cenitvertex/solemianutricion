import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    Search, Users, Star, TrendingUp, Calendar,
    ArrowRight, ChevronRight, XCircle, UserCircle,
    MessageSquare, Heart, Clock, Receipt, Scissors,
    Sparkles, Flower, Package, Timer, Filter,
    Download, SortAsc, SortDesc, ArrowUpDown,
    Check, ChevronDown, Layers, Info, Plus,
    Target, Trash2, AlertCircle, Settings2,
    BarChart3, Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isAfter, isBefore, subMonths, differenceInDays } from 'date-fns';
import { MOCK_HISTORICAL_DATA, STAFF } from '../mockData';

// --- SHARED UI COMPONENTS ---

const StatCard = ({ title, value, icon: Icon, colorClass = "text-solemia-plum", bgClass = "bg-solemia-plum/5", subLabel, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white/60 backdrop-blur-xl border border-white/40 p-5 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:bg-white/80 transition-all group flex flex-col justify-between h-full text-left"
    >
        <div className="flex justify-between items-start mb-4">
            <div className={`p-2.5 ${bgClass} ${colorClass} rounded-2xl group-hover:bg-solemia-plum group-hover:text-white transition-all duration-500`}>
                <Icon className="w-4 h-4" />
            </div>
        </div>
        <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 opacity-70">{title}</p>
            <h3 className="text-xl xl:text-3xl font-black font-outfit text-solemia-charcoal leading-none mb-1.5">{value}</h3>
            {subLabel && <p className="text-[10px] font-medium text-gray-400 opacity-60 truncate">{subLabel}</p>}
        </div>
    </motion.div>
);

const CreateSegmentModal = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [color, setColor] = useState('bg-solemia-plum');
    const [rules, setRules] = useState([
        { metric: 'totalSpent', label: 'Inversión Total ($)', operator: '>', val1: 0, val2: 0, active: true },
        { metric: 'visitCount', label: 'Frecuencia (Visitas)', operator: '>', val1: 0, val1_placeholder: 'Cant.', active: false },
        { metric: 'avgNps', label: 'Satisfacción (NPS)', operator: '>', val1: 0, active: false },
        { metric: 'daysSinceLastVisit', label: 'Inactividad (Días)', operator: '<', val1: 365, active: false }
    ]);

    if (!isOpen) return null;

    const colors = [
        { id: 'bg-solemia-plum', label: 'Plum' },
        { id: 'bg-solemia-pink', label: 'Pink' },
        { id: 'bg-solemia-rose', label: 'Rose' },
        { id: 'bg-solemia-emerald', label: 'Emerald' },
        { id: 'bg-amber-400', label: 'Gold' },
        { id: 'bg-blue-400', label: 'Ocean' }
    ];

    const operators = [
        { id: '>', label: 'Más de (+)' },
        { id: '<', label: 'Menos de (-)' },
        { id: '=', label: 'Igual (=)' },
        { id: 'range', label: 'Rango' }
    ];

    const toggleRule = (index) => {
        const newRules = [...rules];
        newRules[index].active = !newRules[index].active;
        setRules(newRules);
    };

    const updateRule = (index, field, value) => {
        const newRules = [...rules];
        newRules[index][field] = value;
        setRules(newRules);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-solemia-charcoal/20 backdrop-blur-md animate-in fade-in duration-300 text-left">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white/90 backdrop-blur-xl border border-white/40 w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-solemia-plum to-solemia-pink"></div>

                <div className="flex justify-between items-start mb-10">
                    <div className="text-left">
                        <h3 className="text-3xl font-black font-outfit text-solemia-plum leading-tight">Constructor de Etiquetas</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Personaliza las reglas de etiquetado inteligente</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-300 transition-all">
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-8 max-h-[60vh] overflow-y-auto no-scrollbar pr-2">
                    {/* General Name */}
                    <div className="text-left">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-3 px-2">Identificador de la Etiqueta</label>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="Escribe el nombre de la etiqueta..."
                                className="flex-1 px-8 py-5 bg-gray-50 rounded-[1.5rem] border border-gray-100 focus:border-solemia-pink/30 focus:bg-white outline-none font-bold text-sm transition-all"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                            <div className="flex gap-2 p-2 bg-gray-50 rounded-[1.5rem] border border-gray-100">
                                {colors.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => setColor(c.id)}
                                        className={`w-10 h-10 rounded-xl ${c.id} flex items-center justify-center transition-all ${color === c.id ? 'ring-4 ring-white shadow-lg scale-110' : 'opacity-40 hover:opacity-100'}`}
                                    >
                                        {color === c.id && <Check className="w-5 h-5 text-white" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Advanced Rules */}
                    <div className="space-y-4 text-left">
                        <p className="text-[10px] font-black text-solemia-plum uppercase tracking-[0.2em] mb-4 px-2">Reglas de Comportamiento</p>
                        {rules.map((rule, idx) => (
                            <div
                                key={rule.metric}
                                className={`p-6 rounded-[2rem] border transition-all ${rule.active ? 'bg-white border-solemia-plum/10 shadow-md ring-1 ring-solemia-plum/5' : 'bg-gray-50/50 border-gray-100 opacity-60'}`}
                            >
                                <div className="flex flex-col md:flex-row md:items-center gap-6">
                                    <div className="flex items-center gap-4 min-w-[200px]">
                                        <button
                                            onClick={() => toggleRule(idx)}
                                            className={`w-12 h-6 rounded-full relative transition-colors ${rule.active ? 'bg-solemia-emerald' : 'bg-gray-200'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${rule.active ? 'left-7' : 'left-1'}`}></div>
                                        </button>
                                        <span className={`text-xs font-black uppercase tracking-widest ${rule.active ? 'text-solemia-charcoal' : 'text-gray-400'}`}>
                                            {rule.label}
                                        </span>
                                    </div>

                                    {rule.active && (
                                        <div className="flex-1 flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                                            <select
                                                className="bg-gray-100 px-4 py-3 rounded-xl text-[10px] font-black uppercase outline-none border-none cursor-pointer"
                                                value={rule.operator}
                                                onChange={e => updateRule(idx, 'operator', e.target.value)}
                                            >
                                                {operators.map(op => (
                                                    <option key={op.id} value={op.id}>{op.label}</option>
                                                ))}
                                            </select>

                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    placeholder={rule.metric === 'totalSpent' ? '$' : 'Cant.'}
                                                    className="w-24 px-4 py-3 bg-white border border-gray-100 rounded-xl outline-none font-bold text-sm text-center"
                                                    value={rule.val1}
                                                    onChange={e => updateRule(idx, 'val1', e.target.value)}
                                                />
                                                {rule.operator === 'range' && (
                                                    <>
                                                        <span className="text-[10px] font-black text-gray-300">y</span>
                                                        <input
                                                            type="number"
                                                            placeholder="Máx."
                                                            className="w-24 px-4 py-3 bg-white border border-gray-100 rounded-xl outline-none font-bold text-sm text-center"
                                                            value={rule.val2}
                                                            onChange={e => updateRule(idx, 'val2', e.target.value)}
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4 mt-12">
                    <button
                        onClick={onClose}
                        className="flex-1 py-5 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onSave({ name, color, rules })}
                        disabled={!name || !rules.some(r => r.active)}
                        className="flex-1 py-5 bg-solemia-plum text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                    >
                        Generar Etiqueta <Plus className="w-4 h-4 inline ml-2" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const DeleteConfirmationModal = ({ isOpen, labelName, onClose, onConfirm }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-solemia-charcoal/10 backdrop-blur-sm animate-in fade-in duration-300">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white/90 backdrop-blur-xl border border-white/40 p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center"
            >
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h4 className="text-xl font-black font-outfit text-solemia-charcoal mb-2">¿Eliminar etiqueta?</h4>
                <p className="text-xs font-medium text-gray-400 leading-relaxed mb-8">
                    Estás a punto de borrar <span className="text-solemia-plum font-bold">"{labelName}"</span>. Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={() => { onConfirm(); onClose(); }}
                        className="flex-1 py-3.5 bg-gray-50 text-red-400 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-50 hover:text-red-600 transition-all font-outfit"
                    >
                        Sí, Borrar
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-3.5 bg-solemia-charcoal text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-solemia-charcoal/20 hover:scale-[1.02] active:scale-95 transition-all font-outfit"
                    >
                        Cancelar
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const ClientDetailModal = ({ isOpen, client, onClose }) => {
    if (!isOpen || !client) return null;

    const getServiceIcon = (category) => {
        switch (category) {
            case 'Corte': return <Scissors className="w-4 h-4 text-solemia-plum" />;
            case 'Color': return <Sparkles className="w-4 h-4 text-solemia-pink" />;
            case 'Uñas': return <Flower className="w-4 h-4 text-solemia-rose" />;
            case 'Skin': return <Heart className="w-4 h-4 text-solemia-emerald" />;
            case 'Retail': return <Package className="w-4 h-4 text-amber-500" />;
            default: return <Timer className="w-4 h-4 text-gray-400" />;
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-solemia-charcoal/20 backdrop-blur-md animate-in fade-in duration-300 text-left">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white/90 backdrop-blur-xl border border-white/40 w-full max-w-5xl rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
            >
                <button onClick={onClose} className="absolute top-8 right-8 p-3 hover:bg-gray-100 rounded-full text-gray-300 transition-all z-20">
                    <XCircle className="w-8 h-8" />
                </button>

                <div className="flex flex-col md:flex-row h-full">
                    {/* Left: Client Profile Summary */}
                    <div className="w-full md:w-1/3 bg-gray-50/50 p-10 border-r border-gray-100 overflow-y-auto no-scrollbar">
                        <div className="flex flex-col items-center text-center space-y-6 mb-10">
                            <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-solemia-plum to-solemia-pink p-1 shadow-2xl">
                                <div className="w-full h-full rounded-[1.3rem] bg-white flex items-center justify-center text-solemia-plum font-black font-outfit text-4xl shadow-inner uppercase">
                                    {client.name[0]}
                                </div>
                            </div>
                            <div className="text-center">
                                <h3 className="text-3xl font-black font-outfit text-solemia-charcoal leading-tight">{client.name}</h3>
                                {client.segment && (
                                    <span className={`inline-block mt-3 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${client.segment === 'VIP' ? 'bg-amber-100 text-amber-600' :
                                        client.segment === 'Fuga' ? 'bg-red-100 text-red-600' :
                                            client.segment === 'Nueva' ? 'bg-blue-100 text-blue-600' :
                                                'bg-solemia-plum/10 text-solemia-plum'
                                        }`}>
                                        Estatus: {client.segment}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm text-left">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Última Visita</p>
                                <p className="text-sm font-bold text-solemia-charcoal flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-solemia-plum" /> {client.lastVisitFormatted}
                                </p>
                            </div>
                            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm text-left">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Inversión Total</p>
                                <div className="flex items-end justify-between">
                                    <p className="text-2xl font-black font-outfit text-solemia-emerald">${client.totalSpent.toLocaleString()}</p>
                                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter">en {client.visitCount} visitas</p>
                                </div>
                            </div>
                            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm text-left">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Satisfacción Media</p>
                                <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                    <p className="text-xl font-black font-outfit text-solemia-charcoal">{client.avgNps} / 10</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-100 text-left">
                            <h4 className="text-[10px] font-black text-solemia-plum uppercase tracking-[0.2em] mb-4">Servicio Favorito</h4>
                            <div className="flex items-center gap-4 p-4 bg-solemia-pink/5 rounded-2xl border border-solemia-pink/10 mb-6">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Scissors className="w-4 h-4 text-solemia-pink" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-solemia-charcoal leading-none">{client.favoriteService}</p>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Servicio más recurrente</p>
                                </div>
                            </div>

                            <h4 className="text-[10px] font-black text-solemia-plum uppercase tracking-[0.2em] mb-4">Notas Técnicas Live</h4>
                            <div className="p-4 bg-solemia-plum/5 rounded-2xl border border-solemia-plum/10 italic text-[11px] font-medium text-solemia-charcoal/70 leading-relaxed">
                                "{client.insights[0] || 'No hay notas técnicas registradas aún.'}"
                            </div>
                        </div>
                    </div>

                    {/* Right: Detailed History */}
                    <div className="flex-1 p-10 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-100 text-left">
                        <div className="mb-10 text-left">
                            <h4 className="text-2xl font-black font-outfit text-solemia-plum mb-1">Historial de Expediente</h4>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Registro cronológico de servicios y consumos</p>
                        </div>

                        <div className="space-y-6">
                            {client.history.map((record, i) => (
                                <div key={i} className="flex gap-6 group">
                                    <div className="flex flex-col items-center pt-1.5 relative shrink-0 text-left">
                                        <div className="w-10 h-10 rounded-xl bg-white border-2 border-gray-50 shadow-sm flex items-center justify-center z-10 group-hover:border-solemia-plum/30 transition-all">
                                            {getServiceIcon(record.category)}
                                        </div>
                                        {i < client.history.length - 1 && (
                                            <div className="absolute top-10 bottom-[-24px] w-0.5 bg-gray-50 group-hover:bg-gray-100 transition-colors"></div>
                                        )}
                                    </div>
                                    <div className="flex-1 pb-10 text-left">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                                            <div className="text-left">
                                                <p className="text-lg font-bold text-solemia-charcoal leading-none mb-1">{record.serviceName}</p>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{format(parseISO(record.date), 'dd MMM, yyyy')}</span>
                                                    <span className="w-1 h-1 bg-gray-100 rounded-full"></span>
                                                    <span className="text-[10px] font-bold text-solemia-pink uppercase flex items-center gap-1">
                                                        <UserCircle className="w-3 h-3" /> {record.staffName}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-black font-outfit text-solemia-plum">${record.amount.toLocaleString()}</p>
                                                {record.nps && (
                                                    <div className="flex items-center justify-end gap-1 mt-1">
                                                        <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                                                        <span className="text-[9px] font-black text-gray-400">{record.nps}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {record.insight && (
                                            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-50 border-white/40 mt-3 text-left">
                                                <p className="text-xs font-medium text-gray-500 italic leading-relaxed">"{record.insight}"</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const CreateClientModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        notes: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        setFormData({ name: '', phone: '', email: '', notes: '' });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-solemia-charcoal/20 backdrop-blur-md animate-in fade-in duration-300 text-left">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white/90 backdrop-blur-xl border border-white/40 w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-solemia-plum to-solemia-pink"></div>

                <div className="flex justify-between items-start mb-8 text-left">
                    <div>
                        <h3 className="text-3xl font-black text-solemia-plum leading-none mb-3">Nueva Clienta</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Registra un nuevo expediente en el directorio</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-300 transition-colors">
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Nombre Completo *</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-white/60 border border-gray-100 px-6 py-4 rounded-[1.5rem] outline-none focus:border-solemia-plum transition-all text-sm font-medium shadow-sm"
                                placeholder="Ej. Mariana Sánchez"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Teléfono WhatsApp *</label>
                            <input
                                required
                                type="tel"
                                className="w-full bg-white/60 border border-gray-100 px-6 py-4 rounded-[1.5rem] outline-none focus:border-solemia-plum transition-all text-sm font-medium shadow-sm"
                                placeholder="+52 000 000 0000"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Empoderamiento (Correo Electrónico)</label>
                        <input
                            type="email"
                            className="w-full bg-white/60 border border-gray-100 px-6 py-4 rounded-[1.5rem] outline-none focus:border-solemia-plum transition-all text-sm font-medium shadow-sm"
                            placeholder="correo@ejemplo.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Notas Iniciales / Diagnóstico</label>
                        <textarea
                            rows="4"
                            className="w-full bg-white/60 border border-gray-100 px-6 py-4 rounded-[1.5rem] outline-none focus:border-solemia-plum transition-all text-sm font-medium shadow-sm resize-none"
                            placeholder="Añade detalles relevantes..."
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-solemia-charcoal transition-all border border-transparent"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-5 bg-gradient-to-r from-solemia-plum to-solemia-pink text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-solemia-plum/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            Crear Expediente
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default function ClientsView() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);
    const [sortBy, setSortBy] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
    const [isSegmentMenuOpen, setIsSegmentMenuOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [activeSegment, setActiveSegment] = useState('Todas');
    const [labelToDelete, setLabelToDelete] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [staffFilter, setStaffFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [manualClients, setManualClients] = useState([]);
    const [isCreateClientModalOpen, setIsCreateClientModalOpen] = useState(false);
    const [customSegments, setCustomSegments] = useState([
        {
            name: 'Atención Especial',
            color: 'bg-solemia-plum',
            rules: [
                { metric: 'totalSpent', operator: '>', val1: 2000, active: true },
                { metric: 'avgNps', operator: '>', val1: 8, active: true }
            ]
        }
    ]);

    const sortRef = useRef(null);
    const segmentRef = useRef(null);

    // Close menus on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortRef.current && !sortRef.current.contains(event.target)) setIsSortMenuOpen(false);
            if (segmentRef.current && !segmentRef.current.contains(event.target)) setIsSegmentMenuOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Grouping and processing mock data for clients
    const processedClients = useMemo(() => {
        const clientGroups = {};
        const today = new Date();

        // Initialize with manual clients
        manualClients.forEach(mc => {
            clientGroups[mc.name] = {
                name: mc.name,
                phone: mc.phone,
                email: mc.email,
                totalSpent: 0,
                visitCount: 0,
                history: [],
                npsSum: 0,
                npsCount: 0,
                lastVisit: format(today, 'yyyy-MM-dd'),
                insights: mc.notes ? [mc.notes] : [],
                serviceCounts: {}
            };
        });

        MOCK_HISTORICAL_DATA.forEach(record => {
            if (!clientGroups[record.clientName]) {
                clientGroups[record.clientName] = {
                    name: record.clientName,
                    totalSpent: 0,
                    visitCount: 0,
                    history: [],
                    npsSum: 0,
                    npsCount: 0,
                    lastVisit: '2020-01-01',
                    insights: []
                };
            }

            const group = clientGroups[record.clientName];
            group.totalSpent += record.amount;
            group.visitCount += 1;
            group.history.push(record);

            if (record.nps) {
                group.npsSum += record.nps;
                group.npsCount += 1;
            }

            if (isAfter(parseISO(record.date), parseISO(group.lastVisit))) {
                group.lastVisit = record.date;
            }

            if (record.insight) {
                group.insights.push(record.insight);
            }

            if (!group.serviceCounts) group.serviceCounts = {};
            group.serviceCounts[record.serviceName] = (group.serviceCounts[record.serviceName] || 0) + 1;
        });

        // Basic calculations
        const clientsArray = Object.values(clientGroups).map(client => {
            let favoriteService = '—';
            let maxCount = 0;
            if (client.serviceCounts) {
                Object.entries(client.serviceCounts).forEach(([name, count]) => {
                    if (count > maxCount) {
                        maxCount = count;
                        favoriteService = name;
                    }
                });
            }

            return {
                ...client,
                favoriteService,
                avgSpent: client.totalSpent / client.visitCount,
                avgNps: client.npsCount > 0 ? (client.npsSum / client.npsCount).toFixed(1) : '—',
                history: client.history.sort((a, b) => b.timestamp - a.timestamp),
                lastVisitFormatted: format(parseISO(client.lastVisit), 'dd MMM, yyyy'),
                lastVisitDate: client.lastVisit
            };
        });

        // Segmentation logic
        const sortedSpent = [...clientsArray].sort((a, b) => b.totalSpent - a.totalSpent);
        const vipThreshold = sortedSpent[Math.floor(sortedSpent.length * 0.1)]?.totalSpent || 10000;

        return clientsArray.map(client => {
            const daysSinceLastVisit = differenceInDays(today, parseISO(client.lastVisitDate));
            const numericAvgNps = parseFloat(client.avgNps) || 0;

            let segment = 'Regular';
            if (client.totalSpent >= vipThreshold) segment = 'VIP';
            else if (daysSinceLastVisit > 90) segment = 'Fuga';
            else if (client.visitCount === 1) segment = 'Nueva';
            else if (client.visitCount >= 5) segment = 'Fiel';

            // Check custom segments logic
            const satisfiedCustom = customSegments.filter(cs => {
                return cs.rules.every(rule => {
                    if (!rule.active) return true;

                    let val;
                    if (rule.metric === 'totalSpent') val = client.totalSpent;
                    else if (rule.metric === 'visitCount') val = client.visitCount;
                    else if (rule.metric === 'avgNps') val = numericAvgNps;
                    else if (rule.metric === 'daysSinceLastVisit') val = daysSinceLastVisit;

                    const v1 = parseFloat(rule.val1);
                    const v2 = parseFloat(rule.val2);

                    switch (rule.operator) {
                        case '>': return val > v1;
                        case '<': return val < v1;
                        case '=': return val == v1;
                        case 'range': return val >= v1 && val <= v2;
                        default: return true;
                    }
                });
            });

            return {
                ...client,
                segment,
                daysSinceLastVisit,
                numericAvgNps,
                customSegments: satisfiedCustom.map(c => c.name),
                customSegmentData: satisfiedCustom // For color styling if needed
            };
        });
    }, [customSegments, manualClients]);

    const handleCreateClient = (data) => {
        setManualClients(prev => [...prev, {
            ...data,
            id: `manual-${Date.now()}`
        }]);
    };

    const filteredAndSortedClients = useMemo(() => {
        let result = processedClients;

        // Segment Filter
        if (activeSegment !== 'Todas') {
            const isCustom = customSegments.find(cs => cs.name === activeSegment);
            if (isCustom) {
                result = result.filter(c => c.customSegments.includes(activeSegment));
            } else {
                result = result.filter(c => c.segment === activeSegment);
            }
        }

        // Search Filter
        if (searchTerm) {
            result = result.filter(c =>
                c.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sort
        result.sort((a, b) => {
            let valA, valB;
            if (sortBy === 'name') { valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); }
            else if (sortBy === 'visitCount') { valA = a.visitCount; valB = b.visitCount; }
            else if (sortBy === 'avgNps') { valA = a.numericAvgNps; valB = b.numericAvgNps; }
            else if (sortBy === 'totalSpent') { valA = a.totalSpent; valB = b.totalSpent; }
            else if (sortBy === 'lastVisit') { valA = new Date(a.lastVisitDate).getTime(); valB = new Date(b.lastVisitDate).getTime(); }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        // Advanced Filters (Tactical)
        if (staffFilter !== 'all') {
            result = result.filter(c => c.history.some(r => r.staffName === staffFilter));
        }
        if (categoryFilter !== 'all') {
            result = result.filter(c => c.history.some(r => r.category === categoryFilter));
        }
        if (dateRange.start || dateRange.end) {
            result = result.filter(c => c.history.some(r => {
                const d = parseISO(r.date);
                if (dateRange.start && isBefore(d, parseISO(dateRange.start))) return false;
                if (dateRange.end && isAfter(d, parseISO(dateRange.end))) return false;
                return true;
            }));
        }

        return result;
    }, [processedClients, searchTerm, sortBy, sortDirection, activeSegment, customSegments, staffFilter, categoryFilter, dateRange]);

    const kpis = useMemo(() => {
        const total = filteredAndSortedClients.length;
        const totalSpentAll = filteredAndSortedClients.reduce((acc, c) => acc + c.totalSpent, 0);
        const avgLtv = total > 0 ? (totalSpentAll / total).toFixed(0) : 0;
        const newThisMonth = filteredAndSortedClients.filter(c => c.segment === 'Nueva').length;
        const activeNpsClients = filteredAndSortedClients.filter(c => c.avgNps !== '—');
        const globalAvgNps = activeNpsClients.length > 0
            ? (activeNpsClients.reduce((acc, c) => acc + c.numericAvgNps, 0) / activeNpsClients.length).toFixed(1)
            : '—';

        return { total, avgLtv: `$${parseInt(avgLtv).toLocaleString()}`, newThisMonth, avgNps: globalAvgNps };
    }, [filteredAndSortedClients]);

    const sortOptions = [
        { id: 'name', label: 'Alfabético' },
        { id: 'totalSpent', label: 'Inversión' },
        { id: 'visitCount', label: 'Frecuencia' },
        { id: 'avgNps', label: 'NPS' },
        { id: 'lastVisit', label: 'Recencia' }
    ];

    const handleDeleteSegment = (name) => {
        setCustomSegments(customSegments.filter(s => s.name !== name));
        if (activeSegment === name) setActiveSegment('Todas');
    };

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700 pb-20 text-left">
            <header className="space-y-6 px-4">
                <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 text-left">
                    <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-4xl font-black font-outfit text-solemia-plum tracking-tight leading-tight">Registro de Clientas</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="p-1.5 bg-solemia-plum/5 rounded-lg border border-solemia-plum/10 shadow-sm">
                                    <Users className="w-3 h-3 text-solemia-plum" />
                                </div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                                    {processedClients.length} Expendientes localizados
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto text-left">
                        <button
                            onClick={() => setIsCreateClientModalOpen(true)}
                            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-solemia-plum to-solemia-pink text-white rounded-2xl font-black font-outfit text-[10px] uppercase tracking-widest shadow-xl shadow-solemia-plum/20 hover:scale-105 active:scale-95 transition-all w-full md:w-auto"
                        >
                            <Plus className="w-4 h-4" /> Nueva Clienta
                        </button>
                        <div className="flex items-center gap-4 bg-white/60 backdrop-blur-xl px-6 py-4 rounded-[1.5rem] w-full md:w-96 border border-white/40 shadow-sm focus-within:border-solemia-pink/30 focus-within:bg-white transition-all group">
                            <Search className="w-5 h-5 text-gray-300 group-focus-within:text-solemia-pink transition-colors" />
                            <input
                                type="text"
                                placeholder="Busca por nombre o servicio..."
                                className="bg-transparent border-none outline-none text-sm w-full font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="flex items-center gap-3 px-6 py-4 bg-solemia-plum/10 text-solemia-plum border border-solemia-plum/10 rounded-2xl font-black font-outfit text-[10px] uppercase tracking-widest hover:bg-solemia-plum hover:text-white transition-all w-full md:w-auto">
                            <Download className="w-4 h-4" /> Exportar
                        </button>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 text-left">
                <StatCard title="Directorio" value={kpis.total} icon={Users} colorClass="text-solemia-plum" bgClass="bg-solemia-plum/5" subLabel="Total perfiles" />
                <StatCard title="Inversión Prom." value={kpis.avgLtv} icon={TrendingUp} colorClass="text-solemia-emerald" bgClass="bg-solemia-emerald/5" subLabel="LTV Medio" delay={0.1} />
                <StatCard title="Índice NPS" value={kpis.avgNps} icon={Heart} colorClass="text-solemia-pink" bgClass="bg-solemia-pink/5" subLabel="Satisfacción" delay={0.2} />
                <StatCard title="Nuevas (Segmento)" value={kpis.newThisMonth} icon={Star} colorClass="text-amber-500" bgClass="bg-amber-50" subLabel="Recién llegadas" delay={0.3} />
            </div>

            <div className="px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-left">
                <div className="flex items-center gap-3 w-full md:w-auto text-left">
                    {/* ORDERING */}
                    <div className="relative" ref={sortRef}>
                        <button
                            onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                            className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-sm ${isSortMenuOpen ? 'bg-solemia-plum text-white' : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                        >
                            <ArrowUpDown className="w-4 h-4" />
                            Ordenar por: {sortOptions.find(o => o.id === sortBy)?.label}
                            {sortDirection === 'asc' ? <SortAsc className="w-3 h-3 opacity-50" /> : <SortDesc className="w-3 h-3 opacity-50" />}
                            <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-300 ${isSortMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isSortMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute left-0 mt-3 w-56 bg-white/90 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl z-[100] p-2 overflow-hidden"
                                >
                                    {sortOptions.map(option => (
                                        <button
                                            key={option.id}
                                            onClick={() => {
                                                if (sortBy === option.id) {
                                                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                                                } else {
                                                    setSortBy(option.id);
                                                    setSortDirection(option.id === 'name' ? 'asc' : 'desc');
                                                }
                                                setIsSortMenuOpen(false);
                                            }}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-[1rem] text-[10px] font-bold uppercase tracking-widest transition-all ${sortBy === option.id ? 'bg-solemia-plum/5 text-solemia-plum' : 'text-gray-400 hover:bg-gray-50 hover:text-solemia-charcoal'}`}
                                        >
                                            {option.label}
                                            {sortBy === option.id && <Check className="w-3 h-3 text-solemia-pink" />}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* SEGMENTATION */}
                    <div className="relative" ref={segmentRef}>
                        <button
                            onClick={() => setIsSegmentMenuOpen(!isSegmentMenuOpen)}
                            className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-sm ${activeSegment !== 'Todas' ? 'bg-solemia-pink text-white' : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                        >
                            <Layers className="w-4 h-4" />
                            {activeSegment === 'Todas' ? 'Todas las Etiquetas' : `Etiqueta: ${activeSegment}`}
                            <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-300 ${isSegmentMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isSegmentMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute left-0 mt-3 w-80 bg-white/90 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-2xl z-[100] p-6 space-y-4"
                                >
                                    <div className="flex items-center justify-between px-2">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Etiquetas Básicas</p>
                                    </div>

                                    <div className="space-y-1 max-h-72 overflow-y-auto pr-1 no-scrollbar">
                                        {['Todas', 'VIP', 'Fiel', 'Nueva', 'Fuga'].map(seg => (
                                            <button
                                                key={seg}
                                                onClick={() => { setActiveSegment(seg); setIsSegmentMenuOpen(false); }}
                                                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeSegment === seg ? 'bg-solemia-pink/5 text-solemia-pink' : 'text-gray-400 hover:bg-gray-50 hover:text-solemia-charcoal'}`}
                                            >
                                                {seg}
                                                {activeSegment === seg && <Check className="w-3 h-3" />}
                                            </button>
                                        ))}

                                        {customSegments.length > 0 && (
                                            <>
                                                <div className="h-px bg-gray-50 my-4"></div>
                                                <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest px-2 mb-2">Etiquetas Personalizadas</p>
                                                {customSegments.map(cs => (
                                                    <div key={cs.name} className="group relative flex items-center">
                                                        <button
                                                            onClick={() => { setActiveSegment(cs.name); setIsSegmentMenuOpen(false); }}
                                                            className={`flex-1 flex items-center justify-between px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeSegment === cs.name ? `bg-white shadow-sm ring-1 ring-inset ring-gray-100 text-solemia-charcoal` : 'text-gray-400 hover:bg-gray-50 hover:text-solemia-charcoal'}`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-3 h-3 rounded-full ${cs.color} shadow-sm`}></div>
                                                                <span className="truncate max-w-[140px]">{cs.name}</span>
                                                            </div>
                                                            {activeSegment === cs.name && <Check className="w-3 h-3 text-solemia-pink" />}
                                                        </button>

                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setLabelToDelete(cs.name); }}
                                                            className="absolute right-3 p-2 text-gray-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => { setIsCreateModalOpen(true); setIsSegmentMenuOpen(false); }}
                                            className="w-full py-4 bg-solemia-plum text-white rounded-[1.5rem] flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] shadow-xl shadow-solemia-plum/20 transition-all"
                                        >
                                            <Settings2 className="w-4 h-4" /> Crear Etiqueta Personalizada
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    {/* TACTICAL FILTERS */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-sm group ${showFilters ? 'bg-solemia-plum text-white' : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                    >
                        <Filter className={`w-4 h-4 ${showFilters ? 'text-white' : 'group-hover:text-solemia-plum'} transition-colors`} />
                        Filtros
                        {(staffFilter !== 'all' || categoryFilter !== 'all' || dateRange.start || dateRange.end) && (
                            <span className="w-2 h-2 bg-solemia-pink rounded-full border border-white animate-pulse"></span>
                        )}
                        <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                <div className="flex items-center gap-4 text-left">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{filteredAndSortedClients.length} Expendientes localizados</span>
                </div>
            </div>

            {/* FILTERS PANEL */}
            <AnimatePresence>
                {showFilters && (
                    <div className="px-4">
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 mt-2 grid grid-cols-1 md:grid-cols-3 gap-8 shadow-xl relative z-50">
                                {/* Staff Filter */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <UserCircle className="w-3 h-3" /> Especialista
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {['all', ...STAFF].map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setStaffFilter(s)}
                                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${staffFilter === s ? 'bg-solemia-plum text-white shadow-lg shadow-solemia-plum/20' : 'bg-white/80 text-gray-400 hover:bg-white border border-gray-50'}`}
                                            >
                                                {s === 'all' ? 'Todos' : s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Category Filter */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Scissors className="w-3 h-3" /> Categoría
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {['all', 'Corte', 'Color', 'Uñas', 'Skin', 'Retail'].map(c => (
                                            <button
                                                key={c}
                                                onClick={() => setCategoryFilter(c)}
                                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${categoryFilter === c ? 'bg-solemia-pink text-white shadow-lg shadow-solemia-pink/20' : 'bg-white/80 text-gray-400 hover:bg-white border border-gray-50'}`}
                                            >
                                                {c === 'all' ? 'Todas' : c}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Date Range */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Calendar className="w-3 h-3" /> Rango de Fecha
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="date"
                                            className="flex-1 bg-white/80 border border-gray-100 px-4 py-2 rounded-xl text-[10px] font-bold text-solemia-charcoal outline-none focus:bg-white transition-all shadow-sm"
                                            value={dateRange.start}
                                            onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                                        />
                                        <span className="text-gray-300 font-bold">—</span>
                                        <input
                                            type="date"
                                            className="flex-1 bg-white/80 border border-gray-100 px-4 py-2 rounded-xl text-[10px] font-bold text-solemia-charcoal outline-none focus:bg-white transition-all shadow-sm"
                                            value={dateRange.end}
                                            onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                                        />
                                        {(dateRange.start || dateRange.end || staffFilter !== 'all' || categoryFilter !== 'all') && (
                                            <button
                                                onClick={() => { setStaffFilter('all'); setCategoryFilter('all'); setDateRange({ start: '', end: '' }); }}
                                                className="p-2 text-gray-300 hover:text-solemia-pink transition-colors"
                                                title="Limpiar filtros"
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* CLIENTS LIST */}
            <div className="px-4 space-y-4 text-left">
                <AnimatePresence mode="popLayout">
                    {filteredAndSortedClients.map((client, idx) => (
                        <motion.div
                            layout
                            key={client.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: idx * 0.02 }}
                            className="group p-5 md:p-6 bg-white/60 backdrop-blur-xl border border-white/40 flex flex-col md:flex-row items-center justify-between hover:shadow-xl transition-all cursor-pointer relative overflow-hidden text-left rounded-[2.5rem]"
                            onClick={() => setSelectedClient(client)}
                        >
                            {/* Decorative accent based on segment(s) */}
                            <div
                                className="absolute left-0 top-0 bottom-0 w-1.5 transition-all overflow-hidden"
                                style={{
                                    background: client.customSegmentData?.length > 0
                                        ? `linear-gradient(to bottom, ${client.segment === 'VIP' ? '#FBBF24' :
                                            client.segment === 'Fuga' ? '#F87171' :
                                                client.segment === 'Nueva' ? '#60A5FA' : '#E5E7EB'
                                        } 50%, ${client.customSegmentData[0].color === 'bg-solemia-plum' ? '#6B21A8' :
                                            client.customSegmentData[0].color === 'bg-solemia-pink' ? '#BE185D' :
                                                client.customSegmentData[0].color === 'bg-solemia-rose' ? '#E11D48' :
                                                    client.customSegmentData[0].color === 'bg-solemia-emerald' ? '#059669' :
                                                        client.customSegmentData[0].color === 'bg-amber-400' ? '#FBBF24' :
                                                            client.customSegmentData[0].color === 'bg-blue-400' ? '#60A5FA' : '#6B21A8'
                                        } 50%)`
                                        : undefined
                                }}
                            >
                                {!client.customSegmentData?.length && (
                                    <div className={`w-full h-full ${client.segment === 'VIP' ? 'bg-amber-400' :
                                        client.segment === 'Fuga' ? 'bg-red-400' :
                                            client.segment === 'Nueva' ? 'bg-blue-400' :
                                                'bg-gray-100 group-hover:bg-solemia-pink'
                                        }`}></div>
                                )}
                            </div>

                            <div className="flex items-center gap-6 w-full md:w-1/3 text-left">
                                <div className="w-14 h-14 min-w-[56px] rounded-24 truncate bg-gray-50 flex items-center justify-center text-solemia-plum font-black font-outfit text-xl border-2 border-white group-hover:scale-105 transition-all shadow-sm uppercase">
                                    {client.name[0]}
                                </div>
                                <div className="text-left">
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-lg font-bold text-solemia-charcoal leading-none group-hover:text-solemia-plum transition-colors">{client.name}</h4>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${client.segment === 'VIP' ? 'bg-amber-50 text-amber-500' :
                                                client.segment === 'Fuga' ? 'bg-red-50 text-red-500' :
                                                    client.segment === 'Nueva' ? 'bg-blue-50 text-blue-500' :
                                                        'bg-gray-50 text-gray-400'
                                                }`}>
                                                {client.segment}
                                            </span>
                                            {client.customSegmentData?.map((cs, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-2 h-2 rounded-full ${cs.color} shadow-sm border border-white`}
                                                    title={cs.name}
                                                ></div>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                        <Clock className="w-3 h-3" /> Última: {client.lastVisitFormatted}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-4 md:gap-12 w-full md:w-auto mt-6 md:mt-0 px-4 md:px-0 text-left">
                                <div className="text-left">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Visitas</p>
                                    <p className="text-base font-black font-outfit text-solemia-plum leading-none">{client.visitCount}</p>
                                </div>
                                <div className="text-left w-32">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Preferencia</p>
                                    <p className="text-[11px] font-bold text-solemia-charcoal leading-tight group-hover:text-solemia-pink transition-colors truncate">{client.favoriteService}</p>
                                </div>
                                <div className="text-left">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">NPS</p>
                                    <div className="flex items-center gap-1.5">
                                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                        <p className="text-base font-black font-outfit text-solemia-charcoal leading-none">{client.avgNps}</p>
                                    </div>
                                </div>
                                <div className="text-left">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Fidelidad</p>
                                    <p className="text-base font-black font-outfit text-solemia-emerald leading-none">${client.totalSpent.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mt-6 md:mt-0 ml-auto">
                                <button className="px-8 py-3 bg-white/80 border border-white/40 rounded-xl text-[9px] font-black text-solemia-plum uppercase tracking-widest shadow-sm group-hover:bg-solemia-plum group-hover:text-white group-hover:shadow-lg group-hover:shadow-solemia-plum/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 font-outfit">
                                    Ver Perfil <ArrowRight className="w-3 h-3" />
                                </button>
                                <div className="p-2 text-gray-200 group-hover:text-solemia-pink transition-colors">
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredAndSortedClients.length === 0 && (
                    <div className="py-40 text-center flex flex-col items-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-8 border border-gray-100 shadow-inner">
                            <Users className="w-10 h-10 text-gray-200" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-400 font-outfit mb-3">Sin resultados técnicos</h3>
                        <p className="text-sm font-medium text-gray-300 max-w-sm">Los filtros actuales no coinciden con ningún perfil en la base de datos.</p>
                        <button
                            onClick={() => { setSearchTerm(''); setActiveSegment('Todas'); }}
                            className="mt-8 text-[10px] font-black text-solemia-pink uppercase tracking-[0.2em] hover:text-solemia-plum transition-colors underline underline-offset-8"
                        >
                            Reiniciar Filtros
                        </button>
                    </div>
                )}
            </div>

            {/* MODALS */}
            <CreateSegmentModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={(newSegment) => setCustomSegments([...customSegments, newSegment])}
            />

            <CreateClientModal
                isOpen={isCreateClientModalOpen}
                onClose={() => setIsCreateClientModalOpen(false)}
                onSave={handleCreateClient}
            />

            {selectedClient && (
                <ClientDetailModal
                    isOpen={!!selectedClient}
                    client={selectedClient}
                    onClose={() => setSelectedClient(null)}
                />
            )}

            <DeleteConfirmationModal
                isOpen={!!labelToDelete}
                labelName={labelToDelete}
                onClose={() => setLabelToDelete(null)}
                onConfirm={() => {
                    handleDeleteSegment(labelToDelete);
                    setLabelToDelete(null);
                }}
            />
        </div>
    );
}
