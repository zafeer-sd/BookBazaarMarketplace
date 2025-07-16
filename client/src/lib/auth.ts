import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

let currentUser: User | null = null;
let authToken: string | null = null;

export const auth = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/api/auth/login', { email, password });
    const data = await response.json();
    
    currentUser = data.user;
    authToken = data.token;
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    
    return data;
  },

  async register(email: string, password: string, name: string, role: string): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/api/auth/register', { email, password, name, role });
    const data = await response.json();
    
    currentUser = data.user;
    authToken = data.token;
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    
    return data;
  },

  logout(): void {
    currentUser = null;
    authToken = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  },

  getCurrentUser(): User | null {
    if (!currentUser) {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        currentUser = JSON.parse(stored);
      }
    }
    return currentUser;
  },

  getToken(): string | null {
    if (!authToken) {
      authToken = localStorage.getItem('authToken');
    }
    return authToken;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  isSeller(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'seller';
  },

  isBuyer(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'buyer';
  },
};

// Add token to all API requests
const originalApiRequest = apiRequest;
export const apiRequestWithAuth = async (method: string, url: string, data?: unknown) => {
  const token = auth.getToken();
  const headers: Record<string, string> = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (data) {
    headers['Content-Type'] = 'application/json';
  }
  
  const response = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include',
  });
  
  if (!response.ok) {
    const text = (await response.text()) || response.statusText;
    throw new Error(`${response.status}: ${text}`);
  }
  
  return response;
};
