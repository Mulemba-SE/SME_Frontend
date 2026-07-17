import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminUsersApi } from "../api/adminUsers";
import type { CreateAdminUserRequest } from "../types/adminUser";

const ADMIN_USERS_KEY = "admin-users";

export function useAdminUsers() {
  return useQuery({
    queryKey: [ADMIN_USERS_KEY],
    queryFn: () => adminUsersApi.list(),
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAdminUserRequest) => adminUsersApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_KEY] });
    },
  });
}
