import { describe, it, expect, vi } from 'vitest';
import { authApi, userApi } from '../../services/api';

describe('API Services', () => {
  describe('authApi', () => {
    beforeEach(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    it('handles successful login', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const result = await authApi.login(credentials.email, credentials.password);
      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      expect(localStorage.getItem('access_token')).toBeTruthy();
    });

    it('handles logout', () => {
      localStorage.setItem('access_token', 'test-token');
      sessionStorage.setItem('access_token', 'test-token');

      authApi.logout();
      
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(sessionStorage.getItem('access_token')).toBeNull();
    });
  });

  describe('userApi', () => {
    it('retrieves users list', async () => {
      const users = await userApi.getUsers();
      expect(Array.isArray(users)).toBe(true);
    });

    it('creates new user', async () => {
      const newUser = {
        email: 'new@example.com',
        password: 'Password123!',
        role: 'user',
        department: 'Engineering'
      };

      const result = await userApi.createUser(newUser);
      expect(result.email).toBe(newUser.email);
      expect(result.id).toBeDefined();
    });
  });
});