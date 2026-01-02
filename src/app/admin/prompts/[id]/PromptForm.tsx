'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PromptForm({ prompt, isNew }: { prompt: any, isNew: boolean }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

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
            </form>
        </div>
    );
}
