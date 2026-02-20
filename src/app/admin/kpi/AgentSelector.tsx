'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, Users, X } from 'lucide-react';

interface Agent {
    id: string;
    firstName: string;
    lastName: string;
}

interface AgentSelectorProps {
    agents: Agent[];
    selectedIds: string[];
    onChange: (ids: string[]) => void;
}

export default function AgentSelector({ agents, selectedIds, onChange }: AgentSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredAgents = agents.filter(a =>
        `${a.firstName} ${a.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleAgent = (id: string) => {
        const newSelected = selectedIds.includes(id)
            ? selectedIds.filter(sId => sId !== id)
            : [...selectedIds, id];
        onChange(newSelected);
    };

    const toggleAll = () => {
        if (selectedIds.length === agents.length) {
            onChange([]); // Deselect all (which usually means "All" in logic, but UI might want explicit empty)
            // Actually, usually "Empty" selectedIds means "All" in existing dashboard logic?
            // Let's check dashboard logic. 
            // In Dashboard: `if (selectedAgents.length > 0) agentMatch = selectedAgents.includes(s.userId);`
            // So Empty = All.
        } else {
            onChange(agents.map(a => a.id));
        }
    };

    // Derived state for UI
    const isAllSelected = selectedIds.length === agents.length;
    const isNoneSelected = selectedIds.length === 0; // Treated as "All" in dashboard

    return (
        <div className="relative" ref={containerRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg text-sm font-medium transition-all ${isOpen
                        ? 'border-[#EF4D23] ring-1 ring-[#EF4D23]'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
            >
                <Users size={16} className="text-gray-500" />
                <span className="text-gray-700 dark:text-gray-200 truncate max-w-[150px]">
                    {isNoneSelected
                        ? 'All Agents'
                        : isAllSelected
                            ? 'All Agents'
                            : `${selectedIds.length} Agent${selectedIds.length !== 1 ? 's' : ''}`
                    }
                </span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 z-50 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl animate-in fade-in zoom-in-95 duration-200">

                    {/* Search & Actions Header */}
                    <div className="p-3 border-b border-gray-100 dark:border-gray-700 space-y-2">
                        <div className="relative">
                            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Filter agents..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-8 pr-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:border-[#EF4D23]"
                            />
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <button
                                onClick={toggleAll}
                                className="text-[#EF4D23] font-bold hover:underline"
                            >
                                {isAllSelected ? 'Deselect All' : 'Select All'}
                            </button>
                            <span className="text-gray-400">{selectedIds.length} selected</span>
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                        {filteredAgents.length === 0 ? (
                            <div className="p-4 text-center text-xs text-gray-400">No agents found</div>
                        ) : (
                            filteredAgents.map(agent => {
                                const isSelected = selectedIds.includes(agent.id);
                                return (
                                    <div
                                        key={agent.id}
                                        onClick={() => toggleAgent(agent.id)}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${isSelected
                                                ? 'bg-orange-50 dark:bg-orange-900/20'
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected
                                                ? 'bg-[#EF4D23] border-[#EF4D23]'
                                                : 'border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800'
                                            }`}>
                                            {isSelected && <Check size={10} className="text-white" />}
                                        </div>
                                        <span className={`truncate ${isSelected ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                            {agent.firstName} {agent.lastName}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
