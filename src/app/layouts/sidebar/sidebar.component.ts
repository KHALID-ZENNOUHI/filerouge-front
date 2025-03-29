// src/app/layouts/sidebar/sidebar.component.ts
import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { filter } from 'rxjs';

import { AuthService } from '../../services/auth.service';

interface MenuItem {
  name: string;
  route: string;
  icon: string;
  roles: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  @Input() isExpanded = true;
  @Input() navItems: any[] = [];
  @Output() toggleSidebar = new EventEmitter<boolean>();
  
  currentUrl = '';
  currentUser = this.authService.currentUserValue;
  year = new Date().getFullYear();

  // Define menu items as an object for easy access in template
  menuItems = {
    dashboard: { 
      name: 'Dashboard', 
      route: '/dashboard', 
      icon: 'fa-solid fa-gauge-high', 
      roles: ['ADMINISTRATOR', 'TEACHER', 'STUDENT', 'PARENT'] 
    },
    users: { 
      name: 'Users', 
      route: '/users', 
      icon: 'fa-solid fa-users', 
      roles: ['ADMINISTRATOR'] 
    },
    departments: { 
      name: 'Departments', 
      route: '/departments', 
      icon: 'fa-solid fa-building', 
      roles: ['ADMINISTRATOR'] 
    },
    levels: { 
      name: 'Levels', 
      route: '/levels', 
      icon: 'fa-solid fa-layer-group', 
      roles: ['ADMINISTRATOR'] 
    },
    classes: { 
      name: 'Classes', 
      route: '/classes', 
      icon: 'fa-solid fa-chalkboard-user', 
      roles: ['ADMINISTRATOR', 'TEACHER'] 
    },
    subjects: { 
      name: 'Subjects', 
      route: '/subjects', 
      icon: 'fa-solid fa-book', 
      roles: ['ADMINISTRATOR', 'TEACHER'] 
    },
    programs: { 
      name: 'Programs', 
      route: '/programs', 
      icon: 'fa-solid fa-graduation-cap', 
      roles: ['ADMINISTRATOR', 'TEACHER'] 
    },
    settings: { 
      name: 'Settings', 
      route: '/settings', 
      icon: 'fa-solid fa-gear', 
      roles: ['ADMINISTRATOR'] 
    },
    // New menu items
    absent: {
      name: 'Absent',
      route: '/absent',
      icon: 'fa-solid fa-calendar-times',
      roles: ['ADMINISTRATOR', 'TEACHER']
    },
    grades: {
      name: 'Grades',
      route: '/grades',
      icon: 'fa-solid fa-chart-line',
      roles: ['ADMINISTRATOR', 'TEACHER', 'STUDENT', 'PARENT']
    },
    sessions: {
      name: 'Sessions',
      route: '/sessions',
      icon: 'fa-solid fa-clock',
      roles: ['ADMINISTRATOR', 'TEACHER']
    }
  };

  // Legacy array for compatibility with original approach, if needed
  defaultNavItems: MenuItem[] = [
    this.menuItems.dashboard,
    this.menuItems.users,
    this.menuItems.departments, 
    this.menuItems.levels,
    this.menuItems.classes,
    this.menuItems.subjects,
    this.menuItems.programs,
    this.menuItems.absent,
    this.menuItems.grades,
    this.menuItems.sessions,
    this.menuItems.settings
  ];

  ngOnInit() {
    this.currentUrl = this.router.url;
    
    // Use the provided navItems or fallback to default
    if (!this.navItems || this.navItems.length === 0) {
      this.navItems = this.defaultNavItems;
    }
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl = event.url;
    });
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
    this.toggleSidebar.emit(this.isExpanded);
  }

  // Check if the user has permission for this menu item
  hasPermission(item: any): boolean {
    if (!item.roles || item.roles.length === 0) return true;
    return !!this.currentUser && item.roles.includes(this.currentUser.role);
  }

  // Check if menu item is active
  isActive(route: string): boolean {
    return this.currentUrl.startsWith(route);
  }
}