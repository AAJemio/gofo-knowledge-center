'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, RefreshCw, Calendar, AlertTriangle, CheckCircle, RotateCcw, X, Lock, Download, FileText, History } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AdminKPIUpload from './AdminKPIUpload';

interface DaySummary {
    date: string;
    count: number;
    lastUpdated: string;
    sourceFile?: {
        id: string;
        filename: string;
    } | null;
}

interface ActivityLogItem {
    id: string;
    action: string;
    details: string;
    createdAt: string;
    admin: {
        firstName: string;
        lastName: string;
    };
    targetDate?: string;
}

interface Backup {
    records: any[];
    expiry: number;
}

interface AdminDataManagementProps {
    onTargetUpdate?: () => void;
}

export default function AdminDataManagement({ onTargetUpdate }: AdminDataManagementProps) {
    const [summaries, setSummaries] = useState<DaySummary[]>([]);
    const [activityLog, setActivityLog] = useState<ActivityLogItem[]>([]);
    const [lockDate, setLockDate] = useState<string>(''); // YYYY-MM-DD
    const [loading, setLoading] = useState(true);

    // Actions Stae
    const [deleting, setDeleting] = useState<string | null>(null);
    const [updatingLock, setUpdatingLock] = useState(false);
    const [updatingTarget, setUpdatingTarget] = useState(false);
    const [dailyTarget, setDailyTarget] = useState<number>(100);
    const [undoAvailable, setUndoAvailable] = useState<Backup | null>(null);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const router = useRouter();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/kpi/manage');
            if (res.ok) {
                const data = await res.json();
                setSummaries(data.summaries);
                setActivityLog(data.activityLog);
                if (data.lockDate) {
                    setLockDate(new Date(data.lockDate).toISOString().split('T')[0]);
                } else {
                    setLockDate('');
                }
                if (data.dailyTarget) {
                    setDailyTarget(data.dailyTarget);
                }
            }
        } catch (error) {
            console.error('Failed to fetch management data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSetLockDate = async () => {
        setUpdatingLock(true);
        try {
            const res = await fetch('/api/admin/kpi/config/lock', {
                method: 'POST',
                body: JSON.stringify({ lockDate: lockDate || null }),
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                setStatusMsg({ type: 'success', text: 'Lock date updated successfully.' });
                fetchData(); // Refresh logs
            }
        } catch (error) {
            setStatusMsg({ type: 'error', text: 'Failed to update lock date.' });
        } finally {
            setUpdatingLock(false);
        }
    };

    const handleSetDailyTarget = async () => {
        setUpdatingTarget(true);
        try {
            const res = await fetch('/api/admin/kpi/config/target', {
                method: 'POST',
                body: JSON.stringify({ target: dailyTarget }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                setStatusMsg({ type: 'success', text: 'Daily target updated successfully.' });
                fetchData(); // Refresh logs to see action
                if (onTargetUpdate) onTargetUpdate(); // Notify parent
            }
        } catch (error) {
            setStatusMsg({ type: 'error', text: 'Failed to update daily target.' });
        } finally {
            setUpdatingTarget(false);
        }
    };


    const handleDelete = async (date: string) => {
        // Client-side pre-check for lock
        if (lockDate && date <= lockDate) {
            alert('This period is locked for editing.');
            return;
        }

        if (!confirm('Are you sure you want to delete all KPI records for this date? This action can be undone immediately, but will be permanent once you leave this page.')) {
            return;
        }

        setDeleting(date);
        setStatusMsg(null);
        setUndoAvailable(null);

        try {
            const res = await fetch('/api/admin/kpi/manage', {
                method: 'DELETE',
                body: JSON.stringify({ date }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                const data = await res.json();
                setSummaries(prev => prev.filter(s => s.date !== date));
                setUndoAvailable({
                    records: data.backup,
                    expiry: Date.now() + 30000
                });
                setStatusMsg({ type: 'success', text: `Deleted ${data.deletedCount} records.` });
                fetchData(); // Refresh logs mainly
                router.refresh();
            } else {
                setStatusMsg({ type: 'error', text: 'Failed to delete records. Period might be locked.' });
            }
        } catch (error) {
            setStatusMsg({ type: 'error', text: 'Error executing delete.' });
        } finally {
            setDeleting(null);
        }
    };

    const handleUndo = async () => {
        if (!undoAvailable) return;

        try {
            const res = await fetch('/api/admin/kpi/manage', {
                method: 'POST',
                body: JSON.stringify({ records: undoAvailable.records }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                const data = await res.json();
                setStatusMsg({ type: 'success', text: `Restored ${data.restoredCount} records successfully.` });
                setUndoAvailable(null);
                fetchData();
                router.refresh();
            } else {
                setStatusMsg({ type: 'error', text: 'Failed to restore records.' });
            }
        } catch (error) {
            setStatusMsg({ type: 'error', text: 'Error executing restore.' });
        }
    };

    return (
        <div className="space-y-8">
            {/* Status Message */}
            {statusMsg && (
                <div className={`p-3 rounded-lg flex items-center justify-between ${statusMsg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'} border`}>
                    <div className="flex items-center gap-2 text-sm">
                        {statusMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                        {statusMsg.text}
                    </div>
                    {undoAvailable && statusMsg.type === 'success' && (
                        <button
                            onClick={handleUndo}
                            className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-white text-green-700 border border-green-300 rounded shadow-sm hover:bg-green-50 transition-colors animate-pulse"
                        >
                            <RotateCcw size={12} />
                            UNDO
                        </button>
                    )}
                </div>
            )}

            {/* Upload Section */}
            <AdminKPIUpload onUploadComplete={() => {
                fetchData();
                setStatusMsg({ type: 'success', text: 'Upload processed successfully.' });
            }} />

            {/* Config: System Settings (Locking & Targets) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Period Locking */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Lock className="text-gray-500" size={20} />
                            Period Locking
                        </h2>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg flex flex-col gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Lock Date (Inclusive)</label>
                            <p className="text-xs text-gray-400 mb-2">
                                Prevents editing for dates on or before this.
                            </p>
                            <input
                                type="date"
                                value={lockDate}
                                onChange={(e) => setLockDate(e.target.value)}
                                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#EF4D23] outline-none"
                            />
                        </div>
                        <button
                            onClick={handleSetLockDate}
                            disabled={updatingLock}
                            className="w-full px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            {updatingLock ? 'Saving...' : 'Update Lock Date'}
                        </button>
                    </div>
                </div>

                {/* Daily Target */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <FileText className="text-gray-500" size={20} />
                            Daily Targets
                        </h2>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg flex flex-col gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Conversation Target</label>
                            <p className="text-xs text-gray-400 mb-2">
                                Minimum daily concluded chats per agent.
                            </p>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="0"
                                    value={dailyTarget}
                                    onChange={(e) => setDailyTarget(parseInt(e.target.value) || 0)}
                                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#EF4D23] outline-none"
                                />
                                <span className="text-sm text-gray-500 font-medium">chats</span>
                            </div>
                        </div>
                        <button
                            onClick={handleSetDailyTarget}
                            disabled={updatingTarget}
                            className="w-full px-4 py-2 bg-[#EF4D23] text-white text-sm font-bold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                        >
                            {updatingTarget ? 'Saving...' : 'Update Target'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Manage Uploads */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Trash2 className="text-gray-500" size={20} />
                        Manage Uploads
                    </h2>
                    <button
                        onClick={fetchData}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        title="Refresh List"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>

                {loading ? (
                    <div className="py-8 text-center text-gray-400 animate-pulse">Loading records...</div>
                ) : summaries.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-xl">
                        No KPI data found.
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase font-bold text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3 text-right">Agents</th>
                                    <th className="px-4 py-3 text-right">Last Updated</th>
                                    <th className="px-4 py-3 text-center">Evidence</th>
                                    <th className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                                {summaries.map((day) => {
                                    const isLocked = lockDate && day.date <= lockDate;
                                    return (
                                        <tr key={day.date} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-4 py-3 font-mono text-gray-900 dark:text-gray-200">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} className="text-[#EF4D23]" />
                                                    {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                                    {isLocked && (
                                                        <span title="Locked Period">
                                                            <Lock size={12} className="text-gray-400 ml-1" />
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                                {day.count} records
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-500 text-xs">
                                                {new Date(day.lastUpdated).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {day.sourceFile ? (
                                                    <a
                                                        href={`/api/admin/kpi/download/${day.sourceFile.id}`}
                                                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline"
                                                    >
                                                        <FileText size={14} />
                                                        Download
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-300 text-xs">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => handleDelete(day.date)}
                                                    disabled={!!isLocked || deleting === day.date}
                                                    className={`p-1.5 rounded transition-colors ${isLocked
                                                        ? 'text-gray-300 cursor-not-allowed'
                                                        : 'text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30'
                                                        }`}
                                                    title={isLocked ? 'Period is locked' : 'Delete All Data for this Date'}
                                                >
                                                    {deleting === day.date ? (
                                                        <span className="animate-spin block w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full" />
                                                    ) : (
                                                        <Trash2 size={16} />
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Audit Log */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <History className="text-gray-500" size={20} />
                        Activity Log
                    </h2>
                    <span className="text-xs text-gray-400">Last 50 Actions</span>
                </div>
                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 uppercase font-bold text-gray-500 dark:text-gray-400">
                            <tr>
                                <th className="px-4 py-3">Timestamp</th>
                                <th className="px-4 py-3">Admin</th>
                                <th className="px-4 py-3">Action</th>
                                <th className="px-4 py-3">Target Date</th>
                                <th className="px-4 py-3">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700">
                            {activityLog.map((log) => (
                                <tr key={log.id} className="bg-white dark:bg-gray-800">
                                    <td className="px-4 py-3 text-gray-500 font-mono whitespace-nowrap">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                        {log.admin.firstName} {log.admin.lastName}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${log.action === 'UPLOAD' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            log.action === 'DELETE' ? 'bg-red-50 text-red-700 border-red-200' :
                                                log.action === 'REVERT' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    'bg-gray-100 text-gray-700 border-gray-200'
                                            }`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 font-mono">
                                        {log.targetDate ? new Date(log.targetDate).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 truncate max-w-xs" title={log.details}>
                                        {log.details}
                                    </td>
                                </tr>
                            ))}
                            {activityLog.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">No activity recorded yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
