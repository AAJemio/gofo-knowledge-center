import React from 'react';
import { prisma } from '@/lib/prisma';
import AgentAnalyticsView from '@/components/AgentAnalyticsView';

export const dynamic = 'force-dynamic';

export default async function AgentAnalyticsPage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;

    let user = null;
    let caseInteractions: any[] = [];
    let promptInteractions: any[] = [];
    let languageStats = { en: 0, es: 0, total: 0 };

    try {
        user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                _count: { select: { interactions: true } }
            }
        });

        // Fetch top cases used
        const rawCaseInteractions = await prisma.interaction.groupBy({
            by: ['caseId'],
            where: { userId, type: 'case', caseId: { not: null } },
            _count: { caseId: true },
            orderBy: { _count: { caseId: 'desc' } },
            take: 20,
        });

        // Fetch case details for the IDs
        const caseIds = rawCaseInteractions.map(i => i.caseId as string);
        const cases = await prisma.supportCase.findMany({
            where: { id: { in: caseIds } },
            select: { id: true, title_en: true, title_es: true, category: true }
        });

        caseInteractions = rawCaseInteractions.map(i => {
            const c = cases.find(c => c.id === i.caseId);
            return { ...c, count: i._count.caseId };
        });

        // Fetch prompt interactions with language data
        // We need to fetch raw interactions to calculate language breakdown per prompt
        const rawPromptInteractions = await prisma.interaction.findMany({
            where: { userId, type: 'prompt', promptId: { not: null } },
            select: { promptId: true, language: true }
        });

        // Calculate language stats
        rawPromptInteractions.forEach(i => {
            if (i.language === 'en') languageStats.en++;
            if (i.language === 'es') languageStats.es++;
            languageStats.total++;
        });

        // Group by promptId
        const promptGroups: { [key: string]: { count: number, en: number, es: number, other: number } } = {};
        rawPromptInteractions.forEach(i => {
            if (!i.promptId) return;
            if (!promptGroups[i.promptId]) {
                promptGroups[i.promptId] = { count: 0, en: 0, es: 0, other: 0 };
            }
            promptGroups[i.promptId].count++;
            if (i.language === 'en') promptGroups[i.promptId].en++;
            else if (i.language === 'es') promptGroups[i.promptId].es++;
            else promptGroups[i.promptId].other++;
        });

        // Fetch prompt details
        const promptIds = Object.keys(promptGroups);
        const prompts = await prisma.whatsappPrompt.findMany({
            where: { id: { in: promptIds } },
            select: { id: true, title: true, title_es: true, category: true }
        });

        promptInteractions = promptIds.map(id => {
            const p = prompts.find(p => p.id === id);
            const stats = promptGroups[id];
            return {
                ...p,
                count: stats.count,
                en: stats.en,
                es: stats.es,
                other: stats.other
            };
        }).sort((a, b) => b.count - a.count).slice(0, 20);

    } catch (e) {
        console.error("DB Error", e);
    }

    if (!user) return <div className="p-8 text-center">User not found</div>;

    return (
        <AgentAnalyticsView
            user={user}
            caseInteractions={caseInteractions}
            promptInteractions={promptInteractions}
            languageStats={languageStats}
        />
    );
}
