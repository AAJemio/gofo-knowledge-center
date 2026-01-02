'use client';

import React, { useState } from 'react';
import { Lock, AlertCircle, CheckCircle2, Eye, EyeOff, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useAKC } from '@/context/AKCContext';
import { api } from '@/services/api';

export default function ChangePasswordModal() {
    const { currentUser, language, logout } = useAKC();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Only show if user is logged in and must change password
    if (!currentUser?.mustChangePassword) return null;

    // Calculate password strength
    const getStrength = (pass: string) => {
        let score = 0;
        if (pass.length > 5) score++;
        if (pass.length > 8) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        return score;
    };

    const strength = getStrength(newPassword);
    const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
    const passwordsMismatch = newPassword && confirmPassword && newPassword !== confirmPassword;

    const getStrengthLabel = () => {
        if (strength < 2) return { text: language === 'es' ? 'Débil' : 'Weak', color: 'text-red-500', width: '33%' };
        if (strength < 4) return { text: language === 'es' ? 'Media' : 'Medium', color: 'text-yellow-500', width: '66%' };
        return { text: language === 'es' ? 'Fuerte' : 'Strong', color: 'text-green-500', width: '100%' };
    };

    const strengthInfo = getStrengthLabel();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 5) {
            setError(language === 'es' ? 'La contraseña debe tener al menos 5 caracteres.' : 'Password must be at least 5 characters.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError(language === 'es' ? 'Las contraseñas no coinciden.' : 'Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.id, newPassword })
            });

            // Force reload to update session/context
            window.location.reload();
        } catch (err) {
            console.error(err);
            setError(language === 'es' ? 'Error al actualizar contraseña.' : 'Failed to update password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-white dark:bg-[#1B1F22] w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 text-center border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#151719]">
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-[#EF4D23]">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">
                        {language === 'es' ? 'Cambio de Contraseña Requerido' : 'Password Change Required'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {language === 'es'
                            ? 'Por seguridad, debes cambiar tu contraseña temporal antes de continuar.'
                            : 'For security, you must change your temporary password before proceeding.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase flex justify-between">
                            {language === 'es' ? 'Nueva Contraseña' : 'New Password'}
                            {newPassword && (
                                <span className={`text-[10px] uppercase ${strengthInfo.color}`}>
                                    {strengthInfo.text}
                                </span>
                            )}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className={`w-full px-4 py-3 pr-10 rounded-xl bg-gray-50 dark:bg-gray-900 border outline-none focus:ring-2 focus:ring-[#EF4D23]/50 text-gray-900 dark:text-white transition ${strength < 2 && newPassword ? 'border-red-300 dark:border-red-900' : 'border-gray-200 dark:border-gray-700'
                                    }`}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* Strength Bar */}
                        {newPassword && (
                            <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${strength < 2 ? 'bg-red-500' : strength < 4 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                    style={{ width: strengthInfo.width }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase flex justify-between">
                            {language === 'es' ? 'Confirmar Contraseña' : 'Confirm Password'}
                            {passwordsMatch && (
                                <span className="text-[10px] uppercase text-green-500 flex items-center gap-1">
                                    <CheckCircle2 size={12} /> {language === 'es' ? 'Coinciden' : 'Match'}
                                </span>
                            )}
                            {passwordsMismatch && (
                                <span className="text-[10px] uppercase text-red-500 flex items-center gap-1">
                                    <AlertCircle size={12} /> {language === 'es' ? 'No coinciden' : 'Mismatch'}
                                </span>
                            )}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className={`w-full px-4 py-3 pr-10 rounded-xl bg-gray-50 dark:bg-gray-900 border outline-none focus:ring-2 focus:ring-[#EF4D23]/50 text-gray-900 dark:text-white transition ${passwordsMismatch ? 'border-red-500 focus:ring-red-500/20' :
                                    passwordsMatch ? 'border-green-500 focus:ring-green-500/20' :
                                        'border-gray-200 dark:border-gray-700'
                                    }`}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="pt-2 space-y-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#EF4D23] hover:bg-[#d63f1a] text-white font-bold py-3.5 rounded-xl transition shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="animate-spin">⏳</span>
                            ) : (
                                <>
                                    <CheckCircle2 size={20} />
                                    {language === 'es' ? 'Actualizar Contraseña' : 'Update Password'}
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={logout}
                            className="w-full py-3 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
                        >
                            {language === 'es' ? 'Cancelar y Cerrar Sesión' : 'Cancel & Log Out'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
