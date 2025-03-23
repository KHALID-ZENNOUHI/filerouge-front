// src/app/pages/subjects/subject-form/subject-form.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Subject, SubjectRequest } from '../../../models/subject.model';
import { SubjectService } from '../../../services/subject.service';

@Component({
  selector: 'app-subject-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './subject-form.component.html',
  styleUrls: ['./subject-form.component.scss']
})
export class SubjectFormComponent implements OnInit {
  subjectForm!: FormGroup;
  dialogTitle: string;
  isEditMode: boolean;
  nameExists = false;
  codeExists = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SubjectFormComponent>,
    private subjectService: SubjectService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, subject: Subject | null }
  ) {
    this.dialogTitle = data.title || 'Subject Form';
    this.isEditMode = !!data.subject;
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.subjectForm = this.fb.group({
      id: [this.data.subject?.id || null],
      name: [this.data.subject?.name || '', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      code: [this.data.subject?.code || '', [
        Validators.maxLength(20)
      ]],
      description: [this.data.subject?.description || '', [
        Validators.maxLength(500)
      ]],
      credits: [this.data.subject?.credits || null, [
        Validators.min(0),
        Validators.max(20)
      ]]
    });

    // Check for existing names when name changes
    this.subjectForm.get('name')?.valueChanges.subscribe(name => {
      this.checkNameExists(name);
    });

    // Check for existing codes when code changes
    this.subjectForm.get('code')?.valueChanges.subscribe(code => {
      if (code) {
        this.checkCodeExists(code);
      } else {
        this.codeExists = false;
      }
    });
  }

  checkNameExists(name: string): void {
    if (!name || name.trim().length < 2) return;
    
    // Skip check if we're in edit mode and the name hasn't changed
    if (this.isEditMode && this.data.subject?.name === name) {
      this.nameExists = false;
      return;
    }
    
    this.subjectService.existsByName(name).subscribe({
      next: (exists) => {
        this.nameExists = exists;
        if (exists) {
          this.subjectForm.get('name')?.setErrors({ 'nameExists': true });
        }
      }
    });
  }

  checkCodeExists(code: string): void {
    if (!code) return;
    
    // Skip check if we're in edit mode and the code hasn't changed
    if (this.isEditMode && this.data.subject?.code === code) {
      this.codeExists = false;
      return;
    }
    
    this.subjectService.existsByCode(code).subscribe({
      next: (exists) => {
        this.codeExists = exists;
        if (exists) {
          this.subjectForm.get('code')?.setErrors({ 'codeExists': true });
        }
      }
    });
  }

  submit(): void {
    if (this.subjectForm.invalid) {
      this.subjectForm.markAllAsTouched();
      return;
    }

    const subjectData: SubjectRequest = {
      id: this.subjectForm.get('id')?.value,
      name: this.subjectForm.get('name')?.value,
      code: this.subjectForm.get('code')?.value,
      description: this.subjectForm.get('description')?.value,
      credits: this.subjectForm.get('credits')?.value
    };

    this.dialogRef.close(subjectData);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.subjectForm.get(controlName);
    return !!control && control.hasError(errorName) && control.touched;
  }
}