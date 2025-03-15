// src/app/features/departments/department.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Department } from '../models/department.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private apiUrl = 'http://localhost:8080/api/departments';

  constructor(private http: HttpClient) {}

  /**
   * Get all departments
   * @returns Observable of Department array
   */
  getAllDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.apiUrl}/all`)
      .pipe(
        catchError(this.handleError('getAllDepartments', []))
      );
  }

  /**
   * Get departments with pagination
   * @param page Page number (0-indexed)
   * @param size Page size
   * @returns Observable of paginated Department data
   */
  getDepartments(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}`)
      .pipe(
        catchError(this.handleError('getDepartments', { content: [], totalElements: 0 }))
      );
  }

  /**
   * Get a department by its ID
   * @param id Department ID
   * @returns Observable of Department
   */
  getDepartmentById(id: string): Observable<Department> {
    return this.http.get<Department>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError<Department>('getDepartmentById'))
      );
  }

  /**
   * Check if a department exists by name
   * @param name Department name
   * @returns Observable of boolean
   */
  existsByName(name: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists/name/${name}`)
      .pipe(
        catchError(this.handleError('existsByName', false))
      );
  }

  /**
   * Create a new department
   * @param department Department data
   * @returns Observable of created Department
   */
  createDepartment(department: Department): Observable<Department> {
    return this.http.post<Department>(this.apiUrl, department)
      .pipe(
        catchError(this.handleError<Department>('createDepartment'))
      );
  }

  /**
   * Update an existing department
   * @param department Department data with ID
   * @returns Observable of updated Department
   */
  updateDepartment(department: Department): Observable<Department> {
    return this.http.put<Department>(`${this.apiUrl}/${department.id}`, department)
      .pipe(
        catchError(this.handleError<Department>('updateDepartment'))
      );
  }

  /**
   * Delete a department
   * @param id Department ID
   * @returns Observable of void
   */
  deleteDepartment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError<void>('deleteDepartment'))
      );
  }

  /**
   * Find a department by name
   * @param name Department name
   * @returns Observable of Department
   */
  findByName(name: string): Observable<Department> {
    return this.http.get<Department>(`${this.apiUrl}/by-name/${name}`)
      .pipe(
        catchError(this.handleError<Department>('findByName'))
      );
  }

  /**
   * Generic error handler
   * @param operation Operation name
   * @param result Optional default result
   * @returns Error handler function
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      
      // Let the app keep running by returning an empty result
      return throwError(() => error);
    };
  }
}