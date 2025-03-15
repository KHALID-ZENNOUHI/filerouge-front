export interface LoginRequest {
    username: string;
    password: string;
  }
  
  export interface RegisterRequest {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    cin: string;
    phone: string;
    birthDate: Date;
    birthPlace: string;
    address: string;
    gender: string;
    photo?: string;
    role: string;
    classId?: string;
    parentId?: string;
  }
  
  export interface AuthResponse {
    token: string;
    refreshToken: string;
    username: string;
    fullName: string;
    role: string;
  }
  
  export interface PasswordResetRequest {
    email: string;
  }
  
  export interface PasswordResetConfirmRequest {
    token: string;
    newPassword: string;
  }
  
  export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }
  
  export interface PasswordResetResponse {
    success: boolean;
    message: string;
  }
  
  // User model
  export interface User {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    enabled: boolean;
    locked: boolean;
    photo?: string;
  }