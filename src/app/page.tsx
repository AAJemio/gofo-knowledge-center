'use client';

import React from 'react';
import Link from 'next/link';
import { useAKC } from '@/context/AKCContext';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const { login } = useAKC();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      login(data.user);

      if (data.user.defaultPage === 'last-visited' && data.user.lastPath) {
        router.push(data.user.lastPath);
      } else if (data.user.defaultPage && data.user.defaultPage !== 'last-visited') {
        router.push(data.user.defaultPage);
      } else {
        // Fallback defaults
        if (data.user.role === 'admin') {
          router.push('/admin/cases');
        } else {
          router.push('/mqa');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFBF0] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-96 bg-[#1B1F22] skew-y-3 origin-top-left translate-y-[-50px]"></div>

      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img src="/gofo-logo.png" alt="Gofo Logo" className="h-12 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Agent <span className="text-[#EF4D23]">Knowledge Center</span></h1>
          <p className="text-sm text-gray-500 font-medium tracking-wide">MQA & WAP SYSTEM</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg text-center">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#EF4D23]/20 focus:border-[#EF4D23] transition bg-gray-50 text-sm font-medium text-gray-900"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#EF4D23]/20 focus:border-[#EF4D23] transition bg-gray-50 text-sm font-medium text-gray-900"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="block w-full text-center bg-[#EF4D23] hover:bg-[#d63f1a] text-white font-bold py-3.5 rounded-lg shadow-lg shadow-orange-900/10 transition mt-6 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>

      <div className="absolute bottom-6 text-center text-xs text-gray-400 font-medium">
        © 2025 Gofo Agent Knowledge Center. MQA & WAP System.
      </div>
    </div>
  );
}
