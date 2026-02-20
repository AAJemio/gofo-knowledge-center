
'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Calendar, TrendingUp, Clock, MessageSquare, ArrowUp, ArrowDown } from 'lucide-react';

import { useAKC } from '@/context/AKCContext';

export default function AgentKPIView({ userId }: { userId?: string }) {
    const { language } = useAKC();
    const [stats, setStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState('7'); // '1', '7', '30', 'all', 'custom'
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    const t = {
        es: {
            title: "Métricas de Rendimiento",
            allTime: "Todo",
            days: "Días",
            custom: "Personalizado",
            from: "Desde:",
            to: "Hasta:",
            loading: "Cargando métricas...",
            noData: "No se encontraron registros de KPI para este periodo.",
            metrics: {
                csat: "CSAT Promedio",
                conversations: "Total Conversaciones",
                avgDay: "Promedio / día",
                outbound: "Total Salientes",
                online: "Tiempo en Línea",
                firstResponse: "1ra Respuesta (Prom)",
                resolution: "Resolución (Prom)"
            },
            table: {
                date: "Fecha",
                conversations: "Conversaciones",
                outbound: "Msj Salientes",
                online: "T. en Línea",
                available: "T. Disponible",
                firstResponse: "1ra Respuesta",
                resolution: "T. Resolución",
                csat: "CSAT"
            }
        },
        en: {
            title: "Performance Metrics",
            allTime: "All Time",
            days: "Days",
            custom: "Custom",
            from: "From:",
            to: "To:",
            loading: "Loading metrics...",
            noData: "No KPI records found for this period.",
            metrics: {
                csat: "Avg CSAT",
                conversations: "Total Conversations",
                avgDay: "Avg / day",
                outbound: "Total Outbound",
                online: "Total Online Time",
                firstResponse: "First Response (Avg)",
                resolution: "Resolution Time (Avg)"
            },
            table: {
                date: "Date",
                conversations: "Conversations",
                outbound: "Outbound Msgs",
                online: "Online Time",
                available: "Available Time",
                firstResponse: "First Response",
                resolution: "Resolution Time",
                csat: "CSAT"
            }
        }
    };

    const text = language === 'es' ? t.es : t.en;

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                // Fetch logic - adapt based on userId prop (for admin view of agent) or current user
                const url = userId ? `/api/admin/kpi/stats?userId=${userId}` : '/api/kpi/my';
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch KPIs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [userId]);

    const filteredStats = stats.filter(s => {
        const itemDate = new Date(s.date);
        const now = new Date();
        itemDate.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);

        if (range === 'custom') {
            if (!customStart || !customEnd) return true; // Show all if incomplete
            const start = new Date(customStart);
            const end = new Date(customEnd);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
            return itemDate >= start && itemDate <= end;
        }

        if (range === 'all') return true;

        const diffTime = Math.abs(now.getTime() - itemDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Correction: if '1' means "Last 1 Day", it might be inclusive of zero.
        return diffDays <= parseInt(range);
    });

    // Help for traffic light color - Restored per user request (Image 2)
    const getCsatColor = (score: number) => {
        if (score >= 90) return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'; // >= 90% (Excelente)
        if (score >= 70) return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'; // 70% - 89% (Regular)
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'; // < 70% (Crítico)
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return s > 0 ? `${h}h ${m}m ${s}s` : `${h}h ${m}m`;
    };

    if (loading) return <div className="p-8 text-center text-gray-500">{text.loading}</div>;

    // Calculate averages/totals for cards
    const count = filteredStats.length || 1; // Avoid division by zero
    const totals = filteredStats.reduce((acc, curr) => ({
        csat: acc.csat + curr.csat,
        conversations: acc.conversations + curr.conversations,
        outbound: acc.outbound + curr.outboundMessages,
        online: acc.online + curr.onlineTimeSeconds,
        available: acc.available + curr.availableTimeSeconds,
        firstResponse: acc.firstResponse + curr.firstResponseTimeSeconds,
        resolution: acc.resolution + curr.resolutionTimeSeconds,
    }), { csat: 0, conversations: 0, outbound: 0, online: 0, available: 0, firstResponse: 0, resolution: 0 });

    const metrics = [
        {
            id: 'conversations',
            label: text.metrics.conversations,
            value: totals.conversations,
            subValue: `${(totals.conversations / count).toFixed(1)} ${text.metrics.avgDay}`,
            colorClass: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
        },
        { id: 'firstResponse', label: text.metrics.firstResponse, value: formatTime(totals.firstResponse / count), colorClass: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800' },
        { id: 'resolution', label: text.metrics.resolution, value: formatTime(totals.resolution / count), colorClass: 'bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800' },
        { id: 'csat', label: text.metrics.csat, value: (totals.csat / count).toFixed(1) + '%', colorClass: getCsatColor(totals.csat / count) },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                    <TrendingUp className="text-[#EF4D23]" />
                    {text.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                    {['1', '7', '30', 'all', 'custom'].map(r => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`px-4 py-2 text-sm font-bold rounded-full border transition-all duration-200 ${range === r
                                ? 'bg-[#EF4D23] text-white border-[#EF4D23] shadow-md transform scale-105'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                                }`}
                        >
                            {r === 'all' ? text.allTime : (r === 'custom' ? text.custom : `${r} ${text.days}`)}
                        </button>
                    ))}
                </div>
            </div>

            {range === 'custom' && (
                <div className="flex bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 shadow-sm">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{text.from}</span>
                            <input
                                type="date"
                                value={customStart}
                                onChange={(e) => setCustomStart(e.target.value)}
                                className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#EF4D23] outline-none dark:text-white dark:[color-scheme:dark]"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{text.to}</span>
                            <input
                                type="date"
                                value={customEnd}
                                onChange={(e) => setCustomEnd(e.target.value)}
                                className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#EF4D23] outline-none dark:text-white dark:[color-scheme:dark]"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {metrics.map(metric => (
                    <div
                        key={metric.id}
                        className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all duration-200 ${metric.colorClass} shadow-sm`}
                    >
                        <span className="text-xs font-bold uppercase tracking-wider opacity-90">{metric.label}</span>
                        <span className="text-2xl font-black mt-1">{metric.value}</span>
                        {/* @ts-ignore */}
                        {metric.subValue && (
                            <span className="text-[10px] font-bold mt-1 opacity-80 uppercase bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-full">
                                {/* @ts-ignore */}
                                {metric.subValue}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {filteredStats.length === 0 ? (
                <div className="p-8 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    {text.noData}
                </div>
            ) : (
                /* Table */
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase font-bold text-gray-900 dark:text-gray-200">
                                <tr>
                                    <th className="px-4 py-4 whitespace-nowrap">{text.table.date}</th>
                                    <th className="px-4 py-4 text-right whitespace-nowrap">{text.table.conversations}</th>
                                    <th className="px-4 py-4 text-right whitespace-nowrap">{text.table.outbound}</th>
                                    <th className="px-4 py-4 text-right whitespace-nowrap">{text.table.online}</th>
                                    <th className="px-4 py-4 text-right whitespace-nowrap">{text.table.available}</th>
                                    <th className="px-4 py-4 text-right whitespace-nowrap">{text.table.firstResponse}</th>
                                    <th className="px-4 py-4 text-right whitespace-nowrap">{text.table.resolution}</th>
                                    <th className="px-4 py-4 text-center whitespace-nowrap">{text.table.csat}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                                {filteredStats.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(stat => (
                                    <tr key={stat.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-4 py-4 font-medium flex items-center gap-2 whitespace-nowrap text-gray-900 dark:text-white">
                                            <Calendar size={14} className="text-gray-400" />
                                            {new Date(stat.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-4 text-right font-mono text-gray-600 dark:text-gray-300">
                                            {stat.conversations}
                                        </td>
                                        <td className="px-4 py-4 text-right font-mono text-gray-600 dark:text-gray-300">
                                            {stat.outboundMessages}
                                        </td>
                                        <td className="px-4 py-4 text-right text-gray-500 whitespace-nowrap">
                                            {formatTime(stat.onlineTimeSeconds)}
                                        </td>
                                        <td className="px-4 py-4 text-right text-gray-500 whitespace-nowrap">
                                            {formatTime(stat.availableTimeSeconds)}
                                        </td>
                                        <td className="px-4 py-4 text-right text-gray-500 whitespace-nowrap">
                                            {formatTime(stat.firstResponseTimeSeconds)}
                                        </td>
                                        <td className="px-4 py-4 text-right text-gray-500 whitespace-nowrap">
                                            {formatTime(stat.resolutionTimeSeconds)}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-md font-bold text-xs ${getCsatColor(stat.csat)}`}>
                                                {stat.csat}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
