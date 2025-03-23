// src/app/services/program.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Program, ProgramRequest, ClassProgramStatistics, SubjectProgramStatistics } from '../models/program.model';

@Injectable({
  providedIn: 'root'
})
export class ProgramService {
  private apiUrl = 'http://localhost:8080/api/programs';

  constructor(private http: HttpClient) {}

  /**
   * Get all programs
   * @returns Observable of Program array
   */
  getAllPrograms(): Observable<Program[]> {
    return this.http.get<Program[]>(`${this.apiUrl}`)
      .pipe(
        catchError(this.handleError('getAllPrograms', []))
      );
  }

  /**
   * Get programs with pagination
   * @param page Page number (0-indexed)
   * @param size Page size
   * @returns Observable of paginated Program data
   */
  getPrograms(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}`)
      .pipe(
        catchError(this.handleError('getPrograms', { content: [], totalElements: 0 }))
      );
  }

  /**
   * Get a program by its ID
   * @param id Program ID
   * @returns Observable of Program
   */
  getProgramById(id: string): Observable<Program> {
    return this.http.get<Program>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError<Program>('getProgramById'))
      );
  }

  /**
   * Create a new program
   * @param program Program data
   * @returns Observable of created Program
   */
  createProgram(program: ProgramRequest): Observable<Program> {
    return this.http.post<Program>(this.apiUrl, program)
      .pipe(
        catchError(this.handleError<Program>('createProgram'))
      );
  }

  /**
   * Create a new program with associations
   * @param program Program data
   * @param classIds Optional list of class IDs
   * @param subjectIds Optional list of subject IDs
   * @returns Observable of created Program
   */
  createProgramWithAssociations(
    program: ProgramRequest, 
    classIds?: string[], 
    subjectIds?: string[]
  ): Observable<Program> {
    let params = new HttpParams();
    
    if (classIds && classIds.length > 0) {
      classIds.forEach(id => {
        params = params.append('classIds', id);
      });
    }
    
    if (subjectIds && subjectIds.length > 0) {
      subjectIds.forEach(id => {
        params = params.append('subjectIds', id);
      });
    }
    
    return this.http.post<Program>(`${this.apiUrl}/with-associations`, program, { params })
      .pipe(
        catchError(this.handleError<Program>('createProgramWithAssociations'))
      );
  }

  /**
   * Update an existing program
   * @param program Program data with ID
   * @returns Observable of updated Program
   */
  updateProgram(program: ProgramRequest): Observable<Program> {
    return this.http.put<Program>(`${this.apiUrl}/${program.id}`, program)
      .pipe(
        catchError(this.handleError<Program>('updateProgram'))
      );
  }

  /**
   * Delete a program
   * @param id Program ID
   * @returns Observable of void
   */
  deleteProgram(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError<void>('deleteProgram'))
      );
  }

  /**
   * Find programs by class ID
   * @param classId Class ID
   * @returns Observable of Program array
   */
  getProgramsByClassId(classId: string): Observable<Program[]> {
    return this.http.get<Program[]>(`${this.apiUrl}/by-class/${classId}`)
      .pipe(
        catchError(this.handleError('getProgramsByClassId', []))
      );
  }

  /**
   * Find programs by subject ID
   * @param subjectId Subject ID
   * @returns Observable of Program array
   */
  getProgramsBySubjectId(subjectId: string): Observable<Program[]> {
    return this.http.get<Program[]>(`${this.apiUrl}/by-subject/${subjectId}`)
      .pipe(
        catchError(this.handleError('getProgramsBySubjectId', []))
      );
  }

  /**
   * Find a program by class and subject
   * @param classId Class ID
   * @param subjectId Subject ID
   * @returns Observable of Program
   */
  getProgramByClassAndSubject(classId: string, subjectId: string): Observable<Program> {
    return this.http.get<Program>(`${this.apiUrl}/by-class/${classId}/subject/${subjectId}`)
      .pipe(
        catchError(this.handleError<Program>('getProgramByClassAndSubject'))
      );
  }

  /**
   * Check if a program exists by class and subject
   * @param classId Class ID
   * @param subjectId Subject ID
   * @returns Observable of boolean
   */
  existsByClassAndSubject(classId: string, subjectId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists/class/${classId}/subject/${subjectId}`)
      .pipe(
        catchError(this.handleError('existsByClassAndSubject', false))
      );
  }

  /**
   * Get program statistics for a class
   * @param classId Class ID
   * @returns Observable of ClassProgramStatistics
   */
  getClassProgramStatistics(classId: string): Observable<ClassProgramStatistics> {
    return this.http.get<ClassProgramStatistics>(`${this.apiUrl}/statistics/class/${classId}`)
      .pipe(
        catchError(this.handleError<ClassProgramStatistics>('getClassProgramStatistics'))
      );
  }

  /**
   * Get program statistics for a subject
   * @param subjectId Subject ID
   * @returns Observable of SubjectProgramStatistics
   */
  getSubjectProgramStatistics(subjectId: string): Observable<SubjectProgramStatistics> {
    return this.http.get<SubjectProgramStatistics>(`${this.apiUrl}/statistics/subject/${subjectId}`)
      .pipe(
        catchError(this.handleError<SubjectProgramStatistics>('getSubjectProgramStatistics'))
      );
  }

  /**
   * Assign a subject to a class in a program
   * @param classId Class ID
   * @param subjectId Subject ID
   * @param description Optional program description
   * @returns Observable of Program
   */
  assignSubjectToClass(classId: string, subjectId: string, description?: string): Observable<Program> {
    let params = new HttpParams()
      .set('classId', classId)
      .set('subjectId', subjectId);
    
    if (description) {
      params = params.set('description', description);
    }
    
    return this.http.post<Program>(`${this.apiUrl}/assign-subject`, null, { params })
      .pipe(
        catchError(this.handleError<Program>('assignSubjectToClass'))
      );
  }

  /**
   * Remove a subject from a class's program
   * @param classId Class ID
   * @param subjectId Subject ID
   * @returns Observable of void
   */
  removeSubjectFromClass(classId: string, subjectId: string): Observable<void> {
    const params = new HttpParams()
      .set('classId', classId)
      .set('subjectId', subjectId);
    
    return this.http.delete<void>(`${this.apiUrl}/remove-subject`, { params })
      .pipe(
        catchError(this.handleError<void>('removeSubjectFromClass'))
      );
  }

  /**
   * Count programs by class ID
   * @param classId Class ID
   * @returns Observable of number
   */
  countByClassId(classId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/by-class/${classId}`)
      .pipe(
        catchError(this.handleError('countByClassId', 0))
      );
  }

  /**
   * Count programs by subject ID
   * @param subjectId Subject ID
   * @returns Observable of number
   */
  countBySubjectId(subjectId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/by-subject/${subjectId}`)
      .pipe(
        catchError(this.handleError('countBySubjectId', 0))
      );
  }

  /**
   * Remove a class from its program
   * @param classId Class ID
   * @returns Observable of void
   */
  removeClassFromProgram(classId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/by-class/${classId}`)
      .pipe(
        catchError(this.handleError<void>('removeClassFromProgram'))
      );
  }

  /**
   * Remove a subject from its program
   * @param subjectId Subject ID
   * @returns Observable of void
   */
  removeSubjectFromProgram(subjectId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/by-subject/${subjectId}`)
      .pipe(
        catchError(this.handleError<void>('removeSubjectFromProgram'))
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