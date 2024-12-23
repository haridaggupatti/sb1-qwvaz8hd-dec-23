import { delay } from '../utils/helpers';
import { userStore } from './user-store';

export const userApi = {
  getUsers: async () => {
    await delay(1000);
    return userStore.getAllUsers();
  },

  createUser: async (userData: any) => {
    await delay(800);
    const email = userData.email;
    const newUser = userStore.addUser(email, userData);
    return { ...newUser, email };
  },

  updateUser: async (id: string, userData: any) => {
    await delay(800);
    const user = Object.entries(userStore.users).find(([_, u]) => u.id === id);
    if (user) {
      userStore.updateUser(user[0], userData);
      return { ...userData, id };
    }
    throw new Error('User not found');
  },

  deleteUser: async (id: string) => {
    await delay(800);
    const user = Object.entries(userStore.users).find(([_, u]) => u.id === id);
    if (user) {
      userStore.deleteUser(user[0]);
      return { success: true };
    }
    throw new Error('User not found');
  }
};