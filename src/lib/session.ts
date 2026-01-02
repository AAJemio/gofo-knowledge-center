import { cookies } from 'next/headers';

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token');
    if (!token) return null;
    try {
        return JSON.parse(token.value);
    } catch {
        return null;
    }
}
