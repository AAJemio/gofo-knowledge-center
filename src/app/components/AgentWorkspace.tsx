'use client';

import React, { useState, useMemo } from 'react';
import { Search, MessageCircle, Truck, Zap, CornerUpLeft, AlertTriangle, Shield, Edit3, CheckCircle2, Copy, X, Globe, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAKC } from '@/context/AKCContext';
import { api } from '@/services/api';

// Category definitions with MQA colors
const CATEGORIES: any = {
    'Tracking': {
        color: 'border-blue-200 dark:border-blue-900',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-600 dark:text-blue-400',
        hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/40',
        icon: Truck,
        labelEs: 'Rastreo',
        labelEn: 'Tracking'
    },
    'Delivery': {
        color: 'border-green-200 dark:border-green-900',
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-600 dark:text-green-400',
        hover: 'hover:bg-green-100 dark:hover:bg-green-900/40',
        icon: Zap,
        labelEs: 'Entrega',
        labelEn: 'Delivery'
    },
    'Return': {
        color: 'border-orange-200 dark:border-orange-900',
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        text: 'text-orange-600 dark:text-orange-400',
        hover: 'hover:bg-orange-100 dark:hover:bg-orange-900/40',
        icon: CornerUpLeft,
        labelEs: 'Retornos',
        labelEn: 'Returns'
    },
    'Complaint': {
        color: 'border-red-200 dark:border-red-900',
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-600 dark:text-red-400',
        hover: 'hover:bg-red-100 dark:hover:bg-red-900/40',
        icon: AlertTriangle,
        labelEs: 'Quejas',
        labelEn: 'Complaints'
    },
    'Security': {
        color: 'border-gray-800 dark:border-gray-600',
        bg: 'bg-gray-800 dark:bg-gray-700',
        text: 'text-white',
        hover: 'hover:bg-gray-700 dark:hover:bg-gray-600',
        icon: Shield,
        labelEs: 'Seguridad',
        labelEn: 'Security'
    },
    'Modification': {
        color: 'border-purple-200 dark:border-purple-900',
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        text: 'text-purple-600 dark:text-purple-400',
        hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/40',
        icon: Edit3,
        labelEs: 'Cambios',
        labelEn: 'Changes'
    },
    'General': {
        color: 'border-slate-200 dark:border-gray-700',
        bg: 'bg-slate-50 dark:bg-slate-800',
        text: 'text-slate-600 dark:text-slate-400',
        hover: 'hover:bg-slate-100 dark:hover:bg-slate-700',
        icon: MessageCircle,
        labelEs: 'General',
        labelEn: 'General'
    },
    'Admin': {
        color: 'border-indigo-200 dark:border-indigo-900',
        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        text: 'text-indigo-600 dark:text-indigo-400',
        hover: 'hover:bg-indigo-100 dark:hover:bg-indigo-900/40',
        icon: CheckCircle2,
        labelEs: 'Admin',
        labelEn: 'Admin'
    },
};

