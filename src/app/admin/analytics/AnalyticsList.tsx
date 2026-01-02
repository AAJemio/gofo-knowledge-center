'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, ChevronRight } from 'lucide-react';
import { useAKC } from '@/context/AKCContext';

interface AnalyticsListProps {
    users: any[];
}

export default function AnalyticsList({ users }: AnalyticsListProps) {
    const { language } = useAKC();
    const router = useRouter();

    const t = {
        title: language === 'es' ? 'Analítica de Agentes' : 'Agent Analytics',
        subtitle: language === 'es' ? 'Auditoría de actividad y uso de contenido.' : 'Audit agent activity and content usage.',
        headers: {
            user: language === 'es' ? 'Usuario' : 'User',
            role: language === 'es' ? 'Rol' : 'Role',
            interactions: language === 'es' ? 'Interacciones Totales' : 'Total Interactions',
            details: language === 'es' ? 'Detalles' : 'Details',
        },
        recordedEvents: language === 'es' ? 'Eventos registrados' : 'Recorded events',
        viewActivity: language === 'es' ? 'Ver Actividad' : 'View Activity',
        noAgents: language === 'es' ? 'No se encontraron agentes.' : 'No agents found.',
        agentRole: language === 'es' ? 'Agente' : 'Agent',
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t.title}</h1>
                <p className="text-gray-500 dark:text-gray-400">{t.subtitle}</p>
            </div>

            <div className="bg-white dark:bg-[#1B1F22] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm transition-colors duration-300">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.headers.user}</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.headers.role}</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.headers.interactions}</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">{t.headers.details}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {users.map((user: any) => (
                            <tr
                                key={user.id}
                                onClick={() => router.push(`/admin/analytics/${user.id}`)}
                                className="hover:bg-gray-50 dark:hover:bg-gray-900 transition group cursor-pointer"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[#EF4D23] font-bold">
                                            {user.firstName ? user.firstName[0] : user.email[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white">
                                                {user.firstName} {user.lastName}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {user.role === 'admin' ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800">
                                            <User size={12} /> {language === 'es' ? 'Admin' : 'Admin'}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800">
                                            <User size={12} /> {t.agentRole}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                                            {user._count?.interactions || user.usageCount || 0}
                                        </span>
                                        <span className="text-xs text-gray-400">{t.recordedEvents}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="inline-flex items-center gap-1 text-[#EF4D23] hover:text-[#d63f1a] font-medium text-sm transition">
                                        {t.viewActivity} <ChevronRight size={16} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                    {t.noAgents}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
