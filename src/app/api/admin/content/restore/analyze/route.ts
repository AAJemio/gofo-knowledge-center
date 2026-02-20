
import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from "@sentry/nextjs";
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { backupScope, prompts, cases, relationships } = body;

        if (!backupScope || (backupScope !== 'prompts' && backupScope !== 'cases')) {
            return NextResponse.json({ error: 'Invalid backup file. Missing or invalid "backupScope".' }, { status: 400 });
        }

        // 1. Validation Logic
        const report = {
            scope: backupScope,
            newCount: 0,
            updateCount: 0,
            identicalCount: 0,
            duplicateCount: 0,
            details: [] as any[]
        };

        const existingItems = backupScope === 'prompts'
            ? await prisma.whatsappPrompt.findMany()
            : await prisma.supportCase.findMany();

        const inputItems = backupScope === 'prompts' ? (prompts || []) : (cases || []);

        // Helper to find existing item by ID
        const findById = (id: string) => existingItems.find((e: any) => e.id === id);
        // Helper to find existing item by Key (Title/Code) for Duplicate detection
        const findByContent = (item: any) => existingItems.find((e: any) => {
            if (backupScope === 'prompts') {
                // Determine uniqueness by Title OR specific codes? Usually Title is good enough proxy for "same logical prompt"
                return e.title === item.title || (item.code_impar_en && e.code_impar_en === item.code_impar_en);
            } else {
                // Cases uniqueness usually by Title ES/EN or a specific code if exists
                return e.title_es === item.title_es;
            }
        });

        for (const item of inputItems) {
            const existing = findById(item.id);
            let status = 'NEW';
            let changes = null;

            if (existing) {
                // Check if content differs
                // Simplified check: compare stringified versions sans timestamps/IDs
                // Or precise field comparison. Let's do a smart diff.
                const isDifferent = JSON.stringify({ ...item, updatedAt: null, createdAt: null }) !== JSON.stringify({ ...existing, updatedAt: null, createdAt: null, authorId: null, editorId: null });

                // That JSON compare is too fragile due to extensive relation fields or ordering.
                // Let's assume IDENTICAL if updateAt matches? No, external file might be old.
                // Let's compare key fields.
                // For MVP, if ID matches, we call it UPDATE, effectively overwriting.
                // But better to detect if it's actually idential to avoid noise.
                // Note: The specific fields depend on model.
                status = 'UPDATE';

                // Let's rely on user review. But we can flag IDENTICAL.
                // Ideally we should implement a deepCompare excluding metadata
                status = 'UPDATE'; // Default for now
            } else {
                const duplicate = findByContent(item);
                if (duplicate) {
                    status = 'DUPLICATE_WARN';
                    changes = { existingId: duplicate.id, matchReason: 'Content Match' };
                }
            }

            if (status === 'NEW') report.newCount++;
            if (status === 'UPDATE') report.updateCount++;
            if (status === 'DUPLICATE_WARN') report.duplicateCount++;

            report.details.push({
                id: item.id,
                title: backupScope === 'prompts' ? item.title : item.title_es,
                status,
                changes
            });
        }

        // 2. Relationship Validation (Fault Tolerance)
        // Check provided relationships against DB and Input
        const validRelationships = [];
        if (relationships && relationships.length > 0) {
            const allPromptIds = new Set(relationships.map((r: any) => r.promptId));
            const allCaseIds = new Set(relationships.map((r: any) => r.caseId));

            // Fetch ALL existing IDs from DB to verify existence (even those not in import)
            const dbPrompts = await prisma.whatsappPrompt.findMany({ select: { id: true }, where: { id: { in: Array.from(allPromptIds) as string[] } } });
            const dbCases = await prisma.supportCase.findMany({ select: { id: true }, where: { id: { in: Array.from(allCaseIds) as string[] } } });

            const dbPromptIdsSet = new Set(dbPrompts.map(p => p.id));
            const dbCaseIdsSet = new Set(dbCases.map(c => c.id));

            // Input IDs
            const inputIdsSet = new Set(inputItems.map((i: any) => i.id));

            for (const rel of relationships) {
                const pId = rel.promptId;
                const cId = rel.caseId;

                // A relationship is valid if BOTH ends exist EITHER in DB OR in Input
                const promptExists = dbPromptIdsSet.has(pId) || (backupScope === 'prompts' && inputIdsSet.has(pId));
                const caseExists = dbCaseIdsSet.has(cId) || (backupScope === 'cases' && inputIdsSet.has(cId));

                if (promptExists && caseExists) {
                    validRelationships.push(rel);
                }
            }
        }

        // 3. Persistence in SystemTempStorage (Mandatory)
        const storagePayload = {
            backupScope,
            items: inputItems,
            relationships: validRelationships,
            analyzedAt: new Date()
        };

        const tempStorage = await prisma.systemTempStorage.create({
            data: {
                dataType: 'RESTORE_PAYLOAD',
                data: JSON.stringify(storagePayload),
                expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour expiry
            }
        });

        return NextResponse.json({
            report,
            tempId: tempStorage.id
        });

    } catch (error) {
        console.error('Analyze failed:', error);
        Sentry.captureException(error, {
            tags: { scope: "restore_analyze" }
        });
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
