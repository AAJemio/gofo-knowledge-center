import React from 'react';
import { prisma } from '@/lib/prisma';
import AgentWorkspace from '@/app/components/AgentWorkspace';
import AKCNavigation from '@/components/AKCNavigation';

export const dynamic = 'force-dynamic';

export default async function MQAPage() {
    const cases = await prisma.supportCase.findMany({
        orderBy: { usage_count: 'desc' },
        include: { recommendedPrompts: true },
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <AKCNavigation />
            <React.Suspense fallback={<div className="p-8 text-center">Loading Workspace...</div>}>
                <AgentWorkspace initialCases={cases} />
            </React.Suspense>
        </div>
    );
}
