'use client';

import React, { useState, useEffect } from 'react';
import { X, User as UserIcon, Globe, Moon, Sun, Layout, Save, LogOut, CheckCircle2 } from 'lucide-react';
import { useAKC } from '@/context/AKCContext';
import { User } from '@/services/api';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const { currentUser, updateProfile, logout, language, setLanguage, theme, toggleTheme } = useAKC();

    // Local state for staging changes
    const [formData, setFormData] = useState<Partial<User>>({
        firstName: '',
        lastName: '',
        language: 'es',
        theme: 'light',
        defaultPage: 'mqa',
        wapViewMode: 'grid'
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const isInitialized = React.useRef(false);

    // Initialize local state from currentUser only once when modal opens
    useEffect(() => {
        if (isOpen && currentUser && !isInitialized.current) {
            setFormData({
                firstName: currentUser.firstName || '',
                lastName: currentUser.lastName || '',
                language: currentUser.language || 'es',
                theme: currentUser.theme || 'light',
                defaultPage: currentUser.defaultPage || 'mqa',
                wapViewMode: currentUser.wapViewMode || 'grid'
            });
            isInitialized.current = true;
        }

        // Reset initialization flag when modal closes
        if (!isOpen) {
            isInitialized.current = false;
        }
    }, [isOpen, currentUser]);

    // Check if form has changes
    const isDirty = React.useMemo(() => {
        if (!currentUser) return false;
        return (
            formData.firstName !== (currentUser.firstName || '') ||
            formData.lastName !== (currentUser.lastName || '') ||
            formData.language !== (currentUser.language || 'es') ||
            formData.theme !== (currentUser.theme || 'light') ||
            formData.defaultPage !== (currentUser.defaultPage || 'mqa') ||
            formData.wapViewMode !== (currentUser.wapViewMode || 'grid')
        );
    }, [formData, currentUser]);

    if (!isOpen || !currentUser) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // If no changes, just close (Act as "Accept")
        if (!isDirty) {
            onClose();
            return;
        }

        setLoading(true);
        try {
            // 1. Update Backend Profile
            await updateProfile({
                firstName: formData.firstName,
                lastName: formData.lastName,
                language: formData.language as 'es' | 'en',
                theme: formData.theme as 'light' | 'dark',
                defaultPage: formData.defaultPage,
                wapViewMode: formData.wapViewMode
            });

            // 2. Apply Context Changes (UI Update)
            if (formData.language !== language) setLanguage(formData.language as 'es' | 'en');

            // Only toggle theme if it actually changed
            if (formData.theme !== theme) {
                toggleTheme();
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getButtonText = () => {
        if (loading) return language === 'es' ? 'Guardando...' : 'Saving...';
        if (success) return language === 'es' ? '¡Guardado!' : 'Saved!';
        if (!isDirty) return language === 'es' ? 'Aceptar' : 'Accept';
        return language === 'es' ? 'Guardar Cambios' : 'Save Changes';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-[#1B1F22] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-[#151719]">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <UserIcon size={20} className="text-[#EF4D23]" />
                        {language === 'es' ? 'Perfil y Preferencias' : 'Profile & Preferences'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8 max-h-[80vh] overflow-y-auto">
                    {/* Name Fields */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">
                                    {language === 'es' ? 'Nombre' : 'First Name'}
                                </label>
                                <input
                                    value={formData.firstName}
                                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-[#EF4D23]/50 outline-none transition dark:text-white"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">
                                    {language === 'es' ? 'Apellido' : 'Last Name'}
                                </label>
                                <input
                                    value={formData.lastName}
                                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-[#EF4D23]/50 outline-none transition dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Appearance Section */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-2">
                            {language === 'es' ? 'Apariencia' : 'Appearance'}
                        </h3>

                        {/* Language */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                    <Globe size={18} />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {language === 'es' ? 'Idioma' : 'Language'}
                                </span>
                            </div>
                            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, language: 'es' })}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${formData.language === 'es' ? 'bg-white dark:bg-gray-700 text-[#EF4D23] shadow-sm' : 'text-gray-400'}`}
                                >
                                    Español
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, language: 'en' })}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${formData.language === 'en' ? 'bg-white dark:bg-gray-700 text-[#EF4D23] shadow-sm' : 'text-gray-400'}`}
                                >
                                    English
                                </button>
                            </div>
                        </div>

                        {/* Theme */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                                    {formData.theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {language === 'es' ? 'Tema' : 'Theme'}
                                </span>
                            </div>
                            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, theme: 'light' })}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${formData.theme === 'light' ? 'bg-white dark:bg-gray-700 text-[#EF4D23] shadow-sm' : 'text-gray-400'}`}
                                >
                                    {language === 'es' ? 'Claro' : 'Light'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, theme: 'dark' })}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${formData.theme === 'dark' ? 'bg-white dark:bg-gray-700 text-[#EF4D23] shadow-sm' : 'text-gray-400'}`}
                                >
                                    {language === 'es' ? 'Oscuro' : 'Dark'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Startup Section */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-2">
                            {language === 'es' ? 'Inicio y Navegación' : 'Startup & Navigation'}
                        </h3>

                        {/* Restore Session Toggle */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                                    <Layout size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {language === 'es' ? 'Restaurar Sesión' : 'Restore Session'}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                        {language === 'es' ? 'Volver a donde quedaste' : 'Return to where you left off'}
                                    </span>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.defaultPage === 'last-visited'}
                                    onChange={e => setFormData({ ...formData, defaultPage: e.target.checked ? 'last-visited' : '/mqa' })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#EF4D23]/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#EF4D23]"></div>
                            </label>
                        </div>

                        {/* Start Page Dropdown (Conditional) */}
                        <div className={`transition-all duration-300 ${formData.defaultPage === 'last-visited' ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-gray-500 uppercase ml-12">
                                    {language === 'es' ? 'Página de Inicio Predeterminada' : 'Default Start Page'}
                                </span>
                            </div>
                            <div className="ml-12">
                                <select
                                    value={formData.defaultPage === 'last-visited' ? '' : formData.defaultPage}
                                    onChange={e => setFormData({ ...formData, defaultPage: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-[#EF4D23]/50 outline-none dark:text-white"
                                >
                                    <option value="" disabled>{language === 'es' ? 'Seleccionar página...' : 'Select page...'}</option>
                                    <option value="/mqa">MQA (Agent)</option>
                                    <option value="/prompts">WhatsApp Prompts</option>
                                    {currentUser?.role === 'admin' && <option value="/admin/cases">Admin Panel</option>}
                                </select>
                            </div>
                        </div>

                        {/* WAP View Mode */}
                        <div className={`flex items-center justify-between pt-2 transition-all duration-300 ${formData.defaultPage !== '/prompts' ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
                                    <Layout size={18} />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {language === 'es' ? 'Vista de WhatsApp' : 'WhatsApp View'}
                                </span>
                            </div>
                            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, wapViewMode: 'grid' })}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${formData.wapViewMode === 'grid' ? 'bg-white dark:bg-gray-700 text-[#EF4D23] shadow-sm' : 'text-gray-400'}`}
                                >
                                    {language === 'es' ? 'Grilla' : 'Grid'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, wapViewMode: 'list' })}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${formData.wapViewMode === 'list' ? 'bg-white dark:bg-gray-700 text-[#EF4D23] shadow-sm' : 'text-gray-400'}`}
                                >
                                    {language === 'es' ? 'Lista' : 'List'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={logout}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition font-medium text-sm"
                        >
                            <LogOut size={18} />
                            {language === 'es' ? 'Cerrar Sesión' : 'Log Out'}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-[2] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition font-bold text-sm shadow-lg disabled:opacity-70 ${!isDirty && !success
                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                                : 'bg-[#EF4D23] hover:bg-[#d63f1a] text-white shadow-orange-500/20'
                                }`}
                        >
                            {loading ? (
                                <span className="animate-spin">⏳</span>
                            ) : (
                                <>
                                    {!isDirty && !success ? <CheckCircle2 size={18} className="text-green-500" /> : <Save size={18} />}
                                    {getButtonText()}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
