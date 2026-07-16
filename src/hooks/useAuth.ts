import { useAuthStore } from "../store/authStore";
import { authApi } from "../api/auth";
import { getApiErrorMessage, getApiFieldErrors } from "../api/client";
import type { LoginRequest, RegisterRequest } from "../types/auth";

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    setAuth,
    clearAuth,
    setLoading,
    setError,
  } = useAuthStore();

  const login = async (data: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.login(data);
      const userData = {
  email: data.email,
  firstName: res.firstName,
  roles: res.roles,
};
      setAuth(userData);
      return { success: true };
    } catch (err) {
      const message = getApiErrorMessage(err, "Invalid email or password.");
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.register(data);
      const userData = {
  email: data.email,
  firstName: res.firstName,
  roles: res.roles,
};
      setAuth(userData);
      return { success: true };
    } catch (err) {
      const fieldErrors = getApiFieldErrors(err);
      const message = getApiErrorMessage(err, "Registration failed. Please try again.");
      setError(fieldErrors ? null : message);
      return { success: false, error: message, fieldErrors };
    } finally {
      setLoading(false);
    }
  };

 const restoreSession = async () => {
  setLoading(true);
  try {
    const res = await authApi.me();
    setAuth({
      email: res.email || res.phoneNumber || "",
      firstName: res.firstName || res.lastName || "",
      roles: res.roles,
    });
  } catch {
    clearAuth();
  } finally {
    setLoading(false);
  }
};

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
    }
  };

  return { 
    user, 
    isAuthenticated, 
    isLoading, 
    error, 
    login, 
    register, 
    logout,
    restoreSession
  };
}