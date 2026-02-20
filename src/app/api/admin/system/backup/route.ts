import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler } from '@/lib/api-handler';

export const POST = apiHandler(async (req: Request) => {
    const body = await req.json();
    const { password, adminId } = body;

    if (!password || !adminId) {
        return NextResponse.json({ message: 'Missing credentials' }, { status: 400 });
    }

    // specific auth check for sensitive action
    const admin = await prisma.user.findUnique({
        where: { id: adminId }
    });

    if (!admin || admin.role !== 'admin') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    // In a real app, we should hash the password. 
    // Assuming simple comparison for this environment/demo as per previous context
    if (admin.password !== password) {
        return NextResponse.json({ message: 'Invalid password' }, { status: 403 });
    }

    // Fetch all data
    // Using transaction to get a consistent snapshot if possible, though overly large transaction might fail.
    // For backup, sequential fetch is usually acceptable if system is not under heavy write load.

    const [
        users,
        dailyKPIs,
        auditLogs,
        supportCases,
        whatsappPrompts,
        interactions,
        pudoLocations,
        pudoContents,
        notifications,
        kpiSettings,
        kpiActivityLogs,
        kpiSourceFiles
    ] = await prisma.$transaction([
        prisma.user.findMany(),
        prisma.dailyKPI.findMany(),
        prisma.auditLog.findMany(),
        prisma.supportCase.findMany(),
        prisma.whatsappPrompt.findMany(),
        prisma.interaction.findMany(),
        prisma.pudoLocation.findMany(),
        prisma.pudoContent.findMany(),
        prisma.notification.findMany(),
        prisma.kpiSettings.findMany(),
        prisma.kpiActivityLog.findMany(),
        prisma.kpiSourceFile.findMany({
            select: {
                id: true,
                adminId: true,
                filename: true,
                uploadDate: true,
                targetDate: true,
                // fileData: false // EXCLUDED strictly
            }
        })
    ]);

    const backupData = {
        meta: {
            version: '1.0',
            date: new Date().toISOString(),
            environment: process.env.NODE_ENV
        },
        data: {
            users,
            dailyKPIs,
            auditLogs,
            supportCases,
            whatsappPrompts,
            interactions,
            pudoLocations,
            pudoContents,
            notifications,
            kpiSettings,
            kpiActivityLogs,
            kpiSourceFiles
        }
    };

    return new NextResponse(JSON.stringify(backupData), {
        headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="backup_gofo_${new Date().toISOString().replace(/[:.]/g, '-')}.json"`
        }
    });
});
