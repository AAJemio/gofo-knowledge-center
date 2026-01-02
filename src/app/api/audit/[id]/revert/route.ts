import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler } from '@/lib/api-handler';
import { logAction } from '@/services/audit';
import { getCurrentUser } from '@/lib/session';

export const POST = apiHandler(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const user = await getCurrentUser();

    // Parse keys from request body if present
    let keys: string[] | undefined;
    try {
        const body = await request.json();
        keys = body.keys;
    } catch (e) {
        // No body or invalid JSON, assume full revert
    }

    if (!user) {
        throw new Error('Unauthorized');
    }

    // @ts-ignore
    const log = await prisma.auditLog.findUnique({
        where: { id }
    });

    if (!log || !log.previousState) {
        throw new Error('Audit log not found or no previous state available');
    }

    // @ts-ignore
    if (log.isReverted && !keys) {
        throw new Error('This change has already been reverted');
    }

    const previousState = JSON.parse(log.previousState);
    let { id: entityId, ...data } = previousState; // Separate ID from data

    let isPartial = false;
    if (keys && Array.isArray(keys) && keys.length > 0) {
        const filteredData: any = {};
        keys.forEach(k => {
            if (data[k] !== undefined) filteredData[k] = data[k];
        });
        data = filteredData;
        isPartial = true;
    }

    // Capture current state before reverting
    let currentState: any = null;
    if (log.entity === 'CASE') {
        currentState = await prisma.supportCase.findUnique({ where: { id: entityId } });
    } else if (log.entity === 'PROMPT') {
        currentState = await prisma.whatsappPrompt.findUnique({ where: { id: entityId } });
    }

    let result;

    if (log.entity === 'CASE') {
        if (log.action === 'UPDATE') {
            // Restore previous state
            result = await prisma.supportCase.update({
                where: { id: entityId },
                data: data,
            });
        } else if (log.action === 'DELETE') {
            // Re-create the deleted item
            result = await prisma.supportCase.create({
                data: {
                    id: entityId,
                    ...data
                }
            });
        } else if (log.action === 'CREATE') {
            // Revert a creation means deleting
            await prisma.supportCase.delete({
                where: { id: log.entityId }
            });
            result = { message: 'Reverted creation (deleted)' };
        }
    } else if (log.entity === 'PROMPT') {
        if (log.action === 'UPDATE') {
            result = await prisma.whatsappPrompt.update({
                where: { id: entityId },
                data: data,
            });
        } else if (log.action === 'DELETE') {
            result = await prisma.whatsappPrompt.create({
                data: {
                    id: entityId,
                    ...data
                }
            });
        } else if (log.action === 'CREATE') {
            await prisma.whatsappPrompt.delete({
                where: { id: log.entityId }
            });
            result = { message: 'Reverted creation (deleted)' };
        }
    }

    // Determine newState for logging
    let newStateForLog: any = result;
    if (log.action === 'CREATE') {
        newStateForLog = null; // We deleted it
    }

    // Capture the revert action itself as a new audit log
    await logAction(
        user.id,
        'UPDATE', // It's effectively an update/restore
        log.entity as 'CASE' | 'PROMPT',
        log.entityId,
        isPartial
            ? `Partial Revert (${keys?.join(', ')}) from ${new Date(log.createdAt).toLocaleString()}`
            : `Reverted change from ${new Date(log.createdAt).toLocaleString()} (Log ID: ${id})`,
        currentState,
        newStateForLog
    );

    // Mark the original log as reverted ONLY if it was a full revert
    if (!isPartial) {
        // @ts-ignore
        await prisma.auditLog.update({
            where: { id },
            data: { isReverted: true }
        });
    }

    return NextResponse.json({ success: true, result });
});
