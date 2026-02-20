'use client';

import React from 'react';
import { TrendingUp, AlertTriangle, UserCheck, MessageSquare, Clock, Star } from 'lucide-react';

interface AdminKPIScorecardProps {
    data: any[];
    dailyTarget?: number;
}

export default function AdminKPIScorecard({ data, dailyTarget = 100 }: AdminKPIScorecardProps) {
    if (!data || data.length === 0) return null;

    // Aggregation per Agent
    const agentStats = data.reduce((acc: any, curr: any) => {
        const id = curr.userId;
        if (!acc[id]) {
            acc[id] = {
                id,
                name: `${curr.user.firstName} ${curr.user.lastName}`,
                conversations: 0,
                csatTotal: 0,
                resolutionTotal: 0,
                firstResponseTotal: 0,
                count: 0
            };
        }
        acc[id].conversations += curr.conversations;
        acc[id].csatTotal += curr.csat;
        acc[id].resolutionTotal += curr.resolutionTimeSeconds;
        acc[id].firstResponseTotal += curr.firstResponseTimeSeconds;
        acc[id].count += 1;
        return acc;
    }, {});

    const agents = Object.values(agentStats).map((a: any) => ({
        ...a,
        avgCsat: parseFloat((a.csatTotal / a.count).toFixed(1)),
        avgResolution: Math.round(a.resolutionTotal / a.count),
        avgFirstResponse: Math.round(a.firstResponseTotal / a.count),
        avgVolume: Math.round(a.conversations / a.count)
    }));

    // Find Top Performers
    // 1. Most Volume
    const topVolume = [...agents].sort((a, b) => b.conversations - a.conversations)[0];
    // 2. Highest CSAT (min 5 conversations to qualify)
    const topCsat = [...agents].filter(a => a.conversations > 5).sort((a, b) => b.avgCsat - a.avgCsat)[0] || agents[0];
    // 3. Fastest Resolution (min 5 conversations)
    const topSpeed = [...agents].filter(a => a.conversations > 0).sort((a, b) => a.avgResolution - b.avgResolution)[0];

    // 4. Fastest First Response (min 5 conversations)
    const topFirstResponse = [...agents].filter(a => a.conversations > 0).sort((a, b) => a.avgFirstResponse - b.avgFirstResponse)[0];

    // Find Attention Required
    // 1. Low CSAT (< 70%)
    const lowCsatAgents = agents.filter(a => a.avgCsat < 70);
    // 2. High First Response (> 60s)
    const slowResponseAgents = agents.filter(a => a.avgFirstResponse > 60);
    // 3. Below Daily Target
    const belowTargetAgents = agents.filter(a => a.avgVolume < dailyTarget);

    const formatTime = (seconds: number) => {
        if (!seconds) return '0m';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Top Performers Column (Takes 3 cols on XL) */}
            <div className="xl:col-span-3 space-y-4">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
                    <UserCheck size={16} className="text-green-600" />
                    Top Performers
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {topVolume && (
                        <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
                                    <MessageSquare size={20} />
                                </div>
                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                                    Most Volume
                                </span>
                            </div>
                            <h4 className="font-bold text-gray-900 dark:text-white truncate">{topVolume.name}</h4>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-2xl font-black text-gray-900 dark:text-white">{topVolume.conversations}</span>
                                <span className="text-sm text-gray-500 font-medium">conversations</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Avg {topVolume.avgVolume} / day
                            </p>
                        </div>
                    )}

                    {topCsat && (
                        <div className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-800 p-4 rounded-xl border border-green-100 dark:border-green-900/50 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg text-green-600 dark:text-green-400">
                                    <Star size={20} />
                                </div>
                                <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                                    Highest CSAT
                                </span>
                            </div>
                            <h4 className="font-bold text-gray-900 dark:text-white truncate">{topCsat.name}</h4>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-2xl font-black text-gray-900 dark:text-white">{topCsat.avgCsat}%</span>
                                <span className="text-sm text-gray-500 font-medium">positive</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Across {topCsat.conversations} convs
                            </p>
                        </div>
                    )}

                    {topFirstResponse && (
                        <div className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-gray-800 p-4 rounded-xl border border-amber-100 dark:border-amber-900/50 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg text-amber-600 dark:text-amber-400">
                                    <TrendingUp size={20} />
                                </div>
                                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-full">
                                    Fastest Reply
                                </span>
                            </div>
                            <h4 className="font-bold text-gray-900 dark:text-white truncate">{topFirstResponse.name}</h4>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-2xl font-black text-gray-900 dark:text-white">{topFirstResponse.avgFirstResponse}s</span>
                                <span className="text-sm text-gray-500 font-medium">avg reply</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {topFirstResponse.conversations} cases handled
                            </p>
                        </div>
                    )}

                    {topSpeed && (
                        <div className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800 p-4 rounded-xl border border-purple-100 dark:border-purple-900/50 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg text-purple-600 dark:text-purple-400">
                                    <Clock size={20} />
                                </div>
                                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded-full">
                                    Fastest Resolution
                                </span>
                            </div>
                            <h4 className="font-bold text-gray-900 dark:text-white truncate">{topSpeed.name}</h4>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-2xl font-black text-gray-900 dark:text-white">{formatTime(topSpeed.avgResolution)}</span>
                                <span className="text-sm text-gray-500 font-medium">avg time</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {topSpeed.conversations} cases resolved
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Attention Required Column (Takes 1 col on XL) */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle size={16} className="text-red-500" />
                    Attention Required
                </h3>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-xl p-4 h-full shadow-sm flex flex-col gap-3 overflow-y-auto max-h-[400px]">
                    {lowCsatAgents.length === 0 && slowResponseAgents.length === 0 && belowTargetAgents.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                            <UserCheck size={32} className="mb-2 opacity-50" />
                            <span className="text-sm font-medium">All metrics strictly positive!</span>
                        </div>
                    )}

                    {belowTargetAgents.length > 0 && (
                        <div>
                            <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase mb-2 block">
                                Below Target (&lt;{dailyTarget})
                            </span>
                            <ul className="space-y-2">
                                {belowTargetAgents.slice(0, 3).map(a => (
                                    <li key={a.id} className="flex justify-between items-center text-sm bg-white dark:bg-gray-800 p-2 rounded shadow-sm">
                                        <span className="truncate w-24 text-gray-700 dark:text-gray-300 font-medium">{a.name}</span>
                                        <span className="font-bold text-red-600">{a.avgVolume}</span>
                                    </li>
                                ))}
                                {belowTargetAgents.length > 3 && <li className="text-xs text-center text-red-500">...and {belowTargetAgents.length - 3} more</li>}
                            </ul>
                        </div>
                    )}

                    {lowCsatAgents.length > 0 && (
                        <div>
                            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase mb-2 block">
                                Low CSAT (&lt;70%)
                            </span>
                            <ul className="space-y-2">
                                {lowCsatAgents.slice(0, 3).map(a => (
                                    <li key={a.id} className="flex justify-between items-center text-sm bg-white dark:bg-gray-800 p-2 rounded shadow-sm">
                                        <span className="truncate w-24 text-gray-700 dark:text-gray-300 font-medium">{a.name}</span>
                                        <span className="font-bold text-orange-600">{a.avgCsat}%</span>
                                    </li>
                                ))}
                                {lowCsatAgents.length > 3 && <li className="text-xs text-center text-orange-500">...and {lowCsatAgents.length - 3} more</li>}
                            </ul>
                        </div>
                    )}

                    {slowResponseAgents.length > 0 && (
                        <div>
                            <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase mb-2 block">
                                Slow Response (&gt;60s)
                            </span>
                            <ul className="space-y-2">
                                {slowResponseAgents.slice(0, 3).map(a => (
                                    <li key={a.id} className="flex justify-between items-center text-sm bg-white dark:bg-gray-800 p-2 rounded shadow-sm">
                                        <span className="truncate w-24 text-gray-700 dark:text-gray-300 font-medium">{a.name}</span>
                                        <span className="font-bold text-yellow-600">{a.avgFirstResponse}s</span>
                                    </li>
                                ))}
                                {slowResponseAgents.length > 3 && <li className="text-xs text-center text-yellow-500">...and {slowResponseAgents.length - 3} more</li>}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
