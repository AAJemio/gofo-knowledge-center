
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler } from '@/lib/api-handler';
import { getCurrentUser } from '@/lib/session';

export const GET = apiHandler(async (request: Request) => {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    const stats = await prisma.dailyKPI.findMany({
        where: { userId: user.id },
        orderBy: { date: 'desc' },
        take: 90
    });

    return NextResponse.json(stats);
});