export default function AgentWorkspace({ initialCases }: { initialCases: any[] }) {
    const router = useRouter();
    const { language, theme } = useAKC();
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('all');
    const [selectedCase, setSelectedCase] = useState<any>(null);

    const isBilingual = language === 'es'; // If ES, show bilingual content. If EN, show only English.

    // Filter logic
    const filteredCases = useMemo(() => {
        return initialCases.filter(c => {
            const matchesSearch =
                c.title_es.toLowerCase().includes(query.toLowerCase()) ||
                c.title_en.toLowerCase().includes(query.toLowerCase()) ||
                c.keywords.toLowerCase().includes(query.toLowerCase());
            const matchesCategory = category === 'all' || c.category === category;
            return matchesSearch && matchesCategory;
        });
    }, [initialCases, query, category]);

    const handleCardClick = async (c: any) => {
        setSelectedCase(c);
        try {
            await api.usage.track('case', c.id);
        } catch (e) { console.error(e); }
    };

    return (
        <div className="min-h-screen bg-[#FFFBF0] dark:bg-[#0a0a0a] font-sans pb-20 transition-colors duration-300">
            {/* Sticky Header (Unified with PromptsViewer) */}
            <div className={`sticky top-16 z-40 border-b backdrop-blur-md transition-colors duration-300 ${theme === 'dark' ? 'bg-[#1B1F22]/90 border-gray-800' : 'bg-white/90 border-slate-200'}`}>
                <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Title */}
                        <div>
                            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                                Mind Map Quick Answer <span className="text-[#EF4D23]">MQA</span>
                            </h1>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Gofo Knowledge Center</p>
                        </div>

                        {/* Search */}
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-96">
                                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} size={18} />
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder={language === 'es' ? "Buscar por palabra clave, título o escenario..." : "Search by keyword, title, or scenario..."}
                                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium transition-all border outline-none focus:ring-2 focus:ring-[#EF4D23]/50 ${theme === 'dark'
                                        ? 'bg-gray-800 border-gray-700 text-white placeholder-slate-500'
                                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
                                        }`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="flex gap-2 justify-start md:justify-center overflow-x-auto pb-2 hide-scrollbar">
                        <button
                            onClick={() => setCategory('all')}
                            className={`px-5 py-2 rounded-full text-sm font-bold transition shadow-sm border ${category === 'all' ? 'bg-[#EF4D23] border-[#EF4D23] text-white ring-2 ring-[#EF4D23]/30' : 'bg-white dark:bg-gray-800 border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >
                            {language === 'es' ? 'Todos' : 'All'}
                        </button>
                        {Object.keys(CATEGORIES).map(cat => {
                            const style = CATEGORIES[cat];
                            const isActive = category === cat;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`px-5 py-2 rounded-full text-sm font-bold transition shadow-sm border ${isActive ? `${style.bg} ${style.color} ${style.text} ring-2 ring-opacity-50` : 'bg-white dark:bg-gray-800 border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                >
                                    {language === 'es' ? style.labelEs : style.labelEn}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCases.map(c => {
                    const style = CATEGORIES[c.category as keyof typeof CATEGORIES] || CATEGORIES['General'];
                    return (
                        <div
                            key={c.id}
                            onClick={() => handleCardClick(c)}
                            className={`bg-white dark:bg-[#1B1F22] rounded-xl p-5 cursor-pointer hover:shadow-md hover:ring-2 hover:ring-[#EF4D23] transition group border border-gray-200 dark:border-gray-800 flex flex-col h-full`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${style.text} ${style.bg} border ${style.color}`}>
                                    {language === 'es' ? style.labelEs : style.labelEn}
                                </span>
                            </div>

                            {/* Title Logic */}
                            {language === 'es' ? (
                                <>
                                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1 leading-snug group-hover:text-[#EF4D23] transition-colors">
                                        {c.title_es}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{c.title_en}</p>
                                </>
                            ) : (
                                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3 leading-snug group-hover:text-[#EF4D23] transition-colors">
                                    {c.title_en}
                                </h3>
                            )}

                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 mt-auto pt-3 border-t border-gray-100 dark:border-gray-800">
                                {language === 'es' ? c.condition : (c.condition_en || c.condition)}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Modal */}
            {selectedCase && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedCase(null)}>
                    <div className="bg-white dark:bg-[#1B1F22] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-[#1B1F22] z-10">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${CATEGORIES[selectedCase.category]?.bg || 'bg-gray-100'}`}>
                                    {React.createElement(CATEGORIES[selectedCase.category]?.icon || MessageCircle, { size: 20, className: CATEGORIES[selectedCase.category]?.text || 'text-gray-500' })}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {language === 'es' ? selectedCase.title_es : selectedCase.title_en}
                                    </h2>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        {language === 'es' ? CATEGORIES[selectedCase.category]?.labelEs : CATEGORIES[selectedCase.category]?.labelEn}
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedCase(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 overflow-y-auto">
                            {/* Condition Alert */}
                            <div className="bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-400 p-4 rounded-r-lg">
                                <div className="flex items-start">
                                    <div className="ml-1">
                                        <h3 className="text-xs font-bold text-amber-800 dark:text-amber-500 uppercase tracking-wide mb-1">
                                            {language === 'es' ? 'Condición' : 'Condition'}
                                        </h3>
                                        <p className="text-sm text-amber-900 dark:text-amber-200">
                                            {language === 'es' ? selectedCase.condition : (selectedCase.condition_en || selectedCase.condition)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* CRM Configuration */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Edit3 size={14} /> {language === 'es' ? 'Configuración CRM' : 'CRM Configuration'}
                                </h3>
                                <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-gray-900/50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 border-b border-gray-200 dark:border-gray-800">
                                        <div className="p-3 border-r border-gray-200 dark:border-gray-800">
                                            <span className="block text-[10px] uppercase text-gray-500 font-semibold mb-1">Work Order Type</span>
                                            <span className="text-sm font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">{selectedCase.crm_code_type || 'N/A'}</span>
                                        </div>
                                        <div className="p-3">
                                            <span className="block text-[10px] uppercase text-gray-500 font-semibold mb-1">Detailed Type</span>
                                            <span className="text-sm font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">{selectedCase.crm_detailed_type || 'General query'}</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-1 border-b border-gray-200 dark:border-gray-800">
                                        <div className="p-3">
                                            <span className="block text-[10px] uppercase text-gray-500 font-semibold mb-1">Complaint?</span>
                                            <span className={`text-sm font-bold ${selectedCase.crm_complaint_status === 'YES' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                                {selectedCase.crm_complaint_status || 'NO'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50">
                                        <span className="block text-[10px] uppercase text-red-500 font-bold mb-2">Remark Templates (OBLIGATORIO/REQUIRED)</span>
                                        <div className="space-y-2">
                                            {selectedCase.crm_remark_template ? (
                                                selectedCase.crm_remark_template.trim().startsWith('[') ? (
                                                    (() => {
                                                        try {
                                                            const remarks = JSON.parse(selectedCase.crm_remark_template);
                                                            if (Array.isArray(remarks)) {
                                                                return remarks.map((t: any, i: number) => (
                                                                    <div key={i} className="bg-white dark:bg-gray-900 border border-indigo-100 dark:border-indigo-900/50 rounded-lg p-3 group hover:border-[#EF4D23] dark:hover:border-[#EF4D23] hover:shadow-sm transition cursor-pointer relative" onClick={() => navigator.clipboard.writeText(t.tag)}>
                                                                        <div className="flex justify-between items-center mb-1">
                                                                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                                                {isBilingual ? (t.label_es || t.label) : (t.label_en || t.label_es || t.label)}
                                                                            </span>
                                                                            <span className="text-gray-400 group-hover:text-[#EF4D23] transition"><Copy size={12} /></span>
                                                                        </div>
                                                                        <div className="bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 font-mono text-xs p-2 rounded border border-indigo-100 dark:border-indigo-900/50 break-all">
                                                                            {t.tag}
                                                                        </div>
                                                                    </div>
                                                                ));
                                                            }
                                                            throw new Error('Not an array');
                                                        } catch (e) {
                                                            return <div className="text-sm font-mono text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-2 rounded">{selectedCase.crm_remark_template}</div>;
                                                        }
                                                    })()
                                                ) : (
                                                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3 group hover:border-[#EF4D23] hover:shadow-sm transition cursor-pointer relative" onClick={() => navigator.clipboard.writeText(selectedCase.crm_remark_template)}>
                                                        <div className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-xs p-2 rounded border border-gray-200 dark:border-gray-700 break-all">
                                                            {selectedCase.crm_remark_template}
                                                        </div>
                                                        <div className="absolute top-2 right-2 text-gray-400 group-hover:text-[#EF4D23]"><Copy size={12} /></div>
                                                    </div>
                                                )
                                            ) : (
                                                <div className="text-sm text-gray-400 italic">No specific remark template.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Scripts Section */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <MessageCircle size={14} /> {language === 'es' ? 'Scripts de Respuesta' : 'Response Scripts'}
                                </h3>

                                {/* Recommended Prompts */}
                                {selectedCase.recommendedPrompts && selectedCase.recommendedPrompts.length > 0 && (
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-bold text-[#EF4D23]">RECOMMENDED PROMPTS</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedCase.recommendedPrompts.map((p: any) => (
                                                <React.Fragment key={p.id}>
                                                    {/* Spanish Button */}
                                                    {isBilingual && p.code_par_es && (
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(p.content_es || '');
                                                                router.push(`/prompts?id=${p.id}`);
                                                            }}
                                                            className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-3 py-2 rounded-lg text-xs font-bold transition"
                                                            title={p.content_es || ''}
                                                        >
                                                            <MessageSquare size={14} />
                                                            {p.code_par_es.toString().startsWith('/') ? '' : '/'}{p.code_par_es} {p.title_es || p.title}
                                                        </button>
                                                    )}

                                                    {/* English Button */}
                                                    {p.code_impar_en && (
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(p.content_en || '');
                                                                router.push(`/prompts?id=${p.id}`);
                                                            }}
                                                            className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-xs font-bold transition"
                                                            title={p.content_en || ''}
                                                        >
                                                            <MessageSquare size={14} />
                                                            {p.code_impar_en.toString().startsWith('/') ? '' : '/'}{p.code_impar_en} {p.title}
                                                        </button>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* English Scripts */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-bold text-gray-500">🇺🇸 ENGLISH</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <ScriptCard
                                            title="Formal / Official"
                                            content={selectedCase.script_official_en}
                                            variant="dark"
                                        />
                                        <ScriptCard
                                            title="Friendly (Editable)"
                                            content={selectedCase.script_friendly_en}
                                            variant="light-blue"
                                            editable
                                        />
                                    </div>
                                </div>

                                {/* Spanish Scripts (Only if Bilingual) */}
                                {isBilingual && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-bold text-gray-500">🇪🇸 ESPAÑOL</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <ScriptCard
                                                title="Formal / Oficial"
                                                content={selectedCase.script_official_es}
                                                variant="white"
                                            />
                                            <ScriptCard
                                                title="Empático / Amable (Editable)"
                                                content={selectedCase.script_friendly_es}
                                                variant="light-green"
                                                editable
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#151719] rounded-b-xl flex justify-end">
                            <button
                                onClick={() => setSelectedCase(null)}
                                className="bg-[#EF4D23] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#d63f1a] transition shadow-sm text-sm"
                            >
                                {language === 'es' ? 'Entendido' : 'Got it'}
                            </button>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
}

function ScriptCard({ title, content, variant, editable }: any) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getStyles = () => {
        switch (variant) {
            case 'dark': return 'bg-[#1e293b] text-slate-300 border-slate-700';
            case 'light-blue': return 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-200 border-indigo-100 dark:border-indigo-900/30';
            case 'white': return 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700';
            case 'light-green': return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-200 border-emerald-100 dark:border-emerald-900/30';
            default: return 'bg-white text-gray-800 border-gray-200';
        }
    };

    return (
        <div className={`rounded-lg border p-3 relative group h-full flex flex-col ${getStyles()} ${!editable ? 'hover:ring-2 hover:ring-indigo-400/50 cursor-pointer' : ''}`} onClick={!editable ? handleCopy : undefined}>
            <div className="flex justify-between items-center mb-2">
                <span className={`text-[10px] font-bold uppercase ${variant === 'dark' ? 'text-slate-500' : 'opacity-60'}`}>
                    {title}
                </span>
                <button onClick={(e) => { e.stopPropagation(); handleCopy(); }} className="opacity-0 group-hover:opacity-100 transition-opacity text-current hover:scale-110">
                    {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                </button>
            </div>
            {editable ? (
                <textarea
                    defaultValue={content}
                    className="w-full bg-transparent resize-none outline-none text-xs leading-relaxed h-full min-h-[80px]"
                />
            ) : (
                <div className="text-xs leading-relaxed whitespace-pre-wrap">
                    {content}
                </div>
            )}
        </div>
    );
}
