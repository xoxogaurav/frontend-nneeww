import api from './api';

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: {
      id: number;
      name: string;
      email: string;
      is_admin: boolean;
    };
  };
  message?: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

class AuthService {
  private static instance: AuthService;
  private token: string | null = null;

  private constructor() {
    this.token = localStorage.getItem('token');
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async login(email: string, password: string): Promise<{ token: string; user: { id: number; name: string; email: string; is_admin: boolean } }> {
    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        email,
        password
      });

      const responseData = response.data.parsed;
      
      if (!responseData?.success || !responseData?.data?.token || !responseData?.data?.user) {
        throw new Error('Invalid response format');
      }

      this.token = responseData.data.token;
      localStorage.setItem('token', this.token);
      
      // Store admin status in localStorage
      const isAdmin = responseData.data.user.is_admin;
      localStorage.setItem('isAdmin', String(isAdmin));
      
      // Reset admin mode to true for admin users
      if (isAdmin) {
        localStorage.setItem('adminMode', 'true');
      }

      return {
        token: responseData.data.token,
        user: {
          id: responseData.data.user.id,
          name: responseData.data.user.name,
          email: responseData.data.user.email,
          is_admin: isAdmin
        }
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.parsed?.message || 
        error.message || 
        'Failed to login'
      );
    }
  }

  public async register(name: string, email: string, password: string, country: string): Promise<{ token: string; user: { id: number; name: string; email: string; is_admin: boolean } }> {
    try {
      // Get referral code from URL if present
      const urlParams = new URLSearchParams(window.location.search);
      const referralCode = urlParams.get('ref');

      const requestBody = {
        name,
        email,
        password,
        country: country.toUpperCase(),
        ...(referralCode && { referral_code: referralCode })
      };

      const response = await api.post<LoginResponse>('/auth/register', requestBody);

      const responseData = response.data.parsed;
      
      if (!responseData?.success || !responseData?.data?.token || !responseData?.data?.user) {
        throw new Error('Invalid response format');
      }

      this.token = responseData.data.token;
      localStorage.setItem('token', this.token);
      
      // Store admin status in localStorage
      const isAdmin = responseData.data.user.is_admin;
      localStorage.setItem('isAdmin', String(isAdmin));
      
      // Reset admin mode to true for admin users
      if (isAdmin) {
        localStorage.setItem('adminMode', 'true');
      }

      return {
        token: responseData.data.token,
        user: {
          id: responseData.data.user.id,
          name: responseData.data.user.name,
          email: responseData.data.user.email,
          is_admin: isAdmin
        }
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.parsed?.message || 
        error.message || 
        'Failed to register'
      );
    }
  }

  public async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      this.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('adminMode');
      window.location.href = '/';
    }
  }

  public async refreshToken(): Promise<string> {
    try {
      const response = await api.post<{ success: boolean; data: { token: string } }>('/auth/refresh');
      
      const responseData = response.data.parsed;
      
      if (!responseData?.success || !responseData?.data?.token) {
        throw new Error('Invalid response format');
      }

      this.token = responseData.data.token;
      localStorage.setItem('token', this.token);
      return this.token;
    } catch (error: any) {
      this.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('adminMode');
      throw new Error(
        error.response?.data?.parsed?.message || 
        error.message || 
        'Failed to refresh token'
      );
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public isAuthenticated(): boolean {
    return !!this.token;
  }

  public isAdmin(): boolean {
    return localStorage.getItem('isAdmin') === 'true';
  }
}

export default AuthService.getInstance();