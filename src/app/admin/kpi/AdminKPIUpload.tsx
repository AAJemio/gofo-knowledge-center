
'use client';

import React, { useState, useRef } from 'react';
import { Upload, AlertTriangle, Check, FileSpreadsheet, X, Search } from 'lucide-react';
import { api } from '@/services/api';

export default function AdminKPIUpload({ onUploadComplete }: { onUploadComplete: () => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [conflicts, setConflicts] = useState<any[]>([]);
    const [showConflictModal, setShowConflictModal] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [resolutions, setResolutions] = useState<Record<number, string>>({}); // index -> userId
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch users for resolution dropdown
    React.useEffect(() => {
        const fetchUsers = async () => {
            // Assuming we have an endpoint to list users. adapting existing patterns
            try {
                // Determine how to get users. We might need to expose this or use existing context/api
                // For now, let's assume we can fetch them or pass them in. 
                // Just in case, let's use the users API if available or mock empty for now and fix later
                const res = await fetch('/api/users');
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data);
                }
            } catch (e) {
                console.error("Failed to fetch users", e);
            }
        };
        fetchUsers();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setConflicts([]);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // We need to use fetch directly or extend api service. Let's use fetch for now for file upload
            const res = await fetch('/api/admin/kpi/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.success) {
                if (data.unmatched && data.unmatched.length > 0) {
                    setConflicts(data.unmatched);
                    setShowConflictModal(true);
                } else {
                    alert(`Successfully imported ${data.inserted} records.`);
                    onUploadComplete();
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                }
            } else {
                alert('Upload failed: ' + data.message);
            }
        } catch (error) {
            console.error('Upload error', error);
            alert('An error occurred during upload.');
        } finally {
            setUploading(false);
        }
    };

    const handleResolve = async () => {
        // Collect resolved conflicts
        const resolvedData = conflicts
            .map((c, index) => {
                const userId = resolutions[index];
                if (!userId || userId === 'SKIP') return null; // Skip explicit skips and unselected
                return { userId, record: c };
            })
            .filter(r => r !== null);

        if (resolvedData.length === 0) {
            if (!confirm("No conflicts resolved. Proceed to finish?")) return;
            setShowConflictModal(false);
            setConflicts([]);
            onUploadComplete();
            return;
        }

        try {
            const res = await fetch('/api/admin/kpi/resolve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resolutions: resolvedData })
            });

            if (res.ok) {
                setShowConflictModal(false);
                setConflicts([]);
                setResolutions({});
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                alert('Conflicts resolved and records saved.');
                onUploadComplete();
            } else {
                alert('Failed to save resolutions.');
            }
        } catch (e) {
            console.error(e);
            alert('Error saving resolutions.');
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-gray-700">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FileSpreadsheet className="text-green-600" />
                Upload Daily KPIs
            </h3>

            <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Excel File (.xlsx)
                    </label>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-slate-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-[#EF4D23]/10 file:text-[#EF4D23]
                            hover:file:bg-[#EF4D23]/20
                        "
                    />
                </div>
                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className={`px-6 py-2 rounded-lg font-bold text-white transition-all ${!file || uploading
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-[#EF4D23] hover:bg-[#d63f1a] shadow-md hover:shadow-lg'
                        }`}
                >
                    {uploading ? 'Processing...' : 'Upload & Process'}
                </button>
            </div>

            {/* Conflict Resolution Modal */}
            {showConflictModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-red-50 dark:bg-red-900/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600">
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Unmatched Agents Found</h2>
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                        The following names from the file could not be automatically matched to system users.
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setShowConflictModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase font-bold text-gray-500">
                                    <tr>
                                        <th className="px-4 py-3 rounded-l-lg">Original Name (Excel)</th>
                                        <th className="px-4 py-3">Assign To System User</th>
                                        <th className="px-4 py-3 rounded-r-lg text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-gray-700">
                                    {conflicts.map((conflict, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                            <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">
                                                {conflict.rawName}
                                            </td>
                                            <td className="px-4 py-4">
                                                <select
                                                    className="w-full md:w-64 px-3 py-2 rounded-lg border bg-white dark:bg-gray-900 dark:border-gray-600 focus:ring-2 focus:ring-[#EF4D23] outline-none"
                                                    value={resolutions[idx] || ''}
                                                    onChange={(e) => setResolutions({ ...resolutions, [idx]: e.target.value })}
                                                >
                                                    <option value="">Select User...</option>
                                                    <option value="SKIP">⛔ Skip (Do not import)</option>
                                                    {users.map(u => (
                                                        <option key={u.id} value={u.id}>
                                                            {u.firstName} {u.lastName} ({u.email})
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                {resolutions[idx] === 'SKIP' ? (
                                                    <span className="text-gray-500 flex items-center justify-end gap-1 font-bold text-xs">
                                                        <X size={14} /> Skipped
                                                    </span>
                                                ) : resolutions[idx] ? (
                                                    <span className="text-green-600 flex items-center justify-end gap-1 font-bold text-xs">
                                                        <Check size={14} /> Assigned
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs italic">Pending</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
                            <button
                                onClick={() => setShowConflictModal(false)}
                                className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 font-medium"
                            >
                                Cancel Upload
                            </button>
                            <button
                                onClick={handleResolve}
                                className="px-6 py-2 rounded-lg bg-[#EF4D23] text-white font-bold hover:bg-[#d63f1a] shadow-md flex items-center gap-2"
                            >
                                <Check size={18} />
                                Confirm & Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
