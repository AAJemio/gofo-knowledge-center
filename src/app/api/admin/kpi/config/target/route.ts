
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

    const { target } = await request.json();

    // Validate target
    if (typeof target !== 'number' || target < 0) {
        throw new Error('Invalid target value');
    }

    await prisma.kpiSettings.upsert({
        where: { id: 'default' },
        update: { dailyConversationTarget: target },
        create: { id: 'default', dailyConversationTarget: target }
    });

    await logKpiAction(
        user.id,
        'UPDATE_TARGET',
        `Set daily conversation target to ${target}`,
        undefined
    );

    return NextResponse.json({ success: true });
});
