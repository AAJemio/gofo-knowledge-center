import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler } from '@/lib/api-handler';

export const GET = apiHandler(async (request: Request) => {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: any = {};

    if (category && category !== 'all') {
        where.category = category;
    }

    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { content_en: { contains: search, mode: 'insensitive' } },
            { content_es: { contains: search, mode: 'insensitive' } },
        ];
    }

    const prompts = await prisma.whatsappPrompt.findMany({
        where,
        orderBy: {
            usage_count: 'desc',
        },
    });

    return NextResponse.json(prompts);
});

import { logAction } from '@/services/audit';
import { getCurrentUser } from '@/lib/session';

export const POST = apiHandler(async (request: Request) => {
    const body = await request.json();
    const newPrompt = await prisma.whatsappPrompt.create({
        data: body,
    });

    const user = await getCurrentUser();
    if (user) {
        await logAction(
            user.id,
            'CREATE',
            'PROMPT',
            newPrompt.id,
            `Created prompt: ${newPrompt.title}`,
            null,
            newPrompt
        );
    }

    return NextResponse.json(newPrompt, { status: 201 });
});
