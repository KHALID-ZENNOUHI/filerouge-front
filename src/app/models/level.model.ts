// src/app/features/levels/level.model.ts
import { Department } from './department.model';

/**
 * Represents a Level entity in the school management system
 */
export interface Level {
  /**
   * Unique identifier for the level, UUID format
   */
  id: string;
  
  /**
   * Name of the level
   */
  name: string;
  
  /**
   * Department that this level belongs to
   */
  department: Department;
  
  /**
   * Optional count of classes in this level
   */
  classCount?: number;
  
  /**
   * Optional creation date of the level
   */
  createdDate?: Date;
  
  /**
   * Optional last modified date of the level
   */
  lastModifiedDate?: Date;
}