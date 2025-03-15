import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuardService {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles = route.data['roles'] as Array<string>;
    const userRole = this.authService.currentUserValue?.role;
    
    if (!this.authService.isAuthenticated() || !userRole || !expectedRoles.includes(userRole)) {
      this.router.navigate(['/unauthorized']);
      return false;
    }
    
    return true;
  }
}

export const RoleGuard: CanActivateFn = (route: ActivatedRouteSnapshot): boolean => {
  return inject(RoleGuardService).canActivate(route);
};