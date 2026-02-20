import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler } from '@/lib/api-handler';

export const POST = apiHandler(async (req: Request) => {
    const json = await req.json();

    // Basic Validation
    if (!json.meta || !json.data) {
        return NextResponse.json({ message: 'Invalid backup file format' }, { status: 400 });
    }

    const { data } = json;

    // Calculate stats
    const stats = {
        users: data.users?.length || 0,
        dailyKPIs: data.dailyKPIs?.length || 0,
        auditLogs: data.auditLogs?.length || 0,
        supportCases: data.supportCases?.length || 0,
        whatsappPrompts: data.whatsappPrompts?.length || 0,
        interactions: data.interactions?.length || 0,
        pudoLocations: data.pudoLocations?.length || 0,
    };

    // Save to SystemTempStorage
    // Expiration: 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const tempRecord = await prisma.systemTempStorage.create({
        data: {
            dataType: 'RESTORE_PAYLOAD',
            data: JSON.stringify(json), // Store the full JSON payload
            expiresAt
        }
    });

    return NextResponse.json({
        success: true,
        stats,
        backupId: tempRecord.id
    });
});
