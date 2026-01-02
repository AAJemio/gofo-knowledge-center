import { prisma } from '@/lib/prisma';

export async function logAction(
    userId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    entity: 'CASE' | 'PROMPT',
    entityId: string,
    details: string,
    previousState?: any,
    newState?: any
) {
    try {
        // @ts-ignore
        await prisma.auditLog.create({
            data: {
                userId,
                action,
                entity,
                entityId,
                details,
                previousState: previousState ? JSON.stringify(previousState) : null,
                newState: newState ? JSON.stringify(newState) : null
            }
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
        // We don't want to fail the main user action if logging fails, 
        // but in a strict environment we might want to throw.
    }
}
