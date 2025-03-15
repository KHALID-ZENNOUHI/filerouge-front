// src/app/features/departments/department-form/department-form.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Department } from '../../../models/department.model';

@Component({
  selector: 'app-department-form',
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
  templateUrl: './department-form.component.html',
  styleUrls: ['./department-form.component.scss']
})
export class DepartmentFormComponent implements OnInit {
  departmentForm!: FormGroup;
  dialogTitle: string;
  isEditMode: boolean;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DepartmentFormComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, department: Department | null }
  ) {
    this.dialogTitle = data.title || 'Department Form';
    this.isEditMode = !!data.department;
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.departmentForm = this.fb.group({
      id: [this.data.department?.id || null],
      name: [this.data.department?.name || '', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]]
    });
  }

  submit(): void {
    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
      return;
    }

    const departmentData: Department = this.departmentForm.value;
    this.dialogRef.close(departmentData);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  get nameControl() {
    return this.departmentForm.get('name');
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.departmentForm.get(controlName);
    return !!control && control.hasError(errorName) && control.touched;
  }
}