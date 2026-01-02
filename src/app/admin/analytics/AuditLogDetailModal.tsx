'use client';

import React, { useState } from 'react';
import { X, ArrowRight, RotateCcw } from 'lucide-react';
import { useAKC } from '@/context/AKCContext';

interface AuditLogDetailModalProps {
    log: any;
    onClose: () => void;
    onRevert: (id: string, keys?: string[]) => Promise<void>;
}

export default function AuditLogDetailModal({ log, onClose, onRevert }: AuditLogDetailModalProps) {
    const { language } = useAKC();
    const [isReverting, setIsReverting] = useState(false);
    const [revertedKeys, setRevertedKeys] = useState<string[]>([]);

    if (!log) return null;

    const t = {
        title: language === 'es' ? 'Detalles de Auditoría' : 'Audit Details',
        action: language === 'es' ? 'Acción' : 'Action',
        admin: language === 'es' ? 'Administrador' : 'Admin',
        date: language === 'es' ? 'Fecha' : 'Date',
        entity: language === 'es' ? 'Entidad' : 'Entity',
        previous: language === 'es' ? 'Estado Anterior' : 'Previous State',
        new: language === 'es' ? 'Estado Nuevo' : 'New State',
        revert: language === 'es' ? 'Revertir Todos' : 'Revert All',
        reverting: language === 'es' ? 'Revertiendo...' : 'Reverting...',
        reverted: language === 'es' ? 'Cambio Revertido' : 'Change Reverted',
        close: language === 'es' ? 'Cerrar' : 'Close',
        noChanges: language === 'es' ? 'No hay detalles de cambios disponibles.' : 'No change details available.',
        confirmRevert: language === 'es' ? '¿Estás seguro de que deseas revertir este cambio?' : 'Are you sure you want to revert this change?'
    };

    const handleRevertAll = async () => {
        if (!confirm(t.confirmRevert)) return;

        setIsReverting(true);
        try {
            await onRevert(log.id);
            onClose();
        } catch (e) {
            console.error(e);
            alert('Failed to revert');
        } finally {
            setIsReverting(false);
        }
    };

    const handlePartialRevert = async (key: string) => {
        try {
            await onRevert(log.id, [key]);
            setRevertedKeys(prev => [...prev, key]);
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const tryParseJSON = (value: any) => {
        if (typeof value === 'string') {
            try {
                const trimmed = value.trim();
                if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
                    (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
                    return JSON.parse(value);
                }
            } catch {
                return value;
            }
        }
        return value;
    };

    const FormattedValue = ({ value }: { value: any }) => {
        const parsed = tryParseJSON(value);
        const isObject = typeof parsed === 'object' && parsed !== null;

        return (
            <div className={`text-sm font-mono break-all ${isObject ? 'whitespace-pre-wrap' : ''}`}>
                {isObject ? JSON.stringify(parsed, null, 2) : String(value)}
            </div>
        );
    };

    const parseState = (stateStr: string) => {
        if (!stateStr) return null;
        try {
            return JSON.parse(stateStr);
        } catch {
            return null;
        }
    };

    const previous = parseState(log.previousState);
    const current = parseState(log.newState);

    // Calculate diff keys
    const getDiffKeys = (obj1: any, obj2: any) => {
        if (!obj1 || !obj2) return [];
        const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
        const changedKeys: string[] = [];
        keys.forEach(key => {
            if (key === 'updatedAt') return; // Ignore timestamps
            if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
                changedKeys.push(key);
            }
        });
        return changedKeys;
    };

    const changedKeys = getDiffKeys(previous, current);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1B1F22] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            ID: <span className="font-mono">{log.id.slice(0, 8)}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Meta Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                        <div>
                            <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">{t.action}</span>
                            <div className="mt-1 font-bold text-gray-900 dark:text-white">{log.action}</div>
                        </div>
                        <div>
                            <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">{t.entity}</span>
                            <div className="mt-1 font-bold text-gray-900 dark:text-white">{log.entity}</div>
                        </div>
                        <div>
                            <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">{t.admin}</span>
                            <div className="mt-1 font-medium text-gray-900 dark:text-white">{log.user.email}</div>
                        </div>
                        <div>
                            <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">{t.date}</span>
                            <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                {new Date(log.createdAt).toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Diff View */}
                    <div className="space-y-6">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wide border-b border-gray-200 dark:border-gray-800 pb-2 mb-4">
                            {language === 'es' ? 'Cambios Encontrados' : 'Changes Found'}
                        </h4>

                        {changedKeys.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                {t.noChanges}
                            </div>
                        )}

                        {changedKeys.map(key => (
                            <DiffRow
                                key={key}
                                fieldKey={key}
                                oldValue={previous ? previous[key] : undefined}
                                newValue={current ? current[key] : undefined}
                                language={language}
                                logId={log.id}
                                onRevert={handlePartialRevert}
                                isLogReverted={log.isReverted}
                                isFieldReverted={revertedKeys.includes(key)}
                            />
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1B1F22] flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition"
                    >
                        {t.close}
                    </button>
                    <button
                        onClick={handleRevertAll}
                        disabled={isReverting || log.isReverted}
                        className={`px-4 py-2 font-bold rounded-lg transition flex items-center gap-2 disabled:opacity-50 ${log.isReverted
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                    >
                        {isReverting ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <RotateCcw size={16} />
                        )}
                        {isReverting ? t.reverting : (log.isReverted ? t.reverted : t.revert)}
                    </button>
                </div>
            </div>
        </div>
    );
}

function DiffRow({ fieldKey, oldValue, newValue, language, logId, onRevert, isLogReverted, isFieldReverted }: {
    fieldKey: string,
    oldValue: any,
    newValue: any,
    language: string,
    logId: string,
    onRevert: (key: string) => Promise<void>,
    isLogReverted: boolean,
    isFieldReverted: boolean
}) {
    const [isReverting, setIsReverting] = useState(false);

    const handleFieldRevert = async () => {
        if (!confirm(language === 'es' ? '¿Revertir solo este campo?' : 'Revert only this field?')) return;
        setIsReverting(true);
        try {
            await onRevert(fieldKey);
            // Alert removed
        } catch (e) {
            console.error(e);
            alert('Failed to revert field');
        } finally {
            setIsReverting(false);
        }
    };
    const tryParse = (val: any) => {
        if (typeof val === 'string') {
            try {
                const trimmed = val.trim();
                if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) return JSON.parse(val);
            } catch { return val; }
        }
        return val;
    };

    const oldParsed = tryParse(oldValue);
    const newParsed = tryParse(newValue);

    const isArrayDiff = Array.isArray(oldParsed) && Array.isArray(newParsed);

    if (isArrayDiff) {
        return (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-2 border-b border-gray-200 dark:border-gray-800 font-bold text-sm text-gray-700 dark:text-gray-300 flex justify-between items-center">
                    <span>{fieldKey} (Array)</span>
                    {!isLogReverted && (
                        <button
                            onClick={handleFieldRevert}
                            disabled={isReverting}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs flex items-center gap-1 disabled:opacity-50"
                        >
                            {isReverting ? <div className="w-3 h-3 border-2 border-indigo-600 rounded-full animate-spin border-t-transparent" /> : <RotateCcw size={12} />}
                            {language === 'es' ? 'Revertir esto' : 'Revert this'}
                        </button>
                    )}
                </div>
                <div className="p-4 space-y-4">
                    <ArrayDiff oldArr={oldParsed} newArr={newParsed} />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-2 border-b border-gray-200 dark:border-gray-800 font-bold text-sm text-gray-700 dark:text-gray-300 flex justify-between items-center">
                <span>{fieldKey}</span>
                {!isLogReverted && (
                    <button
                        onClick={handleFieldRevert}
                        disabled={isReverting}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs flex items-center gap-1 disabled:opacity-50"
                    >
                        {isReverting ? <div className="w-3 h-3 border-2 border-indigo-600 rounded-full animate-spin border-t-transparent" /> : <RotateCcw size={12} />}
                        {language === 'es' ? 'Revertir esto' : 'Revert this'}
                    </button>
                )}
            </div>
            <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-800">
                <div className="p-4 bg-red-50/50 dark:bg-red-900/10">
                    <div className="text-xs font-bold text-red-500 mb-2 uppercase tracking-wide">{language === 'es' ? 'Anterior' : 'Previous'}</div>
                    <PrettyPrint value={oldParsed} className="text-red-700 dark:text-red-300" />
                </div>
                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10">
                    <div className="text-xs font-bold text-emerald-500 mb-2 uppercase tracking-wide">{language === 'es' ? 'Nuevo' : 'New'}</div>
                    <PrettyPrint value={newParsed} className="text-emerald-700 dark:text-emerald-300" />
                </div>
            </div>
        </div>
    );
}

function ArrayDiff({ oldArr, newArr }: { oldArr: any[], newArr: any[] }) {
    const changes = [];
    const maxLen = Math.max(oldArr.length, newArr.length);
    let hasChanges = false;

    for (let i = 0; i < maxLen; i++) {
        const oldItem = oldArr[i];
        const newItem = newArr[i];
        // Simple JSON comparison
        const isDifferent = JSON.stringify(oldItem) !== JSON.stringify(newItem);
        if (isDifferent) {
            hasChanges = true;
            changes.push({ index: i, oldItem, newItem });
        }
    }

    if (!hasChanges) return <div className="text-gray-400 italic text-sm">No items changed</div>;

    return (
        <div className="space-y-4">
            {changes.map(({ index, oldItem, newItem }) => (
                <div key={index} className="flex flex-col gap-2">
                    <div className="text-xs font-bold text-gray-500">Item {index}</div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                            <PrettyPrint value={oldItem} className="text-red-600 dark:text-red-300" />
                        </div>
                        <div className="p-3 rounded bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                            <PrettyPrint value={newItem} className="text-emerald-600 dark:text-emerald-300" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function PrettyPrint({ value, className }: { value: any, className?: string }) {
    if (value === undefined || value === null) return <span className="text-gray-400 italic">null</span>;
    const isObject = typeof value === 'object';
    return (
        <pre className={`text-xs font-mono break-all whitespace-pre-wrap ${className}`}>
            {isObject ? JSON.stringify(value, null, 2) : String(value)}
        </pre>
    );
}
