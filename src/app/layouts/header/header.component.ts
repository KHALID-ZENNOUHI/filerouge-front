// src/app/layout/header/header.component.ts
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  @Input() isMobile = false;
  @Input() isExpanded = true;
  @Output() toggleSidebar = new EventEmitter<void>();

  currentUser: User | null = this.authService.currentUserValue;
  notificationCount = 0; // Example for notification badge
  
  // For demonstration purposes
  notifications = [
    { id: 1, title: 'New grade posted', message: 'Your Math grade has been updated', time: '10m ago', read: false },
    { id: 2, title: 'Absence recorded', message: 'An absence was recorded for May 3rd', time: '1h ago', read: false },
    { id: 3, title: 'New announcement', message: 'School will be closed on May 15th', time: '3h ago', read: true }
  ];

  ngOnInit() {
    this.notificationCount = this.notifications.filter(n => !n.read).length;
  }

  toggleMenu() {
    this.toggleSidebar.emit();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  markAllRead() {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.notificationCount = 0;
  }

  markAsRead(id: number) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      notification.read = true;
      this.notificationCount = Math.max(0, this.notificationCount - 1);
    }
  }

  clearNotifications() {
    this.notifications = [];
    this.notificationCount = 0;
  }
}