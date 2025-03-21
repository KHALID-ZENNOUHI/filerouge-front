// src/app/components/class/class-list/class-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ClassService } from '../../../services/class.service';
import { Class, Department, Level, ClassFilter } from '../../../models/class.model';

@Component({
  selector: 'app-class-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './class-list.component.html',
  styleUrls: ['./class-list.component.css']
})
export class ClassListComponent implements OnInit {
  classes: any[] = [];
  departments: any[] = [];
  levels: any[] = [];
  
  // constructor(private classService: ClassService) {}
  
  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  
  // Filtering
  filter: ClassFilter = {};
  
  // Loading and error states
  loading = false;
  error: string | null = null;
  
  constructor(private classService: ClassService) { 
    // Initialize collections to empty arrays
    this.classes = [];
    this.departments = [];
    this.levels = [];
  }

  ngOnInit(): void {
    this.loadDepartments();
    this.loadClasses();
  }

  loadClasses(): void {
    this.loading = true;
    this.error = null;
    
    this.classService.getAllClasses()
      .subscribe({
        next: (response: any) => {
          try {
            console.log('Classes response:', response);
            
            // Initialize to empty array in case of error
            this.classes = [];
            
            // Check if response follows Spring Data JPA Page structure
            if (response && typeof response === 'object' && 'content' in response) {
              // It's a paginated response
              if (Array.isArray(response.content)) {
                this.classes = response.content;
                this.totalItems = response.totalElements || 0;
                this.totalPages = response.totalPages || 1;
              }
            } else if (Array.isArray(response)) {
              // It's an array directly
              this.classes = response;
              this.totalItems = response.length;
              this.totalPages = 1;
            } else {
              console.warn('Unexpected response format:', response);
              // Handle unexpected response format
              this.classes = [];
              this.totalItems = 0;
              this.totalPages = 0;
            }
          } catch (e) {
            console.error('Error processing response:', e);
            this.classes = [];
            this.totalItems = 0;
            this.totalPages = 0;
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load classes. Please try again.';
          console.error('Error loading classes:', err);
          this.loading = false;
          this.classes = [];
          this.totalItems = 0;
          this.totalPages = 0;
        }
      });
  }

  loadDepartments(): void {
    this.classService.getAllDepartments()
      .subscribe({
        next: (departments) => {
          // Ensure departments is an array
          this.departments = Array.isArray(departments) ? departments : [];
        },
        error: (err) => {
          console.error('Error loading departments:', err);
          this.departments = []; // Initialize as empty array on error
        }
      });
  }

  loadLevelsByDepartment(departmentId: string): void {
    if (departmentId) {
      this.classService.getLevelsByDepartmentId(departmentId)
        .subscribe({
          next: (levels) => {
            // Ensure levels is an array
            this.levels = Array.isArray(levels) ? levels : [];
            this.filter.levelId = ''; // Reset level selection
          },
          error: (err) => {
            console.error('Error loading levels:', err);
            this.levels = []; // Initialize as empty array on error
          }
        });
    } else {
      this.levels = [];
      this.filter.levelId = '';
    }
  }

  onDepartmentChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const departmentId = selectElement.value;
    this.filter.departmentId = departmentId || undefined;
    
    if (departmentId) {
      this.loadLevelsByDepartment(departmentId);
    } else {
      this.levels = [];
      this.filter.levelId = undefined;
    }
  }

  onLevelChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.filter.levelId = selectElement.value || undefined;
  }

  applyFilter(): void {
    this.currentPage = 0;
    this.searchClasses();
  }

  resetFilter(): void {
    this.filter = {};
    this.levels = [];
    this.currentPage = 0;
    this.loadClasses();
  }

  searchClasses(): void {
    this.loading = true;
    
    if (this.hasActiveFilters()) {
      this.classService.searchClasses(this.filter, this.currentPage, this.pageSize)
        .subscribe({
          next: (response) => {
            this.classes = response.content;
            this.totalItems = response.totalElements;
            this.totalPages = response.totalPages;
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Failed to search classes. Please try again.';
            console.error('Error searching classes:', err);
            this.loading = false;
          }
        });
    } else {
      this.loadClasses();
    }
  }

  hasActiveFilters(): boolean {
    return !!(this.filter.name || this.filter.departmentId || this.filter.levelId);
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.hasActiveFilters() ? this.searchClasses() : this.loadClasses();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.hasActiveFilters() ? this.searchClasses() : this.loadClasses();
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.hasActiveFilters() ? this.searchClasses() : this.loadClasses();
    }
  }

  deleteClass(id: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this class?')) {
      this.classService.deleteClass(id)
        .subscribe({
          next: () => {
            this.classes = this.classes.filter(c => c.id !== id);
            this.loadClasses(); // Reload to update pagination
          },
          error: (err) => {
            this.error = 'Failed to delete class. Please try again.';
            console.error('Error deleting class:', err);
          }
        });
    }
  }
}