// src/app/pages/classes/class-form/class-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClassService } from '../../../services/class.service';
import { Department, Level, ClassRequest, Program } from '../../../models/class.model';

// Define a type for the paginated response
interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

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
  programs: any[] = [];
  
  loading = false;
  departmentsLoading = false;
  levelsLoading = false;
  programsLoading = false;
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
      levelId: ['', Validators.required],
      programId: [''] // Optional
    });
  }

  ngOnInit(): void {
    this.loadDepartments();
    this.loadPrograms();
    
    // Check if we're in edit mode
    this.classId = this.route.snapshot.paramMap.get('id') || undefined;
    this.isEditMode = !!this.classId && this.classId !== 'create' && this.classId !== 'new';
    
    if (this.isEditMode && this.classId) {
      this.loadClassData(this.classId);
    }
  }

  loadDepartments(): void {
    this.departmentsLoading = true;
    console.log('Loading departments...');
    
    this.classService.getAllDepartments()
      .subscribe({
        next: (response: Department[] | PaginatedResponse<Department>) => {
          console.log('Departments response:', response);
          
          // Handle both direct array and paginated response
          if (Array.isArray(response)) {
            this.departments = response;
          } else if (response && 'content' in response) {
            this.departments = response.content;
          } else {
            console.warn('Unexpected response format:', response);
            this.departments = [];
          }
          
          console.log('Parsed departments:', this.departments);
          this.departmentsLoading = false;
        },
        error: (err) => {
          console.error('Error loading departments:', err);
          this.error = 'Failed to load departments from the server. Please check your connection or try again later.';
          this.departmentsLoading = false;
        }
      });
  }

  loadPrograms(): void {
    this.programsLoading = true;
    console.log('Loading programs...');
    
    this.classService.getAllPrograms()
      .subscribe({
        next: (response: any) => {
          console.log('Programs response:', response);
          
          // Handle both direct array and paginated response
          if (Array.isArray(response)) {
            this.programs = response;
          } else if (response && 'content' in response) {
            this.programs = response.content;
          } else {
            console.warn('Unexpected response format:', response);
            this.programs = [];
          }
          
          console.log('Parsed programs:', this.programs);
          this.programsLoading = false;
        },
        error: (err) => {
          console.error('Error loading programs:', err);
          this.programsLoading = false;
        }
      });
  }

  loadLevelsByDepartment(departmentId: string): void {
    if (!departmentId) {
      this.levels = [];
      this.classForm.get('levelId')?.setValue('');
      return;
    }
    
    this.levelsLoading = true;
    console.log('Loading levels for department:', departmentId);
    
    this.classService.getLevelsByDepartmentId(departmentId)
      .subscribe({
        next: (response: Level[] | PaginatedResponse<Level>) => {
          console.log('Levels response:', response);
          
          // Handle both direct array and paginated response
          if (Array.isArray(response)) {
            this.levels = response;
          } else if (response && 'content' in response) {
            this.levels = response.content;
          } else {
            console.warn('Unexpected response format:', response);
            this.levels = [];
          }
          
          console.log('Parsed levels:', this.levels);
          
          // If we're not in edit mode or haven't loaded the class data yet, reset level
          if (!this.isEditMode || !this.classForm.get('levelId')?.value) {
            this.classForm.get('levelId')?.setValue('');
          }
          
          this.levelsLoading = false;
        },
        error: (err) => {
          console.error('Error loading levels:', err);
          this.error = 'Failed to load levels for the selected department. Please try a different department or try again later.';
          this.levels = [];
          this.levelsLoading = false;
        }
      });
  }

  onDepartmentChange(): void {
    const departmentId = this.classForm.get('departmentId')?.value;
    console.log('Department changed to:', departmentId);
    
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
          console.log('Class data loaded:', classData);
          
          // Load levels first so we can select the correct one
          if (classData.level?.department?.id) {
            // Set department value first
            this.classForm.patchValue({
              departmentId: classData.level.department.id
            });
            
            // Load levels for this department
            this.loadLevelsByDepartment(classData.level.department.id);
            
            // Extract program ID from the first program if it exists
            const programId = classData.programs && classData.programs.length > 0 
                             ? classData.programs[0].id 
                             : '';
            
            // Then set other form values (after a short delay to ensure levels are loaded)
            setTimeout(() => {
              this.classForm.patchValue({
                name: classData.name,
                levelId: classData.level.id,
                programId: programId
              });
            }, 300);
          } else {
            // Extract program ID from the first program if it exists
            const programId = classData.programs && classData.programs.length > 0 
                             ? classData.programs[0].id 
                             : '';
                             
            this.classForm.patchValue({
              name: classData.name,
              levelId: classData.level?.id || '',
              programId: programId
            });
          }
          
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading class data:', err);
          this.error = 'Failed to load class data. Please try again.';
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
    
    // Extract form values
    const formValues = this.classForm.value;
    console.log('Form values before submission:', formValues);
    
    // Check that we have a valid level ID
    const levelId = formValues.levelId;
    const name = formValues.name;
    const programId = formValues.programId;
    
    if (!levelId) {
      this.error = 'Please select a valid level';
      this.loading = false;
      return;
    }
    
    // Prepare the request object in the format expected by the backend
    const classRequest: ClassRequest = {
      name: name,
      level: {
        id: levelId
      }
    };
    
    // Add program if selected
    if (programId) {
      classRequest.program = {
        id: programId
      };
    }
    
    // Add ID if editing
    if (this.isEditMode && this.classId) {
      classRequest.id = this.classId;
    }
    
    console.log('Submitting class request:', JSON.stringify(classRequest, null, 2));
    
    if (this.isEditMode && this.classId) {
      this.classService.updateClass(classRequest)
        .subscribe({
          next: (result) => {
            console.log('Class updated successfully:', result);
            this.loading = false;
            this.successMessage = 'Class updated successfully!';
            setTimeout(() => {
              this.router.navigate(['/classes', result.id]);
            }, 1500);
          },
          error: (err) => {
            console.error('Error updating class:', err);
            this.loading = false;
            this.error = 'Failed to update class. Please try again.';
            
            // Log response details if available
            if (err.error) {
              console.error('Error response:', err.error);
            }
          }
        });
    } else {
      this.classService.createClass(classRequest)
        .subscribe({
          next: (result) => {
            console.log('Class created successfully, response:', result);
            this.loading = false;
            this.successMessage = 'Class created successfully!';
            setTimeout(() => {
              this.router.navigate(['/classes', result.id]);
            }, 1500);
          },
          error: (err) => {
            console.error('Error creating class:', err);
            this.loading = false;
            
            // Extract detailed error message if available
            const errorMessage = err.error?.message || 
                              err.error?.error || 
                              'Failed to create class. Please try again.';
            this.error = errorMessage;
            
            // Log response details if available
            if (err.error) {
              console.error('Error response details:', err.error);
            }
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