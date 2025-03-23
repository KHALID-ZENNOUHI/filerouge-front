// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserRequest, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/admin/users`;
  private api = `${environment.apiUrl}/classes`;
  cachedUsers: any[] = [];

  constructor(private http: HttpClient) { }

  /**
   * Get all users
   */
  getAllUsers(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`).pipe(
      tap(response => {
        // Cache the users data
        if (response && response.content) {
          this.cachedUsers = response.content;
        } else if (Array.isArray(response)) {
          this.cachedUsers = response;
        }
      })
    );
  }
  /**
   * Get user by ID
   */
  getUserById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new user
   */
  createUser(user: UserRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}`, user);
  }
  /**
   * Update user status (enable/disable, lock/unlock)
   */
  updateUserStatus(id: string, statusUpdate: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/status`, statusUpdate);
  }

  /**
   * Delete a user
   */
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Search users by name
   */
  searchUsers(query: string): Observable<any> {
    const params = new HttpParams().set('query', query);
    return this.http.get<any>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Get users by role
   */
  getUsersByRole(role: string): Observable<any> {
    const url = `${this.apiUrl}/by-role/${role}`;
    console.log(`Calling API: ${url}`);
    
    return this.http.get<any>(url).pipe(
      tap(response => console.log('UserService - getUsersByRole response:', response)),
      catchError(error => {
        console.error('UserService - getUsersByRole error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Reset a user's password (admin only)
   */
  resetUserPassword(id: string, passwordUpdate: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/reset-password`, passwordUpdate);
  }

  /**
   * Filter users based on criteria
   */
  filterUsers(filter: any): Observable<any> {
    // This is a simplified implementation
    if (filter.role) {
      return this.getUsersByRole(filter.role);
    }
    
    if (filter.name && filter.name.trim() !== '') {
      return this.searchUsers(filter.name);
    }
    
    return this.getAllUsers();
  }

  getAllClasses(): Observable<any> {
    console.log(`Calling API: ${this.api}`);
    return this.http.get<any>(this.api).pipe(
      tap(response => console.log('ClassService - getAllClasses response:', response)),
      catchError(error => {
        console.error('ClassService - getAllClasses error:', error);
        return throwError(() => error);
      })
    );
  }
}