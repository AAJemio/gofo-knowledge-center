
'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Plus, Edit2, Trash2, MapPin, Save, Globe } from 'lucide-react';
import { useAKC } from '@/context/AKCContext';

interface PudoLocation {
    id: string;
    name: string;
    address: string;
    businessDaysEn: string;
    businessDaysEs: string;
    businessHours: string;
    contact: string;
    zipCode: string;
    whatsappPromptId?: string | null;
    status: string;
    whatsappPrompt?: { title: string };
}

interface ContentValues {
    en: string;
    es: string;
}

export default function AdminPudoTable() {
    const { theme } = useAKC();
    const [locations, setLocations] = useState<PudoLocation[]>([]);
    const [content, setContent] = useState<Record<string, { en: string, es: string }>>({});
    const [activeTab, setActiveTab] = useState<'locations' | 'content'>('locations');
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<any>({});

    // Content Editing
    const [prompts, setPrompts] = useState<any[]>([]);
    const [dirtyContent, setDirtyContent] = useState<Record<string, ContentValues>>({});

    const fetchData = async () => {
        setLoading(true);
        try {
            const [locs, cont, promptsList] = await Promise.all([
                api.pudo.list(),
                api.pudo.getContent(),
                api.prompts.list()
            ]);
            setLocations(locs);
            setContent(cont);
            setPrompts(promptsList);

            // Initialize dirty content with existing values or empty strings
            setDirtyContent({
                intro: { en: cont.intro?.en || '', es: cont.intro?.es || '' },
                footer: { en: cont.footer?.en || '', es: cont.footer?.es || '' }
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEditLocation = (loc: Partial<PudoLocation> = {}) => {
        setEditForm({
            id: loc.id || '',
            name: loc.name || '',
            address: loc.address || '',
            businessDaysEn: loc.businessDaysEn || '',
            businessDaysEs: loc.businessDaysEs || '',
            businessHours: loc.businessHours || '',
            contact: loc.contact || '',
            zipCode: loc.zipCode || '',
            whatsappPromptId: loc.whatsappPromptId || '',
            status: loc.status || 'ACTIVE'
        });
        setIsEditing(true);
    };

    // ... (keep handleSaveLocation and handleDeleteLocation and handleSaveContent)

    const handleSaveLocation = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...editForm,
                whatsappPromptId: editForm.whatsappPromptId || null
            };

            let response;
            if (editForm.id) {
                response = await api.pudo.update(editForm.id, payload);
            } else {
                response = await api.pudo.create(payload);
            }

            setIsEditing(false);
            fetchData();
        } catch (error: any) {
            console.error('Save Error:', error);
            // Check if error is an object with message (from api-handler)
            const msg = error?.message || error?.toString() || 'Failed to save location';
            alert(`Error: ${msg}`);
        }
    };

    const handleDeleteLocation = async (id: string) => {
        if (!confirm('Are you sure you want to delete this location?')) return;
        try {
            await api.pudo.delete(id);
            fetchData();
        } catch (error) {
            alert('Failed to delete location');
        }
    };

    const handleSaveContent = async (key: string) => {
        try {
            await api.pudo.updateContent({
                key,
                contentEn: dirtyContent[key].en,
                contentEs: dirtyContent[key].es
            });
            alert('Content saved!');
            fetchData();
        } catch (error) {
            alert('Failed to save content');
        }
    };

    if (loading && !isEditing) return <div>Loading...</div>;

    return (
        <div className={`rounded-xl border shadow-sm ${theme === 'dark' ? 'bg-[#1B1F22] border-gray-800' : 'bg-white border-slate-200'}`}>
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-800">
                <button
                    onClick={() => setActiveTab('locations')}
                    className={`px-6 py-4 text-sm font-bold border-b-2 transition ${activeTab === 'locations' ? 'border-[#EF4D23] text-[#EF4D23]' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    Locations ({locations.length})
                </button>
                <button
                    onClick={() => setActiveTab('content')}
                    className={`px-6 py-4 text-sm font-bold border-b-2 transition ${activeTab === 'content' ? 'border-[#EF4D23] text-[#EF4D23]' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    General Content
                </button>
            </div>

            <div className="p-6">
                {activeTab === 'locations' ? (
                    <>
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => handleEditLocation()}
                                className="flex items-center gap-2 bg-[#EF4D23] hover:bg-[#d63f1a] text-white px-4 py-2 rounded-lg font-bold text-sm transition"
                            >
                                <Plus size={16} /> Add Location
                            </button>
                        </div>

                        {/* List */}
                        <div className="space-y-4">
                            {locations.map(loc => (
                                <div key={loc.id} className={`p-4 rounded-lg border flex flex-col md:flex-row justify-between gap-4 ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-slate-200'}`}>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{loc.name}</h3>
                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${loc.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700'}`}>
                                                {loc.status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                                            <p>{loc.address} ({loc.zipCode})</p>
                                            <p className="flex items-center gap-2">
                                                <span className="font-bold text-xs uppercase">Contact:</span> {loc.contact}
                                            </p>
                                            {loc.whatsappPrompt && (
                                                <p className="flex items-center gap-2 text-indigo-500">
                                                    <span className="font-bold text-xs uppercase text-gray-500">Prompt:</span> {loc.whatsappPrompt.title}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 self-start md:self-center">
                                        <button onClick={() => handleEditLocation(loc)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDeleteLocation(loc.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {locations.length === 0 && (
                                <div className="text-center py-8 text-gray-500">No locations found.</div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="space-y-8">
                        {/* Intro */}
                        <ContentEditor
                            title="Introduction Text"
                            description="Text displayed at the top of the PUDO page."
                            values={dirtyContent.intro || { en: '', es: '' }}
                            onChange={(vals: ContentValues) => setDirtyContent({ ...dirtyContent, intro: vals })}
                            onSave={() => handleSaveContent('intro')}
                            theme={theme}
                        />

                        {/* Footer */}
                        <ContentEditor
                            title="Footer Text"
                            description="Text displayed at the bottom of the PUDO page."
                            values={dirtyContent.footer || { en: '', es: '' }}
                            onChange={(vals: ContentValues) => setDirtyContent({ ...dirtyContent, footer: vals })}
                            onSave={() => handleSaveContent('footer')}
                            theme={theme}
                        />
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className={`w-full max-w-2xl rounded-xl shadow-2xl overflow-y-auto max-h-[90vh] ${theme === 'dark' ? 'bg-[#1e293b] text-white' : 'bg-white text-slate-800'}`}>
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold">{editForm.id ? 'Edit Location' : 'New Location'}</h2>
                            <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <form onSubmit={handleSaveLocation} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Name" value={editForm.name || ''} onChange={(v: string) => setEditForm({ ...editForm, name: v })} required />
                                <Input label="Contact (Phone)" value={editForm.contact || ''} onChange={(v: string) => setEditForm({ ...editForm, contact: v })} required />
                            </div>
                            <Input label="Address" value={editForm.address || ''} onChange={(v: string) => setEditForm({ ...editForm, address: v })} required />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Zip Code" value={editForm.zipCode || ''} onChange={(v: string) => setEditForm({ ...editForm, zipCode: v })} required />
                                <Input label="Business Hours" value={editForm.businessHours || ''} onChange={(v: string) => setEditForm({ ...editForm, businessHours: v })} placeholder="e.g. 8:30-17:00" required />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Business Days</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input label="English (e.g. Mon-Sat)" value={editForm.businessDaysEn || ''} onChange={(v: string) => setEditForm({ ...editForm, businessDaysEn: v })} required />
                                    <Input label="Spanish (e.g. Lun-Sab)" value={editForm.businessDaysEs || ''} onChange={(v: string) => setEditForm({ ...editForm, businessDaysEs: v })} required />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">WhatsApp Prompt (Optional)</label>
                                <select
                                    className="w-full px-3 py-2 rounded-lg border bg-transparent focus:ring-2 focus:ring-[#EF4D23] outline-none transition dark:border-gray-600 dark:bg-gray-900/50"
                                    value={editForm.whatsappPromptId || ''}
                                    onChange={e => setEditForm({ ...editForm, whatsappPromptId: e.target.value })}
                                >
                                    <option value="">Select a prompt...</option>
                                    {prompts
                                        .filter(p => p.title.toLowerCase().includes('pudo'))
                                        .map(p => (
                                            <option key={p.id} value={p.id} className="dark:bg-gray-800">
                                                {p.title} ({p.code_impar_en || p.code_par_es || 'No code'})
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600">Cancel</button>
                                <button type="submit" className="px-6 py-2 rounded-lg bg-[#EF4D23] text-white font-bold hover:bg-[#d63f1a]">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function Input({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
    return (
        <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</label>
            <input
                className="w-full px-3 py-2 rounded-lg border bg-transparent focus:ring-2 focus:ring-[#EF4D23] outline-none transition dark:border-gray-600 dark:bg-gray-900/50"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
            />
        </div>
    );
}

function ContentEditor({ title, description, values, onChange, onSave, theme }: { title: string; description: string; values: ContentValues; onChange: (v: ContentValues) => void; onSave: () => void; theme: string }) {
    return (
        <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-gray-800/30 border-gray-700' : 'bg-gray-50 border-slate-200'}`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
                    <p className="text-xs text-gray-500">{description}</p>
                </div>
                <button
                    onClick={onSave}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition"
                >
                    <Save size={16} /> Save
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                        🇺🇸 English
                    </label>
                    <textarea
                        className={`w-full h-40 p-4 rounded-lg border resize-none focus:ring-2 focus:ring-blue-500 outline-none ${theme === 'dark' ? 'bg-gray-900 border-gray-600 text-slate-300' : 'bg-white border-gray-300 text-slate-800'}`}
                        value={values.en}
                        onChange={e => onChange({ ...values, en: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                        🇪🇸 Español
                    </label>
                    <textarea
                        className={`w-full h-40 p-4 rounded-lg border resize-none focus:ring-2 focus:ring-blue-500 outline-none ${theme === 'dark' ? 'bg-gray-900 border-gray-600 text-slate-300' : 'bg-white border-gray-300 text-slate-800'}`}
                        value={values.es}
                        onChange={e => onChange({ ...values, es: e.target.value })}
                    />
                </div>
            </div>
        </div>
    );
}
