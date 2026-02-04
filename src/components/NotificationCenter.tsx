'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAKC } from '@/context/AKCContext';

interface Notification {
    id: string;
    type: string;
    entityId: string;
    title: string;
    message: string;
    createdAt: string;
}

export default function NotificationCenter() {
    const { language } = useAKC();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const router = useRouter();

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
                // Simple unread logic: assume all fetched are "recent/unread" for now
                // Or store lastChecked in localStorage
                const lastChecked = localStorage.getItem('lastNotificationCheck');
                if (lastChecked) {
                    const newCount = data.filter((n: Notification) => new Date(n.createdAt).getTime() > parseInt(lastChecked)).length;
                    setUnreadCount(newCount);
                } else {
                    setUnreadCount(data.length);
                }
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    const handleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            // Marking as read when opening
            setUnreadCount(0);
            localStorage.setItem('lastNotificationCheck', Date.now().toString());
        }
    };

    const handleClick = (n: Notification) => {
        setIsOpen(false);
        if (n.type === 'CASE_UPDATE') {
            // Navigate to MQA with highlight param and the message (change details) as reason
            const highlightParam = `?highlight=${n.entityId}&reason=${encodeURIComponent(n.message)}`;
            router.push(`/mqa${highlightParam}`);
        } else if (n.type === 'PROMPT_UPDATE') {
            const highlightParam = `?highlight=${n.entityId}&reason=${encodeURIComponent(n.message)}`;
            router.push(`/prompts${highlightParam}`);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={handleOpen}
                className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-full transition relative"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1B1F22] rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden animate-fadeIn">
                    <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                            {language === 'es' ? 'Notificaciones' : 'Notifications'}
                        </h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <X size={16} />
                        </button>
                    </div>
                    <div className="max-h-[70vh] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-sm text-gray-500">
                                No new notifications
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    onClick={() => handleClick(n)}
                                    className="p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition"
                                >
                                    <div className="flex gap-3">
                                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.type.includes('CASE') ? 'bg-orange-500' : 'bg-blue-500'}`} />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                                                {n.message}
                                            </p>
                                            <span className="text-xs text-gray-400 mt-1 block">
                                                {new Date(n.createdAt).toLocaleString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
