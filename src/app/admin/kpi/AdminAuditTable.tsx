'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';

interface AdminAuditTableProps {
    data: any[];
    sortField: string;
    sortDesc: boolean;
    onSort: (field: string) => void;
}

export default function AdminAuditTable({ data, sortField, sortDesc, onSort }: AdminAuditTableProps) {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    // 1. Group data by Agent
    const agentStats = data.reduce((acc: any, curr: any) => {
        const id = curr.userId;
        if (!acc[id]) {
            acc[id] = {
                id,
                user: curr.user,
                conversations: 0,
                outboundMessages: 0,
                onlineTime: 0,
                availableTime: 0,
                csatTotal: 0,
                resolutionTotal: 0,
                firstResponseTotal: 0,
                count: 0,
                history: [] // Keep daily records for drill-down
            };
        }
        acc[id].conversations += curr.conversations;
        acc[id].outboundMessages += curr.outboundMessages;
        acc[id].onlineTime += curr.onlineTimeSeconds;
        acc[id].availableTime += curr.availableTimeSeconds;
        acc[id].csatTotal += curr.csat;
        acc[id].resolutionTotal += curr.resolutionTimeSeconds;
        acc[id].firstResponseTotal += curr.firstResponseTimeSeconds;
        acc[id].count += 1;
        acc[id].history.push(curr);
        return acc;
    }, {});

    const agents = Object.values(agentStats).map((a: any) => ({
        ...a,
        avgCsat: parseFloat((a.csatTotal / a.count).toFixed(1)),
        avgResolution: Math.round(a.resolutionTotal / a.count),
        avgFirstResponse: Math.round(a.firstResponseTotal / a.count),
        adherence: a.onlineTime > 0 ? ((a.availableTime / a.onlineTime) * 100).toFixed(1) : '0.0'
    }));

    // Sorting logic for the aggregated list
    const sortedAgents = [...agents].sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        // Specific mappings for calculated fields if needed, 
        // essentially we assume sortField matches the keys we created above
        if (sortField === 'name') {
            valA = `${a.user.firstName} ${a.user.lastName}`;
            valB = `${b.user.firstName} ${b.user.lastName}`;
        }

        if (valA < valB) return sortDesc ? 1 : -1;
        if (valA > valB) return sortDesc ? -1 : 1;
        return 0;
    });

    const toggleRow = (userId: string) => {
        const newSet = new Set(expandedRows);
        if (newSet.has(userId)) {
            newSet.delete(userId);
        } else {
            newSet.add(userId);
        }
        setExpandedRows(newSet);
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return s > 0 ? `${h}h ${m}m ${s}s` : `${h}h ${m}m`;
    };

    const getCsatColor = (score: number) => {
        if (score >= 90) return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
        if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
        return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase font-bold text-gray-700 dark:text-gray-300">
                        <tr>
                            <th className="px-6 py-4 w-10"></th>{/* Expand chevron */}
                            <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => onSort('name')}>Agent</th>
                            <th className="px-6 py-4 text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => onSort('conversations')}>Conversations</th>
                            <th className="px-6 py-4 text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => onSort('outboundMessages')}>Outbound</th>
                            <th className="px-6 py-4 text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => onSort('adherence')}>Adherence</th>
                            <th className="px-6 py-4 text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => onSort('avgFirstResponse')}>Avg Response</th>
                            <th className="px-6 py-4 text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => onSort('avgResolution')}>Avg Resolution</th>
                            <th className="px-6 py-4 text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => onSort('avgCsat')}>Avg CSAT</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                        {sortedAgents.map(agent => (
                            <React.Fragment key={agent.id}>
                                <tr
                                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer ${expandedRows.has(agent.id) ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`}
                                    onClick={() => toggleRow(agent.id)}
                                >
                                    <td className="px-6 py-4 text-gray-400">
                                        {expandedRows.has(agent.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                                        {agent.user.firstName} {agent.user.lastName}
                                        <div className="text-xs font-normal text-gray-500">{agent.count} records</div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-gray-700 dark:text-gray-300">
                                        {agent.conversations}
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-gray-700 dark:text-gray-300">
                                        {agent.outboundMessages}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="font-mono font-medium text-gray-700 dark:text-gray-300">
                                                {agent.adherence}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                        {formatTime(agent.avgFirstResponse)}
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                        {formatTime(agent.avgResolution)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded-md font-bold text-xs border ${getCsatColor(agent.avgCsat)}`}>
                                            {agent.avgCsat}%
                                        </span>
                                    </td>
                                </tr>
                                {/* Expanded Details Row */}
                                {expandedRows.has(agent.id) && (
                                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                                        <td colSpan={8} className="px-6 py-4">
                                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                                <table className="w-full text-xs text-left bg-white dark:bg-gray-800">
                                                    <thead className="bg-gray-100 dark:bg-gray-900 text-gray-500">
                                                        <tr>
                                                            <th className="px-4 py-2">Date</th>
                                                            <th className="px-4 py-2 text-right">Conversations</th>
                                                            <th className="px-4 py-2 text-right">Outbound</th>
                                                            <th className="px-4 py-2 text-right">Online Time</th>
                                                            <th className="px-4 py-2 text-right">Available</th>
                                                            <th className="px-4 py-2 text-right">Response</th>
                                                            <th className="px-4 py-2 text-right">Resolution</th>
                                                            <th className="px-4 py-2 text-center">CSAT</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y dark:divide-gray-700">
                                                        {agent.history.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((day: any) => (
                                                            <tr key={day.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                                <td className="px-4 py-2 font-mono">{new Date(day.date).toLocaleDateString()}</td>
                                                                <td className="px-4 py-2 text-right">{day.conversations}</td>
                                                                <td className="px-4 py-2 text-right">{day.outboundMessages}</td>
                                                                <td className="px-4 py-2 text-right">{formatTime(day.onlineTimeSeconds)}</td>
                                                                <td className="px-4 py-2 text-right">{formatTime(day.availableTimeSeconds)}</td>
                                                                <td className="px-4 py-2 text-right">{formatTime(day.firstResponseTimeSeconds)}</td>
                                                                <td className="px-4 py-2 text-right">{formatTime(day.resolutionTimeSeconds)}</td>
                                                                <td className="px-4 py-2 text-center font-bold">{day.csat}%</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
