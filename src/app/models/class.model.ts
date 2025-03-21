// src/app/models/class.model.ts
export interface Class {
  id: string;
  name: string;
  level?: Level;
  programs?: Program[];
}

export interface Level {
  id: string;
  name: string;
  department?: Department;
}

export interface Department {
  id: string;
  name: string;
}

export interface Program {
  id: string;
  subject: Subject;
  description?: string;
}

export interface Subject {
  id: string;
  name: string;
}

// Filter/Search criteria
export interface ClassFilter {
  name?: string;
  levelId?: string;
  departmentId?: string;
}

// For class creation/update
export interface ClassRequest {
  id?: string;
  name: string;
  levelId: string;
}

// Class statistics interface
export interface ClassStatistics {
  className: string;
  levelName?: string;
  departmentName?: string;
  totalStudents: number;
  totalSubjects: number;
  studentsByGender?: Record<string, number>;
}