'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Edit, Trash2, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';

interface Prompt {
    id: string;
    title: string;
    title_es: string | null;
    category: string;
    code_impar_en: string | null;
    code_par_es: string | null;
}

export default function PromptsTable({ prompts }: { prompts: Prompt[] }) {
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

    const filteredPrompts = useMemo(() => {
        let result = [...prompts];

        // Filter
        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter(p =>
                p.title.toLowerCase().includes(lowerSearch) ||
                (p.title_es && p.title_es.toLowerCase().includes(lowerSearch)) ||
                p.category.toLowerCase().includes(lowerSearch) ||
                (p.code_impar_en && p.code_impar_en.toLowerCase().includes(lowerSearch)) ||
                (p.code_par_es && p.code_par_es.toLowerCase().includes(lowerSearch))
            );
        }

        // Sort
        if (sortConfig) {
            result.sort((a, b) => {
                const aValue = (a as any)[sortConfig.key] || '';
                const bValue = (b as any)[sortConfig.key] || '';

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
    }, [prompts, search, sortConfig]);

    const handleRowClick = (id: string) => {
        router.push(`/admin/prompts/${id}`);
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
                        placeholder="Search prompts by title, code, or category..."
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
                                    Title
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
                                onClick={() => handleSort('code_impar_en')}
                            >
                                <div className="flex items-center gap-1">
                                    Codes (EN/ES)
                                    <ArrowUpDown size={14} className={`text-gray-400 dark:text-gray-500 ${sortConfig?.key === 'code_impar_en' ? 'text-[#A94F2D] dark:text-[#EF4D23]' : 'group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {filteredPrompts.map((p) => (
                            <tr
                                key={p.id}
                                onClick={() => handleRowClick(p.id)}
                                className="hover:bg-gray-50 dark:hover:bg-gray-900 transition cursor-pointer group"
                            >
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                    <div className="font-bold">{p.title}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">{(p as any).title_es || '-'}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                                        {p.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 font-mono font-medium">
                                    {p.code_impar_en || '-'} / {p.code_par_es || '-'}
                                </td>
                                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-end gap-2">
                                        <Link href={`/admin/prompts/${p.id}`} className="p-2 text-gray-400 hover:text-[#A94F2D] dark:hover:text-[#EF4D23] hover:bg-[#A94F2D]/10 dark:hover:bg-[#EF4D23]/10 rounded-lg transition">
                                            <Edit size={18} />
                                        </Link>
                                        <button className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredPrompts.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 font-medium">
                                    No prompts found matching "{search}".
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                Showing {filteredPrompts.length} prompts
            </div>
        </div>
    );
}
