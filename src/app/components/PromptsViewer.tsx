'use client';

import React, { useState, useEffect } from 'react';
import { Search, Copy, Check, Truck, Zap, CornerUpLeft, Edit3, AlertTriangle, Shield, CheckCircle2, MessageCircle, List, Grid, Share2 } from 'lucide-react';

import { useSearchParams } from 'next/navigation';
import { useAKC } from '@/context/AKCContext';
import { api } from '@/services/api';
import ContentRestoreWizard from '../admin/components/ContentRestoreWizard';
import ExportModal from '../admin/components/ExportModal';
import { downloadFileFromUrl } from '@/utils/downloadHelpers';

// Category definitions unified with MQA
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

const UI_TEXT = {
    es: {
        subtitle: 'Centro de Conocimiento GOFO',
        searchPlaceholder: 'Buscar prompts, códigos o contenido...',
        allCategories: 'Todos',
        listView: 'Vista de Lista',
        titleLang: 'Idioma Títulos:',
        titleHeader: 'Título del Prompt',
        english: 'Inglés',
        spanish: 'Español',
        noPrompts: 'No se encontraron prompts',
        noPromptsDesc: 'Intenta ajustar tu búsqueda o filtro de categoría'
    },
    en: {
        subtitle: 'GOFO Knowledge Center',
        searchPlaceholder: 'Search prompts, codes, or content...',
        allCategories: 'All',
        listView: 'List View',
        titleLang: 'Title Language:',
        titleHeader: 'Prompt Title',
        english: 'English',
        spanish: 'Spanish',
        noPrompts: 'No prompts found',
        noPromptsDesc: 'Try adjusting your search or category filter'
    }
};

