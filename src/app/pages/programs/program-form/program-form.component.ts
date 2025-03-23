// src/app/pages/programs/program-form/program-form.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Program } from '../../../models/program.model';
import { Class } from '../../../models/class.model';
import { Subject } from '../../../models/subject.model';
import { ProgramService } from '../../../services/program.service';
import { ClassService } from '../../../services/class.service';
import { SubjectService } from '../../../services/subject.service';

@Component({
  selector: 'app-program-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './program-form.component.html',
  styleUrls: ['./program-form.component.scss']
})
export class ProgramFormComponent implements OnInit {
  programForm!: FormGroup;
  dialogTitle: string;
  isEditMode: boolean;
  classes: Class[] = [];
  subjects: Subject[] = [];
  selectedClasses: Class[] = [];
  selectedSubjects: Subject[] = [];
  isLoading = false;
  loadingClasses = false;
  loadingSubjects = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProgramFormComponent>,
    private programService: ProgramService,
    private classService: ClassService,
    private subjectService: SubjectService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, program: Program | null }
  ) {
    this.dialogTitle = data.title || 'Program Form';
    this.isEditMode = !!data.program;
  }

  ngOnInit(): void {
    this.initForm();
    
    // Load available classes and subjects if not in edit mode
    if (!this.isEditMode) {
      this.loadClasses();
      this.loadSubjects();
    }
  }

  initForm(): void {
    this.programForm = this.fb.group({
      id: [this.data.program?.id || null],
      description: [this.data.program?.description || '', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(500)
      ]]
    });
  }

  loadClasses(): void {
    this.loadingClasses = true;
    
    this.classService.getAllClasses().subscribe({
      next: (classes) => {
        // Handle different response formats
        if (Array.isArray(classes)) {
          this.classes = classes;
        } else if (classes && typeof classes === 'object' && 'content' in classes) {
          this.classes = classes.content;
        } else {
          this.classes = [];
        }
        this.loadingClasses = false;
      },
      error: (error) => {
        console.error('Error loading classes:', error);
        this.snackBar.open('Failed to load classes', 'Close', { duration: 3000 });
        this.loadingClasses = false;
        this.classes = [];
      }
    });
  }

  loadSubjects(): void {
    this.loadingSubjects = true;
    
    this.subjectService.getAllSubjects().subscribe({
      next: (subjects) => {
        this.subjects = subjects;
        this.loadingSubjects = false;
      },
      error: (error) => {
        console.error('Error loading subjects:', error);
        this.snackBar.open('Failed to load subjects', 'Close', { duration: 3000 });
        this.loadingSubjects = false;
        this.subjects = [];
      }
    });
  }

  toggleClass(classItem: Class): void {
    const index = this.selectedClasses.findIndex(c => c.id === classItem.id);
    if (index === -1) {
      this.selectedClasses.push(classItem);
    } else {
      this.selectedClasses.splice(index, 1);
    }
  }

  toggleSubject(subject: Subject): void {
    const index = this.selectedSubjects.findIndex(s => s.id === subject.id);
    if (index === -1) {
      this.selectedSubjects.push(subject);
    } else {
      this.selectedSubjects.splice(index, 1);
    }
  }

  isClassSelected(classItem: Class): boolean {
    return this.selectedClasses.some(c => c.id === classItem.id);
  }

  isSubjectSelected(subject: Subject): boolean {
    return this.selectedSubjects.some(s => s.id === subject.id);
  }

  submit(): void {
    if (this.programForm.invalid) {
      this.programForm.markAllAsTouched();
      return;
    }
    
    this.isLoading = true;
    
    // Prepare the program request
    const programData = {
      id: this.programForm.get('id')?.value,
      description: this.programForm.get('description')?.value
    };

    // In edit mode, just update the description
    if (this.isEditMode) {
      this.dialogRef.close(programData);
    } else {
      // In create mode, handle associations if classes or subjects are selected
      if (this.selectedClasses.length > 0 || this.selectedSubjects.length > 0) {
        const classIds = this.selectedClasses.map(c => c.id);
        const subjectIds = this.selectedSubjects.map(s => s.id);
        
        // Create with associations (handled separately in the parent component)
        this.dialogRef.close({
          ...programData,
          classIds,
          subjectIds
        });
      } else {
        // No associations, just create the program
        this.dialogRef.close(programData);
      }
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.programForm.get(controlName);
    return !!control && control.hasError(errorName) && control.touched;
  }
}