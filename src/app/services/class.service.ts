// src/app/services/class.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  constructor(private http: HttpClient) { }

  // Class CRUD operations
  getAllClasses(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getClassById(id: string): Observable<Class> {
    return this.http.get<Class>(`${this.apiUrl}/${id}`);
  }

  createClass(classRequest: ClassRequest): Observable<Class> {
    return this.http.post<Class>(this.apiUrl, classRequest);
  }

  updateClass(classRequest: ClassRequest): Observable<Class> {
    return this.http.put<Class>(`${this.apiUrl}/${classRequest.id}`, classRequest);
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

  getClassesByLevelId(levelId: string, page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/by-level/${levelId}/paged`, { params });
  }

  getClassesByDepartmentId(departmentId: string): Observable<Class[]> {
    return this.http.get<Class[]>(`${this.apiUrl}/by-department/${departmentId}`);
  }

  // Class statistics
  getClassStatistics(classId: string): Observable<ClassStatistics> {
    return this.http.get<ClassStatistics>(`${this.apiUrl}/${classId}/statistics`);
  }

  // Levels operations
  getAllLevels(): Observable<Level[]> {
    return this.http.get<Level[]>(`${this.levelsApiUrl}`);
  }

  getLevelsByDepartmentId(departmentId: string): Observable<Level[]> {
    return this.http.get<Level[]>(`${this.levelsApiUrl}/by-department/${departmentId}`);
  }

  // Departments operations
  getAllDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.departmentsApiUrl}`);
  }

  // Programs (subjects assigned to a class) operations
  getProgramsByClassId(classId: string): Observable<Program[]> {
    return this.http.get<Program[]>(`${this.programsApiUrl}/by-class/${classId}`);
  }

  assignSubjectToClass(classId: string, subjectId: string, description?: string): Observable<Program> {
    const params = new HttpParams()
      .set('classId', classId)
      .set('subjectId', subjectId);

    if (description) {
      params.set('description', description);
    }

    return this.http.post<Program>(`${this.programsApiUrl}/assign-subject`, null, { params });
  }

  removeSubjectFromClass(classId: string, subjectId: string): Observable<void> {
    const params = new HttpParams()
      .set('classId', classId)
      .set('subjectId', subjectId);

    return this.http.delete<void>(`${this.programsApiUrl}/remove-subject`, { params });
  }
}