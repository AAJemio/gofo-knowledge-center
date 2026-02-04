import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler } from '@/lib/api-handler';

export const GET = apiHandler(async () => {
    const notifications = await prisma.notification.findMany({
        where: {
            expiresAt: {
                gt: new Date(),
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: 20,
    });

    return NextResponse.json(notifications);
});
