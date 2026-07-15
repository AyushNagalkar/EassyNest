const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<void> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
    }
  }

  setTokens(access: string, refresh: string) {
    this.accessToken = access;
    this.refreshToken = refresh;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  getAccessToken() {
    return this.accessToken;
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) throw new Error('No refresh token');

    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    if (!res.ok) {
      this.clearTokens();
      throw new Error('Token refresh failed');
    }

    const data = await res.json();
    this.setTokens(data.accessToken, data.refreshToken);
  }

  async fetch<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { skipAuth, headers: extraHeaders, ...rest } = options;

    const headers: Record<string, string> = {
      ...(extraHeaders as Record<string, string>),
    };

    if (!(rest.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }


    if (!skipAuth && this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    let res = await fetch(`${API_BASE}${endpoint}`, { headers, ...rest });

    // Auto-refresh on 401
    if (res.status === 401 && !skipAuth && this.refreshToken) {
      if (!this.refreshPromise) {
        this.refreshPromise = this.refreshAccessToken().finally(() => {
          this.refreshPromise = null;
        });
      }
      await this.refreshPromise;

      headers['Authorization'] = `Bearer ${this.accessToken}`;
      res = await fetch(`${API_BASE}${endpoint}`, { headers, ...rest });
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new ApiError(res.status, error.message || 'Request failed', error);
    }

    // Handle empty responses (204, etc)
    const text = await res.text();
    return text ? JSON.parse(text) : null as any;
  }

  get<T = any>(endpoint: string, options?: FetchOptions) {
    return this.fetch<T>(endpoint, { method: 'GET', ...options });
  }

  post<T = any>(endpoint: string, body?: any, options?: FetchOptions) {
    const isFormData = typeof window !== 'undefined' && body instanceof FormData;
    return this.fetch<T>(endpoint, {
      method: 'POST',
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
      ...options
    });
  }

  patch<T = any>(endpoint: string, body?: any, options?: FetchOptions) {
    const isFormData = typeof window !== 'undefined' && body instanceof FormData;
    return this.fetch<T>(endpoint, {
      method: 'PATCH',
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
      ...options
    });
  }

  delete<T = any>(endpoint: string, options?: FetchOptions) {
    return this.fetch<T>(endpoint, { method: 'DELETE', ...options });
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = new ApiClient();
