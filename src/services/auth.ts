import { delay } from '../utils/helpers';
import { userStore } from './user-store';

export const authApi = {
  login: async (email: string, password: string) => {
    await delay(800);

    const user = userStore.getUser(email);
    if (!user || user.password !== password || !user.isActive) {
      throw new Error('Invalid email or password');
    }

    if (userStore.isUserExpired(user)) {
      throw new Error('Your account has expired. Please contact an administrator.');
    }

    userStore.updateUser(email, {
      lastLoginAt: new Date().toISOString(),
      loginCount: (user.loginCount || 0) + 1
    });

    const token = btoa(JSON.stringify({ 
      id: user.id,
      email, 
      role: user.role,
      expiresAt: user.expiresAt
    }));

    localStorage.setItem('access_token', token);
    sessionStorage.setItem('access_token', token);

    return {
      user: {
        id: user.id,
        email,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        loginCount: user.loginCount,
        expiresAt: user.expiresAt
      },
      token
    };
  },

  logout: () => {
    localStorage.removeItem('access_token');
    sessionStorage.removeItem('access_token');
    localStorage.removeItem('session_id');
  },

  getCurrentUser: () => {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (!token) return null;

    try {
      const { id, email, role, expiresAt } = JSON.parse(atob(token));
      const user = userStore.getUser(email);
      
      if (userStore.isUserExpired(user)) {
        localStorage.removeItem('access_token');
        sessionStorage.removeItem('access_token');
        return null;
      }

      return user ? {
        id,
        email,
        role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        loginCount: user.loginCount,
        expiresAt
      } : null;
    } catch {
      localStorage.removeItem('access_token');
      sessionStorage.removeItem('access_token');
      return null;
    }
  }
};