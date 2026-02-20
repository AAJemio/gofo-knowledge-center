
import { prisma } from '@/lib/prisma';

export async function checkKpiLock(targetDate: Date) {
    const settings = await prisma.kpiSettings.findUnique({
        where: { id: 'default' }
    });

    if (settings?.lockDate && targetDate <= settings.lockDate) {
        throw new Error(`Period is locked. Modifications allowed only after ${settings.lockDate.toLocaleDateString()}.`);
    }
}

export async function logKpiAction(adminId: string, action: string, details: string, targetDate?: Date) {
    await prisma.kpiActivityLog.create({
        data: {
            adminId,
            action,
            details,
            targetDate
        }
    });
}
