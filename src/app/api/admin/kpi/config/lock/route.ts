
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler } from '@/lib/api-handler';
import { getCurrentUser } from '@/lib/session';
import { logKpiAction } from '@/lib/kpi-audit-utils';

export const POST = apiHandler(async (request: Request) => {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized');
    }

    const { lockDate } = await request.json();
    // lockDate can be null to unlock

    await prisma.kpiSettings.upsert({
        where: { id: 'default' },
        update: { lockDate: lockDate ? new Date(lockDate) : null },
        create: { id: 'default', lockDate: lockDate ? new Date(lockDate) : null }
    });

    await logKpiAction(
        user.id,
        'LOCK',
        lockDate ? `Set lock date to ${new Date(lockDate).toLocaleDateString()}` : 'Unlocked period editing',
        lockDate ? new Date(lockDate) : undefined
    );

    return NextResponse.json({ success: true });
});
