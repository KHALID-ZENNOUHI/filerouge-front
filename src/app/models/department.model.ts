// src/app/features/departments/department.model.ts
/**
 * Represents a Department entity in the school management system
 */
export interface Department {
    /**
     * Unique identifier for the department, UUID format
     */
    id: string;
    
    /**
     * Name of the department
     */
    name: string;
    
    /**
     * Optional count of levels in this department
     */
    levelCount?: number;
    
    /**
     * Optional count of classes in this department
     */
    classCount?: number;
    
    /**
     * Optional creation date of the department
     */
    createdDate?: Date;
    
    /**
     * Optional last modified date of the department
     */
    lastModifiedDate?: Date;
  }