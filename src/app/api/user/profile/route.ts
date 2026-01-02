import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { apiHandler } from '@/lib/api-handler';

export const PUT = apiHandler(async (request: Request) => {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token');

    if (!token) {
        throw new Error('Not authenticated');
    }

    const tokenData = JSON.parse(token.value);
    const body = await request.json();

    const { firstName, lastName, theme, language, defaultPage, wapViewMode, lastPath } = body;

    const updatedUser = await prisma.user.update({
        where: { id: tokenData.id },
        data: {
            firstName,
            lastName,
            theme,
            language,
            defaultPage,
            wapViewMode,
            lastPath
        },
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

    // Update the cookie with the new data to keep it in sync
    const response = NextResponse.json({ user: updatedUser });

    response.cookies.set('auth_token', JSON.stringify({
        id: updatedUser.id,
        role: updatedUser.role,
        defaultPage: updatedUser.defaultPage || 'mqa'
    }), {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
});
