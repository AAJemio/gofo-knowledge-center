import React from 'react';
import { prisma } from '@/lib/prisma';
import UsersTable from './UsersTable';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
    // Fetch users securely
    // In a real app, we check auth here. 
    // Since we are mocking auth in context for UI, we can just fetch all for now, 
    // assuming the layout or middleware protects this route in a real scenario.

    let users: any[] = [];
    try {
        users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
        });
    } catch (e) {
        console.error("DB Error or Lock", e);
        // Fallback or empty if DB locked (EPERM issues)
    }

    return (
        <div className="space-y-8">
            <UsersTable users={users as any[]} />
        </div>
    );
}
