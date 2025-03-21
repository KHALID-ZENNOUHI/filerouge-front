// src/app/components/class/class-detail/class-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClassService } from '../../../services/class.service';
import { Class, ClassStatistics, Program, Subject } from '../../../models/class.model';

@Component({
  selector: 'app-class-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './class-detail.component.html',
  styleUrls: ['./class-detail.component.css']
})
export class ClassDetailComponent implements OnInit {
  classId: string;
  classData: Class | null = null;
  programs: Program[] = [];
  statistics: ClassStatistics | null = null;
  availableSubjects: Subject[] = [];
  
  // For assigning new subjects
  selectedSubjectId = '';
  programDescription = '';
  
  // State management
  loading = false;
  loadingPrograms = false;
  loadingStatistics = false;
  loadingSubjects = false;
  assigningSubject = false;
  
  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private classService: ClassService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/classes']);
      throw new Error('Class ID is required');
    }
    this.classId = id;
  }

  ngOnInit(): void {
    this.loadClassData();
    this.loadPrograms();
    this.loadStatistics();
  }

  loadClassData(): void {
    this.loading = true;
    this.error = null;
    
    this.classService.getClassById(this.classId)
      .subscribe({
        next: (data) => {
          this.classData = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load class data. Please try again.';
          console.error('Error loading class:', err);
          this.loading = false;
        }
      });
  }

  loadPrograms(): void {
    this.loadingPrograms = true;
    
    this.classService.getProgramsByClassId(this.classId)
      .subscribe({
        next: (data) => {
          this.programs = data;
          this.loadingPrograms = false;
          // After loading programs, load available subjects that aren't already assigned
          this.loadAvailableSubjects();
        },
        error: (err) => {
          console.error('Error loading programs:', err);
          this.loadingPrograms = false;
        }
      });
  }

  loadStatistics(): void {
    this.loadingStatistics = true;
    
    this.classService.getClassStatistics(this.classId)
      .subscribe({
        next: (data) => {
          this.statistics = data;
          this.loadingStatistics = false;
        },
        error: (err) => {
          console.error('Error loading statistics:', err);
          this.loadingStatistics = false;
        }
      });
  }

  loadAvailableSubjects(): void {
    this.loadingSubjects = true;
    
    // This would typically call a backend endpoint to get subjects not already assigned
    // For now, we'll mock this by calling a method to get all subjects
    // In a real implementation, you'd create a dedicated endpoint for this
    
    // Reset selection
    this.selectedSubjectId = '';
    this.programDescription = '';
    
    // Mock implementation (replace with a proper API call)
    setTimeout(() => {
      this.availableSubjects = [
        { id: 'subj1', name: 'Mathematics' },
        { id: 'subj2', name: 'Physics' },
        { id: 'subj3', name: 'Chemistry' },
        { id: 'subj4', name: 'Biology' },
        { id: 'subj5', name: 'History' }
      ].filter(subject => 
        !this.programs.some(program => program.subject.id === subject.id)
      );
      
      this.loadingSubjects = false;
    }, 500);
  }

  assignSubject(): void {
    if (!this.selectedSubjectId) {
      return;
    }
    
    this.assigningSubject = true;
    this.error = null;
    this.successMessage = null;
    
    this.classService.assignSubjectToClass(this.classId, this.selectedSubjectId, this.programDescription)
      .subscribe({
        next: (result) => {
          this.assigningSubject = false;
          this.successMessage = 'Subject assigned successfully!';
          
          // Refresh the programs list
          this.loadPrograms();
          
          // Reset form
          this.selectedSubjectId = '';
          this.programDescription = '';
        },
        error: (err) => {
          this.assigningSubject = false;
          this.error = 'Failed to assign subject. Please try again.';
          console.error('Error assigning subject:', err);
        }
      });
  }

  removeSubject(subjectId: string): void {
    if (confirm('Are you sure you want to remove this subject from the class?')) {
      this.classService.removeSubjectFromClass(this.classId, subjectId)
        .subscribe({
          next: () => {
            this.successMessage = 'Subject removed successfully!';
            
            // Refresh the programs list
            this.loadPrograms();
          },
          error: (err) => {
            this.error = 'Failed to remove subject. Please try again.';
            console.error('Error removing subject:', err);
          }
        });
    }
  }

  deleteClass(): void {
    if (confirm(`Are you sure you want to delete this class: ${this.classData?.name}? This action cannot be undone.`)) {
      this.classService.deleteClass(this.classId)
        .subscribe({
          next: () => {
            this.router.navigate(['/classes'], { 
              queryParams: { deleted: 'true' } 
            });
          },
          error: (err) => {
            this.error = 'Failed to delete class. Please try again.';
            console.error('Error deleting class:', err);
          }
        });
    }
  }
}