export default function PromptsViewer({ initialPrompts }: { initialPrompts: any[] }) {
    const { language, theme, currentUser, updateProfile } = useAKC();
    const [prompts, setPrompts] = useState(initialPrompts);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [viewMode, setViewMode] = useState(currentUser?.wapViewMode || 'grid');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: 'title' | 'english' | 'spanish' | null, direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
    const searchParams = useSearchParams();
    const promptId = searchParams.get('id');
    const highlightId = searchParams.get('highlight');
    const [showRestoreWizard, setShowRestoreWizard] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    // Handle initial highlight/scroll
    useEffect(() => {
        const targetId = highlightId || promptId;
        if (targetId) {
            scrollToCard(targetId);
        }
    }, [promptId, highlightId]);

    // Sync viewMode with currentUser preference on load
    useEffect(() => {
        if (currentUser?.wapViewMode) {
            setViewMode(currentUser.wapViewMode);
        }
    }, [currentUser?.wapViewMode]);

    const handleViewModeChange = (mode: 'grid' | 'list') => {
        setViewMode(mode);
        updateProfile({ wapViewMode: mode });
        setExpandedId(null); // Reset expansion when switching views
    };

    const handleSort = (key: 'title' | 'english' | 'spanish') => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const toggleExpand = (id: string) => {
        setExpandedId(prev => prev === id ? null : id);
    };

    const handleExportClick = () => {
        setIsExportModalOpen(true);
    };

    const handleExportConfirm = (filename: string) => {
        setIsExportModalOpen(false);
        downloadFileFromUrl(`/api/admin/content/backup?scope=prompts`, filename);
    };

    const darkMode = theme === 'dark';
    const lang = language;

    useEffect(() => {
        if (promptId) {
            scrollToCard(promptId);
        }
    }, [promptId]);

    const t = UI_TEXT[lang];

    const filteredPrompts = prompts.filter(p => {
        const matchesSearch =
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.english.toLowerCase().includes(search.toLowerCase()) ||
            p.spanish.toLowerCase().includes(search.toLowerCase()) ||
            p.codeEn.toLowerCase().includes(search.toLowerCase()) ||
            p.codeEs.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === 'all' || p.category === category;
        return matchesSearch && matchesCategory;

    });

    // Sort Logic
    if (sortConfig.key) {
        filteredPrompts.sort((a, b) => {
            let valA = '';
            let valB = '';

            if (sortConfig.key === 'title') {
                valA = lang === 'en' ? a.title : (a.titleEs || a.title);
                valB = lang === 'en' ? b.title : (b.titleEs || b.title);
            } else if (sortConfig.key === 'english') {
                valA = a.codeEn || '';
                valB = b.codeEn || '';
            } else if (sortConfig.key === 'spanish') {
                valA = a.codeEs || '';
                valB = b.codeEs || '';
            }

            return sortConfig.direction === 'asc'
                ? valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' })
                : valB.localeCompare(valA, undefined, { numeric: true, sensitivity: 'base' });
        });
    } else {
        // Default Sort by Highlight (Active)
        filteredPrompts.sort((a, b) => {
            const now = new Date();
            const isA = a.highlightExpiresAt && new Date(a.highlightExpiresAt) > now && (!a.highlightStartsAt || new Date(a.highlightStartsAt) <= now);
            const isB = b.highlightExpiresAt && new Date(b.highlightExpiresAt) > now && (!b.highlightStartsAt || new Date(b.highlightStartsAt) <= now);

            if (isA && !isB) return -1;
            if (!isA && isB) return 1;
            return 0;
        });
    }

    const scrollToCard = (id: string) => {
        // If in list mode, expand the target
        if (viewMode === 'list') {
            setExpandedId(id);
        } else {
            setViewMode('grid');
        }

        setTimeout(() => {
            const element = document.getElementById(`prompt-${id}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('ring-2', 'ring-green-500', 'ring-offset-2');
                setTimeout(() => element.classList.remove('ring-2', 'ring-green-500', 'ring-offset-2'), 2000);
            }
        }, 100);
    };

    const getSortIcon = (key: 'title' | 'english' | 'spanish') => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'asc' ? '↑' : '↓';
        }
        return null;
    };

    return (
        <div suppressHydrationWarning className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#0a0a0a] text-slate-100' : 'bg-[#FFFBF0] text-slate-800'}`}>
            {/* Toolbar (Simplified: Search & Filters only) */}
            <div className={`sticky top-16 z-40 border-b backdrop-blur-md transition-colors duration-300 ${darkMode ? 'bg-[#1B1F22]/90 border-gray-800' : 'bg-white/90 border-slate-200'}`}>
                <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Title */}
                        <div>
                            <h1 className="text-xl font-black tracking-tight">WhatsApp Prompts <span className="text-[#EF4D23]">2025</span></h1>
                            <p suppressHydrationWarning className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t.subtitle}</p>
                        </div>

                        {/* Search & View Controls */}
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            {/* Admin Controls */}
                            {currentUser?.role === 'admin' && (
                                <div className="flex items-center gap-2 mr-2 border-r border-gray-200 dark:border-gray-700 pr-4">
                                    <button
                                        onClick={handleExportClick}
                                        className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                                        title="Export Prompts"
                                    >
                                        <Share2 size={18} className="rotate-180" /> {/* Simulate Download/Export icon */}
                                    </button>
                                    <button
                                        onClick={() => setShowRestoreWizard(true)}
                                        className="p-2 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
                                        title="Import Prompts"
                                    >
                                        <Share2 size={18} /> {/* Simulate Upload/Import icon */}
                                    </button>
                                </div>
                            )}

                            <div className="relative flex-1 md:w-96">
                                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} size={18} />
                                <input
                                    type="text"
                                    placeholder={t.searchPlaceholder}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium transition-all border outline-none focus:ring-2 focus:ring-[#EF4D23]/50 ${darkMode
                                        ? 'bg-gray-800 border-gray-700 text-white placeholder-slate-500'
                                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
                                        }`}
                                />
                            </div>

                            <div className={`flex items-center p-1 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-slate-50 border-slate-200'}`}>
                                <button onClick={() => handleViewModeChange('grid')} className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? (darkMode ? 'bg-gray-700 text-white shadow-sm' : 'bg-white text-slate-800 shadow-sm') : 'text-slate-400 hover:text-slate-500'}`}>
                                    <Grid size={18} />
                                </button>
                                <button onClick={() => handleViewModeChange('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? (darkMode ? 'bg-gray-700 text-white shadow-sm' : 'bg-white text-slate-800 shadow-sm') : 'text-slate-400 hover:text-slate-500'}`}>
                                    <List size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Categories - Now matching MQA visually */}
                    <div className="flex gap-2 justify-start md:justify-center overflow-x-auto pb-2 hide-scrollbar">
                        <button
                            onClick={() => setCategory('all')}
                            className={`px-5 py-2 rounded-full text-sm font-bold transition shadow-sm border ${category === 'all' ? 'bg-[#EF4D23] border-[#EF4D23] text-white ring-2 ring-[#EF4D23]/30' : 'bg-white dark:bg-gray-800 border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >
                            {lang === 'es' ? 'Todos' : 'All'}
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
                                    {lang === 'es' ? style.labelEs : style.labelEn}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {viewMode === 'list' && filteredPrompts.length > 0 && (
                    <div className={`hidden md:flex items-center justify-between px-6 py-2 mb-2 text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        <div
                            onClick={() => handleSort('title')}
                            className="cursor-pointer hover:text-[#EF4D23] transition-colors flex items-center gap-1 select-none"
                        >
                            {t.titleHeader}
                            {getSortIcon('title')}
                        </div>
                        <div className="flex gap-16 pr-4">
                            <span
                                onClick={() => handleSort('english')}
                                className="cursor-pointer hover:text-[#EF4D23] transition-colors flex items-center gap-1 select-none"
                            >
                                {t.english}
                                {getSortIcon('english')}
                            </span>
                            <span
                                onClick={() => handleSort('spanish')}
                                className="cursor-pointer hover:text-[#EF4D23] transition-colors flex items-center gap-1 select-none"
                            >
                                {t.spanish}
                                {getSortIcon('spanish')}
                            </span>
                        </div>
                    </div>
                )}

                <div className={`grid gap-6 ${viewMode === 'list' ? 'grid-cols-1 gap-2' : 'grid-cols-1 lg:grid-cols-2'}`}>
                    {filteredPrompts.map(prompt => (
                        <PromptCard
                            key={prompt.id}
                            prompt={prompt}
                            viewMode={viewMode}
                            lang={lang}
                            isExpanded={expandedId === prompt.id}
                            onToggle={() => toggleExpand(prompt.id)}
                            t={t}
                            darkMode={darkMode}
                        />
                    ))}
                </div>

                {filteredPrompts.length === 0 && (
                    <div className="text-center py-20">
                        <div className={`inline-flex p-4 rounded-full mb-4 ${darkMode ? 'bg-slate-800 text-slate-600' : 'bg-slate-100 text-slate-400'}`}>
                            <Search size={40} />
                        </div>
                        <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{t.noPrompts}</h3>
                        <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>{t.noPromptsDesc}</p>
                    </div>
                )}
            </main>

            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                onConfirm={handleExportConfirm}
                defaultFilename={`backup_prompts_${new Date().toISOString().slice(0, 10)}`}
                title={language === 'es' ? 'Exportar Prompts' : 'Export Prompts'}
            />

            {showRestoreWizard && (
                <ContentRestoreWizard
                    scope="prompts"
                    onSuccess={() => setShowRestoreWizard(false)}
                    onClose={() => setShowRestoreWizard(false)}
                />
            )}
        </div>
    );
}

