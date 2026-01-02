'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, MessageSquare } from 'lucide-react';
import { useAKC } from '@/context/AKCContext';

interface AgentAnalyticsViewProps {
    user: any;
    caseInteractions: any[];
    promptInteractions: any[];
    languageStats: { en: number; es: number; total: number };
}

export default function AgentAnalyticsView({ user, caseInteractions, promptInteractions, languageStats }: AgentAnalyticsViewProps) {
    const { language } = useAKC();

    const t = {
        totalInteractions: language === 'es' ? 'Interacciones Totales' : 'Total Interactions',
        prefers: language === 'es' ? 'Prefiere' : 'Prefers',
        topCases: language === 'es' ? 'Casos de Soporte Más Usados' : 'Top Support Cases',
        topPrompts: language === 'es' ? 'Prompts de WhatsApp Más Usados' : 'Top WhatsApp Prompts',
        caseTitle: language === 'es' ? 'Título del Caso' : 'Case Title',
        promptTitle: language === 'es' ? 'Título del Prompt' : 'Prompt Title',
        visits: language === 'es' ? 'Visitas' : 'Visits',
        uses: language === 'es' ? 'Usos' : 'Uses',
        noActivity: language === 'es' ? 'Sin actividad registrada.' : 'No activity recorded.',
        other: language === 'es' ? 'Otro' : 'Other',
        dashboard: language === 'es' ? 'Panel de Estadísticas' : 'Analytics Dashboard',
        welcome: language === 'es' ? 'Bienvenido de nuevo,' : 'Welcome back,',
    };

    const preferredLang = languageStats.es >= languageStats.en ? (language === 'es' ? 'Español' : 'Spanish') : (language === 'es' ? 'Inglés' : 'English');
    const preferredLangPct = languageStats.total > 0
        ? Math.round((Math.max(languageStats.es, languageStats.en) / languageStats.total) * 100)
        : 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="bg-white dark:bg-[#1B1F22] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/analytics"
                        className="p-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                    >
                        <ArrowLeft size={24} />
                    </Link>
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#EF4D23] to-orange-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-orange-500/20">
                        {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            {t.welcome} <span className="text-[#EF4D23]">{user.firstName}</span>
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            {user.email} • <span className="uppercase tracking-wider text-xs font-bold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">{user.role}</span>
                        </p>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="flex gap-6 bg-gray-50 dark:bg-[#151719] p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div className="text-center">
                        <div className="text-2xl font-black text-gray-900 dark:text-white">{user._count?.interactions || 0}</div>
                        <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{t.totalInteractions}</div>
                    </div>
                    {languageStats.total > 0 && (
                        <>
                            <div className="w-px bg-gray-200 dark:bg-gray-700"></div>
                            <div className="text-center">
                                <div className="text-2xl font-black text-green-500">{preferredLangPct}%</div>
                                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{preferredLang}</div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Cases Usage */}
                <div className="bg-white dark:bg-[#1B1F22] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
                    <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                <FileText size={20} />
                            </div>
                            <h2 className="font-bold text-lg text-gray-900 dark:text-white">{t.topCases}</h2>
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-2">
                            {caseInteractions.length > 0 ? (
                                <div className="space-y-2">
                                    {caseInteractions.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition group border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 font-bold text-xs group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                                    {idx + 1}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-bold text-gray-900 dark:text-white text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        {language === 'es' ? (item.title_es || item.title_en) : (item.title_en || item.title_es)}
                                                    </div>
                                                    <div className="text-xs text-gray-500 truncate">{item.category}</div>
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg font-bold text-sm text-gray-700 dark:text-gray-300">
                                                {item.count}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                    <FileText size={48} className="mb-4 opacity-20" />
                                    <p>{t.noActivity}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Prompts Usage */}
                <div className="bg-white dark:bg-[#1B1F22] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
                    <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-900/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                                <MessageSquare size={20} />
                            </div>
                            <h2 className="font-bold text-lg text-gray-900 dark:text-white">{t.topPrompts}</h2>
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-2">
                            {promptInteractions.length > 0 ? (
                                <div className="space-y-2">
                                    {promptInteractions.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition group border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 font-bold text-xs group-hover:bg-green-500 group-hover:text-white transition-colors">
                                                    {idx + 1}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-bold text-gray-900 dark:text-white text-sm truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                                        {language === 'es' ? (item.title_es || item.title) : item.title}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{item.category}</span>
                                                        <div className="flex gap-1">
                                                            {item.es > 0 && <span className="w-2 h-2 rounded-full bg-orange-500" title={`ES: ${item.es}`}></span>}
                                                            {item.en > 0 && <span className="w-2 h-2 rounded-full bg-blue-500" title={`EN: ${item.en}`}></span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg font-bold text-sm text-gray-700 dark:text-gray-300">
                                                {item.count}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                    <MessageSquare size={48} className="mb-4 opacity-20" />
                                    <p>{t.noActivity}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
