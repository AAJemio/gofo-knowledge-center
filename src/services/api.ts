export interface User {
    id: string;
    email: string;
    role: 'admin' | 'agent';
    firstName: string;
    lastName: string;
    theme?: 'light' | 'dark';
    language?: 'es' | 'en';
    defaultPage?: string;
    wapViewMode?: 'grid' | 'list';
    lastPath?: string;
    mustChangePassword?: boolean;
}

export interface SupportCase {
    id: string;
    title_es: string;
    title_en: string;
    category: string;
    keywords: string;
    condition: string;
    script_official_es: string;
    script_official_en: string;
    script_friendly_es?: string;
    script_friendly_en?: string;
    recommendedPrompts: WhatsappPrompt[];
    usage_count: number;
}

export interface WhatsappPrompt {
    id: string;
    title: string;
    title_es?: string;
    category: string;
    content_en: string;
    content_es: string;
    code_impar_en?: string;
    code_par_es?: string;
    usage_count: number;
}

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(url, options);
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'API Error');
    }
    return res.json();
}

export const api = {
    // Auth
    auth: {
        me: () => fetcher<{ user: User }>('/api/auth/me'),
        login: (credentials: any) => fetcher<any>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        }),
        logout: () => fetcher('/api/auth/logout', { method: 'POST' }),
    },

    // Users
    users: {
        list: () => fetcher<User[]>('/api/users'),
        get: (id: string) => fetcher<{ user: User }>(`/api/users/${id}`),
        update: (id: string, data: Partial<User>) => fetcher<User>(`/api/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        delete: (id: string) => fetcher(`/api/users/${id}`, { method: 'DELETE' }),
        updateProfile: (data: Partial<User>) => fetcher<{ user: User }>('/api/user/profile', {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
    },

    // Cases
    cases: {
        list: (params?: { search?: string; category?: string; limit?: number }) => {
            const searchParams = new URLSearchParams();
            if (params?.search) searchParams.set('search', params.search);
            if (params?.category) searchParams.set('category', params.category);
            if (params?.limit) searchParams.set('limit', params.limit.toString());
            return fetcher<SupportCase[]>(`/api/cases?${searchParams.toString()}`);
        },
        get: (id: string) => fetcher<SupportCase>(`/api/cases/${id}`),
        create: (data: any) => fetcher<SupportCase>('/api/cases', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: (id: string, data: any) => fetcher<SupportCase>(`/api/cases/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        delete: (id: string) => fetcher(`/api/cases/${id}`, { method: 'DELETE' }),
    },

    // Prompts
    prompts: {
        list: (params?: { search?: string; category?: string }) => {
            const searchParams = new URLSearchParams();
            if (params?.search) searchParams.set('search', params.search);
            if (params?.category) searchParams.set('category', params.category);
            return fetcher<WhatsappPrompt[]>(`/api/prompts?${searchParams.toString()}`);
        },
        get: (id: string) => fetcher<WhatsappPrompt>(`/api/prompts/${id}`),
        create: (data: any) => fetcher<WhatsappPrompt>('/api/prompts', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: (id: string, data: any) => fetcher<WhatsappPrompt>(`/api/prompts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        delete: (id: string) => fetcher(`/api/prompts/${id}`, { method: 'DELETE' }),
    },

    // Usage
    usage: {
        track: (type: 'case' | 'prompt', id: string, language?: string) => fetcher('/api/usage', {
            method: 'POST',
            body: JSON.stringify({ type, id, language })
        }),
    },

    // Analytics
    analytics: {
        getUserStats: (userId: string) => fetcher<any>(`/api/admin/analytics/${userId}`), // Assuming this endpoint exists or will exist
    }
};
