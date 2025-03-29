// src/app/pages/landing/landing.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatToolbarModule
  ],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  year = new Date().getFullYear();
  
  learnMoreClick() {
    if (this.authService.isAuthenticated()) {
      // If authenticated, redirect to profile
      this.router.navigate(['users']);
    } else {
      // If not authenticated, scroll to features section
      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  features = [
    {
      icon: 'dashboard',
      title: 'Intuitive Dashboard',
      description: 'Get a comprehensive overview of your school data with our easy-to-use dashboard.'
    },
    {
      icon: 'school',
      title: 'Class Management',
      description: 'Efficiently organize classes, assign subjects, and manage student enrollment.'
    },
    {
      icon: 'people',
      title: 'Student & Teacher Management',
      description: 'Maintain detailed profiles for students and staff with complete academic history.'
    },
    {
      icon: 'book',
      title: 'Academic Programs',
      description: 'Design and implement educational programs with flexible curriculum structures.'
    },
    {
      icon: 'assessment',
      title: 'Performance Analytics',
      description: 'Track student progress and institutional performance with powerful analytics tools.'
    },
    {
      icon: 'event',
      title: 'Scheduling & Calendar',
      description: 'Plan academic schedules, events, and important deadlines with ease.'
    }
  ];
  
  testimonials = [
    {
      quote: "This system has revolutionized how we manage our school operations. Everything is now streamlined and accessible.",
      author: "Sarah Johnson",
      position: "School Principal"
    },
    {
      quote: "The intuitive interface makes it easy for our teachers to track student progress and communicate with parents.",
      author: "Michael Rodriguez",
      position: "Department Head"
    },
    {
      quote: "Setting up classes and managing academic programs has never been easier. Highly recommended!",
      author: "Emily Thompson",
      position: "Administrator"
    }
  ];
}