'use client';

import React from 'react';
import { useAKC } from '@/context/AKCContext';
import { History, FileText, MessageSquare, Plus, Edit, Trash, User } from 'lucide-react';

import { useRouter } from 'next/navigation';
import AuditLogDetailModal from './AuditLogDetailModal';

interface AuditLogListProps {
    logs: any[];
}

export default function AuditLogList({ logs }: AuditLogListProps) {
    const { language } = useAKC();
    const router = useRouter();
    const [selectedLog, setSelectedLog] = React.useState<any>(null);

    const handleRevert = async (id: string, keys?: string[]) => {
        const res = await fetch(`/api/audit/${id}/revert`, {
            method: 'POST',
            body: JSON.stringify({ keys }),
            headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error('Revert failed');
        router.refresh();
    };

    const t = {
        title: language === 'es' ? 'Registro de Auditoría de Contenido' : 'Content Audit Log',
        subtitle: language === 'es' ? 'Historial de cambios realizados en casos y prompts.' : 'History of changes made to cases and prompts.',
        headers: {
            admin: language === 'es' ? 'Administrador' : 'Admin',
            action: language === 'es' ? 'Acción' : 'Action',
            entity: language === 'es' ? 'Entidad' : 'Entity',
            details: language === 'es' ? 'Detalles' : 'Details',
            date: language === 'es' ? 'Fecha' : 'Date',
        },
        noLogs: language === 'es' ? 'No hay registros de actividad.' : 'No activity logs found.',
        actions: {
            CREATE: language === 'es' ? 'Crear' : 'Create',
            UPDATE: language === 'es' ? 'Editar' : 'Update',
            DELETE: language === 'es' ? 'Eliminar' : 'Delete',
        },
        entities: {
            CASE: language === 'es' ? 'Caso' : 'Case',
            PROMPT: language === 'es' ? 'Prompt' : 'Prompt',
        }
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'CREATE': return <Plus size={14} className="text-emerald-500" />;
            case 'UPDATE': return <Edit size={14} className="text-blue-500" />;
            case 'DELETE': return <Trash size={14} className="text-red-500" />;
            default: return <History size={14} />;
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'CREATE': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800';
            case 'UPDATE': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
            case 'DELETE': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="space-y-4 pt-8 border-t border-gray-200 dark:border-gray-800">
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <History size={20} />
                    {t.title}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t.subtitle}</p>
            </div>

            <div className="bg-white dark:bg-[#1B1F22] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.headers.admin}</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.headers.action}</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.headers.entity}</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.headers.details}</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">{t.headers.date}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {logs.map((log) => (
                                <tr
                                    key={log.id}
                                    onClick={() => setSelectedLog(log)}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-900 transition cursor-pointer active:bg-gray-100 dark:active:bg-gray-800"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                                                {log.user.firstName ? log.user.firstName[0] : log.user.email[0].toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {log.user.firstName} {log.user.lastName}
                                                </span>
                                                <span className="text-xs text-gray-500">{log.user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getActionColor(log.action)}`}>
                                            {getActionIcon(log.action)}
                                            {t.actions[log.action as keyof typeof t.actions] || log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
                                            {log.entity === 'CASE' ? <FileText size={14} /> : <MessageSquare size={14} />}
                                            {t.entities[log.entity as keyof typeof t.entities] || log.entity}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate" title={log.details}>
                                            {log.details}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-right text-xs text-gray-500 whitespace-nowrap">
                                        {new Date(log.createdAt).toLocaleString(language === 'es' ? 'es-ES' : 'en-US')}
                                    </td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        {t.noLogs}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedLog && (
                <AuditLogDetailModal
                    log={selectedLog}
                    onClose={() => setSelectedLog(null)}
                    onRevert={handleRevert}
                />
            )}
        </div>
    );
}
