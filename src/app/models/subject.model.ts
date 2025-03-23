// src/app/models/subject.model.ts
/**
 * Represents a Subject entity in the school management system
 */
export interface Subject {
  /**
   * Unique identifier for the subject, UUID format
   */
  id: string;
  
  /**
   * Name of the subject
   */
  name: string;
  
  /**
   * Optional description for the subject
   */
  description?: string;
  
  /**
   * Optional code for the subject (e.g., MATH101)
   */
  code?: string;
  
  /**
   * Credits for the subject (if applicable)
   */
  credits?: number;
  
  /**
   * Optional count of programs using this subject
   */
  programCount?: number;
  
  /**
   * Optional creation date of the subject
   */
  createdDate?: Date;
  
  /**
   * Optional last modified date of the subject
   */
  lastModifiedDate?: Date;
}

/**
 * Request object for creating or updating a subject
 */
export interface SubjectRequest {
  /**
   * Unique identifier for the subject (only for updates)
   */
  id?: string;
  
  /**
   * Name of the subject
   */
  name: string;
  
  /**
   * Optional description for the subject
   */
  description?: string;
  
  /**
   * Optional code for the subject (e.g., MATH101)
   */
  code?: string;
  
  /**
   * Credits for the subject (if applicable)
   */
  credits?: number;
}