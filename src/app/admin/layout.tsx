import Link from 'next/link';
import { LayoutDashboard, MessageSquare, FileText, Users, LogOut, BarChart2 } from 'lucide-react';
import AKCNavigation from '@/components/AKCNavigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-black font-sans transition-colors duration-300">
            <AKCNavigation />

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 bg-white dark:bg-[#1B1F22] border-r border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 flex flex-col z-10 transition-colors duration-300">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Admin Portal</h2>
                    </div>
                    <nav className="flex-1 px-4 py-6 space-y-1">
                        <NavLink href="/admin" icon={LayoutDashboard} label="Dashboard" />
                        <NavLink href="/admin/cases" icon={FileText} label="Support Cases" />
                        <NavLink href="/admin/prompts" icon={MessageSquare} label="WhatsApp Prompts" />
                        <NavLink href="/admin/users" icon={Users} label="Users" />
                        <NavLink href="/admin/analytics" icon={BarChart2} label="Analytics" />
                    </nav>
                    <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-lg transition-colors duration-300">
                            <div className="w-8 h-8 rounded-full bg-[#A94F2D] flex items-center justify-center text-white font-bold text-xs">AD</div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">Admin User</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">admin@gofo.com</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-black transition-colors duration-300">
                    <div className="max-w-7xl mx-auto p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

function NavLink({ href, icon: Icon, label }: any) {
    return (
        <Link href={href} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-[#A94F2D] dark:hover:text-[#EF4D23] transition-all group">
            <Icon size={18} className="text-gray-400 dark:text-gray-500 group-hover:text-[#A94F2D] dark:group-hover:text-[#EF4D23] transition-colors" />
            {label}
        </Link>
    );
}
