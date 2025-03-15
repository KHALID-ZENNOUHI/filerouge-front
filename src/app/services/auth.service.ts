// src/app/auth/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api/auth';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>; // Changed from currentUser to currentUser$

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(loginRequest: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, loginRequest)
      .pipe(
        tap(response => this.setSession(response)),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => new Error(error.error?.message || 'Login failed. Please try again.'));
        })
      );
  }

  register(registerRequest: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/register`, registerRequest)
      .pipe(
        catchError(error => {
          console.error('Registration error:', error);
          return throwError(() => new Error(error.error?.message || 'Registration failed. Please try again.'));
        })
      );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('user_data');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    
    return this.http.post<AuthResponse>(`${this.API_URL}/refresh-token`, { refreshToken })
      .pipe(
        tap(response => this.setSession(response)),
        catchError(error => {
          console.error('Token refresh error:', error);
          this.logout();
          return throwError(() => new Error('Session expired. Please login again.'));
        })
      );
  }

  requestPasswordReset(request: PasswordResetRequest): Observable<PasswordResetResponse> {
    return this.http.post<PasswordResetResponse>(`${this.API_URL}/reset-password/request`, request)
      .pipe(
        catchError(error => {
          console.error('Password reset request error:', error);
          return throwError(() => new Error(error.error?.message || 'Password reset request failed. Please try again.'));
        })
      );
  }

  confirmPasswordReset(request: PasswordResetConfirmRequest): Observable<PasswordResetResponse> {
    return this.http.post<PasswordResetResponse>(`${this.API_URL}/reset-password/confirm`, request)
      .pipe(
        catchError(error => {
          console.error('Password reset confirmation error:', error);
          return throwError(() => new Error(error.error?.message || 'Password reset confirmation failed. Please try again.'));
        })
      );
  }

  changePassword(request: ChangePasswordRequest): Observable<PasswordResetResponse> {
    return this.http.post<PasswordResetResponse>(`${this.API_URL}/change-password`, request)
      .pipe(
        catchError(error => {
          console.error('Change password error:', error);
          return throwError(() => new Error(error.error?.message || 'Change password failed. Please try again.'));
        })
      );
  }

  checkAuthentication(): Observable<boolean> {
    return this.http.get<void>(`${this.API_URL}/check`)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const expiresAt = localStorage.getItem('expires_at');
    
    if (!token || !expiresAt) {
      return false;
    }
    
    return Date.now() < JSON.parse(expiresAt);
  }

  // Get the JWT token
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Get the refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  hasRole(role: string): boolean {
    const user = this.currentUserValue;
    return user?.role === role;
  }

  private setSession(authResult: AuthResponse): void {
    try {
      // Calculate an expiration time (24 hours from now)
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      // Store auth data in localStorage
      localStorage.setItem('auth_token', authResult.token);
      localStorage.setItem('refresh_token', authResult.refreshToken);
      localStorage.setItem('expires_at', JSON.stringify(expiresAt));

      // Create user object from auth response
      const user: User = {
        id: '', // Will be filled by the backend if needed
        username: authResult.username,
        firstName: '', // We don't have this info from the response
        lastName: '',  // We don't have this info from the response
        email: '',     // We don't have this info from the response
        role: authResult.role,
        enabled: true,
        locked: false,
        photo: undefined
      };

      // Try to extract the fullName
      if (authResult.fullName) {
        const nameParts = authResult.fullName.split(' ');
        if (nameParts.length > 0) {
          user.firstName = nameParts[0];
          if (nameParts.length > 1) {
            user.lastName = nameParts.slice(1).join(' ');
          }
        }
      }

      // Store user data
      localStorage.setItem('user_data', JSON.stringify(user));
      this.currentUserSubject.next(user);
    } catch (error) {
      console.error('Error setting session:', error);
      this.logout();
    }
  }

  private getUserFromStorage(): User | null {
    const userData = localStorage.getItem('user_data');
    const token = localStorage.getItem('auth_token');
    const expiresAt = localStorage.getItem('expires_at');
    
    if (userData && token && expiresAt && Date.now() < JSON.parse(expiresAt)) {
      return JSON.parse(userData);
    }
    return null;
  }
}