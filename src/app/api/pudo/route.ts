
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler } from '@/lib/api-handler';
import { getCurrentUser } from '@/lib/session';

export const GET = apiHandler(async () => {
    const locations = await prisma.pudoLocation.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { name: 'asc' },
        include: { whatsappPrompt: true }
    });
    return NextResponse.json(locations);
});

export const POST = apiHandler(async (request: Request) => {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized');
    }

    const body = await request.json();
    const { name, address, businessDaysEn, businessDaysEs, businessHours, contact, zipCode, imageUrl, whatsappPromptId } = body;

    const newLocation = await prisma.pudoLocation.create({
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
            status: 'ACTIVE'
        }
    });

    return NextResponse.json(newLocation);
});
