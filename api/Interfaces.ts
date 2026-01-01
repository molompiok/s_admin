export interface ApiSuccessResponse<T> {
    status: 'success';
    data: T;
}

export interface ApiErrorResponse {
    status: 'error';
    message: string;
    errors?: any;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface User {
    id: string;
    full_name: string | null;
    email: string;
    phone: string | null;
    photo: string[];
    status: string;
    wave_main_wallet_id: string | null;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string | null;
    roles?: string[];
    collab_stores?: Store[];
    affiliateCodes?: any[];
    stores?: Store[];
    wallet?: WalletBalance;
}

export interface Store {
    id: string;
    user_id: string;
    name: string;
    title: string;
    description: string;
    slug: string;
    logo: string[];
    favicon: string[];
    cover_image: string[];
    domain_names: string[];
    is_active: boolean;
    is_running: boolean;
    status: string;
    wave_store_wallet_id: string | null;
    createdAt: string;
    updatedAt: string;
    user?: User;
    currentApi?: any;
    currentTheme?: any;
    wallet?: WalletBalance;
}

export interface WalletBalance {
    id: string;
    owner_id: string;
    owner_name: string;
    entity_type: string;
    currency: string;
    balance: number;
    available_balance: number;
    pending_balance: number;
    reserved_balance: number;
}

export interface Transaction {
    id: string;
    amount: number;
    category: string;
    label: string;
    status: string;
    created_at: string;
}

export interface TransactionResponse {
    transactions: Transaction[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
    };
}

export interface LoginResponse {
    token: string;
    user: User;
    type: string;
}

export interface ServiceStat {
    timestamp: number;
    cpu: number;
    memory: number;
    replicas: number;
}

export interface ServiceStatus {
    id: string;
    name: string;
    type: 'app' | 'theme' | 'store';
    status: 'running' | 'stopped' | 'error';
    current: ServiceStat;
    history: ServiceStat[];
}

export interface HostStat {
    timestamp: number;
    cpu: number;
    memory: number;
    disk: number;
    temp: number;
}

export interface HostStatus {
    os: {
        platform: string;
        distro: string;
        release: string;
    };
    uptime: number;
    cpu: {
        manufacturer: string;
        brand: string;
        cores: number;
    };
    current: HostStat;
    history: HostStat[];
}

export interface MonitoringResponse {
    services: ServiceStatus[];
    host: HostStatus | null;
}
