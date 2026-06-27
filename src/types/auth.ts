export interface User {
  email: string;
  firstName: string;
  lastName?: string;
  roles: string[];
}

export interface AuthResponse {
  firstName: string;
  roles: string[];
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