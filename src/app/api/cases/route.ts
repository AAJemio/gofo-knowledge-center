import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler } from '@/lib/api-handler';
import { logAction } from '@/services/audit';
import { getCurrentUser } from '@/lib/session';


export const GET = apiHandler(async (request: Request) => {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};

    if (search) {
        where.OR = [
            { title_en: { contains: search, mode: 'insensitive' } },
            { title_es: { contains: search, mode: 'insensitive' } },
            { keywords: { contains: search, mode: 'insensitive' } },
            { id: { contains: search, mode: 'insensitive' } }
        ];
    }

    if (category && category !== 'All') {
        where.category = category;
    }

    const cases = await prisma.supportCase.findMany({
        where,
        take: limit,
        orderBy: { usage_count: 'desc' },
        include: {
            recommendedPrompts: true
        }
    });

    return NextResponse.json(cases);
});

export const POST = apiHandler(async (request: Request) => {
    const body = await request.json();
    const { id, ...rest } = body;

    // Basic validation
    if (!id) throw new Error('ID is required');

    const data: any = { ...rest };

    const newCase = await prisma.supportCase.create({
        data: {
            id,
            ...data
        }
    });

    const user = await getCurrentUser();
    if (user) {
        await logAction(
            user.id,
            'CREATE',
            'CASE',
            newCase.id,
            `Created case: ${newCase.title_es || newCase.title_en}`,
            null,
            newCase
        );
    }

    return NextResponse.json(newCase);
});
