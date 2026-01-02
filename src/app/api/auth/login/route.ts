import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler } from '@/lib/api-handler';

export const POST = apiHandler(async (request: Request) => {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
        throw new Error('Missing email or password');
    }

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new Error('Invalid credentials');
    }

    // Simple password check (plaintext for MVP as per seed)
    // In production, use bcrypt.compare(password, user.password)
    if (user.password !== password) {
        throw new Error('Invalid credentials');
    }

    const response = NextResponse.json({
        success: true,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            theme: user.theme,
            language: user.language,
            defaultPage: user.defaultPage,
            wapViewMode: user.wapViewMode,
            lastPath: user.lastPath,
            mustChangePassword: user.mustChangePassword
        }
    });

    response.cookies.set('auth_token', JSON.stringify({
        id: user.id,
        role: user.role,
        defaultPage: user.defaultPage || 'mqa'
    }), {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
});
