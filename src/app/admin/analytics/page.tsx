import React from 'react';
import { prisma } from '@/lib/prisma';
import AnalyticsList from './AnalyticsList';

export const dynamic = 'force-dynamic';

import AuditLogList from './AuditLogList';

export default async function AnalyticsPage() {
    let users: any[] = [];
    let auditLogs: any[] = [];

    try {
        users = await prisma.user.findMany({
            orderBy: { usageCount: 'desc' },
            include: {
                _count: {
                    select: { interactions: true }
                }
            }
        });
    } catch (e) {
        console.error("DB Error fetching users", e);
    }

    try {
        // @ts-ignore - Ignore TS error until client is regenerated
        if (prisma.auditLog) {
            auditLogs = await prisma.auditLog.findMany({
                orderBy: { createdAt: 'desc' },
                take: 100,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            role: true,
                        }
                    }
                }
            });
        }
    } catch (e) {
        console.error("DB Error fetching audit logs", e);
    }

    return (
        <div className="space-y-8">
            <AnalyticsList users={users} />
            <AuditLogList logs={auditLogs} />
        </div>
    );
}
