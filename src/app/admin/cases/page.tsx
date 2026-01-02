import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Plus } from 'lucide-react';
import CasesTable from './CasesTable';

export default async function CasesPage() {
    // Fetch ALL cases for client-side filtering/sorting
    const cases = await prisma.supportCase.findMany({
        orderBy: { updatedAt: 'desc' },
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support Cases</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Manage MQA support flows and scripts.</p>
                </div>
                <Link href="/admin/cases/new" className="flex items-center gap-2 bg-[#A94F2D] text-white px-4 py-2 rounded-lg hover:bg-[#8e4225] transition font-medium">
                    <Plus size={18} /> New Case
                </Link>
            </div>

            <CasesTable cases={cases as any[]} />
        </div>
    );
}
