
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { tempId, options } = body;
        const skipIds = new Set(options?.skipIds || []);

        if (!tempId) {
            return NextResponse.json({ error: 'Missing tempId.' }, { status: 400 });
        }

        // 1. Retrieve Payload
        const tempStorage = await prisma.systemTempStorage.findUnique({
            where: { id: tempId }
        });

        if (!tempStorage) {
            return NextResponse.json({ error: 'Restore session expired or invalid. Please upload again.' }, { status: 404 });
        }

        const payload = JSON.parse(tempStorage.data);
        const { backupScope, items, relationships } = payload;

        let successCount = 0;

        // 2. Transactional Upsert
        await prisma.$transaction(async (tx) => {
            // Process Items
            for (const item of items) {
                if (skipIds.has(item.id)) continue;

                // Strip relation fields (they are handled separately or via nested writes but input is flat)
                const { supportCases, recommendedPrompts, ...data } = item;
                // We need to clean up data object from any relational arrays that might be in the JSON export
                // The export JSON has "prompts" and "cases". `item` here is one of those objects.
                // The export logic in GET route uses include: { supportCases: { select: { id: true } } }
                // So item has `supportCases: [{id: ...}]`. Prisma create/update will fail if we pass this 
                // into a scalar field or wrong relation structure.

                // Helper to strip known relation keys
                const cleanData = { ...data };
                if (backupScope === 'prompts') {
                    delete cleanData.supportCases;
                    delete cleanData.interactions;
                    delete cleanData.pudoLocations;
                    delete cleanData.author;
                    delete cleanData.editor;
                    // Ensure dates are parsed correctly? Prisma usually handles ISO strings.
                } else if (backupScope === 'cases') {
                    delete cleanData.recommendedPrompts;
                    delete cleanData.interactions;
                    delete cleanData.author;
                    delete cleanData.editor;
                }

                if (backupScope === 'prompts') {
                    await tx.whatsappPrompt.upsert({
                        where: { id: item.id },
                        update: cleanData,
                        create: cleanData
                    });
                } else {
                    await tx.supportCase.upsert({
                        where: { id: item.id },
                        update: cleanData,
                        create: cleanData
                    });
                }
                successCount++;
            }

            // Process Relationships
            // We need to be careful not to wipe existing relationships if we're doing partial updates?
            // The requirement is "Re-linking".
            // Since we don't do deleteMany, existing links remain.
            // We adding new links.
            // What if a link was removed in the source?
            // "Integrity". If we import, we generally expect the state to match the backup for the involved items.
            // But strict "Sync" is hard with partials.
            // Let's implement additive linking for now to be safe.
            // Or better: ensure the specific links in backup exist.

            // Process Relationships safely
            if (relationships && relationships.length > 0) {
                for (const rel of relationships) {
                    try {
                        // Connect Prompt to Case.
                        // For implicit M-N relations, Prisma 'connect' is generally safe but can throw if constraint violated depending on DB/Prisma version.
                        // To be absolutely safe and idempotent, we can check existence first or use update with connect and catch specific error code P2002.
                        // However, simpler approach:
                        await tx.supportCase.update({
                            where: { id: rel.caseId },
                            data: {
                                recommendedPrompts: {
                                    connect: { id: rel.promptId }
                                }
                            }
                        });
                    } catch (error: any) {
                        // Ignore unique constraint violations (P2002) which mean they are already connected.
                        if (error.code !== 'P2002') {
                            console.warn(`Failed to connect case ${rel.caseId} with prompt ${rel.promptId}`, error.message);
                        }
                    }
                }
            }
        });

        // 3. Cleanup
        await prisma.systemTempStorage.delete({ where: { id: tempId } });

        return NextResponse.json({ success: true, count: successCount });

    } catch (error) {
        console.error('Execute restore failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
