// src/app/pages/users/user-form/user-form.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

import { User } from '../../../models/user.model';
import { ClassService } from '../../../services/class.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatRadioModule,
    MatDividerModule,
    MatStepperModule,
    MatCheckboxModule
  ],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  dialogTitle: string;
  isEditMode: boolean;
  hidePassword = true;
  
  // Dropdown options
  roles = ['ADMINISTRATOR', 'TEACHER', 'STUDENT', 'PARENT'];
  genders = ['MALE', 'FEMALE'];
  
  // For students
  classes: any[] = [];
  parents: any[] = [];
  
  // Loading state
  loadingClasses = false;
  loadingParents = false;
  isFullInput = false;
  
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserFormComponent>,
    private snackBar: MatSnackBar,
    private classService: ClassService,
    private userService: UserService,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, user: User | null }
  ) {
    this.dialogTitle = data.title || 'User Form';
    this.isEditMode = !!data.user;
    
    console.log('UserFormComponent initialized', { 
      title: this.dialogTitle, 
      isEditMode: this.isEditMode,
      userData: this.data.user
    });
  }

  ngOnInit(): void {
    console.log('UserFormComponent ngOnInit');
    this.initForm();
    
    // Always preload classes and parents regardless of role
    this.loadClasses();
    this.loadParentsDirectly();
    
    // Watch for role changes to update field requirements
    this.userForm.get('role')?.valueChanges.subscribe(role => {
      console.log('Role changed to:', role);
      this.updateFormFieldsBasedOnRole(role);
    });
    
  }

  initForm(): void {
    console.log('Initializing form');
    
    // Extract classId and parentId from the complex objects if they exist
    const classId = this.data.user?.class?.id || this.data.user?.classId || null;
    const parentId = this.data.user?.parent?.id || this.data.user?.parentId || null;

    this.userForm = this.fb.group({
      id: [this.data.user?.id || null],
      username: [this.data.user?.username || '', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)
      ]],
      firstName: [this.data.user?.firstName || '', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      lastName: [this.data.user?.lastName || '', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      email: [this.data.user?.email || '', [
        Validators.required,
        Validators.email
      ]],
      // Only require password for new users
      password: [this.isEditMode ? '' : '', this.isEditMode ? [] : [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/.*[A-Z].*/), // At least one uppercase
        Validators.pattern(/.*[a-z].*/), // At least one lowercase
        Validators.pattern(/.*\d.*/)     // At least one digit
      ]],
      cin: [this.data.user?.cin || '', [
        Validators.required,
        Validators.pattern(/^[A-Za-z]{2}\d{6}$/) // 2 letters followed by 6 digits
      ]],
      phone: [this.data.user?.phone || '', [
        Validators.required,
        Validators.pattern(/^(06|07|05)\d{8}$/) // Starts with 06, 07, or 05 followed by 8 digits
      ]],
      birthDate: [this.data.user?.birthDate || null],
      birthPlace: [this.data.user?.birthPlace || ''],
      address: [this.data.user?.address || ''],
      gender: [this.data.user?.gender || 'MALE'],
      photo: [this.data.user?.photo || ''],
      role: [this.data.user?.role || 'STUDENT', Validators.required],
      
      // Student-specific fields
      classId: [classId],
      parentId: [parentId],
      
      // Status fields (only for edit mode)
      enabled: [this.data.user?.enabled !== undefined ? this.data.user.enabled : true],
      locked: [this.data.user?.locked || false]
      
    });
    
    // Update form fields based on initial role
    if (this.data.user?.role) {
      this.updateFormFieldsBasedOnRole(this.data.user.role);
    } else {
      // Default role is STUDENT, so set validators
      this.updateFormFieldsBasedOnRole('STUDENT');
    }
    if(this.userForm.value !== null && this.userForm.value !== undefined && this.userForm.valid) {
      this.isFullInput = true;
    }
  }

  updateFormFieldsBasedOnRole(role: string): void {
    console.log(`Updating form fields based on role: ${role}`);
    const classIdControl = this.userForm.get('classId');
    const parentIdControl = this.userForm.get('parentId');
    
    if (role === 'STUDENT') {
      classIdControl?.setValidators(Validators.required);
      parentIdControl?.setValidators(Validators.required);
    } else {
      classIdControl?.clearValidators();
      parentIdControl?.clearValidators();
      
      // Reset values
      classIdControl?.setValue(null);
      parentIdControl?.setValue(null);
    }
    
    classIdControl?.updateValueAndValidity();
    parentIdControl?.updateValueAndValidity();
  }

  loadClasses(): void {
    console.log('Loading classes...');
    this.loadingClasses = true;
    this.classes = []; // Reset classes array
    
    this.classService.getAllClasses().subscribe({
      next: (response) => {
        console.log('Raw class response:', response);
        
        // Properly handle paginated response
        if (response && response.content && Array.isArray(response.content)) {
          // It's a paginated response
          this.classes = response.content;
          console.log('Extracted classes from paginated response:', this.classes);
        } else if (Array.isArray(response)) {
          // It's a direct array
          this.classes = response;
          console.log('Using classes array directly:', this.classes);
        } else {
          console.error('Unexpected response format from classes API:', response);
        }
        
        this.loadingClasses = false;
      },
      error: (error) => {
        console.error('Error loading classes:', error);
        this.loadingClasses = false;
        this.snackBar.open('Error loading classes. Please try again.', 'Close', {
          duration: 3000
        });
      }
    });
  }

  // Using a different approach to load parents since the by-role endpoint has issues
  loadParentsDirectly(): void {
    console.log('Loading parents directly...');
    this.loadingParents = true;
    this.parents = []; // Reset parents array
    
    // Use the base users endpoint and filter for parents on the client side
    this.http.get<any>(`${environment.apiUrl}/admin/users`).subscribe({
      next: (response) => {
        console.log('Raw users response:', response);
        
        let allUsers = [];
        
        // Handle paginated response
        if (response && response.content && Array.isArray(response.content)) {
          allUsers = response.content;
          console.log('Extracted users from paginated response:', allUsers);
        } else if (Array.isArray(response)) {
          allUsers = response;
          console.log('Using users array directly:', allUsers);
        } else {
          console.error('Unexpected response format from users API:', response);
          this.loadingParents = false;
          return;
        }
        
        // Filter for parents only
        this.parents = allUsers.filter((user: any) => user.role === 'PARENT');
        console.log('Filtered parent users:', this.parents);
        
        this.loadingParents = false;
      },
      error: (error) => {
        console.error('Error loading parents:', error);
        this.loadingParents = false;
        this.snackBar.open('Error loading parents. Please try again.', 'Close', {
          duration: 3000
        });
      }
    });
  }

  submit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      
      // Show error message
      this.snackBar.open('Please fix the validation errors before submitting', 'OK', {
        duration: 3000,
        panelClass: 'error-snackbar'
      });
      return;
    }
    
    // Prepare the request object
    const userData = this.userForm.value;
    
    // Remove empty password if editing
    if (this.isEditMode && !userData.password) {
      delete userData.password;
    }
    
    // Remove student-specific fields if not a student
    if (userData.role !== 'STUDENT') {
      delete userData.classId;
      delete userData.parentId;
    }
    
    this.dialogRef.close(userData);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.userForm.get(controlName);
    return !!control && control.hasError(errorName) && control.touched;
  }


  checkFullInput(): void {
    if(this.userForm.value !== null && this.userForm.value !== undefined && this.userForm.valid) {
      this.isFullInput = true;
    }
  }
}