import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler } from '@/lib/api-handler';

export const PUT = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const body = await req.json();
    const { email, password, firstName, lastName, role } = body;

    const user = await prisma.user.update({
        where: { id },
        data: {
            email,
            password,
            firstName: firstName || '',
            lastName: lastName || '',
            role,
        },
    });

    return NextResponse.json(user);
});

export const DELETE = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    await prisma.user.delete({
        where: { id },
    });
    return NextResponse.json({ success: true });
});
