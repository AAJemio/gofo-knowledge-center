'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Edit, Trash2, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import { useAKC } from '@/context/AKCContext';

interface SupportCase {
    id: string;
    title_es: string | null;
    title_en: string | null;
    category: string | null;
    crm_code_type: string | null;
}

export default function CasesTable({ cases }: { cases: SupportCase[] }) {
    const { language } = useAKC();
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const filteredCases = useMemo(() => {
        let result = [...cases];

        // Filter
        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter(c =>
                (c.title_es && c.title_es.toLowerCase().includes(lowerSearch)) ||
                (c.title_en && c.title_en.toLowerCase().includes(lowerSearch)) ||
                (c.category && c.category.toLowerCase().includes(lowerSearch)) ||
                (c.crm_code_type && c.crm_code_type.toLowerCase().includes(lowerSearch))
            );
        }

        // Sort
        if (sortConfig) {
            result.sort((a, b) => {
                let aValue = (a as any)[sortConfig.key] || '';
                let bValue = (b as any)[sortConfig.key] || '';

                // Special handling for title sorting to include both languages checks or fallback
                if (sortConfig.key === 'title') {
                    aValue = (a.title_es || a.title_en || '').toLowerCase();
                    bValue = (b.title_es || b.title_en || '').toLowerCase();
                } else if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return result;
    }, [cases, search, sortConfig]);

    const handleRowClick = (id: string) => {
        router.push(`/admin/cases/${id}`);
    };

    return (
        <div>
            {/* Search Bar */}
            <div className="bg-white dark:bg-[#1B1F22] p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 mb-6 transition-colors duration-300">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" size={20} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search cases by title, category, or CRM..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A94F2D]/20 focus:border-[#A94F2D] transition text-gray-900 dark:text-white font-medium placeholder-gray-500 dark:placeholder-gray-400 bg-transparent dark:bg-gray-900"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#1B1F22] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors duration-300">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-xs uppercase text-gray-600 dark:text-gray-400 font-bold transition-colors duration-300">
                            <th
                                className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition group select-none"
                                onClick={() => handleSort('title')}
                            >
                                <div className="flex items-center gap-1">
                                    {language === 'es' ? 'Título (ES/EN)' : 'Title (EN/ES)'}
                                    <ArrowUpDown size={14} className={`text-gray-400 dark:text-gray-500 ${sortConfig?.key === 'title' ? 'text-[#A94F2D] dark:text-[#EF4D23]' : 'group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                                </div>
                            </th>
                            <th
                                className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition group select-none"
                                onClick={() => handleSort('category')}
                            >
                                <div className="flex items-center gap-1">
                                    Category
                                    <ArrowUpDown size={14} className={`text-gray-400 dark:text-gray-500 ${sortConfig?.key === 'category' ? 'text-[#A94F2D] dark:text-[#EF4D23]' : 'group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                                </div>
                            </th>
                            <th
                                className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition group select-none"
                                onClick={() => handleSort('crm_code_type')}
                            >
                                <div className="flex items-center gap-1">
                                    CRM Type
                                    <ArrowUpDown size={14} className={`text-gray-400 dark:text-gray-500 ${sortConfig?.key === 'crm_code_type' ? 'text-[#A94F2D] dark:text-[#EF4D23]' : 'group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {filteredCases.map((c) => (
                            <tr
                                key={c.id}
                                onClick={() => handleRowClick(c.id)}
                                className="hover:bg-gray-50 dark:hover:bg-gray-900 transition cursor-pointer group"
                            >
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-900 dark:text-white">
                                        {language === 'es' ? (c.title_es || 'Sin Título') : (c.title_en || 'No Title')}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
                                        {language === 'es' ? (c.title_en || 'No Title') : (c.title_es || 'Sin Título')}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                                        {c.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 font-medium">
                                    {c.crm_code_type || '-'}
                                </td>
                                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-end gap-2">
                                        <Link href={`/admin/cases/${c.id}`} className="p-2 text-gray-400 hover:text-[#A94F2D] dark:hover:text-[#EF4D23] hover:bg-[#A94F2D]/10 dark:hover:bg-[#EF4D23]/10 rounded-lg transition">
                                            <Edit size={18} />
                                        </Link>
                                        <button className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredCases.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 font-medium">
                                    No cases found matching "{search}".
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                Showing {filteredCases.length} cases
            </div>
        </div>
    );
}
