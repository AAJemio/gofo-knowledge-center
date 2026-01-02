
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Save, ArrowLeft, Plus, X, Trash2, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CaseForm({ supportCase, isNew, allPrompts }: { supportCase: any, isNew: boolean, allPrompts: any[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Support Prompts
    const [selectedPrompts, setSelectedPrompts] = useState<any[]>([]);
    const [promptSearch, setPromptSearch] = useState('');

    useEffect(() => {
        if (supportCase && supportCase.recommendedPrompts) {
            setSelectedPrompts(supportCase.recommendedPrompts);
        }
    }, [supportCase]);

    // Parse initial remarks
    const [remarks, setRemarks] = useState<{ label_es?: string; label_en?: string; label?: string; tag: string }[]>([]);
    const [simpleRemark, setSimpleRemark] = useState('');
    const [mode, setMode] = useState<'simple' | 'advanced'>('simple');

    useEffect(() => {
        if (supportCase?.crm_remark_template) {
            const raw = supportCase.crm_remark_template.trim();
            if (raw.startsWith('[')) {
                try {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) {
                        setRemarks(parsed);
                        setMode('advanced');
                    } else {
                        setSimpleRemark(raw);
                        setMode('simple');
                    }
                } catch {
                    setSimpleRemark(raw);
                    setMode('simple');
                }
            } else {
                setSimpleRemark(raw);
                setMode('simple');
            }
        }
    }, [supportCase]);

    const handleAddRemark = () => {
        setRemarks([...remarks, { label_es: '', label_en: '', tag: '' }]);
    };

    const handleRemoveRemark = (index: number) => {
        const newRemarks = [...remarks];
        newRemarks.splice(index, 1);
        setRemarks(newRemarks);
    };

    const handleRemarkChange = (index: number, field: string, value: string) => {
        const newRemarks = [...remarks];
        (newRemarks[index] as any)[field] = value;
        setRemarks(newRemarks);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data: any = Object.fromEntries(formData.entries());

        // Process remarks
        if (mode === 'advanced') {
            data.crm_remark_template = JSON.stringify(remarks);
        } else {
            data.crm_remark_template = simpleRemark;
        }

        data.recommendedPromptIds = selectedPrompts.map(p => p.id);

        try {
            const url = isNew ? '/api/cases' : `/api/cases/${supportCase.id}`;
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

            router.push('/admin/cases');
            router.refresh();
        } catch (error: any) {
            console.error(error);
            alert(`Error saving case: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/cases" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition text-gray-500 dark:text-gray-400">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{isNew ? 'Create New Case' : 'Edit Case'}</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{isNew ? 'Add a new support scenario' : `Editing ${supportCase?.title_es}`}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-[#1B1F22] p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 transition-colors duration-300">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-1">Title (Spanish)</label>
                        <input
                            name="title_es"
                            defaultValue={supportCase?.title_es}
                            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#A94F2D]/20 focus:border-[#A94F2D] outline-none text-gray-900 dark:text-white bg-white dark:bg-gray-900 transition-colors"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-1">Title (English)</label>
                        <input
                            name="title_en"
                            defaultValue={supportCase?.title_en}
                            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#A94F2D]/20 focus:border-[#A94F2D] outline-none text-gray-900 dark:text-white bg-white dark:bg-gray-900 transition-colors"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-1">Category</label>
                        <select
                            name="category"
                            defaultValue={supportCase?.category || 'General'}
                            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#A94F2D]/20 focus:border-[#A94F2D] outline-none text-gray-900 dark:text-white bg-white dark:bg-gray-900 transition-colors"
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
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-1">Keywords</label>
                        <input
                            name="keywords"
                            defaultValue={supportCase?.keywords}
                            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#A94F2D]/20 focus:border-[#A94F2D] outline-none text-gray-900 dark:text-white bg-white dark:bg-gray-900 transition-colors"
                        />
                    </div>
                </div>

                {/* Condition */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-1">Condition / Scenario (ES)</label>
                        <textarea
                            name="condition"
                            defaultValue={supportCase?.condition}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#A94F2D]/20 focus:border-[#A94F2D] outline-none text-gray-900 dark:text-white bg-white dark:bg-gray-900 transition-colors"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-1">Condition / Scenario (EN)</label>
                        <textarea
                            name="condition_en"
                            defaultValue={supportCase?.condition_en || ''}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#A94F2D]/20 focus:border-[#A94F2D] outline-none text-gray-900 dark:text-white bg-white dark:bg-gray-900 transition-colors"
                        />
                    </div>
                </div>

                {/* Scripts */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Scripts</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-1">Official Script (ES)</label>
                            <textarea
                                name="script_official_es"
                                defaultValue={supportCase?.script_official_es}
                                rows={5}
                                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#A94F2D]/20 focus:border-[#A94F2D] outline-none font-mono text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-900 transition-colors"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-1">Official Script (EN)</label>
                            <textarea
                                name="script_official_en"
                                defaultValue={supportCase?.script_official_en}
                                rows={5}
                                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#A94F2D]/20 focus:border-[#A94F2D] outline-none font-mono text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-900 transition-colors"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-1">Friendly Script (ES)</label>
                            <textarea
                                name="script_friendly_es"
                                defaultValue={supportCase?.script_friendly_es || ''}
                                rows={5}
                                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#A94F2D]/20 focus:border-[#A94F2D] outline-none font-mono text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-900 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-1">Friendly Script (EN)</label>
                            <textarea
                                name="script_friendly_en"
                                defaultValue={supportCase?.script_friendly_en || ''}
                                rows={5}
                                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#A94F2D]/20 focus:border-[#A94F2D] outline-none font-mono text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-900 transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* CRM */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-1">CRM Code Type</label>
                        <input
                            name="crm_code_type"
                            defaultValue={supportCase?.crm_code_type || ''}
                            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#A94F2D]/20 focus:border-[#A94F2D] outline-none text-gray-900 dark:text-white bg-white dark:bg-gray-900 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-1">Detailed Type</label>
                        <input
                            name="crm_detailed_type"
                            defaultValue={supportCase?.crm_detailed_type || ''}
                            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#A94F2D]/20 focus:border-[#A94F2D] outline-none text-gray-900 dark:text-white bg-white dark:bg-gray-900 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-1">Complaint Status</label>
                        <select
                            name="crm_complaint_status"
                            defaultValue={supportCase?.crm_complaint_status || 'NO'}
                            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#A94F2D]/20 focus:border-[#A94F2D] outline-none text-gray-900 dark:text-white bg-white dark:bg-gray-900 transition-colors"
                        >
                            <option value="YES">YES</option>
                            <option value="NO">NO</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-2">Remark Templates</label>
                        <div className="flex gap-4 mb-4">
                            <button
                                type="button"
                                onClick={() => setMode('simple')}
                                className={`px-4 py-1 text-sm font-bold rounded-full transition ${mode === 'simple' ? 'bg-[#A94F2D] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}
                            >
                                Single (Simple)
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setMode('advanced');
                                    if (remarks.length === 0 && simpleRemark) {
                                        setRemarks([{ label: 'Standard', tag: simpleRemark }]);
                                    }
                                }}
                                className={`px-4 py-1 text-sm font-bold rounded-full transition ${mode === 'advanced' ? 'bg-[#A94F2D] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}
                            >
                                Multiple (Dynamic)
                            </button>
                        </div>

                        {mode === 'simple' ? (
                            <textarea
                                value={simpleRemark}
                                onChange={(e) => setSimpleRemark(e.target.value)}
                                rows={3}
                                placeholder="Enter a single remark template..."
                                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#A94F2D]/20 focus:border-[#A94F2D] outline-none font-mono text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-900 transition-colors"
                            />
                        ) : (
                            <div className="space-y-3 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors">
                                {remarks.map((item, idx) => (
                                    <div key={idx} className="flex gap-3 items-start animate-fadeIn">
                                        <div className="flex-1 space-y-2">
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    value={(item as any).label_es || (item as any).label || ''}
                                                    onChange={(e) => handleRemarkChange(idx, 'label_es', e.target.value)}
                                                    placeholder="Title (ES)"
                                                    className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-[#A94F2D] outline-none bg-white dark:bg-gray-800 transition-colors"
                                                />
                                                <input
                                                    value={(item as any).label_en || ''}
                                                    onChange={(e) => handleRemarkChange(idx, 'label_en', e.target.value)}
                                                    placeholder="Title (EN)"
                                                    className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-[#A94F2D] outline-none bg-white dark:bg-gray-800 transition-colors"
                                                />
                                            </div>
                                            <input
                                                value={item.tag}
                                                onChange={(e) => handleRemarkChange(idx, 'tag', e.target.value)}
                                                placeholder="Template Tag (e.g. <Verified...>)"
                                                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md font-mono text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-[#A94F2D] outline-none bg-white dark:bg-gray-800 transition-colors"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveRemark(idx)}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition mt-1"
                                            title="Remove"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={handleAddRemark}
                                    className="flex items-center gap-2 text-sm font-bold text-[#A94F2D] hover:underline mt-2"
                                >
                                    <Plus size={16} /> Add Template
                                </button>
                            </div>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Use "Multiple" to add various options like "Address Updated", "Business", etc.</p>
                    </div>
                </div>
                {/* Recommended Prompts */}
                <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recommended Prompts</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Search & Add */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-2">Add Prompt</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    value={promptSearch}
                                    onChange={(e) => setPromptSearch(e.target.value)}
                                    placeholder="Search prompts..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#A94F2D]/20 focus:border-[#A94F2D] outline-none text-gray-900 dark:text-white bg-white dark:bg-gray-900 transition-colors"
                                />
                            </div>
                            {promptSearch && (
                                <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                                    {allPrompts
                                        .filter(p => p.title.toLowerCase().includes(promptSearch.toLowerCase()) && !selectedPrompts.find(s => s.id === p.id))
                                        .map(p => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedPrompts([...selectedPrompts, p]);
                                                    setPromptSearch('');
                                                }}
                                                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-white font-medium"
                                            >
                                                {p.title} <span className="text-gray-400 text-xs ml-2">({p.category})</span>
                                            </button>
                                        ))}
                                </div>
                            )}
                        </div>

                        {/* Selected List */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-2">Selected Prompts</label>
                            <div className="space-y-2">
                                {selectedPrompts.map(p => (
                                    <div key={p.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 transition-colors">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{p.title}</span>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedPrompts(selectedPrompts.filter(s => s.id !== p.id))}
                                            className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                                {selectedPrompts.length === 0 && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400 italic">No prompts linked.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>


                <div className="flex justify-end gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Link href="/admin/cases" className="px-6 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition text-gray-700 dark:text-gray-300">
                        Cancel
                    </Link>
                    <button type="submit" disabled={loading} className="flex items-center gap-2 bg-[#A94F2D] text-white px-6 py-2 rounded-lg hover:bg-[#8e4225] transition font-medium disabled:opacity-50">
                        {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
