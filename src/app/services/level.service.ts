// src/app/features/levels/level.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Level } from '../models/level.model';  

@Injectable({
  providedIn: 'root'
})
export class LevelService {
  private apiUrl = 'http://localhost:8080/api/levels';

  constructor(private http: HttpClient) {}

  /**
   * Get all levels
   * @returns Observable of Level array
   */
  getAllLevels(): Observable<Level[]> {
    return this.http.get<Level[]>(`${this.apiUrl}/all`)
      .pipe(
        catchError(this.handleError('getAllLevels', []))
      );
  }

  /**
   * Get levels with pagination
   * @param page Page number (0-indexed)
   * @param size Page size
   * @returns Observable of paginated Level data
   */
  getLevels(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}`)
      .pipe(
        catchError(this.handleError('getLevels', { content: [], totalElements: 0 }))
      );
  }

  /**
   * Get a level by its ID
   * @param id Level ID
   * @returns Observable of Level
   */
  getLevelById(id: string): Observable<Level> {
    return this.http.get<Level>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError<Level>('getLevelById'))
      );
  }

  /**
   * Get levels by department ID
   * @param departmentId Department ID
   * @returns Observable of Level array
   */
  getLevelsByDepartmentId(departmentId: string): Observable<Level[]> {
    return this.http.get<Level[]>(`${this.apiUrl}/by-department/${departmentId}`)
      .pipe(
        catchError(this.handleError('getLevelsByDepartmentId', []))
      );
  }

  /**
   * Get levels by department ID with pagination
   * @param departmentId Department ID
   * @param page Page number (0-indexed)
   * @param size Page size
   * @returns Observable of paginated Level data
   */
  getLevelsByDepartmentIdPaged(departmentId: string, page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/by-department/${departmentId}/paged?page=${page}&size=${size}`)
      .pipe(
        catchError(this.handleError('getLevelsByDepartmentIdPaged', { content: [], totalElements: 0 }))
      );
  }

  /**
   * Check if a level exists by name
   * @param name Level name
   * @returns Observable of boolean
   */
  existsByName(name: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists/name/${name}`)
      .pipe(
        catchError(this.handleError('existsByName', false))
      );
  }

  /**
   * Check if a level exists by name in a specific department
   * @param name Level name
   * @param departmentId Department ID
   * @returns Observable of boolean
   */
  existsByNameAndDepartmentId(name: string, departmentId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists/name/${name}/department/${departmentId}`)
      .pipe(
        catchError(this.handleError('existsByNameAndDepartmentId', false))
      );
  }

  /**
   * Create a new level
   * @param level Level data
   * @returns Observable of created Level
   */
  createLevel(level: Level): Observable<Level> {
    return this.http.post<Level>(this.apiUrl, level)
      .pipe(
        catchError(this.handleError<Level>('createLevel'))
      );
  }

  /**
   * Update an existing level
   * @param level Level data with ID
   * @returns Observable of updated Level
   */
  updateLevel(level: Level): Observable<Level> {
    return this.http.put<Level>(`${this.apiUrl}/${level.id}`, level)
      .pipe(
        catchError(this.handleError<Level>('updateLevel'))
      );
  }

  /**
   * Delete a level
   * @param id Level ID
   * @returns Observable of void
   */
  deleteLevel(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError<void>('deleteLevel'))
      );
  }

  /**
   * Find a level by name
   * @param name Level name
   * @returns Observable of Level
   */
  findByName(name: string): Observable<Level> {
    return this.http.get<Level>(`${this.apiUrl}/by-name/${name}`)
      .pipe(
        catchError(this.handleError<Level>('findByName'))
      );
  }

  /**
   * Count classes by level ID
   * @param levelId Level ID
   * @returns Observable of class count
   */
  countClassesByLevelId(levelId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${levelId}/class-count`)
      .pipe(
        catchError(this.handleError('countClassesByLevelId', 0))
      );
  }

  /**
   * Search levels by name
   * @param searchTerm Search term
   * @returns Observable of Level array
   */
  searchByName(searchTerm: string): Observable<Level[]> {
    return this.http.get<Level[]>(`${this.apiUrl}/search?searchTerm=${searchTerm}`)
      .pipe(
        catchError(this.handleError('searchByName', []))
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