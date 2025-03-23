// src/app/pages/programs/program-list/program-list.component.ts
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

import { Program } from '../../../models/program.model';
import { ProgramService } from '../../../services/program.service';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog.component';
import { ProgramFormComponent } from '../program-form/program-form.component';

@Component({
  selector: 'app-program-list',
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
  templateUrl: './program-list.component.html',
  styleUrls: ['./program-list.component.scss']
})
export class ProgramListComponent implements OnInit {
  displayedColumns: string[] = ['description', 'classCount', 'subjectCount', 'actions'];
  dataSource: MatTableDataSource<Program> = new MatTableDataSource<Program>([]);
  searchControl = new FormControl('');
  isLoading = true;
  error: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private programService: ProgramService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPrograms();

    // Filter on search text change
    this.searchControl.valueChanges.subscribe(value => {
      this.applyFilter(value || '');
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadPrograms(): void {
    this.isLoading = true;
    this.error = null;

    this.programService.getAllPrograms().subscribe({
      next: (programs) => {
        // Process the data to add class and subject counts
        const processedPrograms = programs.map(program => ({
          ...program,
          classCount: program.classes?.length || 0,
          subjectCount: program.subjects?.length || 0
        }));
        
        this.dataSource.data = processedPrograms;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load programs. Please try again.';
        this.isLoading = false;
        console.error('Error loading programs:', error);
      }
    });
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openAddProgramDialog(): void {
    const dialogRef = this.dialog.open(ProgramFormComponent, {
      width: '500px',
      data: { title: 'Add Program', program: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.programService.createProgram(result).subscribe({
          next: (newProgram) => {
            // Add class and subject counts for display
            const programWithCounts = {
              ...newProgram,
              classCount: newProgram.classes?.length || 0,
              subjectCount: newProgram.subjects?.length || 0
            };
            
            this.dataSource.data = [...this.dataSource.data, programWithCounts];
            this.snackBar.open('Program added successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            this.snackBar.open('Failed to add program', 'Close', { duration: 3000 });
            console.error('Error adding program:', error);
          }
        });
      }
    });
  }

  openEditProgramDialog(program: Program): void {
    const dialogRef = this.dialog.open(ProgramFormComponent, {
      width: '500px',
      data: { 
        title: 'Edit Program', 
        program: { 
          id: program.id,
          description: program.description
        } 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.programService.updateProgram(result).subscribe({
          next: (updatedProgram) => {
            // Add class and subject counts for display
            const programWithCounts = {
              ...updatedProgram,
              classCount: updatedProgram.classes?.length || 0,
              subjectCount: updatedProgram.subjects?.length || 0
            };
            
            const index = this.dataSource.data.findIndex(p => p.id === updatedProgram.id);
            if (index !== -1) {
              const updatedData = [...this.dataSource.data];
              updatedData[index] = programWithCounts;
              this.dataSource.data = updatedData;
            }
            
            this.snackBar.open('Program updated successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            this.snackBar.open('Failed to update program', 'Close', { duration: 3000 });
            console.error('Error updating program:', error);
          }
        });
      }
    });
  }

  deleteProgram(program: Program): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Deletion',
        message: `Are you sure you want to delete this program? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        icon: 'warning',
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.programService.deleteProgram(program.id).subscribe({
          next: () => {
            this.dataSource.data = this.dataSource.data.filter(p => p.id !== program.id);
            this.snackBar.open('Program deleted successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            this.snackBar.open('Failed to delete program', 'Close', { duration: 3000 });
            console.error('Error deleting program:', error);
          }
        });
      }
    });
  }

  refreshList(): void {
    this.loadPrograms();
  }
}