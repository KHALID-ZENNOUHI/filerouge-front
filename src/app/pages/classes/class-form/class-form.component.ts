// src/app/components/class/class-form/class-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClassService } from '../../../services/class.service';
import { Department, Level, ClassRequest } from '../../../models/class.model';

@Component({
  selector: 'app-class-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './class-form.component.html',
  styleUrls: ['./class-form.component.css']
})
export class ClassFormComponent implements OnInit {
  classForm: FormGroup;
  isEditMode = false;
  classId?: string;
  departments: Department[] = [];
  levels: Level[] = [];
  
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;
  
  constructor(
    private fb: FormBuilder,
    private classService: ClassService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.classForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      departmentId: ['', Validators.required],
      levelId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadDepartments();
    
    // Check if we're in edit mode
    this.classId = this.route.snapshot.paramMap.get('id') || undefined;
    this.isEditMode = !!this.classId;
    
    if (this.isEditMode && this.classId) {
      this.loadClassData(this.classId);
    }
  }

  loadDepartments(): void {
    this.classService.getAllDepartments()
      .subscribe({
        next: (departments) => {
          this.departments = departments;
        },
        error: (err) => {
          this.error = 'Failed to load departments. Please try again.';
          console.error('Error loading departments:', err);
        }
      });
  }

  loadLevelsByDepartment(departmentId: string): void {
    if (departmentId) {
      this.classService.getLevelsByDepartmentId(departmentId)
        .subscribe({
          next: (levels) => {
            this.levels = levels;
            // If we're not in edit mode or haven't loaded the class data yet, reset level
            if (!this.isEditMode || !this.classForm.get('levelId')?.value) {
              this.classForm.get('levelId')?.setValue('');
            }
          },
          error: (err) => {
            this.error = 'Failed to load levels. Please try again.';
            console.error('Error loading levels:', err);
          }
        });
    } else {
      this.levels = [];
      this.classForm.get('levelId')?.setValue('');
    }
  }

  onDepartmentChange(): void {
    const departmentId = this.classForm.get('departmentId')?.value;
    if (departmentId) {
      this.loadLevelsByDepartment(departmentId);
    } else {
      this.levels = [];
      this.classForm.get('levelId')?.setValue('');
    }
  }

  loadClassData(classId: string): void {
    this.loading = true;
    
    this.classService.getClassById(classId)
      .subscribe({
        next: (classData) => {
          // Load levels first so we can select the correct one
          if (classData.level?.department?.id) {
            this.loadLevelsByDepartment(classData.level.department.id);
            
            // Update form values
            this.classForm.patchValue({
              name: classData.name,
              departmentId: classData.level.department.id,
              levelId: classData.level.id
            });
          } else {
            this.classForm.patchValue({
              name: classData.name,
              levelId: classData.level?.id
            });
          }
          
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load class data. Please try again.';
          console.error('Error loading class:', err);
          this.loading = false;
        }
      });
  }

  onSubmit(): void {
    if (this.classForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      this.classForm.markAllAsTouched();
      return;
    }
    
    this.loading = true;
    this.error = null;
    this.successMessage = null;
    
    const classRequest: ClassRequest = {
      name: this.classForm.get('name')?.value,
      levelId: this.classForm.get('levelId')?.value
    };
    
    if (this.isEditMode && this.classId) {
      classRequest.id = this.classId;
      
      this.classService.updateClass(classRequest)
        .subscribe({
          next: (result) => {
            this.loading = false;
            this.successMessage = 'Class updated successfully!';
            setTimeout(() => {
              this.router.navigate(['/classes', result.id]);
            }, 1500);
          },
          error: (err) => {
            this.loading = false;
            this.error = 'Failed to update class. Please try again.';
            console.error('Error updating class:', err);
          }
        });
    } else {
      this.classService.createClass(classRequest)
        .subscribe({
          next: (result) => {
            this.loading = false;
            this.successMessage = 'Class created successfully!';
            setTimeout(() => {
              this.router.navigate(['/classes', result.id]);
            }, 1500);
          },
          error: (err) => {
            this.loading = false;
            this.error = 'Failed to create class. Please try again.';
            console.error('Error creating class:', err);
          }
        });
    }
  }

  // Helper methods for validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.classForm.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.classForm.get(fieldName);
    
    if (!field) return '';
    
    if (field.errors?.['required']) {
      return 'This field is required';
    }
    
    if (field.errors?.['maxlength']) {
      return `Maximum length is ${field.errors['maxlength'].requiredLength} characters`;
    }
    
    return 'Invalid value';
  }
}