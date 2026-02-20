
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler } from '@/lib/api-handler';
import { getCurrentUser } from '@/lib/session';

export const PUT = apiHandler(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized');
    }

    const { id } = await params;
    const body = await request.json();

    const { name, address, businessDaysEn, businessDaysEs, businessHours, contact, zipCode, imageUrl, whatsappPromptId, status } = body;

    const updatedLocation = await prisma.pudoLocation.update({
        where: { id },
        data: {
            name,
            address,
            businessDaysEn,
            businessDaysEs,
            businessHours,
            contact,
            zipCode,
            imageUrl: imageUrl || null,
            whatsappPromptId: whatsappPromptId || null,
            status
        }
    });

    return NextResponse.json(updatedLocation);
});

export const DELETE = apiHandler(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized');
    }

    const { id } = await params;

    // Soft delete by setting status to INACTIVE? Or hard delete?
    // User requested "delete" usually implies hard delete or archive. Let's do soft delete for safety first, or just update status.
    // Actually, let's allow hard delete if needed, but safer to mark INACTIVE first.
    // For now, I'll implement HARD DELETE as per standard API practices, assuming frontend handles confirmation.
    // Or I can just update status to INACTIVE.
    // Let's implement HARD DELETE for now as it's cleaner for "Deleted" items, unless user asked for archiving.

    await prisma.pudoLocation.delete({
        where: { id }
    });

    return NextResponse.json({ success: true });
});
