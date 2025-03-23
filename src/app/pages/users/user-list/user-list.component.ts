// src/app/pages/users/user-list/user-list.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';

import { UserService } from '../../../services/user.service';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog.component';
import { UserFormComponent } from '../user-form/user-form.component';
import { ResetPasswordDialogComponent } from '../reset-password-dialog/reset-password-dialog.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatMenuModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatChipsModule,
    UserFormComponent,
    ResetPasswordDialogComponent
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  dataSource = new MatTableDataSource<any>([]);
  
  // Filter controls
  searchControl = new FormControl('');
  roleFilter = new FormControl('');
  
  // Role options for filter
  roles = ['ADMINISTRATOR', 'TEACHER', 'STUDENT', 'PARENT'];
  
  // Loading and error states
  isLoading = true;
  error: string | null = null;
  
  // Pagination
  totalItems = 0;
  pageSize = 20;
  pageIndex = 0;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    
    // Apply filters when search text or role filter changes
    this.searchControl.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    this.roleFilter.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadUsers(): void {
    this.isLoading = true;
    this.error = null;

    this.userService.getAllUsers().subscribe({
      next: (response: any) => {
        // Handle paginated response structure
        if (response && response.content) {
          this.dataSource.data = response.content;
          this.totalItems = response.totalElements;
          this.pageSize = response.size;
          this.pageIndex = response.number;
        } else if (Array.isArray(response)) {
          // Handle case where response is a direct array
          this.dataSource.data = response;
          this.totalItems = response.length;
        } else {
          console.error('Unexpected response format:', response);
          this.error = 'Received unexpected data format from the server';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load users. Please try again.';
        this.isLoading = false;
        console.error('Error loading users:', error);
      }
    });
  }

  applyFilters(): void {
    this.isLoading = true;
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    const roleFilter = this.roleFilter.value || '';
    
    // If both filters are empty, reset the filter
    if (!searchTerm && !roleFilter) {
      this.dataSource.filter = '';
      this.isLoading = false;
      return;
    }
    
    // If using API filtering (for larger datasets)
    if (roleFilter && !searchTerm) {
      // We can use the API endpoint for role filtering
      this.userService.getUsersByRole(roleFilter).subscribe({
        next: (response: any) => {
          if (response && response.content) {
            this.dataSource.data = response.content;
            this.totalItems = response.totalElements;
          } else if (Array.isArray(response)) {
            this.dataSource.data = response;
            this.totalItems = response.length;
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error filtering by role:', error);
          // Fall back to client-side filtering
          this.applyClientSideFiltering(searchTerm, roleFilter);
          this.isLoading = false;
        }
      });
      return;
    }
    
    // For other cases, use client-side filtering
    this.applyClientSideFiltering(searchTerm, roleFilter);
    this.isLoading = false;
  }
  
  applyClientSideFiltering(searchTerm: string, roleFilter: string): void {
    // Make a copy of the original data if we don't have it already
    const originalData = this.userService.cachedUsers || this.dataSource.data;
    
    // Apply filters to the data
    const filteredData = originalData.filter((user: any) => {
      // Check if it matches the search term
      const matchesSearch = !searchTerm || 
        (user.firstName?.toLowerCase().includes(searchTerm) || 
         user.lastName?.toLowerCase().includes(searchTerm) || 
         user.email?.toLowerCase().includes(searchTerm) || 
         user.username?.toLowerCase().includes(searchTerm));
      
      // Check if it matches the role filter
      const matchesRole = !roleFilter || user.role === roleFilter;
      
      // Return true only if both conditions are met
      return matchesSearch && matchesRole;
    });
    
    // Update the data source with filtered data
    this.dataSource.data = filteredData;
    this.totalItems = filteredData.length;
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.roleFilter.setValue('');
  }

  openAddUserDialog(): void {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '800px',
      data: { title: 'Add User', user: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.createUser(result).subscribe({
          next: () => {
            this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
            this.loadUsers();
          },
          error: (error) => {
            this.snackBar.open('Failed to create user: ' + (error.message || 'Unknown error'), 'Close', { duration: 5000 });
          }
        });
      }
    });
  }

  deleteUser(user: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Deletion',
        message: `Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        icon: 'delete',
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && user.id) {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
            this.loadUsers();
          },
          error: (error) => {
            this.snackBar.open('Failed to delete user: ' + (error.message || 'Unknown error'), 'Close', { duration: 5000 });
          }
        });
      }
    });
  }

  refreshList(): void {
    this.loadUsers();
  }

  openEditUserDialog(user: any): void {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '800px',
      data: { title: 'Edit User', user: {...user} }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.createUser(result).subscribe({
          next: () => {
            this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
            this.loadUsers();
          },
          error: (error) => {
            this.snackBar.open('Failed to update user: ' + (error.message || 'Unknown error'), 'Close', { duration: 5000 });
          }
        });
      }
    });
  }
  
  openResetPasswordDialog(user: any): void {
    const dialogRef = this.dialog.open(ResetPasswordDialogComponent, {
      width: '400px',
      data: { userId: user.id, username: user.username }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && user.id) {
        this.userService.resetUserPassword(user.id, result).subscribe({
          next: () => {
            this.snackBar.open('Password reset successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            this.snackBar.open('Failed to reset password: ' + (error.message || 'Unknown error'), 'Close', { duration: 5000 });
          }
        });
      }
    });
  }
  
  openStatusUpdateDialog(user: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: user.enabled ? 'Disable User' : 'Enable User',
        message: `Are you sure you want to ${user.enabled ? 'disable' : 'enable'} ${user.firstName} ${user.lastName}?`,
        confirmText: user.enabled ? 'Disable' : 'Enable',
        cancelText: 'Cancel',
        color: user.enabled ? 'warn' : 'primary'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && user.id) {
        const statusUpdate = {
          enabled: !user.enabled,
          locked: user.locked,
          reasonForChange: 'Status updated by administrator'
        };

        this.userService.updateUserStatus(user.id, statusUpdate).subscribe({
          next: () => {
            this.snackBar.open(`User ${statusUpdate.enabled ? 'enabled' : 'disabled'} successfully`, 'Close', { duration: 3000 });
            this.loadUsers();
          },
          error: (error) => {
            this.snackBar.open('Failed to update user status: ' + (error.message || 'Unknown error'), 'Close', { duration: 5000 });
          }
        });
      }
    });
  }

  getRoleClass(role: string): string {
    switch (role) {
      case 'ADMINISTRATOR': return 'admin-role';
      case 'TEACHER': return 'teacher-role';
      case 'STUDENT': return 'student-role';
      case 'PARENT': return 'parent-role';
      default: return '';
    }
  }
}