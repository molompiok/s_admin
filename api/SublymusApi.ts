import { ApiResponse, LoginResponse, User, Store, WalletBalance, TransactionResponse, ServiceStatus, MonitoringResponse } from './Interfaces';
const isProduction = process.env.NODE_ENV === 'production';

class SublymusAdminApi {
    private baseUrl: string = '';
    private token: string | null = null;

    setBaseUrl(url: string) {
        this.baseUrl = url;
    }
    constructor() {
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('s_admin_token');
            // In dev, we might want to hardcode or use env
            this.baseUrl = isProduction
                ? `https://server.sublymus.com`
                : 'http://localhost:5555';
        }
    }

    setToken(token: string) {
        this.token = token;
        if (typeof window !== 'undefined') {
            localStorage.setItem('s_admin_token', token);
        }
    }

    logout() {
        this.token = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('s_admin_token');
        }
    }

    private async _request<T>(path: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseUrl}${path}`;
        const headers = new Headers(options.headers);

        if (this.token) {
            headers.set('Authorization', `Bearer ${this.token}`);
        }

        if (!(options.body instanceof FormData)) {
            headers.set('Content-Type', 'application/json');
        }
        headers.set('Accept', 'application/json');

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (response.status === 401) {
            this.logout();
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }

        const data = await response.json();
        if (!response.ok) {
            throw data;
        }

        return data;
    }

    private get<T>(path: string, params?: any): Promise<T> {
        const query = params ? new URLSearchParams(params).toString() : '';
        return this._request<T>(`${path}${query ? `?${query}` : ''}`);
    }

    private post<T>(path: string, data: any): Promise<T> {
        return this._request<T>(path, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    auth = {
        login: (payload: any) => this._request<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),
        me: (userId?: string, params: any = {}) => {
            const query = new URLSearchParams(params).toString();
            let path = '/auth/me';
            const queryParts = [];

            if (userId) {
                queryParts.push(`user_id=${userId}`);
            }
            if (query) {
                queryParts.push(query);
            }

            if (queryParts.length > 0) {
                path += `?${queryParts.join('&')}`;
            }
            return this._request<{ user: User, roles: string[] }>(path);
        },
        socialAuthBackendSource: (params?: { provider: string, redirectSuccess?: string, redirectError?: string }) => {
            const success = params?.redirectSuccess && `client_success=${encodeURIComponent(params?.redirectSuccess)}`;
            const error = params?.redirectError && `client_error=${encodeURIComponent(params?.redirectError)}`;
            const provider = params?.provider || 'google';
            return `${this.baseUrl}/auth/${provider}/redirect?${[success, error].filter(Boolean).join('&')}`;
        }
    };

    stores = {
        list: (params: any = {}) => {
            const query = new URLSearchParams(params).toString();
            return this._request<{ list: Store[], meta: any }>(`/stores${query ? `?${query}` : ''}`);
        },
        get: (id: string) => this._request<Store>(`/stores/${id}`),
    };

    users = {
        list: (params: any = {}) => {
            const query = new URLSearchParams(params).toString();
            return this._request<{ users: { list: User[], meta: any } }>(`/admin/users${query ? `?${query}` : ''}`);
        },
    };

    wallets = {
        getPlatform: () => this._request<WalletBalance>('/admin/platform-wallet'),
        get: (id: string) => this._request<WalletBalance>(`/admin/wallets/${id}`),
    };

    admin = {
        getGlobalStatus: () => this._request<any>('/admin/global_status'),
        getAffiliations: () => this._request<any[]>('/admin/affiliations'),
        getWalletTransactions: (walletId: string, params?: any) =>
            this.get<TransactionResponse>(`/admin/wallets/${walletId}/transactions`, params),
    };

    monitoring = {
        getStats: () => this.get<MonitoringResponse>('/admin/monitoring'),
        performAction: (data: { id: string, type: string, action: string, replicas?: number }) =>
            this.post<any>('/admin/monitoring/action', data),
        performGroupAction: (data: { type: string, action: string }) =>
            this.post<any>('/admin/monitoring/group-action', data),
    };
}

export const api = new SublymusAdminApi();
export default api;
