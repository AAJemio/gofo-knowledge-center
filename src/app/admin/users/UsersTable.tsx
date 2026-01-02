'use client';

import React, { useState } from 'react';
import { Search, Plus, Trash2, Edit2, Shield, User, X, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAKC } from '@/context/AKCContext';

export default function UsersTable({ users }: { users: any[] }) {
    const router = useRouter();
    const { currentUser, language } = useAKC(); // Only used for displaying "You" badge if needed
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'agent' });
    const [loading, setLoading] = useState(false);

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.firstName && u.firstName.toLowerCase().includes(search.toLowerCase())) ||
        (u.lastName && u.lastName.toLowerCase().includes(search.toLowerCase()))
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
            const method = editingUser ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.refresh();
                setIsModalOpen(false);
                setEditingUser(null);
                setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'agent' });
            } else {
                const data = await res.json();
                alert(`Error saving user: ${data.message || res.statusText}`);
            }
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await fetch(`/api/users/${id}`, { method: 'DELETE' });
            router.refresh();
        } catch (error) {
            console.error(error);
        }
    };

    const openModal = (user: any = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                password: user.password,
                role: user.role
            });
        } else {
            setEditingUser(null);
            setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'agent' });
        }
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    {language === 'es' ? 'Gestión de Usuarios' : 'User Management'}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    {language === 'es' ? 'Administra el acceso y roles para el Centro de Conocimiento.' : 'Manage access and roles for the Knowledge Center.'}
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative flex-1 w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder={language === 'es' ? "Buscar usuarios..." : "Search users..."}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-[#EF4D23]"
                    />
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-[#EF4D23] hover:bg-[#d63f1a] text-white px-4 py-2 rounded-lg font-medium transition shadow-sm"
                >
                    <Plus size={18} /> {language === 'es' ? 'Agregar Usuario' : 'Add User'}
                </button>
            </div>

            <div className="bg-white dark:bg-[#1B1F22] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm transition-colors duration-300">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{language === 'es' ? 'Nombre' : 'Name'}</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{language === 'es' ? 'Rol' : 'Role'}</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{language === 'es' ? 'Interacciones' : 'Interactions'}</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{language === 'es' ? 'Estado' : 'Status'}</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">{language === 'es' ? 'Acciones' : 'Actions'}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {filteredUsers.map((user) => (
                            <tr
                                key={user.id}
                                onClick={() => openModal(user)}
                                className="hover:bg-gray-50 dark:hover:bg-gray-900 transition cursor-pointer"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[#EF4D23] font-bold">
                                            {user.firstName ? user.firstName[0] : user.email[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white">
                                                {user.firstName} {user.lastName}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${user.role === 'admin'
                                        ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800'
                                        }`}>
                                        {user.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-gray-700 dark:text-gray-300">
                                    {(user as any).usageCount || 0}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded border border-green-100 dark:border-green-900/30">
                                        {language === 'es' ? 'Activo' : 'Active'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); openModal(user); }}
                                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(user.id, e)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                    {language === 'es' ? 'No se encontraron usuarios.' : 'No users found matching your search.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1B1F22] w-full max-w-md rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                {editingUser ? (language === 'es' ? 'Editar Usuario' : 'Edit User') : (language === 'es' ? 'Nuevo Usuario' : 'New User')}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">{language === 'es' ? 'Nombre' : 'First Name'}</label>
                                    <input
                                        required
                                        value={formData.firstName}
                                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:border-[#EF4D23] text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">{language === 'es' ? 'Apellido' : 'Last Name'}</label>
                                    <input
                                        required
                                        value={formData.lastName}
                                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:border-[#EF4D23] text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">{language === 'es' ? 'Correo Electrónico' : 'Email Address'}</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:border-[#EF4D23] text-gray-900 dark:text-white"
                                />
                            </div>

                            {editingUser ? (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">{language === 'es' ? 'Contraseña' : 'Password'}</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        placeholder={language === 'es' ? "(Dejar en blanco para mantener)" : "(Leave blank to keep current)"}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:border-[#EF4D23] text-gray-900 dark:text-white"
                                    />
                                </div>
                            ) : (
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/50">
                                    <h3 className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-1">
                                        {language === 'es' ? 'Contraseña Temporal' : 'Temporary Password'}
                                    </h3>
                                    <p className="text-xs text-blue-600 dark:text-blue-300">
                                        {language === 'es'
                                            ? `Se asignará automáticamente: "${formData.role === 'admin' ? 'admin' : 'agent'}"`
                                            : `Will be automatically set to: "${formData.role === 'admin' ? 'admin' : 'agent'}"`
                                        }
                                    </p>
                                    <p className="text-[10px] mt-2 text-blue-500 dark:text-blue-400 opacity-80">
                                        {language === 'es'
                                            ? 'El usuario deberá cambiarla al iniciar sesión.'
                                            : 'User will be forced to change it on first login.'
                                        }
                                    </p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">{language === 'es' ? 'Rol' : 'Role'}</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="role"
                                            value="agent"
                                            checked={formData.role === 'agent'}
                                            onChange={e => setFormData({ ...formData, role: 'agent' })}
                                            className="text-[#EF4D23] focus:ring-[#EF4D23]"
                                        />
                                        <span className="text-sm font-medium dark:text-gray-300">Agent</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="role"
                                            value="admin"
                                            checked={formData.role === 'admin'}
                                            onChange={e => setFormData({ ...formData, role: 'admin' })}
                                            className="text-[#EF4D23] focus:ring-[#EF4D23]"
                                        />
                                        <span className="text-sm font-medium dark:text-gray-300">Admin</span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#EF4D23] hover:bg-[#d63f1a] text-white font-bold py-3 rounded-xl transition shadow-lg disabled:opacity-50"
                                >
                                    {loading ? (language === 'es' ? 'Guardando...' : 'Saving...') : (language === 'es' ? 'Guardar Usuario' : 'Save User')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
