import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService, User } from './services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'school-management-system';
  private authService = inject(AuthService);
  private router = inject(Router);
  
  currentUser: User | null = null;
  private authSubscription: Subscription | null = null;

  ngOnInit(): void {
    // Subscribe to authentication state
    this.authSubscription = this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
      
      // Perform any actions that depend on authentication state
      if (user) {
        console.log('User is logged in:', user.username);
        // Additional initialization for authenticated user
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.authSubscription?.unsubscribe();
  }
}
