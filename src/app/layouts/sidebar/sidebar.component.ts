// src/app/layout/sidebar/sidebar.component.ts
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { filter } from 'rxjs';

import { AuthService } from '../../services/auth.service';

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
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  @Input() isExpanded = true;
  @Input() navItems: any[] = [];
  @Output() toggleSidebar = new EventEmitter<boolean>();
  
  currentUrl = '';
  currentUser = this.authService.currentUserValue;
  year = new Date().getFullYear();

  ngOnInit() {
    this.currentUrl = this.router.url;
    
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