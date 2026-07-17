export type AssignableRole = "MANAGER" | "STAFF" | "CUSTOMER";

export interface AdminUser {
  id: string;
  userNo: number;
  firstName: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  roles: string[];
  disabled: boolean;
  createdAt: string;
}

export interface CreateAdminUserRequest {
  firstName: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  role: AssignableRole;
}

export interface CreateAdminUserResponse {
  firstName: string;
  lastName?: string;
  email: string;
  role: string;
}
