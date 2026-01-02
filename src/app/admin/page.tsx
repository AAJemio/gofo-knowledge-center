import React from 'react';
import { prisma } from '@/lib/prisma';
import { FileText, MessageSquare, Users, TrendingUp } from 'lucide-react';

async function getStats() {
    const casesCount = await prisma.supportCase.count();
    const promptsCount = await prisma.whatsappPrompt.count();
    const usersCount = await prisma.user.count();

    // Calculate total usage
    const casesUsage = await prisma.supportCase.aggregate({ _sum: { usage_count: true } });
    const promptsUsage = await prisma.whatsappPrompt.aggregate({ _sum: { usage_count: true } });
    const totalUsage = (casesUsage._sum.usage_count || 0) + (promptsUsage._sum.usage_count || 0);

    return { casesCount, promptsCount, usersCount, totalUsage };
}

export default async function AdminDashboard() {
    const stats = await getStats();

    return (
        <div>
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Overview of the Knowledge Center performance.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Cases" value={stats.casesCount} icon={FileText} color="bg-blue-500" href="/admin/cases" />
                <StatCard title="WhatsApp Prompts" value={stats.promptsCount} icon={MessageSquare} color="bg-green-500" href="/admin/prompts" />
                <StatCard title="Active Users" value={stats.usersCount} icon={Users} color="bg-purple-500" href="/admin/users" />
                <StatCard title="Total Interactions" value={stats.totalUsage} icon={TrendingUp} color="bg-[#A94F2D]" href="/admin/analytics" />
            </div>

            {/* Recent Activity or Charts could go here */}
            <div className="bg-white dark:bg-[#1B1F22] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors duration-300">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">System Status</h2>
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full w-fit border border-green-100 dark:border-green-900/30">
                    <span className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-500 animate-pulse"></span>
                    All Systems Operational
                </div>
            </div>
        </div>
    );
}

import Link from 'next/link';

function StatCard({ title, value, icon: Icon, color, href }: any) {
    const Content = (
        <div className="bg-white dark:bg-[#1B1F22] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 flex items-center gap-4 transition hover:shadow-md h-full duration-300">
            <div className={`w-12 h-12 rounded-lg ${color} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center text-${color.replace('bg-', '')}`}>
                <div className={`p-3 rounded-lg ${color} text-white shadow-sm`}>
                    <Icon size={24} />
                </div>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
            </div>
        </div>
    );

    if (href) {
        return <Link href={href} className="block h-full">{Content}</Link>;
    }

    return Content;
}
