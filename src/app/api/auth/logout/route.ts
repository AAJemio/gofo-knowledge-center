import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';

export const POST = apiHandler(async () => {
    const response = NextResponse.json({ success: true });
    response.cookies.delete('auth_token');
    return response;
});
