import React from 'react';
import AdminKPIDashboard from './AdminKPIDashboard';

export default function KPISystemPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                    <span className="text-[#EF4D23]">KPI</span> SYSTEM
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Manage agent performance metrics and daily records.
                </p>
            </div>

            <AdminKPIDashboard refreshTrigger={0} />
        </div>
    );
}
