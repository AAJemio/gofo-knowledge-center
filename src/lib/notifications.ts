import { prisma } from '@/lib/prisma';

interface NotificationParams {
    type: 'CASE_UPDATE' | 'PROMPT_UPDATE';
    entityId: string;
    title: string;
    message: string;
    expiresAt?: Date;
}

export async function createNotification(params: NotificationParams) {
    const { type, entityId, title, message, expiresAt } = params;

    const finalExpiresAt = expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000); // Default 24h

    return prisma.notification.create({
        data: {
            type,
            entityId,
            title,
            message,
            expiresAt: finalExpiresAt,
        },
    });
}
