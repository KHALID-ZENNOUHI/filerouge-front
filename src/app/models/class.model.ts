// src/app/features/classes/class.model.ts
import { Level } from './level.model';

/**
 * Represents a Class entity in the school management system
 */
export interface Class {
  /**
   * Unique identifier for the class, UUID format
   */
  id: string;
  
  /**
   * Name of the class
   */
  name: string;
  
  /**
   * Level that this class belongs to
   */
  level: Level;
  
  /**
   * Optional count of students in this class
   */
  studentCount?: number;
  
  /**
   * Optional count of programs (subjects) in this class
   */
  programCount?: number;
  
  /**
   * Optional creation date of the class
   */
  createdDate?: Date;
  
  /**
   * Optional last modified date of the class
   */
  lastModifiedDate?: Date;
}