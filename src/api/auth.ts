import axios from "axios";
import { API } from "./endpoints";
import type { LoginRequest, RegisterRequest, AuthResponse, MeResponse } from "../types/auth";

const api = axios.create({
  baseURL: '',
  headers: { "Content-Type": "application/json" },
  withCredentials: true,        // Required for httpOnly JWT cookie
});

export interface ApiError extends Error {
  errorCode?: string;
  isApiError?: boolean;
  fieldErrors?: Record<string, string>;
}

// Global error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    const errorCode = data?.errorCode;
    const fieldErrors = data?.errors as Record<string, string> | undefined;

    if (errorCode === "VALIDATION_ERROR" && fieldErrors) {
      const firstMessage = Object.values(fieldErrors)[0] ?? "Please check the form for errors.";
      const apiError: ApiError = new Error(firstMessage);
      apiError.errorCode = errorCode;
      apiError.isApiError = true;
      apiError.fieldErrors = fieldErrors;
      return Promise.reject(apiError);
    }

    const serverMessage = data?.message;
    if (serverMessage) {
      const apiError: ApiError = new Error(serverMessage);
      apiError.errorCode = errorCode;
      apiError.isApiError = true;
      return Promise.reject(apiError);
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>(API.AUTH.LOGIN, data);
    return res.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>(API.AUTH.REGISTER, data);
    return res.data;
  },

  logout: async (): Promise<void> => {
    await api.post(API.AUTH.LOGOUT);
  },

  // Important: Backend uses /me
  me: async (): Promise<MeResponse> => {
    const res = await api.get<MeResponse>(API.AUTH.ME);
    return res.data;
  },
};

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && (err as ApiError).isApiError) {
    return err.message;
  }
  return fallback;
}

export function getApiErrorCode(err: unknown): string | undefined {
  if (err instanceof Error && (err as ApiError).isApiError) {
    return (err as ApiError).errorCode;
  }
  return undefined;
}

export function getApiFieldErrors(err: unknown): Record<string, string> | undefined {
  if (err instanceof Error && (err as ApiError).isApiError) {
    return (err as ApiError).fieldErrors;
  }
  return undefined;
}