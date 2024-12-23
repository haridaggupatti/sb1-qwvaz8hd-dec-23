import { delay } from '../utils/helpers';
import { userStore } from './user-store';

export const adminApi = {
  getStats: async () => {
    await delay(1000);
    const users = Object.values(userStore.users);
    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      adminUsers: users.filter(u => u.role === 'admin').length,
      recentLogins: [
        { date: '2024-03-15', count: 3 },
        { date: '2024-03-16', count: 5 },
        { date: '2024-03-17', count: 4 },
        { date: '2024-03-18', count: 7 },
        { date: '2024-03-19', count: 6 }
      ]
    };
  }
};