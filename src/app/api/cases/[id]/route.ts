import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler } from '@/lib/api-handler';

import { logAction } from '@/services/audit';
import { getCurrentUser } from '@/lib/session';

export const PUT = apiHandler(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const body = await request.json();
    const { recommendedPromptIds, ...rest } = body;
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
