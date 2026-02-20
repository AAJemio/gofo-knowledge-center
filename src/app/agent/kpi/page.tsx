
'use client';

import React from 'react';
import AgentKPIView from './AgentKPIView';

import AKCNavigation from '@/components/AKCNavigation';

export default function AgentKPIPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#151719]">
            <AKCNavigation />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                    MY <span className="text-[#EF4D23]">KPIs</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8">
                    Track your daily performance metrics and quality scores.
                </p>
                <AgentKPIView />
            </div>
        </div>
    );
}
