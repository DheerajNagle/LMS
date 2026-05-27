import { useState, useCallback } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { authApi, loginSchema, registerSchema, LoginFields, RegisterFields } from "@/api/auth";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  
  const loginStore = useAuthStore((state) => state.login);
  const logoutStore = useAuthStore((state) => state.logout);
  const refreshSession = useAuthStore((state) => state.refreshSession);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAvatarStore = useAuthStore((state) => state.updateAvatar);

  const login = useCallback(async (fields: LoginFields) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Zod client-side validation guard
      const validation = loginSchema.safeParse(fields);
      if (!validation.success) {
        throw new Error(validation.error.issues[0]?.message || "Invalid credentials format.");
      }

      // 2. Perform API call
      const res = await authApi.login(fields);
      
      // 3. Update Zustand & SecureStore
      await loginStore(res.token, res.refreshToken, res.user);
    } catch (e: any) {
      setError(e.message || "Authentication failed.");
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [loginStore]);

  const register = useCallback(async (fields: RegisterFields) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Zod client-side validation guard
      const validation = registerSchema.safeParse(fields);
      if (!validation.success) {
        throw new Error(validation.error.issues[0]?.message || "Invalid registration format.");
      }

      // 2. Perform API call
      const res = await authApi.register(fields);
      
      // 3. Update Zustand & SecureStore
      await loginStore(res.token, res.refreshToken, res.user);
    } catch (e: any) {
      setError(e.message || "Registration failed.");
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [loginStore]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await logoutStore();
    } catch (e: any) {
      console.error("Logout error:", e);
    } finally {
      setIsLoading(false);
    }
  }, [logoutStore]);

  const updateAvatar = useCallback(async (avatarUri: string) => {
    await updateAvatarStore(avatarUri);
  }, [updateAvatarStore]);

  return {
    user,
    token,
    refreshToken,
    isAuthenticated,
    isInitialized,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshSession,
    updateAvatar,
  };
}
