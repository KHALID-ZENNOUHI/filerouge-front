// src/app/features/departments/department-list/department-list.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
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
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { Department } from '../../../models/department.model';
import { DepartmentService } from '../../../services/department.service';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog.component';
import { DepartmentFormComponent } from '../department-form/department-form.component';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
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
    ReactiveFormsModule
  ],
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.scss']
})
export class DepartmentListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'levels', 'classes', 'actions'];
  dataSource: MatTableDataSource<Department> = new MatTableDataSource<Department>([]);
  searchControl = new FormControl('');
  isLoading = true;
  error: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private departmentService: DepartmentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDepartments();

    // Filter on search text change
    this.searchControl.valueChanges.subscribe(value => {
      this.applyFilter(value || '');
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadDepartments(): void {
    this.isLoading = true;
    this.error = null;

    this.departmentService.getAllDepartments().subscribe({
      next: (departments) => {
        this.dataSource.data = departments;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load departments. Please try again.';
        this.isLoading = false;
        console.error('Error loading departments:', error);
      }
    });
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openAddDepartmentDialog(): void {
    const dialogRef = this.dialog.open(DepartmentFormComponent, {
      width: '500px',
      data: { title: 'Add Department', department: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.departmentService.createDepartment(result).subscribe({
          next: (newDepartment) => {
            this.dataSource.data = [...this.dataSource.data, newDepartment];
            this.snackBar.open('Department added successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            this.snackBar.open('Failed to add department', 'Close', { duration: 3000 });
            console.error('Error adding department:', error);
          }
        });
      }
    });
  }

  openEditDepartmentDialog(department: Department): void {
    const dialogRef = this.dialog.open(DepartmentFormComponent, {
      width: '500px',
      data: { title: 'Edit Department', department: { ...department } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.departmentService.updateDepartment(result).subscribe({
          next: (updatedDepartment) => {
            const index = this.dataSource.data.findIndex(d => d.id === updatedDepartment.id);
            if (index !== -1) {
              const updatedData = [...this.dataSource.data];
              updatedData[index] = updatedDepartment;
              this.dataSource.data = updatedData;
            }
            this.snackBar.open('Department updated successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            this.snackBar.open('Failed to update department', 'Close', { duration: 3000 });
            console.error('Error updating department:', error);
          }
        });
      }
    });
  }

  deleteDepartment(department: Department): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Deletion',
        message: `Are you sure you want to delete the department "${department.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.departmentService.deleteDepartment(department.id).subscribe({
          next: () => {
            this.dataSource.data = this.dataSource.data.filter(d => d.id !== department.id);
            this.snackBar.open('Department deleted successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            this.snackBar.open('Failed to delete department', 'Close', { duration: 3000 });
            console.error('Error deleting department:', error);
          }
        });
      }
    });
  }

  viewDepartmentDetails(department: Department): void {
    // Navigate to department details page
    // Handled by the router link in the template
  }

  refreshList(): void {
    this.loadDepartments();
  }
}