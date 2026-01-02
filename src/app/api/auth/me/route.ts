import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { apiHandler } from '@/lib/api-handler';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token');

    if (!token) {
        throw new Error('Not authenticated');
    }

    const tokenData = JSON.parse(token.value);

    const user = await prisma.user.findUnique({
        where: { id: tokenData.id },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            theme: true,
            language: true,
            defaultPage: true,
            wapViewMode: true,
            lastPath: true,
        }
    });

    if (!user) {
        throw new Error('User not found');
    }

    return NextResponse.json({ user });
});
