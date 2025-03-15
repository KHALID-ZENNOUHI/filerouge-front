// src/app/layout/main-layout/main-layout.component.ts
import { Component, OnInit, ViewChild, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { filter } from 'rxjs';

import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    MatBadgeModule,
    HeaderComponent,
    SidebarComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  
  @ViewChild('sidenav') sidenav!: MatSidenav;
  
  isMobile = false;
  isExpanded = true;
  currentUser = this.authService.currentUserValue;
  
  // Navigation links with icons and roles
  navItems = [
    { 
      name: 'Dashboard', 
      route: '/dashboard', 
      icon: 'dashboard', 
      roles: ['ADMINISTRATOR', 'TEACHER', 'STUDENT', 'PARENT']
    },
    { 
      name: 'Users', 
      route: '/users', 
      icon: 'people', 
      roles: ['ADMINISTRATOR']
    },
    { 
      name: 'Classes', 
      route: '/classes', 
      icon: 'school', 
      roles: ['ADMINISTRATOR', 'TEACHER']
    },
    { 
      name: 'Programs', 
      route: '/programs', 
      icon: 'book', 
      roles: ['ADMINISTRATOR', 'TEACHER']
    },
    { 
      name: 'Students', 
      route: '/students', 
      icon: 'person', 
      roles: ['ADMINISTRATOR', 'TEACHER']
    },
    { 
      name: 'Grades', 
      route: '/grades', 
      icon: 'grade', 
      roles: ['ADMINISTRATOR', 'TEACHER', 'STUDENT', 'PARENT']
    },
    { 
      name: 'Absences', 
      route: '/absences', 
      icon: 'event_busy', 
      roles: ['ADMINISTRATOR', 'TEACHER', 'STUDENT', 'PARENT']
    },
    { 
      name: 'Schedule', 
      route: '/schedule', 
      icon: 'schedule', 
      roles: ['ADMINISTRATOR', 'TEACHER', 'STUDENT', 'PARENT']
    },
    { 
      name: 'Reports', 
      route: '/reports', 
      icon: 'assessment', 
      roles: ['ADMINISTRATOR', 'TEACHER']
    },
    { 
      name: 'Settings', 
      route: '/settings', 
      icon: 'settings', 
      roles: ['ADMINISTRATOR']
    }
  ];

  ngOnInit() {
    this.checkScreenSize();
    
    // Close sidenav on navigation in mobile view
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.isMobile) {
        this.sidenav.close();
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile) {
      this.isExpanded = false;
      if (this.sidenav) this.sidenav.close();
    } else {
      this.isExpanded = true;
      if (this.sidenav) this.sidenav.open();
    }
  }

  toggleSidebar() {
    if (this.sidenav) {
      this.sidenav.toggle();
      this.isExpanded = this.sidenav.opened;
    }
  }

  handleSidenavToggle(expanded: boolean) {
    this.isExpanded = expanded;
  }

  // Check if the user has permission for this menu item
  hasPermission(item: any): boolean {
    if (!item.roles || item.roles.length === 0) return true;
    return !!this.currentUser && item.roles.includes(this.currentUser.role);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}