'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, TrendingUp, Users, AlertCircle } from 'lucide-react';
import AdminKPICharts from './AdminKPICharts';
import AdminKPIScorecard from './AdminKPIScorecard';
import AdminAuditTable from './AdminAuditTable';
import AgentSelector from './AgentSelector';
import AdminDataManagement from './AdminDataManagement';



export default function AdminKPIDashboard({ refreshTrigger }: { refreshTrigger: number }) {
    const [stats, setStats] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]); // For agent selector
    const [dailyTarget, setDailyTarget] = useState(100);
    const [loading, setLoading] = useState(true);
    const [internalRefresh, setInternalRefresh] = useState(0);

    // Filters
    const [filterName, setFilterName] = useState('');
    const [range, setRange] = useState('7'); // '7', '30', 'all', 'custom'
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [selectedAgents, setSelectedAgents] = useState<string[]>([]); // Empty = All

    // Sorting
    const [activeTab, setActiveTab] = useState<'dashboard' | 'management'>('dashboard'); // 'dashboard' | 'management'
    const [sortField, setSortField] = useState('conversations');
    const [sortDesc, setSortDesc] = useState(true);

    // Search Autocomplete
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch stats, users, and settings (target)
                // We might need a separate call for settings if not included in stats
                // For now, let's assume we add a settings endpoint or assume default, 
                // OR better, since we use AdminDataManagement which calls /manage, 
                // maybe we should pull settings from there too?
                // Use a simplified settings fetch here.
                const [statsRes, usersRes, settingsRes] = await Promise.all([
                    fetch('/api/admin/kpi/stats'),
                    fetch('/api/users'),
                    fetch('/api/admin/kpi/manage') // Re-using manage endpoint for simplicity to get target
                ]);

                if (statsRes.ok) {
                    const data = await statsRes.json();
                    setStats(data);
                }

                if (usersRes.ok) {
                    const usersData = await usersRes.json();
                    setUsers(usersData.filter((u: any) => u.role === 'agent'));
                }

                if (settingsRes.ok) {
                    const settingsData = await settingsRes.json();
                    if (settingsData.dailyTarget) {
                        setDailyTarget(settingsData.dailyTarget);
                    }
                }

            } catch (error) {
                console.error("Failed to fetch admin stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [refreshTrigger, internalRefresh]);

    // Data Gap Logic
    const getMissingDates = (filteredData: any[], startDate: Date, endDate: Date) => {
        if (range === 'all' || !startDate || !endDate) return [];

        const existingDates = new Set(filteredData.map(d => new Date(d.date).toDateString()));
        const missing = [];
        const current = new Date(startDate);

        // Safety cap: don't loop more than 365 days
        let safety = 0;
        while (current <= endDate && safety < 365) {
            if (!existingDates.has(current.toDateString())) {
                missing.push(new Date(current));
            }
            current.setDate(current.getDate() + 1);
            safety++;
        }
        return missing;
    };

    // Filtering Logic
    const filteredStats = stats.filter(s => {
        const itemDate = new Date(s.date);
        const now = new Date();
        itemDate.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);

        // 1. Date Filter
        let dateMatch = true;
        if (range === 'custom') {
            if (customStart && customEnd) {
                const start = new Date(customStart);
                const end = new Date(customEnd);
                start.setHours(0, 0, 0, 0);
                end.setHours(0, 0, 0, 0);
                dateMatch = itemDate >= start && itemDate <= end;
            }
        } else if (range !== 'all') {
            const diffTime = Math.abs(now.getTime() - itemDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            // '7' means last 7 days inclusive
            dateMatch = diffDays <= parseInt(range);
        }

        // 2. Name Filter (Search)
        const fullName = `${s.user.firstName} ${s.user.lastName}`.toLowerCase();
        const nameMatch = fullName.includes(filterName.toLowerCase());

        // 3. Agent Selector
        let agentMatch = true;
        if (selectedAgents.length > 0) {
            agentMatch = selectedAgents.includes(s.userId);
        }

        return dateMatch && nameMatch && agentMatch;
    });

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDesc(!sortDesc);
        } else {
            setSortField(field);
            setSortDesc(true);
        }
    };

    // Calculate Missing Dates for Alert
    const now = new Date();
    let computedStart = new Date();
    if (range === '7') computedStart.setDate(now.getDate() - 7);
    if (range === '30') computedStart.setDate(now.getDate() - 30);
    if (range === 'custom' && customStart) computedStart = new Date(customStart);

    // Only show gaps if specific agents selected or simply across whole dataset?
    // Gaps usually mean NO DATA for ANYONE on that day, or for the filtered view.
    // Let's check generally for the filtered dataset.
    const missingDates = (range !== 'all') ? getMissingDates(filteredStats, computedStart, range === 'custom' && customEnd ? new Date(customEnd) : now) : [];

    if (loading) return <div className="p-12 text-center text-gray-500">Loading dashboard...</div>;

    return (
        <div className="space-y-6 pb-20">
            {/* Tabs Header */}
            <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`pb-3 px-1 text-sm font-bold border-b-2 transition-colors ${activeTab === 'dashboard'
                        ? 'border-[#EF4D23] text-[#EF4D23]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    Audit Dashboard
                </button>
                <button
                    onClick={() => setActiveTab('management')}
                    className={`pb-3 px-1 text-sm font-bold border-b-2 transition-colors ${activeTab === 'management'
                        ? 'border-[#EF4D23] text-[#EF4D23]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    Data Management
                </button>
            </div>

            {activeTab === 'management' ? (
                <AdminDataManagement onTargetUpdate={() => setInternalRefresh(prev => prev + 1)} />
            ) : (
                <>
                    {/* Header & Controls */}
                    <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">

                        {/* Search */}
                        <div className="relative w-full xl:w-64" ref={searchRef}>
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400`} size={18} />
                            <input
                                type="text"
                                placeholder="Search agent..."
                                value={filterName}
                                onChange={(e) => {
                                    setFilterName(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border bg-gray-50 dark:bg-gray-900 dark:border-gray-600 outline-none focus:ring-2 focus:ring-[#EF4D23] text-gray-900 dark:text-white"
                            />

                            {/* Autocomplete Dropdown */}
                            {showSuggestions && filterName && (
                                <div className="absolute top-full left-0 z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {users.filter(u =>
                                        `${u.firstName} ${u.lastName}`.toLowerCase().includes(filterName.toLowerCase())
                                    ).length > 0 ? (
                                        users.filter(u =>
                                            `${u.firstName} ${u.lastName}`.toLowerCase().includes(filterName.toLowerCase())
                                        ).slice(0, 5).map(u => (
                                            <button
                                                key={u.id}
                                                onClick={() => {
                                                    setFilterName(`${u.firstName} ${u.lastName}`);
                                                    setShowSuggestions(false);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                            >
                                                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                                                    {u.firstName[0]}{u.lastName[0]}
                                                </div>
                                                <span>{u.firstName} {u.lastName}</span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-4 py-2 text-xs text-gray-400">No agents found</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Filters Group */}
                        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">

                            {/* Date Range */}
                            <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
                                {['7', '30', 'all', 'custom'].map(r => (
                                    <button
                                        key={r}
                                        onClick={() => setRange(r)}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${range === r
                                            ? 'bg-white dark:bg-gray-700 text-[#EF4D23] shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                            }`}
                                    >
                                        {r === 'all' ? 'All' : (r === 'custom' ? 'Custom' : `${r}d`)}
                                    </button>
                                ))}
                            </div>

                            {/* Agent Selector (Custom UI) */}
                            <AgentSelector
                                agents={users}
                                selectedIds={selectedAgents}
                                onChange={setSelectedAgents}
                            />
                        </div>

                        {/* Custom Date Inputs */}
                        {range === 'custom' && (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                                <input
                                    type="date"
                                    value={customStart}
                                    onChange={(e) => setCustomStart(e.target.value)}
                                    className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-[#EF4D23] outline-none dark:text-white dark:[color-scheme:dark]"
                                />
                                <span className="text-gray-400">-</span>
                                <input
                                    type="date"
                                    value={customEnd}
                                    onChange={(e) => setCustomEnd(e.target.value)}
                                    className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-[#EF4D23] outline-none dark:text-white dark:[color-scheme:dark]"
                                />
                            </div>
                        )}
                    </div>

                    {/* Data Gap Alert */}
                    {missingDates.length > 0 && !filterName && (
                        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-3 flex items-start gap-3">
                            <AlertCircle className="text-orange-500 shrink-0 mt-0.5" size={18} />
                            <div>
                                <h4 className="text-sm font-bold text-orange-700 dark:text-orange-400">Missing Data Detected</h4>
                                <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">
                                    No KPI records found for the following dates in your selection:
                                </p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {missingDates.slice(0, 10).map(d => (
                                        <span key={d.toISOString()} className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200 text-[10px] rounded-full font-mono">
                                            {d.toLocaleDateString()}
                                        </span>
                                    ))}
                                    {missingDates.length > 10 && <span className="text-xs text-orange-600 ml-1">...and {missingDates.length - 10} more</span>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Search No Results Hint */}
                    {filteredStats.length === 0 && filterName && (
                        <div className="flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                            <Users size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">No data found for "{filterName}"</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 mb-4">
                                in the selected period ({range === 'all' ? 'All Time' : (range === 'custom' ? 'Custom Range' : `Last ${range} Days`)})
                            </p>
                            {users.some(u => `${u.firstName} ${u.lastName}`.toLowerCase().includes(filterName.toLowerCase())) ? (
                                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    <span>
                                        User exists in the directory. Try switching the date range to <strong>30d</strong> or <strong>All</strong>.
                                    </span>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400">User not found in agent directory.</p>
                            )}
                        </div>
                    )}

                    {/* Scorecards */}
                    <AdminKPIScorecard data={filteredStats} dailyTarget={dailyTarget} />

                    {/* Charts */}
                    <AdminKPICharts data={filteredStats} period={range} dailyTarget={dailyTarget} />

                    {/* Master Table */}
                    <AdminAuditTable
                        data={filteredStats}
                        sortField={sortField}
                        sortDesc={sortDesc}
                        onSort={handleSort}
                    />
                </>
            )}
        </div>
    );
}
