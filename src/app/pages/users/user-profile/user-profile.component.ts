// src/app/pages/users/user-profile/user-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { User, UserRole } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog.component';
import { UserFormComponent } from '../user-form/user-form.component';
import { ResetPasswordDialogComponent } from '../reset-password-dialog/reset-password-dialog.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  userId!: string;
  user: User | null = null;
  isLoading = true;
  error: string | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigate(['/users']);
      return;
    }
    
    this.userId = idParam;
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.error = null;
    
    this.userService.getUserById(this.userId).subscribe({
      next: (user: User) => {
        this.user = user;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.error = error.message || 'Failed to load user profile. Please try again.';
        this.isLoading = false;
        console.error('Error loading user profile:', error);
      }
    });
  }

  openEditUserDialog(): void {
    if (!this.user) return;
    
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '800px',
      data: { title: 'Edit User', user: {...this.user} }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.createUser(result).subscribe({
          next: () => {
            this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
            this.loadUserProfile();
          },
          error: (error: any) => {
            this.snackBar.open('Failed to update user: ' + (error.message || 'Unknown error'), 'Close', { duration: 5000 });
          }
        });
      }
    });
  }

  openResetPasswordDialog(): void {
    if (!this.user) return;
    
    const dialogRef = this.dialog.open(ResetPasswordDialogComponent, {
      width: '400px',
      data: { userId: this.user.id, username: this.user.username }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.user?.id) {
        this.userService.resetUserPassword(this.user.id, result).subscribe({
          next: () => {
            this.snackBar.open('Password reset successfully', 'Close', { duration: 3000 });
          },
          error: (error: any) => {
            this.snackBar.open('Failed to reset password: ' + (error.message || 'Unknown error'), 'Close', { duration: 5000 });
          }
        });
      }
    });
  }

  toggleUserStatus(): void {
    if (!this.user) return;
    
    const action = this.user.enabled ? 'disable' : 'enable';
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
        message: `Are you sure you want to ${action} this user?`,
        confirmText: action.charAt(0).toUpperCase() + action.slice(1),
        cancelText: 'Cancel',
        color: this.user.enabled ? 'warn' : 'primary'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.user?.id) {
        const statusUpdate = {
          enabled: !this.user.enabled,
          locked: this.user.locked,
          reasonForChange: `User ${action}d by administrator`
        };

        this.userService.updateUserStatus(this.user.id, statusUpdate).subscribe({
          next: () => {
            this.snackBar.open(`User ${action}d successfully`, 'Close', { duration: 3000 });
            this.loadUserProfile();
          },
          error: (error: any) => {
            this.snackBar.open('Failed to update user status: ' + (error.message || 'Unknown error'), 'Close', { duration: 5000 });
          }
        });
      }
    });
  }

  deleteUser(): void {
    if (!this.user) return;
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Deletion',
        message: `Are you sure you want to delete ${this.user.firstName} ${this.user.lastName}? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        icon: 'delete',
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.user?.id) {
        this.userService.deleteUser(this.user.id).subscribe({
          next: () => {
            this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/users']);
          },
          error: (error: any) => {
            this.snackBar.open('Failed to delete user: ' + (error.message || 'Unknown error'), 'Close', { duration: 5000 });
          }
        });
      }
    });
  }
  
  getFormattedDate(date: Date | string | undefined | null): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }
  
  getRoleClass(role: UserRole): string {
    switch (role) {
      case UserRole.ADMINISTRATOR: return 'admin-role';
      case UserRole.TEACHER: return 'teacher-role';
      case UserRole.STUDENT: return 'student-role';
      case UserRole.PARENT: return 'parent-role';
      default: return '';
    }
  }
}