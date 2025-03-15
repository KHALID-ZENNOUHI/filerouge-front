import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isAuthenticated()) {
      // Check if route has required roles
      const requiredRoles = route.data['roles'] as Array<string>;
      if (requiredRoles) {
        const userRole = this.authService.currentUserValue?.role;
        if (!userRole || !requiredRoles.includes(userRole)) {
          this.router.navigate(['/unauthorized']);
          return false;
        }
      }
      return true;
    }

    // Not logged in, redirect to login with return url
    this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}

export const AuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
  return inject(AuthGuardService).canActivate(route, state);
};