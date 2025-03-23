// src/app/components/class/class-detail/class-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClassService } from '../../../services/class.service';
import { Class, ClassStatistics, Program, Subject, Student, Teacher } from '../../../models/class.model';

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
  students: Student[] = [];
  statistics: ClassStatistics | null = null;
  availableSubjects: Subject[] = [];
  
  // For assigning new subjects
  selectedSubjectId = '';
  selectedTeacherId = '';
  programDescription = '';
  
  // For visual states
  activeTab = 'students'; // 'students', 'subjects', or 'statistics'
  
  // State management
  loading = false;
  loadingPrograms = false;
  loadingStudents = false;
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
    if (!id || id === 'new' || id === 'create') {
      // If no ID or it's 'new', redirect to the class list page
      this.router.navigate(['/classes']);
      throw new Error('Valid class ID is required');
    }
    this.classId = id;
  }

  ngOnInit(): void {
    this.loadClassData();
    this.loadPrograms();
    this.loadStudents();
    this.loadStatistics();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  loadClassData(): void {
    this.loading = true;
    this.error = null;
    
    this.classService.getClassById(this.classId)
      .subscribe({
        next: (data) => {
          this.classData = data;
          this.loading = false;
          console.log('Class data loaded:', this.classData);
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
          this.programs = Array.isArray(data) ? data : [];
          this.loadingPrograms = false;
          console.log('Programs loaded:', this.programs);
          // After loading programs, load available subjects that aren't already assigned
          this.loadAvailableSubjects();
        },
        error: (err) => {
          console.error('Error loading programs:', err);
          this.loadingPrograms = false;
          this.programs = [];
        }
      });
  }

  loadStudents(): void {
    this.loadingStudents = true;
    
    this.classService.getStudentsByClassId(this.classId)
      .subscribe({
        next: (data) => {
          this.students = Array.isArray(data) ? data : [];
          this.loadingStudents = false;
          console.log('Students loaded:', this.students);
        },
        error: (err) => {
          console.error('Error loading students:', err);
          this.loadingStudents = false;
          this.students = [];
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
          console.log('Statistics loaded:', this.statistics);
        },
        error: (err) => {
          console.error('Error loading statistics:', err);
          this.loadingStatistics = false;
        }
      });
  }

  loadAvailableSubjects(): void {
    this.loadingSubjects = true;
    
    // Get subjects not already assigned to this class
    this.classService.getAvailableSubjectsForClass(this.classId)
      .subscribe({
        next: (subjects) => {
          this.availableSubjects = Array.isArray(subjects) ? subjects : [];
          this.loadingSubjects = false;
          console.log('Available subjects loaded:', this.availableSubjects);
          
          // Reset selection
          this.selectedSubjectId = '';
          this.selectedTeacherId = '';
          this.programDescription = '';
        },
        error: (err) => {
          console.error('Error loading available subjects:', err);
          this.loadingSubjects = false;
          this.availableSubjects = [];
          
          // Fallback: filter out subjects that are already assigned
          this.classService.getAllSubjects()
            .subscribe({
              next: (allSubjects) => {
                const assignedSubjectIds = this.programs.map(p => p.subject.id);
                this.availableSubjects = allSubjects.filter(
                  subject => !assignedSubjectIds.includes(subject.id)
                );
                this.loadingSubjects = false;
              },
              error: (err) => {
                console.error('Error loading fallback subjects:', err);
                this.loadingSubjects = false;
              }
            });
        }
      });
  }

  assignSubject(): void {
    if (!this.selectedSubjectId) {
      return;
    }
    
    this.assigningSubject = true;
    this.error = null;
    this.successMessage = null;
    
    this.classService.assignSubjectToClass(
      this.classId, 
      this.selectedSubjectId, 
      this.selectedTeacherId || undefined, 
      this.programDescription || undefined
    )
      .subscribe({
        next: (result) => {
          this.assigningSubject = false;
          this.successMessage = 'Subject assigned successfully!';
          
          // Refresh the programs list
          this.loadPrograms();
          
          // Reset form
          this.selectedSubjectId = '';
          this.selectedTeacherId = '';
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

  getFullName(person: any): string {
    if (!person) return 'N/A';
    return `${person.firstName || ''} ${person.lastName || ''}`.trim() || 'N/A';
  }
  
  getGenderPercentage(gender: string): number {
    if (!this.statistics || !this.statistics.studentsByGender) return 0;
    
    const maleCount = this.statistics.studentsByGender['MALE'] || 0;
    const femaleCount = this.statistics.studentsByGender['FEMALE'] || 0;
    const totalStudents = maleCount + femaleCount;
    
    if (totalStudents === 0) return 0;
    
    if (gender === 'MALE') {
      return Math.round((maleCount / totalStudents) * 100);
    } else if (gender === 'FEMALE') {
      return Math.round((femaleCount / totalStudents) * 100);
    }
    
    return 0;
  }
}