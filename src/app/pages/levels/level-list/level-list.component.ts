// src/app/features/levels/level-list/level-list.component.ts
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
import { MatSelectModule } from '@angular/material/select';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { Level } from '../../../models/level.model';
import { Department } from '../../../models/department.model';
import { LevelService } from '../../../services/level.service';
import { DepartmentService } from '../../../services/department.service';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog.component';
import { LevelFormComponent } from '../level-form/level-form.component';

@Component({
  selector: 'app-level-list',
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
    MatSelectModule,
    ReactiveFormsModule
  ],
  templateUrl: './level-list.component.html',
  styleUrls: ['./level-list.component.scss']
})
export class LevelListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'department', 'classCount', 'actions'];
  dataSource: MatTableDataSource<Level> = new MatTableDataSource<Level>([]);
  searchControl = new FormControl('');
  departmentFilter = new FormControl('');
  departments: Department[] = [];
  isLoading = true;
  error: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private levelService: LevelService,
    private departmentService: DepartmentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
    this.loadLevels();

    // Apply filters when search text or department filter changes
    this.searchControl.valueChanges.subscribe(value => {
      this.applyFilters();
    });

    this.departmentFilter.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadDepartments(): void {
    this.departmentService.getAllDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
      }
    });
  }

  loadLevels(): void {
    this.isLoading = true;
    this.error = null;

    this.levelService.getAllLevels().subscribe({
      next: (levels) => {
        this.dataSource.data = levels;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load levels. Please try again.';
        this.isLoading = false;
        console.error('Error loading levels:', error);
      }
    });
  }

  applyFilters(): void {
    this.dataSource.filterPredicate = (data: Level, filter: string) => {
      const searchTerm = this.searchControl.value?.toLowerCase() || '';
      const departmentId = this.departmentFilter.value;
      
      const matchesSearch = data.name.toLowerCase().includes(searchTerm) ||
                          data.department.name.toLowerCase().includes(searchTerm);
      
      const matchesDepartment = !departmentId || data.department.id === departmentId;
      
      return matchesSearch && matchesDepartment;
    };
    
    // Apply the filter (value doesn't matter as we're using filterPredicate)
    this.dataSource.filter = 'filter-applied';

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openAddLevelDialog(): void {
    const dialogRef = this.dialog.open(LevelFormComponent, {
      width: '500px',
      data: { 
        title: 'Add Level', 
        level: null,
        departments: this.departments
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.levelService.createLevel(result).subscribe({
          next: (newLevel) => {
            this.dataSource.data = [...this.dataSource.data, newLevel];
            this.snackBar.open('Level added successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            this.snackBar.open('Failed to add level', 'Close', { duration: 3000 });
            console.error('Error adding level:', error);
          }
        });
      }
    });
  }

  openEditLevelDialog(level: Level): void {
    const dialogRef = this.dialog.open(LevelFormComponent, {
      width: '500px',
      data: { 
        title: 'Edit Level', 
        level: { ...level },
        departments: this.departments
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.levelService.updateLevel(result).subscribe({
          next: (updatedLevel) => {
            const index = this.dataSource.data.findIndex(l => l.id === updatedLevel.id);
            if (index !== -1) {
              const updatedData = [...this.dataSource.data];
              updatedData[index] = updatedLevel;
              this.dataSource.data = updatedData;
            }
            this.snackBar.open('Level updated successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            this.snackBar.open('Failed to update level', 'Close', { duration: 3000 });
            console.error('Error updating level:', error);
          }
        });
      }
    });
  }

  deleteLevel(level: Level): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Deletion',
        message: `Are you sure you want to delete the level "${level.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        icon: 'warning',
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.levelService.deleteLevel(level.id).subscribe({
          next: () => {
            this.dataSource.data = this.dataSource.data.filter(l => l.id !== level.id);
            this.snackBar.open('Level deleted successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            this.snackBar.open('Failed to delete level', 'Close', { duration: 3000 });
            console.error('Error deleting level:', error);
          }
        });
      }
    });
  }

  viewLevelDetails(level: Level): void {
    // Navigate to level details page
    // Handled by the router link in the template
  }

  refreshList(): void {
    this.loadLevels();
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.departmentFilter.setValue('');
  }
}