// src/app/services/class.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders  } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Class, ClassFilter, ClassRequest, ClassStatistics, Department, Level, Program } from '../models/class.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClassService {
  private apiUrl = `${environment.apiUrl}/classes`;
  private levelsApiUrl = `${environment.apiUrl}/levels`;
  private departmentsApiUrl = `${environment.apiUrl}/departments`;
  private programsApiUrl = `${environment.apiUrl}/programs`;
  private studentsApiUrl = `${environment.apiUrl}/students`;
  private subjectsApiUrl = `${environment.apiUrl}/subjects`;

  constructor(private http: HttpClient) { }

  // Class CRUD operations
  getAllClasses(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getClassesPaginated(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/paginated`, { params });
  }

  getClassById(id: string): Observable<Class> {
    return this.http.get<Class>(`${this.apiUrl}/${id}`);
  }

  createClass(classRequest: ClassRequest): Observable<Class> {
    console.log('ClassService: Creating class with data:', JSON.stringify(classRequest, null, 2));
    
    // Ensure the request is correctly formatted for the API
    const requestBody = classRequest;
    
    // Add headers to ensure proper content type
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    
    return this.http.post<Class>(this.apiUrl, requestBody, options).pipe(
      tap(response => {
        console.log('Class created successfully, API response:', JSON.stringify(response, null, 2));
        
        // Check if level is null
        if (!response.level) {
          console.warn('Warning: Level is null in the create class response');
        }
      }),
      catchError(error => {
        console.error('Error creating class, API error:', error);
        
        // Log request details for debugging
        console.error('Request that caused error:', {
          url: this.apiUrl,
          body: requestBody
        });
        
        return throwError(() => error);
      })
    );
  }

  updateClass(classRequest: ClassRequest): Observable<Class> {
    console.log('ClassService: Updating class with data:', JSON.stringify(classRequest, null, 2));
    
    // Ensure the request is correctly formatted for the API
    const requestBody = classRequest;
    
    // Add headers to ensure proper content type
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    
    return this.http.put<Class>(`${this.apiUrl}/${classRequest.id}`, requestBody, options).pipe(
      tap(response => {
        console.log('Class updated successfully, API response:', JSON.stringify(response, null, 2));
        
        // Check if level is null
        if (!response.level) {
          console.warn('Warning: Level is null in the update class response');
        }
      }),
      catchError(error => {
        console.error('Error updating class, API error:', error);
        
        // Log request details for debugging
        console.error('Request that caused error:', {
          url: `${this.apiUrl}/${classRequest.id}`,
          body: requestBody
        });
        
        return throwError(() => error);
      })
    );
  }

  deleteClass(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Class filtering
  searchClasses(filter: ClassFilter, page: number = 0, size: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filter.name) {
      params = params.set('name', filter.name);
    }
    if (filter.levelId) {
      params = params.set('levelId', filter.levelId);
    }
    if (filter.departmentId) {
      params = params.set('departmentId', filter.departmentId);
    }

    return this.http.get<any>(`${this.apiUrl}/search`, { params });
  }

  getClassesByLevelId(levelId: string): Observable<Class[]> {
    return this.http.get<Class[]>(`${this.apiUrl}/by-level/${levelId}`);
  }

  getClassesByDepartmentId(departmentId: string): Observable<Class[]> {
    return this.http.get<Class[]>(`${this.apiUrl}/by-department/${departmentId}`);
  }

  // Class statistics
  getClassStatistics(classId: string): Observable<ClassStatistics> {
    return this.http.get<ClassStatistics>(`${this.apiUrl}/${classId}/statistics`);
  }

  // Student operations
  getStudentsByClassId(classId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.studentsApiUrl}/by-class/${classId}`);
  }

  // Levels operations
  getAllLevels(): Observable<Level[]> {
    // Log the request
    console.log('Fetching all levels from:', `${this.levelsApiUrl}`);
    return this.http.get<Level[]>(`${this.levelsApiUrl}`).pipe(
      tap(response => console.log('Levels response:', response)),
      catchError(error => {
        console.error('Error fetching levels:', error);
        return throwError(() => error);
      })
    );
  }

  getLevelsByDepartmentId(departmentId: string): Observable<Level[]> {
    // Log the request
    console.log('Fetching levels for department:', departmentId);
    return this.http.get<Level[]>(`${this.levelsApiUrl}/by-department/${departmentId}`).pipe(
      tap(response => console.log('Levels by department response:', response)),
      catchError(error => {
        console.error('Error fetching levels by department, trying alternate endpoint:', error);
        // Try alternate endpoint
        return this.http.get<Level[]>(`${environment.apiUrl}/level/by-department/${departmentId}`).pipe(
          tap(response => console.log('Levels response from alternate endpoint:', response)),
          catchError(error2 => {
            console.error('Error fetching levels from alternate endpoint:', error2);
            // Try another alternate endpoint
            return this.http.get<Level[]>(`${environment.apiUrl}/niveau/by-department/${departmentId}`).pipe(
              tap(response => console.log('Levels response from second alternate endpoint:', response)),
              catchError(error3 => {
                console.error('Error fetching levels from second alternate endpoint:', error3);
                return throwError(() => error3);
              })
            );
          })
        );
      })
    );
  }

  // Departments operations
  getAllDepartments(): Observable<Department[]> {
    // Log the request
    console.log('Fetching all departments from:', `${this.departmentsApiUrl}`);
    return this.http.get<Department[]>(`${this.departmentsApiUrl}`).pipe(
      tap(response => console.log('Departments response:', response)),
      catchError(error => {
        console.error('Error fetching departments, trying alternate endpoint:', error);
        // Try alternate endpoint
        return this.http.get<Department[]>(`${environment.apiUrl}/department`).pipe(
          tap(response => console.log('Departments response from alternate endpoint:', response)),
          catchError(error2 => {
            console.error('Error fetching departments from alternate endpoint:', error2);
            return throwError(() => error2);
          })
        );
      })
    );
  }

  // Subjects operations
  getAllSubjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.subjectsApiUrl}`);
  }

  getAvailableSubjectsForClass(classId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.subjectsApiUrl}/available-for-class/${classId}`);
  }

  assignSubjectToClass(classId: string, subjectId: string, teacherId?: string, description?: string): Observable<Program> {
    let params = new HttpParams()
      .set('classId', classId)
      .set('subjectId', subjectId);

    if (teacherId) {
      params = params.set('teacherId', teacherId);
    }
    
    const payload = description ? { description } : {};
    
    return this.http.post<Program>(`${this.apiUrl}/${classId}/assign-subject/${subjectId}`, payload, { params });
  }

  removeSubjectFromClass(classId: string, subjectId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${classId}/remove-subject/${subjectId}`);
  }

  getProgramsByClassId(classId: string): Observable<Program[]> {
    return this.http.get<Program[]>(`${this.programsApiUrl}/by-class/${classId}`);
  }
  
  // Programs management
  getAllPrograms(): Observable<any> {
    console.log('Fetching all programs');
    return this.http.get<any>(`${this.programsApiUrl}`).pipe(
      tap(response => console.log('Programs response:', response)),
      catchError(error => {
        console.error('Error fetching programs:', error);
        return throwError(() => error);
      })
    );
  }
}