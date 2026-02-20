
import React, { useState, useRef } from 'react';
import { Upload, FileJson, AlertTriangle, CheckCircle, XCircle, ArrowRight, Loader2, RefreshCw } from 'lucide-react';

interface ContentRestoreWizardProps {
    scope: 'prompts' | 'cases';
    onSuccess: () => void;
    onClose: () => void;
}

export default function ContentRestoreWizard({ scope, onSuccess, onClose }: ContentRestoreWizardProps) {
    const [step, setStep] = useState<'upload' | 'analyze' | 'review' | 'executing' | 'done'>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [report, setReport] = useState<{ newCount: number; updateCount: number; duplicateCount: number; details: any[] } | null>(null);
    const [tempId, setTempId] = useState<string | null>(null);
    const [skipIds, setSkipIds] = useState<Set<string>>(new Set());
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'NEW' | 'UPDATE' | 'DUPLICATE_WARN'>('ALL');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;
        setStep('analyze');
        setError(null);

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const jsonContent = JSON.parse(e.target?.result as string);

                // Basic client-side check
                if (jsonContent.backupScope !== scope) {
                    throw new Error(`Invalid backup scope. Expected "${scope}", got "${jsonContent.backupScope || 'unknown'}".`);
                }

                const res = await fetch('/api/admin/content/restore/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(jsonContent)
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Analysis failed');
                }

                const data = await res.json();
                setReport(data.report);
                setTempId(data.tempId);
                setStep('review');

            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred');
                }
                setStep('upload');
            }
        };
        reader.readAsText(file);
    };

    const handleExecute = async () => {
        if (!tempId) return;
        setStep('executing');
        try {
            const res = await fetch('/api/admin/content/restore/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tempId,
                    options: {
                        skipIds: Array.from(skipIds)
                    }
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Restore execution failed');
            }

            setStep('done');
            setTimeout(() => {
                onSuccess();
            }, 1000); // Give user a moment to see success
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred during execution');
            }
            setStep('review'); // Go back to review to try again?
        }
    };

    const toggleSkip = (id: string) => {
        const newSkip = new Set(skipIds);
        if (newSkip.has(id)) newSkip.delete(id);
        else newSkip.add(id);
        setSkipIds(newSkip);
    };

    const filteredDetails = report?.details?.filter((item: any) => {
        if (filterStatus === 'ALL') return true;
        return item.status === filterStatus;
    }) || [];

    const detailsCount = filteredDetails.length;

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
            setFile(e.dataTransfer.files[0]);
            setError(null);
        }
    };

    // ... Rendering Logic using steps ...
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold dark:text-gray-100 flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-blue-600" />
                        Restore {scope === 'prompts' ? 'Prompts' : 'Cases'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex-1 overflow-y-auto">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 dark:bg-red-900/20 dark:text-red-300">
                            <AlertTriangle className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    {step === 'upload' && (
                        <div
                            className={`flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl transition-colors cursor-pointer
                                ${isDragging
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                accept=".json"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <div className="text-center space-y-4 pointer-events-none">
                                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full inline-block">
                                    <FileJson className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                    ]</div>
                                <div>
                                    <button
                                        type="button"
                                        className="btn btn-primary px-6 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm"
                                    >
                                        Select Backup JSON
                                    </button>
                                    <p className="mt-2 text-sm text-gray-500">
                                        {file ? file.name : "Drag & drop or click to upload"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'analyze' && (
                        <div className="flex flex-col items-center justify-center h-64">
                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                            <p className="text-gray-600 dark:text-gray-300">Analyzing content differences...</p>
                        </div>
                    )}

                    {step === 'review' && report && (
                        <div className="space-y-4">
                            {/* Summary Stats */}
                            <div className="grid grid-cols-4 gap-4 mb-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{report.newCount}</div>
                                    <div className="text-xs uppercase text-blue-600 dark:text-blue-400 font-semibold">New</div>
                                </div>
                                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{report.updateCount}</div>
                                    <div className="text-xs uppercase text-yellow-600 dark:text-yellow-400 font-semibold">Updates</div>
                                </div>
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-red-700 dark:text-red-300">{report.duplicateCount}</div>
                                    <div className="text-xs uppercase text-red-600 dark:text-red-400 font-semibold">Conflicts</div>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                                    {/* Identical is implied or distinct? API doesn't list identical count in example but let's assume */}
                                    <div className="text-2xl font-bold text-gray-500">{report.details.length}</div>
                                    <div className="text-xs uppercase text-gray-400 font-semibold">Total</div>
                                </div>
                            </div>

                            {/* Filter Tabs */}
                            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                                {['ALL', 'NEW', 'UPDATE', 'DUPLICATE_WARN'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status as any)}
                                        className={`px-3 py-1 text-sm rounded-full ${filterStatus === status ? 'bg-gray-800 text-white dark:bg-white dark:text-gray-900' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                    >
                                        {status === 'DUPLICATE_WARN' ? 'Conflicts' : status}
                                    </button>
                                ))}
                            </div>

                            {/* List */}
                            <div className="max-h-64 overflow-y-auto space-y-2">
                                {filteredDetails.length === 0 ? (
                                    <p className="text-center text-gray-400 py-8">No items found for this filter.</p>
                                ) : (
                                    filteredDetails.map((item: any) => (
                                        <div key={item.id} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={!skipIds.has(item.id)}
                                                onChange={() => toggleSkip(item.id)}
                                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-4"
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900 dark:text-gray-200">{scope === 'prompts' ? item.title : item.title_es || item.title}</div>
                                                <div className="text-xs text-gray-500 font-mono">{item.id}</div>
                                                {item.status === 'DUPLICATE_WARN' && (
                                                    <div className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        <span>Warning: Potential duplicate content detected.</span>
                                                    </div>
                                                )}
                                                {/* Show changes diff if UPDATE? For MVP just status is enough */}
                                            </div>
                                            <div>
                                                {item.status === 'NEW' && <span className="px-2 py-1 text-xs font-bold bg-blue-100 text-blue-800 rounded-full border border-blue-200">NEW</span>}
                                                {item.status === 'UPDATE' && <span className="px-2 py-1 text-xs font-bold bg-yellow-100 text-yellow-800 rounded-full border border-yellow-200">UPDATE</span>}
                                                {item.status === 'DUPLICATE_WARN' && <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-800 rounded-full border border-red-200">CONFLICT</span>}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Warning Summary */}
                            {skipIds.size > 0 && (
                                <div className="text-sm text-gray-500 text-right">
                                    Skipping {skipIds.size} items.
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'executing' && (
                        <div className="flex flex-col items-center justify-center h-64">
                            <Loader2 className="w-10 h-10 text-green-600 animate-spin mb-4" />
                            <p className="text-gray-600 dark:text-gray-300">Restoring content...</p>
                        </div>
                    )}

                    {step === 'done' && (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Restore Complete!</h3>
                            <p className="text-gray-600 dark:text-gray-300">Your content has been successfully updated.</p>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                    {step === 'upload' && (
                        <button
                            onClick={handleAnalyze}
                            disabled={!file}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            Analyze
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    )}

                    {step === 'review' && (
                        <>
                            <button
                                onClick={() => setStep('upload')}
                                className="px-6 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleExecute}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
                            >
                                Execute Restore
                                <CheckCircle className="w-4 h-4" />
                            </button>
                        </>
                    )}

                    {step === 'done' && (
                        <button
                            onClick={onClose}
                            className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium"
                        >
                            Close
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
