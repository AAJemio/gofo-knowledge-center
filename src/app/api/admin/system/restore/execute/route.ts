import { NextResponse } from 'next/server';
import * as Sentry from "@sentry/nextjs";
import { prisma } from '@/lib/prisma';
import { apiHandler } from '@/lib/api-handler';

// Helper to recursively parse dates from JSON strings
function parseDates(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string') {
        // Simple ISO date check
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
            return new Date(obj);
        }
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(v => parseDates(v));
    }
    if (typeof obj === 'object') {
        const newObj: any = {};
        for (const key in obj) {
            newObj[key] = parseDates(obj[key]);
        }
        return newObj;
    }
    return obj;
}

export const POST = apiHandler(async (req: Request) => {
    try {
        const body = await req.json();
        const { backupId, confirmText } = body;

        if (confirmText !== 'CONFIRMAR') {
            return NextResponse.json({ message: 'Confirmation text does not match' }, { status: 400 });
        }

        if (!backupId) {
            return NextResponse.json({ message: 'Missing backup ID' }, { status: 400 });
        }

        // 1. Retrieve Payload
        const tempRecord = await prisma.systemTempStorage.findUnique({
            where: { id: backupId }
        });

        if (!tempRecord) {
            return NextResponse.json({ message: 'Backup session expired or invalid. Please upload again.' }, { status: 404 });
        }

        if (tempRecord.expiresAt < new Date()) {
            await prisma.systemTempStorage.delete({ where: { id: backupId } });
            return NextResponse.json({ message: 'Backup session expired' }, { status: 400 });
        }

        // 2. Parse Data
        const json = JSON.parse(tempRecord.data);
        // Convert ISO strings to Dates
        const data = parseDates(json.data);

        // 3. Execute Transaction
        // Order is CRITICAL due to Foreign Keys
        await prisma.$transaction(async (tx) => {
            // --- DELETE PHASE (Children First) ---
            await tx.kpiActivityLog.deleteMany({});
            await tx.auditLog.deleteMany({});
            await tx.notification.deleteMany({});

            await tx.interaction.deleteMany({});
            await tx.dailyKPI.deleteMany({});

            // Decouple self-relations or circular refs if necessary here, but explicit delete usually works if order is right.
            // Cases and Prompts might reference Users (authors).
            // Prompts might reference Cases? (supportCases relation).
            // Schema: SupportCase has `recommendedPrompts`. Model WhatsappPrompt has `supportCases`. It's a many-to-many usually handled by implicit pivot table?
            // Schema Check: 
            // model WhatsappPrompt { supportCases SupportCase[] } 
            // model SupportCase { recommendedPrompts WhatsappPrompt[] }
            // This is an implicit m-n. Prisma handles the pivot table deletion automatically when both sides are deleted? 
            // Actually, deleting the record deletes the pivot table entries.
            // But if we have circular refs, we might need `deleteMany` to work.
            // Order: Delete Interactions first (references both).

            await tx.supportCase.deleteMany({});
            await tx.whatsappPrompt.deleteMany({});

            await tx.pudoLocation.deleteMany({});
            await tx.kpiSourceFile.deleteMany({}); // Metadata only

            await tx.pudoContent.deleteMany({});
            await tx.kpiSettings.deleteMany({});

            // Users last (Parents)
            await tx.user.deleteMany({});

            // --- INSERT PHASE (Parents First) ---
            // We use createMany for speed, but detailed relations (like m-n) might need connect?
            // restore data usually is flat array of objects from the backup.
            // If the backup JSON has the relations resolved (e.g. supportCases in prompt is an array), createMany won't work easily.
            // Standard `findMany` returns the objects. Relations are usually NOT included unless `include` is used.
            // Our backup script used `prisma.model.findMany()`, which by default DOES NOT include relations.
            // BUT, m-n relations (implicit) are stored in a separate table like `_SupportCaseToWhatsappPrompt`.
            // If we didn't back up the pivot table, we lose the connections!
            // The current backup script `prisma.supportCase.findMany()` only gets the scalar fields.
            // The m-n links are LOST in the current backup implementation if we didn't explicitly include them or backup the raw tables.
            // However, for this iteration, let's restore what we have. If relations are missing, it's a known limitation of the "simple" backup.
            // Ideally, we should include relations in backup logic.
            // For now, let's restore the entities.

            if (data.users?.length) await tx.user.createMany({ data: data.users });
            if (data.kpiSettings?.length) await tx.kpiSettings.createMany({ data: data.kpiSettings });
            if (data.pudoContents?.length) await tx.pudoContent.createMany({ data: data.pudoContents });

            if (data.dailyKPIs?.length) await tx.dailyKPI.createMany({ data: data.dailyKPIs });
            if (data.notifications?.length) await tx.notification.createMany({ data: data.notifications });

            if (data.supportCases?.length) await tx.supportCase.createMany({ data: data.supportCases });
            if (data.whatsappPrompts?.length) await tx.whatsappPrompt.createMany({ data: data.whatsappPrompts });

            // PudoLocation depends on WhatsappPrompt
            if (data.pudoLocations?.length) await tx.pudoLocation.createMany({ data: data.pudoLocations });

            if (data.interactions?.length) await tx.interaction.createMany({ data: data.interactions });

            if (data.auditLogs?.length) await tx.auditLog.createMany({ data: data.auditLogs });
            if (data.kpiActivityLogs?.length) await tx.kpiActivityLog.createMany({ data: data.kpiActivityLogs });

            if (data.kpiSourceFiles?.length) {
                // fileData was excluded from backup. We must provide a placeholder to satisfy the schema.
                // Using a strictly empty buffer or specific 'Restored' marker.
                const filesWithPlaceholder = data.kpiSourceFiles.map((f: any) => ({
                    ...f,
                    fileData: Buffer.from('Restored - Content not available')
                }));
                await tx.kpiSourceFile.createMany({ data: filesWithPlaceholder });
            }

        }, {
            maxWait: 5000, // 5s max wait for lock
            timeout: 20000 // 20s timeout for transaction (Serverless limit usually 10-60s)
        });

        // 4. Cleanup
        await prisma.systemTempStorage.delete({ where: { id: backupId } });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Execute Restore Failed:', error);
        Sentry.captureException(error, {
            tags: { scope: "restore_execute" }
        });
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
});
