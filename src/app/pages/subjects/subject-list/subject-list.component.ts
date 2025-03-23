// src/app/pages/subjects/subject-list/subject-list.component.ts
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

import { Subject } from '../../../models/subject.model';
import { SubjectService } from '../../../services/subject.service';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog.component';
import { SubjectFormComponent } from '../subject-form/subject-form.component';

@Component({
  selector: 'app-subject-list',
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
  templateUrl: './subject-list.component.html',
  styleUrls: ['./subject-list.component.scss']
})
export class SubjectListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'code', 'credits', 'programCount', 'actions'];
  dataSource: MatTableDataSource<Subject> = new MatTableDataSource<Subject>([]);
  searchControl = new FormControl('');
  isLoading = true;
  error: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private subjectService: SubjectService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSubjects();

    // Filter on search text change
    this.searchControl.valueChanges.subscribe(value => {
      this.applyFilter(value || '');
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadSubjects(): void {
    this.isLoading = true;
    this.error = null;

    this.subjectService.getAllSubjects().subscribe({
      next: (subjects) => {
        this.dataSource.data = subjects;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load subjects. Please try again.';
        this.isLoading = false;
        console.error('Error loading subjects:', error);
      }
    });
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openAddSubjectDialog(): void {
    const dialogRef = this.dialog.open(SubjectFormComponent, {
      width: '500px',
      data: { title: 'Add Subject', subject: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.subjectService.createSubject(result).subscribe({
          next: (newSubject) => {
            this.dataSource.data = [...this.dataSource.data, newSubject];
            this.snackBar.open('Subject added successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            this.snackBar.open('Failed to add subject', 'Close', { duration: 3000 });
            console.error('Error adding subject:', error);
          }
        });
      }
    });
  }

  openEditSubjectDialog(subject: Subject): void {
    const dialogRef = this.dialog.open(SubjectFormComponent, {
      width: '500px',
      data: { title: 'Edit Subject', subject: { ...subject } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.subjectService.updateSubject(result).subscribe({
          next: (updatedSubject) => {
            const index = this.dataSource.data.findIndex(s => s.id === updatedSubject.id);
            if (index !== -1) {
              const updatedData = [...this.dataSource.data];
              updatedData[index] = updatedSubject;
              this.dataSource.data = updatedData;
            }
            this.snackBar.open('Subject updated successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            this.snackBar.open('Failed to update subject', 'Close', { duration: 3000 });
            console.error('Error updating subject:', error);
          }
        });
      }
    });
  }

  deleteSubject(subject: Subject): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Deletion',
        message: `Are you sure you want to delete the subject "${subject.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        icon: 'warning',
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.subjectService.deleteSubject(subject.id).subscribe({
          next: () => {
            this.dataSource.data = this.dataSource.data.filter(s => s.id !== subject.id);
            this.snackBar.open('Subject deleted successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            this.snackBar.open('Failed to delete subject', 'Close', { duration: 3000 });
            console.error('Error deleting subject:', error);
          }
        });
      }
    });
  }

  refreshList(): void {
    this.loadSubjects();
  }
}