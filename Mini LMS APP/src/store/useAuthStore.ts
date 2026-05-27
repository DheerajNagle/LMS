import { create } from "zustand";
import { secureStorage } from "@/utils/secure-store";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (token: string, refreshToken: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateAvatar: (avatarUri: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isInitialized: false,

  login: async (token, refreshToken, user) => {
    await secureStorage.saveToken(token);
    await secureStorage.saveRefreshToken(refreshToken);
    await secureStorage.saveUser(user);
    set({ token, refreshToken, user, isAuthenticated: true });
  },

  logout: async () => {
    await secureStorage.clearAuth();
    set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
  },

  updateAvatar: async (avatarUri: string) => {
    const { user } = get();
    if (user) {
      const updatedUser = { ...user, avatar: avatarUri };
      await secureStorage.saveUser(updatedUser);
      set({ user: updatedUser });
    }
  },

  initialize: async () => {
    try {
      const token = await secureStorage.getToken();
      const refreshToken = await secureStorage.getRefreshToken();
      const user = await secureStorage.getUser();
      if (token && refreshToken && user) {
        set({ token, refreshToken, user, isAuthenticated: true });
      }
    } catch (e) {
      console.error("Auth store initialization failed:", e);
    } finally {
      set({ isInitialized: true });
    }
  },

  refreshSession: async () => {
    const { refreshToken } = get();
    if (!refreshToken) return;
    try {
      const { authApi } = require("@/api/auth");
      const tokens = await authApi.refreshAccessToken(refreshToken);
      await secureStorage.saveToken(tokens.token);
      await secureStorage.saveRefreshToken(tokens.refreshToken);
      set({ token: tokens.token, refreshToken: tokens.refreshToken });
    } catch (e) {
      console.error("Token refreshing operation failed:", e);
      // If refresh fails, sign user out
      await secureStorage.clearAuth();
      set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
    }
  }
}));
