
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler } from '@/lib/api-handler';
import { getCurrentUser } from '@/lib/session';

export const GET = apiHandler(async (request: Request) => {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    // Parse query params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const whereClause: any = {};

    if (user.role === 'agent') {
        // Agents can only see their own
        whereClause.userId = user.id;
    } else if (userId) {
        // Admin filtering by a specific user
        whereClause.userId = userId;
    }

    // Default to last 30 days if not specified? Or just return all limit 1000?
    // For MVP, return all sorted by date desc
    const stats = await prisma.dailyKPI.findMany({
        where: whereClause,
        include: {
            user: { select: { firstName: true, lastName: true, email: true } }
        },
        orderBy: { date: 'desc' },
        take: 300 // Limit to recent history for performance
    });

    return NextResponse.json(stats);
});
