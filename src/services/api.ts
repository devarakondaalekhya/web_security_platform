import { User, IScan, DashboardStats } from '../types';

const TOKEN_KEY = 'webshield_jwt_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `HTTP error ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  async register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await request<{ success: boolean; token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    setStoredToken(res.token);
    return res;
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await request<{ success: boolean; token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(res.token);
    return res;
  },

  async demoLogin(): Promise<{ token: string; user: User }> {
    const res = await request<{ success: boolean; token: string; user: User }>('/api/auth/demo-login', {
      method: 'POST',
    });
    setStoredToken(res.token);
    return res;
  },

  async getMe(): Promise<User> {
    const res = await request<{ success: boolean; user: User }>('/api/auth/me');
    return res.user;
  },

  logout(): void {
    clearStoredToken();
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const res = await request<{ success: boolean; stats: DashboardStats }>('/api/scans/stats/summary');
    return res.stats;
  },

  async getScans(): Promise<IScan[]> {
    const res = await request<{ success: boolean; scans: IScan[] }>('/api/scans');
    return res.scans;
  },

  async getScanById(id: string): Promise<IScan> {
    const res = await request<{ success: boolean; scan: IScan }>(`/api/scans/${id}`);
    return res.scan;
  },

  async startScan(url: string, authorizedConfirmed: boolean): Promise<IScan> {
    const res = await request<{ success: boolean; scan: IScan }>('/api/scans', {
      method: 'POST',
      body: JSON.stringify({ url, authorizedConfirmed }),
    });
    return res.scan;
  },

  async deleteScan(id: string): Promise<void> {
    await request(`/api/scans/${id}`, {
      method: 'DELETE',
    });
  },

  async getSystemInfo(): Promise<any> {
    return await request('/api/scans/system/info');
  },
};
