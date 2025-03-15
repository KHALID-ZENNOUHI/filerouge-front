// src/app/auth/interceptors/jwt.interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

// Private state for refresh token handling
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  
  // Skip adding token for auth endpoints except refresh token
  if (req.url.includes('/api/auth/login') || 
      req.url.includes('/api/auth/register') || 
      req.url.includes('/api/auth/reset-password')) {
    return next(req);
  }

  // Add auth token to requests
  const token = authService.getToken();
  if (token) {
    req = addToken(req, token);
  }

  return next(req).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401Error(req, next, authService);
      }
      return throwError(() => error);
    })
  );
};

// Helper function to add token to request
function addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

// Handle 401 errors by trying to refresh the token
function handle401Error(
  request: HttpRequest<unknown>, 
  next: HttpHandlerFn,
  authService: AuthService
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = authService.getRefreshToken();
    
    if (refreshToken) {
      return authService.refreshToken().pipe(
        switchMap(response => {
          isRefreshing = false;
          refreshTokenSubject.next(response.token);
          return next(addToken(request, response.token));
        }),
        catchError(err => {
          isRefreshing = false;
          authService.logout();
          return throwError(() => err);
        })
      );
    } else {
      // No refresh token available
      isRefreshing = false;
      authService.logout();
      return throwError(() => new Error('No refresh token available'));
    }
  } else {
    // Wait for token to be refreshed
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => {
        return next(addToken(request, token as string));
      })
    );
  }
}