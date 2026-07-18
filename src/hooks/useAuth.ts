import { useAuthStore } from "../store/authStore";
import { authApi } from "../api/auth";
import { getApiErrorMessage, getApiFieldErrors } from "../api/client";
import type { ChangePasswordRequest, LoginRequest, RegisterRequest } from "../types/auth";

const AUTH_HINT_KEY = "imarabill_has_session";

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
        mustChangePassword: res.mustChangePassword,
      };
      setAuth(userData);
      localStorage.setItem(AUTH_HINT_KEY, "1");
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
        mustChangePassword: res.mustChangePassword,
      };
      setAuth(userData);
      localStorage.setItem(AUTH_HINT_KEY, "1");
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
    // No hint of a prior session -> skip the /me round trip entirely.
    if (!localStorage.getItem(AUTH_HINT_KEY)) {
      clearAuth();
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.me();
      setAuth({
        email: res.email || res.phoneNumber || "",
        firstName: res.firstName || res.lastName || "",
        roles: res.roles,
        mustChangePassword: res.mustChangePassword,
      });
    } catch {
      clearAuth();
      localStorage.removeItem(AUTH_HINT_KEY);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
      localStorage.removeItem(AUTH_HINT_KEY);
    }
  };

  const changePassword = async (data: ChangePasswordRequest) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.changePassword(data);
      if (user) {
        setAuth({ ...user, mustChangePassword: false });
      }
      return { success: true };
    } catch (err) {
      const message = getApiErrorMessage(err, "Could not change password. Please try again.");
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
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
    restoreSession,
    changePassword,
  };
}