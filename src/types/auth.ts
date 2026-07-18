export interface User {
  email: string;
  firstName: string;
  lastName?: string;
  roles: string[];
  mustChangePassword?: boolean;
}

export interface AuthResponse {
  firstName: string;
  roles: string[];
  mustChangePassword?: boolean;
}

export interface MeResponse extends User {
  // Add any extra fields your /me endpoint returns
  id?: string;
  phoneNumber?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}