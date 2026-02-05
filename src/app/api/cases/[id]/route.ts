import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler } from '@/lib/api-handler';

import { logAction } from '@/services/audit';
import { getCurrentUser } from '@/lib/session';
import { createNotification } from '@/lib/notifications';
import { revalidatePath } from 'next/cache';

export const PUT = apiHandler(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const body = await request.json();
    const { recommendedPromptIds, highlightType, ...rest } = body;
    const data: any = { ...rest };

    if (recommendedPromptIds && Array.isArray(recommendedPromptIds)) {
        data.recommendedPrompts = {
            set: recommendedPromptIds.map((pid: string) => ({ id: pid }))
        };
    }

    // Fetch previous state
    const previousState = await prisma.supportCase.findUnique({ where: { id } });

    const updatedCase = await prisma.supportCase.update({
        where: { id },
        data,
    });

    const user = await getCurrentUser();
    if (user) {
        await logAction(
            user.id,
            'UPDATE',
            'CASE',
            id,
            `Updated case: ${updatedCase.title_es || updatedCase.title_en}`,
            previousState,
            updatedCase
        );
    }

    // Calculate changes
    const changes: string[] = [];
    if (previousState) {
        if (updatedCase.title_en !== previousState.title_en) changes.push('Title (EN)');
        if (updatedCase.title_es !== previousState.title_es) changes.push('Title (ES)');
        if (updatedCase.keywords !== previousState.keywords) changes.push('Keywords');
        if (updatedCase.script_official_es !== previousState.script_official_es) changes.push('Script (ES)');
        if (updatedCase.script_official_en !== previousState.script_official_en) changes.push('Script (EN)');
        if (updatedCase.script_friendly_es !== previousState.script_friendly_es) changes.push('Friendly Script (ES)');
        if (updatedCase.script_friendly_en !== previousState.script_friendly_en) changes.push('Friendly Script (EN)');
        if (updatedCase.condition !== previousState.condition) changes.push('Condition');
        if (updatedCase.category !== previousState.category) changes.push('Category');
        if (updatedCase.crm_remark_template !== previousState.crm_remark_template) changes.push('CRM Template');
    }

    const changeSummary = changes.length > 0 ? `Updated: ${changes.join(', ')}` : 'Case Updated';

    // Notify agents about the update
    await createNotification({
        type: 'CASE_UPDATE',
        entityId: updatedCase.id,
        title: 'Case Updated',
        message: body.highlightReason
            ? `Highlight: ${body.highlightReason}`
            : changes.length > 0 ? `Case "${updatedCase.title_en}" updated: ${changes.join(', ')}` : `Case "${updatedCase.title_en}" has been updated.`,
        expiresAt: body.highlightExpiresAt ? new Date(body.highlightExpiresAt) : undefined
    });

    revalidatePath('/mqa');

    return NextResponse.json(updatedCase);
});

export const DELETE = apiHandler(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    // Fetch info before delete for log
    const caseToDelete = await prisma.supportCase.findUnique({ where: { id } });

    await prisma.supportCase.delete({
        where: { id },
    });

    const user = await getCurrentUser();
    if (user && caseToDelete) {
        await logAction(
            user.id,
            'DELETE',
            'CASE',
            id,
            `Deleted case: ${caseToDelete.title_es || caseToDelete.title_en}`,
            caseToDelete,
            null
        );
    }

    return NextResponse.json({ message: 'Case deleted' });
});
