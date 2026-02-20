import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler } from '@/lib/api-handler';
import { getCurrentUser } from '@/lib/session';
import { checkKpiLock, logKpiAction } from '@/lib/kpi-audit-utils';

// GET: Get summaries, Activity Log, and Lock Status
export const GET = apiHandler(async (request: Request) => {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized');
    }

    // 1. Group Stats
    const groupStats = await prisma.dailyKPI.groupBy({
        by: ['date'],
        _count: { userId: true },
        _max: { updatedAt: true },
        orderBy: { date: 'desc' }
    });

    // 2. Fetch Evidence Files (latest per date)
    const files = await prisma.kpiSourceFile.findMany({
        orderBy: { uploadDate: 'desc' },
        distinct: ['targetDate'],
        select: { id: true, targetDate: true, filename: true }
    });

    const fileMap = new Map(files.map(f => [f.targetDate.toISOString(), f]));

    const summaries = groupStats.map(item => ({
        date: item.date,
        count: item._count.userId,
        lastUpdated: item._max.updatedAt,
        sourceFile: fileMap.get(item.date.toISOString()) || null
    }));

    // 3. Fetch Audit Log (Last 50)
    const activityLog = await prisma.kpiActivityLog.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: { admin: { select: { firstName: true, lastName: true } } }
    });

    // 4. Fetch Lock Settings
    const settings = await prisma.kpiSettings.findUnique({ where: { id: 'default' } });

    return NextResponse.json({
        summaries,
        activityLog,
        lockDate: settings?.lockDate || null,
        dailyTarget: settings?.dailyConversationTarget || 100
    });
});

// DELETE: Delete records
export const DELETE = apiHandler(async (request: Request) => {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized');
    }

    const { date, userIds } = await request.json();
    if (!date) throw new Error('Date is required');
    const targetDate = new Date(date);

    // Lock Check
    await checkKpiLock(targetDate);

    const whereClause: any = { date: targetDate };
    if (userIds && userIds.length > 0) {
        whereClause.userId = { in: userIds };
    }

    const backupData = await prisma.dailyKPI.findMany({ where: whereClause });
    const deleteResult = await prisma.dailyKPI.deleteMany({ where: whereClause });

    // Log
    await logKpiAction(user.id, 'DELETE', `Deleted ${deleteResult.count} records.`, targetDate);

    return NextResponse.json({
        success: true,
        deletedCount: deleteResult.count,
        backup: backupData
    });
});

// POST: Restore records (Undo)
export const POST = apiHandler(async (request: Request) => {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized');
    }

    const { records } = await request.json();
    if (!records || records.length === 0) throw new Error('No records to restore');

    const targetDate = new Date(records[0].date);
    await checkKpiLock(targetDate);

    const cleanRecords = records.map((r: any) => ({
        userId: r.userId,
        date: new Date(r.date),
        conversations: r.conversations,
        outboundMessages: r.outboundMessages,
        onlineTimeSeconds: r.onlineTimeSeconds,
        availableTimeSeconds: r.availableTimeSeconds,
        firstResponseTimeSeconds: r.firstResponseTimeSeconds,
        resolutionTimeSeconds: r.resolutionTimeSeconds,
        csat: r.csat,
    }));

    const result = await prisma.dailyKPI.createMany({
        data: cleanRecords,
        skipDuplicates: true
    });

    await logKpiAction(user.id, 'REVERT', `Restored ${result.count} records.`, targetDate);

    return NextResponse.json({ success: true, restoredCount: result.count });
});
