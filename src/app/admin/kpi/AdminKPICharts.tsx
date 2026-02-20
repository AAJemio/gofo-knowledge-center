'use client';

import React from 'react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ComposedChart, Area, ReferenceLine
} from 'recharts';

interface AdminKPIChartsProps {
    data: any[];
    period: string;
    dailyTarget?: number;
}

export default function AdminKPICharts({ data, period, dailyTarget = 100 }: AdminKPIChartsProps) {
    if (!data || data.length === 0) return null;

    // 1. Group data by Date to aggregation (for general trend)
    // Map: date -> { date, totalConversations, avgCsat, avgResolution, agentCount }
    const groupedByDate = data.reduce((acc: any, curr: any) => {
        const dateKey = new Date(curr.date).toLocaleDateString();
        if (!acc[dateKey]) {
            acc[dateKey] = {
                date: curr.date,
                dateLabel: dateKey,
                totalConversations: 0,
                totalCsat: 0,
                totalResolution: 0,
                count: 0
            };
        }
        acc[dateKey].totalConversations += curr.conversations;
        acc[dateKey].totalCsat += curr.csat;
        acc[dateKey].totalResolution += curr.resolutionTimeSeconds;
        acc[dateKey].count += 1;
        return acc;
    }, {});

    const chartData = Object.values(groupedByDate)
        .map((d: any) => ({
            ...d,
            avgConversations: Math.round(d.totalConversations / d.count),
            avgCsat: parseFloat((d.totalCsat / d.count).toFixed(1)),
            avgResolution: Math.round(d.totalResolution / d.count / 60) // in minutes
        }))
        // @ts-ignore
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Volume Trend */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4 uppercase tracking-wider">
                    Work Volume Trend
                </h3>
                <div className="h-64 w-full text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis
                                dataKey="dateLabel"
                                stroke="#9ca3af"
                                tick={{ fill: '#9ca3af' }}
                                tickLine={false}
                            />
                            <YAxis
                                stroke="#9ca3af"
                                tick={{ fill: '#9ca3af' }}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ color: '#1f2937' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="totalConversations"
                                stroke="#3b82f6"
                                fillOpacity={1}
                                fill="url(#colorConv)"
                                name="Total Conversations"
                            />
                            <Line
                                type="monotone"
                                dataKey="avgConversations"
                                stroke="#10B981"
                                strokeWidth={2}
                                dot={{ r: 4, fill: '#10B981' }}
                                name="Avg per Agent"
                            />
                            <ReferenceLine
                                y={dailyTarget}
                                label={{ position: 'right', value: `Target: ${dailyTarget}`, fill: '#EF4D23', fontSize: 10 }}
                                stroke="#EF4D23"
                                strokeDasharray="3 3"
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Efficiency vs Quality */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4 uppercase tracking-wider">
                    Volume vs Quality (CSAT)
                </h3>
                <div className="h-64 w-full text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis
                                dataKey="dateLabel"
                                stroke="#9ca3af"
                                tick={{ fill: '#9ca3af' }}
                                tickLine={false}
                            />
                            <YAxis
                                yAxisId="left"
                                stroke="#9ca3af"
                                tick={{ fill: '#9ca3af' }}
                                tickLine={false}
                                label={{ value: 'Vol', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                stroke="#9ca3af"
                                tick={{ fill: '#9ca3af' }}
                                tickLine={false}
                                domain={[0, 100]}
                                unit="%"
                                label={{ value: 'CSAT', angle: 90, position: 'insideRight', fill: '#9ca3af' }}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ color: '#1f2937' }}
                            />
                            <Legend />
                            <Bar
                                yAxisId="left"
                                dataKey="totalConversations"
                                fill="#3b82f6"
                                name="Conversations"
                                barSize={20}
                                radius={[4, 4, 0, 0]}
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="avgCsat"
                                stroke="#10b981"
                                strokeWidth={2}
                                name="Avg CSAT (%)"
                                dot={false}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

// Temporary Fix for Recharts AreaChart import if it wasn't exported from main
// Using ComposedChart logic as alternative if needed, but AreaChart is standard.
import { AreaChart } from 'recharts';
