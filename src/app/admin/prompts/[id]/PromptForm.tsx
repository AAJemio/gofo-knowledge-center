'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAKC } from '@/context/AKCContext';

export default function PromptForm({ prompt, isNew }: { prompt: any, isNew: boolean }) {
    const router = useRouter();
    const { language } = useAKC();
    const [loading, setLoading] = useState(false);

    // Highlight Logic
    const [highlightEnabled, setHighlightEnabled] = useState(false);
    const [highlightType, setHighlightType] = useState<'duration' | 'range'>('duration');
    const [highlightDuration, setHighlightDuration] = useState('1440'); // Default 24h
    const [highlightColor, setHighlightColor] = useState('#EF4D23'); // Default Orange
    const [highlightReason, setHighlightReason] = useState('');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    React.useEffect(() => {
        if (prompt?.highlightExpiresAt) {
            setHighlightEnabled(true);
            const expires = new Date(prompt.highlightExpiresAt);

            if (prompt.highlightStartsAt) {
                setHighlightType('range');
                setCustomStart(new Date(prompt.highlightStartsAt).toISOString().slice(0, 16));
                setCustomEnd(expires.toISOString().slice(0, 16));
            }
        }
        if (prompt?.highlightColor) setHighlightColor(prompt.highlightColor);
        if (prompt?.highlightReason) setHighlightReason(prompt.highlightReason);
    }, [prompt]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data: any = Object.fromEntries(formData.entries());

        // Handle Highlight
        if (highlightEnabled) {
            data.highlightColor = highlightColor;
            data.highlightReason = highlightReason;

            if (highlightType === 'duration') {
                const now = new Date();
                const minutes = parseInt(highlightDuration);
                now.setMinutes(now.getMinutes() + minutes);
                data.highlightExpiresAt = now.toISOString();
                data.highlightStartsAt = new Date().toISOString();
            } else {
                data.highlightStartsAt = customStart ? new Date(customStart).toISOString() : new Date().toISOString();
                data.highlightExpiresAt = customEnd ? new Date(customEnd).toISOString() : null;
            }
        } else {
            data.highlightExpiresAt = null;
            data.highlightStartsAt = null;
            data.highlightColor = null;
            data.highlightReason = null;
        }

        try {
            const url = isNew ? '/api/prompts' : `/api/prompts/${prompt.id}`;
            const method = isNew ? 'POST' : 'PUT';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.details || 'Failed to save');
            }

            router.push('/admin/prompts');
            router.refresh();

            // Success Notification
            const msg = language === 'es' ? '¡Prompt guardado con éxito!' : 'Prompt saved successfully!';
            alert(msg);
        } catch (error: any) {
            console.error(error);
            alert(`Error saving prompt: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/prompts" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition text-gray-500 dark:text-gray-400">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{isNew ? 'Create New Prompt' : 'Edit Prompt'}</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{isNew ? 'Add a new WhatsApp template' : `Editing ${prompt?.title}`}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-[#1B1F22] p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 transition-colors duration-300">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-1">Title (English)</label>
                        <input
                            name="title"
                            defaultValue={prompt?.title}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#A94F2D]/20 focus:border-[#A94F2D] outline-none text-gray-900 dark:text-white bg-white dark:bg-gray-900 transition-colors font-medium"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-1">Title (Spanish)</label>
                        <input
                            name="title_es"
                            defaultValue={prompt?.title_es || ''}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#A94F2D]/20 focus:border-[#A94F2D] outline-none text-gray-900 dark:text-white bg-white dark:bg-gray-900 transition-colors font-medium"
                            placeholder="Título en Español"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-1">Category</label>
                        <select
                            name="category"
                            defaultValue={prompt?.category || 'General'}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#A94F2D]/20 focus:border-[#A94F2D] outline-none text-gray-900 dark:text-white bg-white dark:bg-gray-900 transition-colors font-medium"
                        >
                            <option value="General">General</option>
                            <option value="Tracking">Tracking</option>
                            <option value="Delivery">Delivery</option>
                            <option value="Return">Return</option>
                            <option value="Complaint">Complaint</option>
                            <option value="Security">Security</option>
                            <option value="Modification">Modification</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-1">Code (Odd/Impar - EN)</label>
                        <input
                            name="code_impar_en"
                            defaultValue={prompt?.code_impar_en || ''}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#A94F2D]/20 focus:border-[#A94F2D] outline-none font-mono text-gray-900 dark:text-white bg-white dark:bg-gray-900 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-1">Code (Even/Par - ES)</label>
                        <input
                            name="code_par_es"
                            defaultValue={prompt?.code_par_es || ''}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#A94F2D]/20 focus:border-[#A94F2D] outline-none font-mono text-gray-900 dark:text-white bg-white dark:bg-gray-900 transition-colors"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-1">Content (English)</label>
                        <textarea
                            name="content_en"
                            defaultValue={prompt?.content_en}
                            rows={8}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#A94F2D]/20 focus:border-[#A94F2D] outline-none font-mono text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-900 transition-colors"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-1">Content (Spanish)</label>
                        <textarea
                            name="content_es"
                            defaultValue={prompt?.content_es}
                            rows={8}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#A94F2D]/20 focus:border-[#A94F2D] outline-none font-mono text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-900 transition-colors"
                            required
                        />
                    </div>
                </div>

                {/* Highlighting */}
                <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        {language === 'es' ? 'Resaltado y Notificaciones' : 'Highlight & Notifications'}
                    </h3>
                    <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30">
                        <div className="flex items-center gap-3 mb-4">
                            <input
                                type="checkbox"
                                id="highlightToggle"
                                checked={highlightEnabled}
                                onChange={(e) => setHighlightEnabled(e.target.checked)}
                                className="w-5 h-5 rounded text-[#A94F2D] focus:ring-[#A94F2D]"
                            />
                            <label htmlFor="highlightToggle" className="font-bold text-gray-900 dark:text-white select-none cursor-pointer">
                                {language === 'es' ? 'Resaltar este prompt para Agentes' : 'Highlight this prompt for Agents'}
                            </label>
                        </div>

                        {highlightEnabled && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn ml-8">
                                <div className="md:col-span-2">
                                    <div className="flex gap-4 mb-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="highlightType" checked={highlightType === 'duration'} onChange={() => setHighlightType('duration')} className="text-[#A94F2D] focus:ring-[#A94F2D]" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Quick Duration</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="highlightType" checked={highlightType === 'range'} onChange={() => setHighlightType('range')} className="text-[#A94F2D] focus:ring-[#A94F2D]" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Date Range</span>
                                        </label>
                                    </div>
                                </div>

                                {highlightType === 'duration' ? (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-1">{language === 'es' ? 'Duración' : 'Duration'}</label>
                                        <select
                                            value={highlightDuration}
                                            onChange={(e) => setHighlightDuration(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#A94F2D]/20 focus:border-[#A94F2D] outline-none text-gray-900 dark:text-white bg-white dark:bg-gray-900 transition-colors"
                                        >
                                            <option value="60">1 Hour</option>
                                            <option value="240">4 Hours</option>
                                            <option value="720">12 Hours</option>
                                            <option value="1440">24 Hours (1 Day)</option>
                                            <option value="4320">3 Days</option>
                                            <option value="10080">1 Week</option>
                                        </select>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-1">{language === 'es' ? 'Inicio' : 'Start'}</label>
                                            <input
                                                type="datetime-local"
                                                value={customStart}
                                                onChange={e => setCustomStart(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-1">{language === 'es' ? 'Fin' : 'End'}</label>
                                            <input
                                                type="datetime-local"
                                                value={customEnd}
                                                onChange={e => setCustomEnd(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-1">{language === 'es' ? 'Color' : 'Highlight Color'}</label>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="color"
                                            value={highlightColor}
                                            onChange={(e) => setHighlightColor(e.target.value)}
                                            className="h-10 w-12 rounded cursor-pointer border-0 p-0"
                                        />
                                        <span className="text-sm text-gray-500 font-mono">{highlightColor}</span>
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-1">{language === 'es' ? 'Razón (Opcional)' : 'Reason (Optional)'}</label>
                                    <input
                                        value={highlightReason}
                                        onChange={(e) => setHighlightReason(e.target.value)}
                                        placeholder={language === 'es' ? "Ej: Nuevo mensaje de seguridad..." : "Ex: New security message..."}
                                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#A94F2D]/20 focus:border-[#A94F2D] outline-none text-gray-900 dark:text-white bg-white dark:bg-gray-900 transition-colors"
                                    />
                                </div>

                                <div className="md:col-span-2 text-sm text-gray-600 dark:text-gray-400">
                                    <p>{language === 'es'
                                        ? 'Cuando está resaltado, este prompt aparecerá en la parte superior de la lista con el borde seleccionado.'
                                        : 'When highlighted, this prompt will appear at the top of the Agent list with the selected color border.'}</p>
                                    <p className="mt-1"><strong>Note:</strong> {language === 'es' ? 'Guardar enviará una notificación a todos los agentes.' : 'Saving will also send a notification to all agents.'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Link href="/admin/prompts" className="px-6 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition text-gray-700 dark:text-gray-300">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-[#A94F2D] text-white px-6 py-2 rounded-lg hover:bg-[#8e4225] transition font-medium disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>
            </form >
        </div >
    );
}
