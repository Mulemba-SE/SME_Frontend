import axios from "axios";

export interface ApiError extends Error {
  errorCode?: string;
  isApiError?: boolean;
  fieldErrors?: Record<string, string>;
}

export const api = axios.create({
  baseURL: "",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // Required for httpOnly JWT cookie
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    const errorCode = data?.errorCode;
    const fieldErrors = data?.errors as Record<string, string> | undefined;

    if (errorCode === "VALIDATION_ERROR" && fieldErrors) {
      const firstMessage = Object.values(fieldErrors)[0] ?? "Please check the form for errors.";
      const apiError: ApiError = Object.assign(new Error(firstMessage), {
        errorCode,
        isApiError: true,
        fieldErrors,
      });
      return Promise.reject(apiError);
    }

    const serverMessage = data?.message;
    if (serverMessage) {
      const apiError: ApiError = Object.assign(new Error(serverMessage), {
        errorCode,
        isApiError: true,
      });
      return Promise.reject(apiError);
    }

    return Promise.reject(error);
  }
);

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
