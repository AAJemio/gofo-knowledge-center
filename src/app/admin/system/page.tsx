'use client';

import React, { useState, useRef } from 'react';
import { Download, Upload, Shield, AlertTriangle, CheckCircle, FileJson, Server, Database, MessageSquare, Briefcase } from 'lucide-react';
import { useAKC } from '@/context/AKCContext';
import ContentRestoreWizard from '../components/ContentRestoreWizard';
import ExportModal from '../components/ExportModal';
import { downloadBlob } from '@/utils/downloadHelpers';

export default function SystemAdminPage() {
    const { currentUser, language } = useAKC();
    const [password, setPassword] = useState('');
    const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

    // Export Modal State
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportType, setExportType] = useState<'system' | 'prompts' | 'cases'>('system');
    const [exportFilename, setExportFilename] = useState('');

    // Content Restore State
    const [contentRestoreScope, setContentRestoreScope] = useState<'prompts' | 'cases' | null>(null);

    // System Restore State
    const [restoreFile, setRestoreFile] = useState<File | null>(null);
    const [restorePhase, setRestorePhase] = useState<'upload' | 'analyze' | 'confirm' | 'executing' | 'success' | 'error'>('upload');
    const [restoreStats, setRestoreStats] = useState<any>(null);
    const [restoreBackupId, setRestoreBackupId] = useState<string | null>(null);
    const [confirmText, setConfirmText] = useState('');
    const [restoreError, setRestoreError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Drag and Drop State
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setRestoreFile(e.dataTransfer.files[0]);
            analyzeBackup(e.dataTransfer.files[0]);
        }
    };

    const openExportModal = (type: 'system' | 'prompts' | 'cases') => {
        setExportType(type);
        const date = new Date().toISOString().slice(0, 10);
        setExportFilename(`backup_${type}_${date}`);
        setIsExportModalOpen(true);
    };

    const handleExportConfirm = (filename: string) => {
        setIsExportModalOpen(false);
        setExportFilename(filename);
        if (exportType === 'system') {
            setIsBackupModalOpen(true); // Open password check
        } else {
            triggerContentDownload(exportType as 'prompts' | 'cases', filename);
        }
    };

    const triggerContentDownload = async (scope: 'prompts' | 'cases', filename: string) => {
        try {
            const res = await fetch(`/api/admin/content/backup?scope=${scope}`);
            if (!res.ok) throw new Error('Export failed');

            const blob = await res.blob();
            downloadBlob(blob, filename);
        } catch (error) {
            console.error(error);
            alert('Failed to delete export content.');
        }
    };

    const handleBackup = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/system/backup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    password,
                    adminId: currentUser?.id
                })
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.message || 'Backup failed');
                return;
            }

            // Trigger download with custom filename
            const blob = await res.blob();
            downloadBlob(blob, exportFilename); // Use the filename set in the export modal

            setIsBackupModalOpen(false);
            setPassword('');
        } catch (error) {
            console.error(error);
            alert('An error occurred during backup.');
        }
    };

    const handleContentBackup = (scope: 'prompts' | 'cases') => {
        openExportModal(scope);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setRestoreFile(e.target.files[0]);
            analyzeBackup(e.target.files[0]);
        }
    };

    const analyzeBackup = async (file: File) => {
        setRestorePhase('analyze');
        setRestoreError('');
        const text = await file.text();

        try {
            // Validate JSON locally first to fail fast
            const json = JSON.parse(text);
            if (!json.meta || !json.data) {
                throw new Error('Invalid backup file format');
            }

            // Send to server for analysis and temp storage
            const res = await fetch('/api/admin/system/restore/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(json)
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Analysis failed');
            }

            setRestoreStats(data.stats);
            setRestoreBackupId(data.backupId);
            setRestorePhase('confirm');
        } catch (error: any) {
            console.error(error);
            setRestoreError(error.message || 'Failed to analyze backup file');
            setRestorePhase('error');
        }
    };

    const executeRestore = async () => {
        if (confirmText !== 'CONFIRMAR') return;
        setRestorePhase('executing');

        try {
            const res = await fetch('/api/admin/system/restore/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    backupId: restoreBackupId,
                    confirmText
                })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Restore execution failed');
            }

            setRestorePhase('success');
        } catch (error: any) {
            console.error(error);
            setRestoreError(error.message || 'Failed to execute restore');
            setRestorePhase('error');
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                    <Server className="text-[#EF4D23]" />
                    {language === 'es' ? 'Administración del Sistema' : 'System Administration'}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    {language === 'es' ? 'Herramientas de recuperación ante desastres y mantenimiento.' : 'Disaster recovery and maintenance tools.'}
                </p>
            </div>

            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-800 pb-2">
                {language === 'es' ? 'Respaldo Completo del Sistema' : 'Full System Backup'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* System Backup Card */}
                <div className="bg-white dark:bg-[#1B1F22] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                        <Database size={120} className="text-blue-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 w-fit rounded-lg mb-4">
                            <Download className="text-blue-600 dark:text-blue-400" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            {language === 'es' ? 'Copia de Seguridad (Backup)' : 'System Backup (Export)'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            {language === 'es'
                                ? 'Exporta el estado completo de la base de datos a un archivo JSON seguro. Excluye archivos binarios grandes.'
                                : 'Export the full database state to a secure JSON file. Excludes large binary files.'}
                        </p>
                        <button
                            onClick={() => setIsBackupModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition flex items-center gap-2"
                        >
                            <Download size={18} />
                            {language === 'es' ? 'Crear Respaldo' : 'Create Backup'}
                        </button>
                    </div>
                </div>

                {/* System Restore Card */}
                <div className="bg-white dark:bg-[#1B1F22] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                        <AlertTriangle size={120} className="text-orange-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 w-fit rounded-lg mb-4">
                            <Upload className="text-orange-600 dark:text-orange-400" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            {language === 'es' ? 'Restaurar Sistema (Restore)' : 'System Restore (Import)'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            {language === 'es'
                                ? 'Reemplaza la base de datos actual con un archivo de respaldo. ACCIÓN DESTRUCTIVA.'
                                : 'Replace the current database with a backup file. DESTRUCTIVE ACTION.'}
                        </p>
                        <button
                            onClick={() => setIsRestoreModalOpen(true)}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-bold transition flex items-center gap-2"
                        >
                            <Upload size={18} />
                            {language === 'es' ? 'Iniciar Restauración' : 'Start Restore'}
                        </button>
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-800 pb-2 pt-4">
                {language === 'es' ? 'Gestión de Contenido (Prompts y Casos)' : 'Content Management (Prompts & Cases)'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Prompts Backup Card */}
                <div className="bg-white dark:bg-[#1B1F22] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                        <MessageSquare size={120} className="text-green-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 w-fit rounded-lg mb-4">
                            <MessageSquare className="text-green-600 dark:text-green-400" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            WhatsApp Prompts
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            {language === 'es'
                                ? 'Respalda o restaura solo la biblioteca de prompts de WhatsApp.'
                                : 'Backup or restore only the WhatsApp prompts library.'}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleContentBackup('prompts')}
                                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                            >
                                <Download size={16} />
                                {language === 'es' ? 'Exportar' : 'Export'}
                            </button>
                            <button
                                onClick={() => setContentRestoreScope('prompts')}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                            >
                                <Upload size={16} />
                                {language === 'es' ? 'Importar' : 'Import'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Cases Backup Card */}
                <div className="bg-white dark:bg-[#1B1F22] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                        <Briefcase size={120} className="text-purple-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 w-fit rounded-lg mb-4">
                            <Briefcase className="text-purple-600 dark:text-purple-400" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            Support Cases
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            {language === 'es'
                                ? 'Respalda o restaura los casos de soporte y sus scripts.'
                                : 'Backup or restore support cases and their scripts.'}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleContentBackup('cases')}
                                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                            >
                                <Download size={16} />
                                {language === 'es' ? 'Exportar' : 'Export'}
                            </button>
                            <button
                                onClick={() => setContentRestoreScope('cases')}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                            >
                                <Upload size={16} />
                                {language === 'es' ? 'Importar' : 'Import'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Export Options Modal */}
            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                onConfirm={handleExportConfirm}
                defaultFilename={exportFilename}
                title={language === 'es' ? 'Opciones de Exportación' : 'Export Options'}
            />

            {/* Backup Password Modal */}
            {isBackupModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1B1F22] w-full max-w-md rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4 text-blue-600 dark:text-blue-400">
                            <Shield size={24} />
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Security Check</h2>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            {language === 'es'
                                ? 'Por favor ingresa tu contraseña de administrador para autorizar la descarga.'
                                : 'Please enter your admin password to authorize the download.'}
                        </p>
                        <form onSubmit={handleBackup} className="space-y-4">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Admin Password"
                                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:border-blue-500"
                                autoFocus
                            />
                            <div className="flex gap-2 justify-end">
                                <button
                                    type="button"
                                    onClick={() => { setIsBackupModalOpen(false); setPassword(''); }}
                                    className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!password}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold disabled:opacity-50"
                                >
                                    Download
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Restore Process Modal */}
            {isRestoreModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1B1F22] w-full max-w-lg rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden">
                        <div className="p-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <AlertTriangle className="text-orange-500" size={20} />
                                System Restore
                            </h2>
                            <button onClick={() => setIsRestoreModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <div className="p-6">
                            {restorePhase === 'upload' && (
                                <div className="text-center space-y-4">
                                    <div
                                        className={`border-2 border-dashed rounded-xl p-8 transition cursor-pointer
                                            ${isDragging
                                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                                : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                            }`}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <FileJson className="mx-auto text-gray-400 mb-3" size={48} />
                                        <p className="font-medium text-gray-700 dark:text-gray-300">
                                            Click or Drag & Drop to upload backup file (.json)
                                        </p>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileSelect}
                                            accept=".json"
                                            className="hidden"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Note: This will replace your current database configuration.
                                    </p>
                                </div>
                            )}

                            {restorePhase === 'analyze' && (
                                <div className="text-center py-8 space-y-4">
                                    <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
                                    <p className="font-mono text-sm text-gray-600 dark:text-gray-400">Analyzing backup file...</p>
                                </div>
                            )}

                            {restorePhase === 'confirm' && restoreStats && (
                                <div className="space-y-4">
                                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                                        <h4 className="font-bold text-orange-800 dark:text-orange-300 mb-2">Restoration Summary</h4>
                                        <div className="grid grid-cols-2 gap-2 text-sm text-orange-700 dark:text-orange-400">
                                            <div>Users: <b>{restoreStats.users}</b></div>
                                            <div>KPI Records: <b>{restoreStats.dailyKPIs}</b></div>
                                            <div>Support Cases: <b>{restoreStats.supportCases}</b></div>
                                            <div>WhatsApp Prompts: <b>{restoreStats.whatsappPrompts}</b></div>
                                            <div>Activity Logs: <b>{restoreStats.auditLogs}</b></div>
                                            <div>Interactions: <b>{restoreStats.interactions}</b></div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">
                                            Confirmation Required
                                        </label>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Type <b>CONFIRMAR</b> to proceed. This action cannot be undone.
                                        </p>
                                        <input
                                            type="text"
                                            value={confirmText}
                                            onChange={(e) => setConfirmText(e.target.value)}
                                            placeholder="Type CONFIRMAR"
                                            className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 focus:border-orange-500 outline-none font-bold"
                                        />
                                    </div>

                                    <button
                                        onClick={executeRestore}
                                        disabled={confirmText !== 'CONFIRMAR'}
                                        className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 dark:disabled:bg-gray-800 text-white font-bold rounded-xl transition"
                                    >
                                        EXECUTE RESTORE
                                    </button>
                                </div>
                            )}

                            {restorePhase === 'executing' && (
                                <div className="text-center py-8 space-y-4">
                                    <div className="animate-spin w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full mx-auto"></div>
                                    <p className="font-mono text-sm text-red-600 dark:text-red-400">
                                        Restoring Database... Do not close this window.
                                    </p>
                                </div>
                            )}

                            {restorePhase === 'success' && (
                                <div className="text-center py-8 space-y-4">
                                    <CheckCircle className="mx-auto text-green-500" size={64} />
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Restore Complete!</h3>
                                    <p className="text-gray-500">The system has been successfully restored.</p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="bg-gray-900 dark:bg-white text-white dark:text-black px-6 py-2 rounded-lg font-bold"
                                    >
                                        Reload Application
                                    </button>
                                </div>
                            )}

                            {restorePhase === 'error' && (
                                <div className="text-center py-6 space-y-4">
                                    <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-lg text-red-700 dark:text-red-300 text-sm">
                                        {restoreError}
                                    </div>
                                    <button
                                        onClick={() => setRestorePhase('upload')}
                                        className="text-gray-500 underline"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Content Restore Wizard */}
            {contentRestoreScope && (
                <ContentRestoreWizard
                    scope={contentRestoreScope}
                    onSuccess={() => {
                        setContentRestoreScope(null);
                        alert('Restore completed successfully!');
                    }}
                    onClose={() => setContentRestoreScope(null)}
                />
            )}
        </div>
    );
}
