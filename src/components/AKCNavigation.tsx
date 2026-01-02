'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, LayoutGrid, MessageSquare, ShieldCheck, Moon, Sun, Globe, BarChart2, Settings } from 'lucide-react';
import { useAKC } from '@/context/AKCContext';
import ProfileModal from './ProfileModal';

export default function AKCNavigation() {
    const pathname = usePathname();
    const { language, setLanguage, theme, toggleTheme, currentUser, logout, updateDefaultPage } = useAKC();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const isActive = (path: string) => pathname.startsWith(path);

    // Track last visited path automatically
    React.useEffect(() => {
        if (pathname && currentUser) {
            // Debounce or just save? For now, save on every change is fine as it's just a fetch.
            // Maybe exclude login page or root?
            if (pathname !== '/' && !pathname.startsWith('/api')) {
                updateDefaultPage(pathname);
            }
        }
    }, [pathname, currentUser]);

    // Helper to handle navigation (now just a pass-through or removed if not needed)
    // We can remove handleNavClick and just use Link directly since useEffect handles tracking.
    const handleNavClick = () => {
        // No-op, kept for compatibility if needed, or remove usage in JSX
    };

    return (
        <>
            <nav className="bg-white dark:bg-[#1B1F22] border-b border-gray-200 dark:border-gray-800 text-gray-800 dark:text-white sticky top-0 z-50 transition-colors duration-300 shadow-sm">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        {/* Brand */}
                        <div className="flex items-center gap-4">
                            <Link href="/mqa" className="flex items-center gap-2 group">
                                {/* Logo Image */}
                                <img src="/gofo-logo.png" alt="Gofo Logo" className="h-8 object-contain" />
                                <div className="flex flex-col">
                                    <span className="font-bold text-lg leading-none text-[#EF4D23]">AKC</span>
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wider">AGENT KNOWLEDGE CENTER</span>
                                </div>
                            </Link>
                        </div>

                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center gap-1 bg-gray-100 dark:bg-gray-900/50 p-1 rounded-xl border border-gray-200 dark:border-gray-800">
                            <Link
                                href="/mqa"
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${isActive('/mqa')
                                    ? 'bg-[#EF4D23] text-white shadow-md'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800'
                                    }`}
                            >
                                <LayoutGrid size={18} />
                                MQA
                            </Link>
                            <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1"></div>
                            <Link
                                href="/prompts"
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${isActive('/prompts')
                                    ? 'bg-[#EF4D23] text-white shadow-md'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800'
                                    }`}
                            >
                                <MessageSquare size={18} />
                                WAP
                            </Link>
                            <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1"></div>
                            <Link
                                href="/agent/analytics"
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${isActive('/agent/analytics')
                                    ? 'bg-[#EF4D23] text-white shadow-md'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800'
                                    }`}
                            >
                                <BarChart2 size={18} />
                                Stats
                            </Link>

                            {currentUser?.role === 'admin' && (
                                <>
                                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1"></div>
                                    <Link
                                        href="/admin/cases"
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${isActive('/admin')
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        <ShieldCheck size={18} />
                                        Admin
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* User Actions & Toggles */}
                        <div className="flex items-center gap-3">
                            {/* Language Toggle */}
                            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => setLanguage('es')}
                                    className={`px-2 py-1 text-xs font-bold rounded-md transition ${language === 'es' ? 'bg-white dark:bg-gray-700 text-[#EF4D23] shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                                >
                                    ES
                                </button>
                                <button
                                    onClick={() => setLanguage('en')}
                                    className={`px-2 py-1 text-xs font-bold rounded-md transition ${language === 'en' ? 'bg-white dark:bg-gray-700 text-[#EF4D23] shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                                >
                                    EN
                                </button>
                            </div>

                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                            >
                                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                            </button>

                            <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1 hidden md:block"></div>

                            <button
                                onClick={() => setIsProfileOpen(true)}
                                className="text-right hidden md:block hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded-lg transition group"
                            >
                                <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#EF4D23] transition-colors">
                                    {currentUser?.firstName} {currentUser?.lastName}
                                </div>
                                <div className="text-[10px] text-green-500 font-bold uppercase flex items-center justify-end gap-1">
                                    {currentUser?.role} • Online <Settings size={10} className="text-gray-400" />
                                </div>
                            </button>
                            <button onClick={logout} className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-300 transition">
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </div>
                <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
            </nav>
        </>
    );
}
