import { api } from "./client";
import { API } from "./endpoints";
import type { RegisterRequest, AuthResponse } from "../types/auth";
import type { TeamExistsResponse } from "../types/setup";

export const setupApi = {
  exists: async (): Promise<TeamExistsResponse> => {
    const res = await api.get<TeamExistsResponse>(API.SETUP.EXISTS);
    return res.data;
  },

  createFirstManager: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>(API.SETUP.FIRST_MANAGER, data);
    return res.data;
  },
};