const ClickableCode = ({ code, text, lang, darkMode, promptId }: { code: string, text: string, lang: 'en' | 'es', darkMode: boolean, promptId: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent row expansion
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 800);

        // Track usage
        try {
            await fetch('/api/usage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'prompt', id: promptId, language: lang })
            });
        } catch (error) {
            console.error('Failed to track usage', error);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className={`
                relative inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-mono font-bold text-sm transition-all duration-200 min-w-[60px]
                ${copied
                    ? 'bg-green-500 text-white scale-105 shadow-md'
                    : darkMode
                        ? 'bg-slate-800 text-blue-300 hover:bg-slate-700 hover:text-white'
                        : lang === 'en'
                            ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700'
                }
            `}
            title="Clic para copiar prompt"
        >
            {copied ? <Check size={14} /> : code}
        </button>
    );
};



function PromptCard({ prompt, darkMode, viewMode, lang, isExpanded, onToggle, t }: { prompt: any, darkMode: boolean, viewMode: string, lang: 'en' | 'es', isExpanded?: boolean, onToggle?: () => void, t: any }) {
    const catStyle = CATEGORIES[prompt.category] || CATEGORIES['General'];
    const now = new Date();
    const isHighlighted = prompt.highlightExpiresAt && new Date(prompt.highlightExpiresAt) > now && (!prompt.highlightStartsAt || new Date(prompt.highlightStartsAt) <= now);
    const highlightStyle = isHighlighted ? {
        borderColor: prompt.highlightColor || '#EF4D23',
        borderWidth: '2px',
        backgroundColor: prompt.highlightColor ? `${prompt.highlightColor}10` : undefined
    } : {};

    const [copiedShare, setCopiedShare] = useState(false);

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        const url = `${window.location.origin}/prompts?id=${prompt.id}`;
        navigator.clipboard.writeText(url);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2000);
    };

    if (viewMode === 'list') {
        return (
            <div id={`prompt-${prompt.id}`} style={highlightStyle} className={`rounded-xl border transition-all duration-200 relative ${darkMode ? 'bg-[#151719] border-gray-800' : 'bg-white border-slate-100 shadow-sm hover:shadow-md'}`}>
                {isHighlighted && (
                    <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 w-fit rounded-br-lg rounded-tl-lg absolute z-10 left-0 top-0">
                        UPDATED
                    </div>
                )}
                {/* List Row Header */}
                <div
                    onClick={onToggle}
                    className={`px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${isExpanded ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}
                >
                    <div className="flex items-center gap-3 flex-1 ml-4 md:ml-0">
                        <h3 className={`font-bold text-sm ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                            {lang === 'en' ? prompt.title : (prompt.titleEs || prompt.title)}
                        </h3>
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                            {prompt.category}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 self-end md:self-auto">
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase mr-2 md:hidden ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>EN</span>
                            <ClickableCode
                                code={prompt.codeEn}
                                text={prompt.english}
                                lang="en"
                                darkMode={darkMode}
                                promptId={prompt.id}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase mr-2 md:hidden ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>ES</span>
                            <ClickableCode
                                code={prompt.codeEs}
                                text={prompt.spanish}
                                lang="es"
                                darkMode={darkMode}
                                promptId={prompt.id}
                            />
                        </div>
                    </div>

                    {/* Share Button (List View) */}
                    <button
                        onClick={handleShare}
                        className={`p-2 ml-2 rounded-full transition ${copiedShare ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400'}`}
                        title={lang === 'es' ? "Copiar enlace" : "Copy link"}
                    >
                        {copiedShare ? <CheckCircle2 size={16} /> : <Share2 size={16} />}
                    </button>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                    <div className={`px-6 py-6 border-t grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-200 ${darkMode ? 'border-gray-800 bg-[#0a0a0a]/50' : 'border-slate-100 bg-slate-50/50'}`}>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">🇺🇸</span>
                                <span className={`text-xs font-bold uppercase ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>English</span>
                            </div>
                            <CopyableExpandedContent
                                text={prompt.english}
                                lang="en"
                                promptId={prompt.id}
                                darkMode={darkMode}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">🇪🇸</span>
                                <span className={`text-xs font-bold uppercase ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Español</span>
                            </div>
                            <CopyableExpandedContent
                                text={prompt.spanish}
                                lang="es"
                                promptId={prompt.id}
                                darkMode={darkMode}
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Grid View (Original Card)
    return (
        <div id={`prompt-${prompt.id}`} style={highlightStyle} className={`rounded-2xl border overflow-hidden transition-all duration-300 relative ${darkMode ? 'bg-[#151719] border-gray-700' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'}`}>
            {isHighlighted && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg z-10">
                    UPDATED
                </div>
            )}
            {/* Card Header */}
            <div className={`px-5 py-3 border-b flex justify-between items-center ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-slate-100 bg-slate-50/50'}`}>
                <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${catStyle.bg} ${catStyle.color} border`}>
                        {catStyle.icon && <catStyle.icon size={16} className={catStyle.text} />}
                    </div>
                    <div>
                        <h3 className={`font-bold text-sm ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                            {lang === 'en' ? prompt.title : (prompt.titleEs || prompt.title)}
                        </h3>
                        <p className={`text-[10px] uppercase tracking-wider font-semibold ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{prompt.category}</p>
                    </div>
                </div>

                {/* Share Button (Grid View) */}
                <button
                    onClick={handleShare}
                    className={`p-2 rounded-full transition ${copiedShare ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400'}`}
                    title={lang === 'es' ? "Copiar enlace" : "Copy link"}
                >
                    {copiedShare ? <CheckCircle2 size={16} /> : <Share2 size={16} />}
                </button>
            </div>

            {/* Card Body */}
            <div className="p-5 grid gap-4 grid-cols-1 md:grid-cols-2">
                <CopyBlock
                    text={prompt.english}
                    code={prompt.codeEn}
                    lang="en"
                    darkMode={darkMode}
                    promptId={prompt.id}
                />
                <CopyBlock
                    text={prompt.spanish}
                    code={prompt.codeEs}
                    lang="es"
                    darkMode={darkMode}
                    promptId={prompt.id}
                />
            </div>
        </div>
    );
}

function CopyBlock({ text, code, lang, darkMode, promptId }: { text: string, code: string, lang: string, darkMode: boolean, promptId: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);

        // Track usage
        try {
            await api.usage.track('prompt', promptId, lang);
        } catch (error) {
            console.error('Failed to track usage', error);
        }
    };

    return (
        <div
            onClick={handleCopy}
            className={`
                relative group cursor-pointer rounded-xl p-5 transition-all duration-200 border h-full flex flex-col
                ${darkMode
                    ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-gray-500'
                    : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-indigo-300 hover:shadow-md'
                }
            `}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col">
                    <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {lang === 'en' ? '🇺🇸 English' : '🇪🇸 Español'}
                    </span>
                    <span className={`text-2xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                        {code}
                    </span>
                </div>
                <span className={`
                    text-xs px-2 py-1 rounded-md transition-all flex items-center gap-1 font-medium
                    ${copied
                        ? 'bg-green-500 text-white shadow-sm'
                        : 'bg-slate-200 text-slate-500 opacity-0 group-hover:opacity-100'
                    }
                `}>
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                </span>
            </div>

            <p className={`whitespace-pre-wrap text-xs leading-relaxed font-mono mt-auto ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {text}
            </p>

            {copied && (
                <div className="absolute inset-0 bg-green-500/5 rounded-xl animate-pulse pointer-events-none border-2 border-green-500" />
            )}
        </div>
    );
}

function CopyableExpandedContent({ text, lang, promptId, darkMode }: { text: string, lang: string, promptId: string, darkMode: boolean }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);

        // Track usage
        try {
            await api.usage.track('prompt', promptId, lang);
        } catch (error) {
            console.error('Failed to track usage', error);
        }
    };

    return (
        <div
            onClick={handleCopy}
            className={`p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap cursor-pointer relative group transition-all
                ${darkMode
                    ? 'bg-gray-800 text-slate-300 hover:bg-gray-700'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                }
            `}
            title="Clic para copiar"
        >
            {text}
            <div className={`absolute top-2 right-2 p-1.5 rounded-md transition-all duration-200 ${copied ? 'opacity-100 bg-green-500 text-white' : 'opacity-0 group-hover:opacity-100 bg-gray-100 dark:bg-gray-600 text-gray-400 dark:text-gray-300'}`}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
            </div>
        </div>
    );
}
