// src/app/models/program.model.ts
import { Class } from './class.model';
import { Subject } from './subject.model';

/**
 * Represents a Program entity in the school management system
 */
export interface Program {
  /**
   * Unique identifier for the program, UUID format
   */
  id: string;
  
  /**
   * Classes associated with this program
   */
  classes?: Class[];
  
  /**
   * Subjects associated with this program
   */
  subjects?: Subject[];
  
  /**
   * Description of the program
   */
  description: string;
  
  /**
   * Optional creation date of the program
   */
  createdDate?: Date;
  
  /**
   * Optional last modified date of the program
   */
  lastModifiedDate?: Date;
}

/**
 * Request object for creating or updating a program
 */
export interface ProgramRequest {
  /**
   * Unique identifier for the program (only for updates)
   */
  id?: string;
  
  /**
   * Description of the program
   */
  description: string;
}

/**
 * Program statistics for a specific class
 */
export interface ClassProgramStatistics {
  className: string;
  programId?: string;
  programDescription?: string;
  otherClassesInProgram?: number;
  subjects?: string[];
  programAssigned?: boolean;
}

/**
 * Program statistics for a specific subject
 */
export interface SubjectProgramStatistics {
  subjectName: string;
  programId?: string;
  programDescription?: string;
  otherSubjectsInProgram?: number;
  classes?: string[];
  programAssigned?: boolean;
}