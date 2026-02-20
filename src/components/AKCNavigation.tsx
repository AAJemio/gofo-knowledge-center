'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, LayoutGrid, MessageSquare, ShieldCheck, Moon, Sun, Globe, BarChart2, BarChart3, Settings, MapPin, Users, LayoutDashboard, TrendingUp } from 'lucide-react';
import { useAKC } from '@/context/AKCContext';
import ProfileModal from './ProfileModal';
import NotificationCenter from './NotificationCenter';
import { BrandLogo } from './BrandLogo';

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
                    <div className="flex justify-between items-center h-14">
                        {/* Brand */}
                        <div className="flex items-center gap-3">
                            <Link href="/mqa" className="flex items-center gap-2 group">
                                {/* Logo Image */}
                                <BrandLogo className="h-6 object-contain" />
                                <div className="flex flex-col">
                                    <span className="font-bold text-base leading-none text-[#EF4D23]">AKC</span>
                                    <span className="text-[9px] text-gray-500 dark:text-gray-400 font-medium tracking-wider hidden lg:block">AGENT KNOWLEDGE CENTER</span>
                                </div>
                            </Link>
                        </div>

                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center gap-0.5 bg-gray-100 dark:bg-gray-900/50 p-0.5 rounded-lg border border-gray-200 dark:border-gray-800">
                            <Link
                                href="/mqa"
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${isActive('/mqa')
                                    ? 'bg-[#EF4D23] text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800'
                                    }`}
                            >
                                <LayoutGrid size={14} />
                                MQA
                            </Link>
                            <div className="w-px h-4 bg-gray-200 dark:bg-gray-800 mx-0.5"></div>
                            <Link
                                href="/prompts"
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${isActive('/prompts')
                                    ? 'bg-[#EF4D23] text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800'
                                    }`}
                            >
                                <MessageSquare size={14} />
                                WAP
                            </Link>
                            <div className="w-px h-4 bg-gray-200 dark:bg-gray-800 mx-0.5"></div>
                            <Link
                                href="/agent/analytics"
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${isActive('/agent/analytics')
                                    ? 'bg-[#EF4D23] text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800'
                                    }`}
                            >
                                <BarChart2 size={14} />
                                Stats
                            </Link>

                            <div className="w-px h-4 bg-gray-200 dark:bg-gray-800 mx-0.5"></div>
                            <Link
                                href="/agent/kpi"
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${isActive('/agent/kpi')
                                    ? 'bg-[#EF4D23] text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800'
                                    }`}
                            >
                                <TrendingUp size={14} />
                                My KPIs
                            </Link>


                            {currentUser?.role === 'admin' && (
                                <>
                                    <div className="w-px h-4 bg-gray-200 dark:bg-gray-800 mx-0.5"></div>
                                    <Link
                                        href="/admin/cases"
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${isActive('/admin')
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        <ShieldCheck size={14} />
                                        Admin
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* User Actions & Toggles */}
                        <div className="flex items-center gap-2">
                            <NotificationCenter />

                            {/* Admin Links */}
                            {currentUser?.role === 'admin' && (
                                <>
                                    <Link
                                        href="/admin/users"
                                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-bold transition ${pathname === '/admin/users' ? 'bg-[#EF4D23]/10 text-[#EF4D23]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800'}`}
                                    >
                                        <Users size={16} />
                                        <span className="hidden xl:inline">Users</span>
                                    </Link>

                                    <Link
                                        href="/admin/analytics"
                                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-bold transition ${pathname === '/admin/analytics' ? 'bg-[#EF4D23]/10 text-[#EF4D23]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800'}`}
                                    >
                                        <BarChart3 size={16} />
                                        <span className="hidden xl:inline">Analytics</span>
                                    </Link>
                                </>
                            )}

                            {/* Language Toggle */}
                            <div className="flex bg-gray-100 dark:bg-gray-800 p-0.5 rounded-md border border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => setLanguage('es')}
                                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition ${language === 'es' ? 'bg-white dark:bg-gray-700 text-[#EF4D23] shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                                >
                                    ES
                                </button>
                                <button
                                    onClick={() => setLanguage('en')}
                                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition ${language === 'en' ? 'bg-white dark:bg-gray-700 text-[#EF4D23] shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                                >
                                    EN
                                </button>
                            </div>

                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                            >
                                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                            </button>

                            <div className="w-px h-4 bg-gray-200 dark:bg-gray-800 mx-0.5 hidden md:block"></div>

                            <button
                                onClick={() => setIsProfileOpen(true)}
                                className="text-right hidden md:block hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded-md transition group"
                            >
                                <div className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-[#EF4D23] transition-colors whitespace-nowrap">
                                    {currentUser?.firstName} {currentUser?.lastName}
                                </div>
                                <div className="text-[9px] text-green-500 font-bold uppercase flex items-center justify-end gap-1 whitespace-nowrap">
                                    {currentUser?.role} • Online <Settings size={8} className="text-gray-400" />
                                </div>
                            </button>
                            <button onClick={logout} className="p-1.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-300 transition">
                                <LogOut size={16} />
                            </button>
                        </div>
                    </div>
                </div>
                <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
            </nav >
        </>
    );
}
