
import React, { Suspense } from 'react';
import AdminPudoTable from './AdminPudoTable';

export const dynamic = 'force-dynamic';

export default function AdminPudoPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">P.U.D.O. Management</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage locations and general content for the Pick Up & Drop Off page.</p>
            </div>

            <Suspense fallback={<div>Loading PUDO Management...</div>}>
                <AdminPudoTable />
            </Suspense>
        </div>
    );
}
