
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler } from '@/lib/api-handler';
import { getCurrentUser } from '@/lib/session';

export const GET = apiHandler(async () => {
    const content = await prisma.pudoContent.findMany();
    // Convert array to object for easier consumption { key: { en, es } }
    const contentMap: Record<string, { en: string, es: string }> = {};
    content.forEach((item) => {
        contentMap[item.key] = { en: item.contentEn, es: item.contentEs };
    });
    return NextResponse.json(contentMap);
});

export const PUT = apiHandler(async (request: Request) => {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized');
    }

    const body = await request.json();
    const { key, contentEn, contentEs } = body;

    if (!key) throw new Error('Key is required');

    const updated = await prisma.pudoContent.upsert({
        where: { key },
        update: { contentEn, contentEs },
        create: { key, contentEn, contentEs }
    });

    return NextResponse.json(updated);
});
