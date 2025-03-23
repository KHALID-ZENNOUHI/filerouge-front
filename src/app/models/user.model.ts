// src/app/models/user.model.ts
import { Class } from './class.model';

// Role enum
export enum UserRole {
  ADMINISTRATOR = 'ADMINISTRATOR',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

export interface User {
  id?: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  cin: string;
  phone: string;
  birthDate: Date;
  birthPlace: string;
  address: string;
  gender: Gender;
  photo?: string;
  role: UserRole;
  enabled: boolean;
  locked: boolean;
  lastLogin?: Date;
  
  // Student-specific fields
  class?: Class; // For students
  parent?: User; // For students
  
  // For handling in forms
  classId?: string;
  parentId?: string;
}

export interface UserFilter {
  name?: string;
  role?: UserRole;
  enabled?: boolean;
}

export interface UserStatusUpdate {
  enabled: boolean;
  locked: boolean;
  reasonForChange: string;
}

export interface PasswordUpdate {
  currentPassword?: string; // Only for current user changing their own password
  newPassword: string;
  confirmPassword: string;
}

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  lockedUsers: number;
  disabledUsers: number;
  usersByRole: {[key: string]: number};
  neverLoggedInUsers: number;
}

// For creating/updating users
export interface UserRequest {
  id?: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string; // Optional when updating
  cin: string;
  phone: string;
  birthDate: Date;
  birthPlace: string;
  address: string;
  gender: Gender;
  photo?: string;
  role: UserRole;
  enabled?: boolean;
  locked?: boolean;
  classId?: string; // For students
  parentId?: string; // For students
}