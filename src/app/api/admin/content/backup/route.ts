
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const scope = searchParams.get('scope'); // 'prompts' | 'cases'

        if (!scope || (scope !== 'prompts' && scope !== 'cases')) {
            return NextResponse.json({ error: 'Invalid scope. Must be "prompts" or "cases".' }, { status: 400 });
        }

        const backupData: any = {
            version: "1.0",
            timestamp: new Date().toISOString(),
            backupScope: scope,
            prompts: [],
            cases: [],
            relationships: []
        };

        if (scope === 'prompts') {
            // Fetch Prompts with Relations
            const promptsWithRelations = await prisma.whatsappPrompt.findMany({
                include: {
                    supportCases: { select: { id: true } }
                }
            });

            // Extract relationships manually to flat format
            promptsWithRelations.forEach(p => {
                p.supportCases.forEach(c => {
                    backupData.relationships.push({ caseId: c.id, promptId: p.id });
                });
            });

            // Clean up the main prompts array (remove the included supportCases if we want pure model data)
            backupData.prompts = promptsWithRelations.map(({ supportCases, ...rest }) => rest);

        } else if (scope === 'cases') {
            // Fetch Cases with Relations
            const casesWithRelations = await prisma.supportCase.findMany({
                include: {
                    recommendedPrompts: { select: { id: true } }
                }
            });

            backupData.cases = casesWithRelations.map(({ recommendedPrompts, ...rest }) => rest);

            // Extract relationships 
            casesWithRelations.forEach(c => {
                c.recommendedPrompts.forEach(p => {
                    // Avoid duplicates if we were doing mixed scope, but here it's isolated.
                    backupData.relationships.push({ caseId: c.id, promptId: p.id });
                });
            });
        }

        // Return as JSON file download
        const jsonString = JSON.stringify(backupData, null, 2);

        return new NextResponse(jsonString, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="gofo_${scope}_backup_${new Date().toISOString().split('T')[0]}.json"`
            }
        });

    } catch (error) {
        console.error('Backup failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
