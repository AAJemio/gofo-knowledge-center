
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler } from '@/lib/api-handler';
import { getCurrentUser } from '@/lib/session';

export const POST = apiHandler(async (request: Request) => {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized');
    }

    const body = await request.json();
    const { resolutions } = body; // Array of { userId, recordData }

    if (!resolutions || !Array.isArray(resolutions)) {
        throw new Error('Invalid resolutions');
    }

    await prisma.$transaction(
        resolutions.map((res: any) =>
            prisma.dailyKPI.upsert({
                where: {
                    userId_date: {
                        userId: res.userId,
                        date: new Date(res.record.date) // Ensure date is parsed
                    }
                },
                update: {
                    conversations: res.record.conversations,
                    outboundMessages: res.record.outboundMessages,
                    onlineTimeSeconds: res.record.onlineTimeSeconds,
                    availableTimeSeconds: res.record.availableTimeSeconds,
                    firstResponseTimeSeconds: res.record.firstResponseTimeSeconds,
                    resolutionTimeSeconds: res.record.resolutionTimeSeconds,
                    csat: res.record.csat
                },
                create: {
                    userId: res.userId,
                    date: new Date(res.record.date),
                    conversations: res.record.conversations,
                    outboundMessages: res.record.outboundMessages,
                    onlineTimeSeconds: res.record.onlineTimeSeconds,
                    availableTimeSeconds: res.record.availableTimeSeconds,
                    firstResponseTimeSeconds: res.record.firstResponseTimeSeconds,
                    resolutionTimeSeconds: res.record.resolutionTimeSeconds,
                    csat: res.record.csat
                }
            })
        )
    );

    return NextResponse.json({ success: true, count: resolutions.length });
});
