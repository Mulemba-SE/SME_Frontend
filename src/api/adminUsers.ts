import { api } from "./client";
import { API } from "./endpoints";
import type { AdminUser, CreateAdminUserRequest, CreateAdminUserResponse } from "../types/adminUser";

export const adminUsersApi = {
  list: async (): Promise<AdminUser[]> => {
    const res = await api.get<AdminUser[]>(API.ADMIN.USERS);
    return res.data;
  },

  create: async (input: CreateAdminUserRequest): Promise<CreateAdminUserResponse> => {
    const res = await api.post<CreateAdminUserResponse>(API.ADMIN.USERS, input);
    return res.data;
  },
};
