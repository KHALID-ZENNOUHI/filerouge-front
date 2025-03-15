// src/app/features/levels/level-form/level-form.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Level } from '../../../models/level.model';
import { Department } from '../../../models/department.model';
import { LevelService } from '../../../services/level.service';

@Component({
  selector: 'app-level-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './level-form.component.html',
  styleUrls: ['./level-form.component.scss']
})
export class LevelFormComponent implements OnInit {
  levelForm!: FormGroup;
  dialogTitle: string;
  isEditMode: boolean;
  departments: Department[];
  nameExists = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<LevelFormComponent>,
    private levelService: LevelService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { 
      title: string, 
      level: Level | null,
      departments: Department[]
    }
  ) {
    this.dialogTitle = data.title || 'Level Form';
    this.isEditMode = !!data.level;
    this.departments = data.departments || [];
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.levelForm = this.fb.group({
      id: [this.data.level?.id || null],
      name: [this.data.level?.name || '', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      department: [this.data.level?.department || null, [
        Validators.required
      ]]
    });

    // Check for existing names when name changes
    this.levelForm.get('name')?.valueChanges.subscribe(name => {
      this.checkNameExists(name);
    });

    // Check for existing names when department changes
    this.levelForm.get('department')?.valueChanges.subscribe(() => {
      const name = this.levelForm.get('name')?.value;
      if (name) {
        this.checkNameExists(name);
      }
    });
  }

  checkNameExists(name: string): void {
    if (!name || name.trim().length < 2) return;
    
    const departmentId = this.levelForm.get('department')?.value?.id;
    if (!departmentId) return;
    
    // Skip check if we're in edit mode and the name hasn't changed
    if (this.isEditMode && this.data.level?.name === name && 
        this.data.level?.department.id === departmentId) {
      this.nameExists = false;
      return;
    }
    
    this.levelService.existsByNameAndDepartmentId(name, departmentId).subscribe({
      next: (exists) => {
        this.nameExists = exists;
        if (exists) {
          this.levelForm.get('name')?.setErrors({ 'nameExists': true });
        }
      }
    });
  }

  submit(): void {
    if (this.levelForm.invalid) {
      this.levelForm.markAllAsTouched();
      return;
    }

    const levelData: Level = {
      id: this.levelForm.get('id')?.value,
      name: this.levelForm.get('name')?.value,
      department: this.levelForm.get('department')?.value
    };

    this.dialogRef.close(levelData);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.levelForm.get(controlName);
    return !!control && control.hasError(errorName) && control.touched;
  }
}