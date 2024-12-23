const GLOBAL_USER_STORE_KEY = 'global_user_store';

export const userStore = {
  users: (() => {
    try {
      const stored = localStorage.getItem(GLOBAL_USER_STORE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading user store:', error);
    }
    return {
      'test@example.com': {
        id: '1',
        password: 'password123',
        role: 'user',
        isActive: true,
        createdAt: '2024-03-01T00:00:00Z',
        lastLoginAt: '2024-03-19T10:00:00Z',
        loginCount: 5,
        expiresAt: '2025-03-01'
      },
      'admin@example.com': {
        id: '2',
        password: 'admin123',
        role: 'admin',
        isActive: true,
        createdAt: '2024-03-01T00:00:00Z',
        lastLoginAt: '2024-03-19T11:00:00Z',
        loginCount: 10,
        expiresAt: '2025-03-01'
      }
    };
  })(),

  save() {
    try {
      localStorage.setItem(GLOBAL_USER_STORE_KEY, JSON.stringify(this.users));
      sessionStorage.setItem(GLOBAL_USER_STORE_KEY, JSON.stringify(this.users));
    } catch (error) {
      console.error('Error saving user store:', error);
    }
  },

  addUser(email: string, userData: any) {
    const timestamp = new Date().toISOString();
    this.users[email] = {
      ...userData,
      id: `user_${Date.now()}`,
      loginCount: 0,
      lastLoginAt: null,
      createdAt: timestamp,
      isActive: true
    };
    this.save();
    return this.users[email];
  },

  updateUser(email: string, userData: any) {
    if (this.users[email]) {
      this.users[email] = {
        ...this.users[email],
        ...userData,
        updatedAt: new Date().toISOString()
      };
      this.save();
    }
  },

  deleteUser(email: string) {
    delete this.users[email];
    this.save();
  },

  getUser(email: string) {
    return this.users[email];
  },

  getAllUsers() {
    return Object.entries(this.users).map(([email, user]) => ({
      ...user,
      email
    }));
  },

  isUserExpired(user: any): boolean {
    if (!user.expiresAt) return false;
    const expiryDate = new Date(user.expiresAt);
    return expiryDate < new Date();
  },

  syncUsers() {
    const storedUsers = localStorage.getItem(GLOBAL_USER_STORE_KEY);
    if (storedUsers) {
      this.users = JSON.parse(storedUsers);
    }
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === GLOBAL_USER_STORE_KEY) {
      userStore.syncUsers();
    }
  });
}