import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler } from '@/lib/api-handler';

import { logAction } from '@/services/audit';
import { getCurrentUser } from '@/lib/session';

export const PUT = apiHandler(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const body = await request.json();

    // Explicitly extract fields to avoid passing unknown properties
    const data = {
        title: body.title,
        title_es: body.title_es || null,
        category: body.category,
        code_impar_en: body.code_impar_en || null,
        code_par_es: body.code_par_es || null,
        content_en: body.content_en,
        content_es: body.content_es,
    };

    // Fetch previous state
    const previousState = await prisma.whatsappPrompt.findUnique({ where: { id } });

    const updatedPrompt = await prisma.whatsappPrompt.update({
        where: { id },
        data,
    });

    const user = await getCurrentUser();
    if (user) {
        await logAction(
            user.id,
            'UPDATE',
            'PROMPT',
            id,
            `Updated prompt: ${updatedPrompt.title}`,
            previousState,
            updatedPrompt
        );
    }

    return NextResponse.json(updatedPrompt);
});

export const DELETE = apiHandler(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    // Fetch info before delete for log
    const promptToDelete = await prisma.whatsappPrompt.findUnique({ where: { id } });

    await prisma.whatsappPrompt.delete({
        where: { id },
    });

    const user = await getCurrentUser();
    if (user && promptToDelete) {
        await logAction(
            user.id,
            'DELETE',
            'PROMPT',
            id,
            `Deleted prompt: ${promptToDelete.title}`,
            promptToDelete,
            null
        );
    }

    return NextResponse.json({ message: 'Prompt deleted' });
});
