import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const authToken = request.cookies.get('auth_token')?.value;
    const { pathname } = request.nextUrl;

    // 1. Protect Admin Routes
    if (pathname.startsWith('/admin')) {
        if (!authToken) {
            return NextResponse.redirect(new URL('/', request.url));
        }

        try {
            const user = JSON.parse(authToken);
            if (user.role !== 'admin') {
                // Redirect agents to MQA if they try to access admin
                return NextResponse.redirect(new URL('/mqa', request.url));
            }
        } catch (e) {
            // Invalid token
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // 2. Protect MQA and Prompts Routes
    if (pathname.startsWith('/mqa') || pathname.startsWith('/prompts')) {
        if (!authToken) {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // 3. Redirect logged-in users away from login page
    if (pathname === '/') {
        if (authToken) {
            try {
                const user = JSON.parse(authToken);
                const defaultPage = user.defaultPage || 'mqa';
                const targetUrl = defaultPage === 'prompts' ? '/prompts' :
                    defaultPage === 'stats' ? '/agent/analytics' :
                        '/mqa';

                return NextResponse.redirect(new URL(targetUrl, request.url));
            } catch (e) {
                // Token invalid, let them stay on login
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/mqa/:path*', '/prompts/:path*', '/'],
};
