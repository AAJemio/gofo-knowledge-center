import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Plus } from 'lucide-react';
import PromptsTable from './PromptsTable';

export default async function PromptsPage() {
    // Fetch ALL prompts for client-side filtering
    const prompts = await prisma.whatsappPrompt.findMany({
        orderBy: { updatedAt: 'desc' },
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">WhatsApp Prompts</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Manage bilingual WhatsApp templates.</p>
                </div>
                <Link href="/admin/prompts/new" className="flex items-center gap-2 bg-[#A94F2D] text-white px-4 py-2 rounded-lg hover:bg-[#8e4225] transition font-medium">
                    <Plus size={18} /> New Prompt
                </Link>
            </div>

            <PromptsTable prompts={prompts as any[]} />
        </div>
    );
}
