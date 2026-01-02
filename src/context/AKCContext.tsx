'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, User } from '@/services/api';
import ChangePasswordModal from '@/components/ChangePasswordModal';

type Language = 'es' | 'en';
type Theme = 'light' | 'dark';


interface AKCContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    theme: Theme;
    toggleTheme: () => void;
    currentUser: User | null;
    login: (user: User) => void;
    logout: () => void;
    updateProfile: (data: Partial<User>) => Promise<void>;
    updateDefaultPage: (path: string) => Promise<void>;
}

const AKCContext = createContext<AKCContextType | undefined>(undefined);

export function AKCProvider({ children }: { children: React.ReactNode }) {
    // ... existing state ...
    const [language, setLanguage] = useState<Language>('es');
    const [theme, setTheme] = useState<Theme>('light');
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    // ... existing useEffects ...
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') as Theme;
        if (storedTheme) {
            setTheme(storedTheme);
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
        }
    }, []);

    useEffect(() => {
        if (currentUser) {
            if (currentUser.theme) setTheme(currentUser.theme);
            if (currentUser.language) setLanguage(currentUser.language);
        }
    }, [currentUser]);

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const data = await api.auth.me();
                setCurrentUser(data.user);
            } catch (error) {
                console.error('Session check failed', error);
            }
        };
        checkSession();
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        updateProfile({ theme: newTheme });
    };

    const setLanguageAndSave = (lang: Language) => {
        setLanguage(lang);
        updateProfile({ language: lang });
    };

    const login = (user: User) => setCurrentUser(user);

    const logout = async () => {
        try {
            await api.auth.logout();
        } catch (error) {
            console.error('Logout failed', error);
        }
        setCurrentUser(null);
        window.location.href = '/';
    };

    const updateProfile = async (data: Partial<User>) => {
        if (!currentUser) return;

        const updatedUser = { ...currentUser, ...data } as User;
        setCurrentUser(updatedUser);

        try {
            await api.users.updateProfile(data);

            if (data.theme) setTheme(data.theme);
            if (data.language) setLanguage(data.language);

        } catch (error) {
            console.error('Update profile failed', error);
            // Revert optimistic update
            try {
                const sessionData = await api.auth.me();
                setCurrentUser(sessionData.user);
            } catch (e) {
                console.error('Failed to revert profile', e);
            }
        }
    };

    const updateDefaultPage = async (path: string) => {
        if (!currentUser) return;
        // Prevent infinite loop: only update if path is different
        if (currentUser.lastPath === path) return;

        await updateProfile({ lastPath: path });
    };

    return (
        <AKCContext.Provider value={{ language, setLanguage: setLanguageAndSave, theme, toggleTheme, currentUser, login, logout, updateProfile, updateDefaultPage }}>
            {children}
            <ChangePasswordModal />
        </AKCContext.Provider>
    );


}

export function useAKC() {
    const context = useContext(AKCContext);
    if (context === undefined) {
        throw new Error('useAKC must be used within an AKCProvider');
    }
    return context;
}
