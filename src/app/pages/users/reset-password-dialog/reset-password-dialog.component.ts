// src/app/pages/users/reset-password-dialog/reset-password-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-reset-password-dialog',
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
  template: `
    <h2 mat-dialog-title>Reset Password</h2>
    <form [formGroup]="passwordForm" (ngSubmit)="submit()">
      <mat-dialog-content>
        <p>Resetting password for user: <strong>{{ data.username }}</strong></p>
        
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>New Password</mat-label>
          <input matInput formControlName="newPassword" [type]="hidePassword ? 'password' : 'text'">
          <mat-icon matPrefix>lock</mat-icon>
          <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
            <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
          </button>
          <mat-error *ngIf="hasError('newPassword', 'required')">
            New password is required
          </mat-error>
          <mat-error *ngIf="hasError('newPassword', 'minlength')">
            New password must be at least 8 characters
          </mat-error>
          <mat-error *ngIf="hasError('newPassword', 'pattern')">
            Password must contain at least one uppercase letter, one lowercase letter, and one digit
          </mat-error>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Confirm Password</mat-label>
          <input matInput formControlName="confirmPassword" [type]="hidePassword ? 'password' : 'text'">
          <mat-icon matPrefix>lock_outline</mat-icon>
          <mat-error *ngIf="hasError('confirmPassword', 'required')">
            Please confirm your password
          </mat-error>
          <mat-error *ngIf="hasError('confirmPassword', 'matching')">
            Passwords do not match
          </mat-error>
        </mat-form-field>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="cancel()">Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="passwordForm.invalid">
          Reset Password
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    
    p {
      margin-bottom: 16px;
    }
  `]
})
export class ResetPasswordDialogComponent {
  passwordForm: FormGroup;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ResetPasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userId: string, username: string }
  ) {
    this.passwordForm = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/.*[A-Z].*/), // At least one uppercase
        Validators.pattern(/.*[a-z].*/), // At least one lowercase
        Validators.pattern(/.*\d.*/)     // At least one digit
      ]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    const newPassword = g.get('newPassword')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    
    if (newPassword !== confirmPassword) {
      g.get('confirmPassword')?.setErrors({ matching: true });
      return { matching: true };
    }
    
    return null;
  }

  submit(): void {
    if (this.passwordForm.invalid) {
      return;
    }
    
    this.dialogRef.close({
      newPassword: this.passwordForm.value.newPassword,
      confirmPassword: this.passwordForm.value.confirmPassword
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.passwordForm.get(controlName);
    return !!control && control.hasError(errorName) && control.touched;
  }
}