'use client';

import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (filename: string) => void;
    title?: string;
    defaultFilename?: string;
}

export default function ExportModal({ isOpen, onClose, onConfirm, title = "Export Options", defaultFilename = "" }: ExportModalProps) {
    const [filename, setFilename] = useState(defaultFilename);

    useEffect(() => {
        if (isOpen && defaultFilename) {
            setFilename(defaultFilename);
        }
    }, [isOpen, defaultFilename]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1B1F22] w-full max-w-md rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-2xl">
                <div className="flex items-center gap-3 mb-4 text-gray-900 dark:text-white">
                    <Download size={24} className="text-blue-600" />
                    <h2 className="text-lg font-bold">{title}</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Filename
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={filename}
                                onChange={(e) => setFilename(e.target.value)}
                                className="flex-1 px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:border-blue-500 font-mono text-sm"
                                autoFocus
                            />
                            <span className="text-gray-500 dark:text-gray-400 font-mono text-sm">.json</span>
                        </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onConfirm(filename)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                        >
                            Export
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
