// src/app/models/class.model.ts
export interface Class {
  id: string;
  name: string;
  level: Level;
  students?: Student[];
  programs?: Program[];
  createdDate?: Date;
  lastModifiedDate?: Date;
}

export interface Level {
  id: string;
  name: string;
  department: Department;
}

export interface Department {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  photo?: string;
  phone?: string;
}

export interface Program {
  id: string;
  subject: Subject;
  description?: string;
  teacher?: Teacher;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  specialty?: string;
}

// Filter/Search criteria
export interface ClassFilter {
  name?: string;
  levelId?: string;
  departmentId?: string;
}

// For class creation/update
// For class creation/update
export interface ClassRequest {
  id?: string;
  name: string;
  level: {
    id: string;
  };
  program?: {
    id: string;
  };
}
// Class statistics interface
export interface ClassStatistics {
  className: string;
  levelName: string;
  departmentName: string;
  totalStudents: number;
  totalSubjects: number;
  studentsByGender: Record<string, number>;
}