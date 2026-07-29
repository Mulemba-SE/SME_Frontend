import { api } from "./client";
import { API } from "./endpoints";
import type { LoginRequest, RegisterRequest, ChangePasswordRequest, ForgotPasswordRequest, ResetPasswordRequest, ResetTokenInfo, AuthResponse, MeResponse } from "../types/auth";
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

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await api.post(API.AUTH.CHANGE_PASSWORD, data);
  },

  oneTimeLogin: async (token: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>(API.AUTH.ONE_TIME_LOGIN, { token });
    return res.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await api.post(API.AUTH.FORGOT_PASSWORD, data);
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>(API.AUTH.RESET_PASSWORD, data);
    return res.data;
  },

  getResetTokenInfo: async (token: string): Promise<ResetTokenInfo> => {
    const res = await api.get<ResetTokenInfo>(API.AUTH.RESET_PASSWORD_INFO, { params: { token } });
    return res.data;
  },

  // Important: Backend uses /me
  me: async (): Promise<MeResponse> => {
    const res = await api.get<MeResponse>(API.AUTH.ME);
    return res.data;
  },
};