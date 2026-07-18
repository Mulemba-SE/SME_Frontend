import { api } from "./client";
import { API } from "./endpoints";
import type { LoginRequest, RegisterRequest, ChangePasswordRequest, AuthResponse, MeResponse } from "../types/auth";

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

  // Important: Backend uses /me
  me: async (): Promise<MeResponse> => {
    const res = await api.get<MeResponse>(API.AUTH.ME);
    return res.data;
  },
};
