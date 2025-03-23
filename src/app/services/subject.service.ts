// src/app/services/subject.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Subject, SubjectRequest } from '../models/subject.model';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private apiUrl = 'http://localhost:8080/api/subjects';

  constructor(private http: HttpClient) {}

  /**
   * Get all subjects
   * @returns Observable of Subject array
   */
  getAllSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.apiUrl}/all`)
      .pipe(
        catchError(this.handleError('getAllSubjects', []))
      );
  }

  /**
   * Get subjects with pagination
   * @param page Page number (0-indexed)
   * @param size Page size
   * @returns Observable of paginated Subject data
   */
  getSubjects(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}`)
      .pipe(
        catchError(this.handleError('getSubjects', { content: [], totalElements: 0 }))
      );
  }

  /**
   * Get a subject by its ID
   * @param id Subject ID
   * @returns Observable of Subject
   */
  getSubjectById(id: string): Observable<Subject> {
    return this.http.get<Subject>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError<Subject>('getSubjectById'))
      );
  }

  /**
   * Check if a subject exists by name
   * @param name Subject name
   * @returns Observable of boolean
   */
  existsByName(name: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists/name/${name}`)
      .pipe(
        catchError(this.handleError('existsByName', false))
      );
  }

  /**
   * Check if a subject exists by code
   * @param code Subject code
   * @returns Observable of boolean
   */
  existsByCode(code: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists/code/${code}`)
      .pipe(
        catchError(this.handleError('existsByCode', false))
      );
  }

  /**
   * Create a new subject
   * @param subject Subject data
   * @returns Observable of created Subject
   */
  createSubject(subject: SubjectRequest): Observable<Subject> {
    return this.http.post<Subject>(this.apiUrl, subject)
      .pipe(
        catchError(this.handleError<Subject>('createSubject'))
      );
  }

  /**
   * Update an existing subject
   * @param subject Subject data with ID
   * @returns Observable of updated Subject
   */
  updateSubject(subject: SubjectRequest): Observable<Subject> {
    return this.http.put<Subject>(`${this.apiUrl}/${subject.id}`, subject)
      .pipe(
        catchError(this.handleError<Subject>('updateSubject'))
      );
  }

  /**
   * Delete a subject
   * @param id Subject ID
   * @returns Observable of void
   */
  deleteSubject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError<void>('deleteSubject'))
      );
  }

  /**
   * Find a subject by name
   * @param name Subject name
   * @returns Observable of Subject
   */
  findByName(name: string): Observable<Subject> {
    return this.http.get<Subject>(`${this.apiUrl}/by-name/${name}`)
      .pipe(
        catchError(this.handleError<Subject>('findByName'))
      );
  }

  /**
   * Find a subject by code
   * @param code Subject code
   * @returns Observable of Subject
   */
  findByCode(code: string): Observable<Subject> {
    return this.http.get<Subject>(`${this.apiUrl}/by-code/${code}`)
      .pipe(
        catchError(this.handleError<Subject>('findByCode'))
      );
  }

  /**
   * Search subjects by name or code
   * @param searchTerm Search term
   * @returns Observable of Subject array
   */
  searchSubjects(searchTerm: string): Observable<Subject[]> {
    const params = new HttpParams().set('searchTerm', searchTerm);
    return this.http.get<Subject[]>(`${this.apiUrl}/search`, { params })
      .pipe(
        catchError(this.handleError('searchSubjects', []))
      );
  }

  /**
   * Count programs by subject ID
   * @param subjectId Subject ID
   * @returns Observable of program count
   */
  countProgramsBySubjectId(subjectId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${subjectId}/program-count`)
      .pipe(
        catchError(this.handleError('countProgramsBySubjectId', 0))
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