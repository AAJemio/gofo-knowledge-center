import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler } from '@/lib/api-handler';

export const GET = apiHandler(async () => {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(users);
});

export const POST = apiHandler(async (req: Request) => {
    const body = await req.json();
    const { email, firstName, lastName, role } = body;

    // Basic validation
    if (!email || !role) {
        throw new Error('Missing required fields');
    }

    // Set temporary password based on role
    const tempPassword = role === 'admin' ? 'admin' : 'agent';

    const user = await prisma.user.create({
        data: {
            email,
            password: tempPassword,
            firstName: firstName || '',
            lastName: lastName || '',
            role,
            mustChangePassword: true, // Force password change on first login
        },
    });

    return NextResponse.json(user);
});
