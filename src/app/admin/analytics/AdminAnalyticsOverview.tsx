
'use client';

import React, { useState } from 'react';
import AnalyticsList from './AnalyticsList';
import AuditLogList from './AuditLogList';
import { BarChart3, ShieldCheck } from 'lucide-react';

interface AdminAnalyticsOverviewProps {
    users: any[];
    auditLogs: any[];
}

export default function AdminAnalyticsOverview({ users, auditLogs }: AdminAnalyticsOverviewProps) {
    const [activeTab, setActiveTab] = useState<'usage' | 'audit'>('usage');

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                ANALYTICS <span className="text-[#EF4D23]">HUB</span>
            </h1>

            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-2 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('usage')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${activeTab === 'usage' ? 'bg-[#EF4D23] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                    <BarChart3 size={16} />
                    Usage Stats
                </button>
                <button
                    onClick={() => setActiveTab('audit')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${activeTab === 'audit' ? 'bg-[#EF4D23] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                    <ShieldCheck size={16} />
                    Audit Logs
                </button>
                <button
                    onClick={() => setActiveTab('audit')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${activeTab === 'audit' ? 'bg-[#EF4D23] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                    <ShieldCheck size={16} />
                    Audit Logs
                </button>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === 'usage' && <AnalyticsList users={users} />}
                {activeTab === 'audit' && <AuditLogList logs={auditLogs} />}
            </div>
        </div>
    );
}
