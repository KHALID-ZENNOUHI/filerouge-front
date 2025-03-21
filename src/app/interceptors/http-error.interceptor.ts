// src/app/interceptors/http-error.interceptor.ts
import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unknown error occurred';
      
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        if (error.status === 0) {
          errorMessage = 'Could not connect to the server. Please check your internet connection.';
        } else if (error.status === 401) {
          errorMessage = 'Unauthorized access. Please log in.';
          // Redirect to login page or handle auth error
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to access this resource.';
        } else if (error.status === 404) {
          errorMessage = 'The requested resource was not found.';
        } else if (error.status === 500) {
          errorMessage = 'Internal server error. Please try again later.';
        }
        
        // Include more information if available
        if (error.error && error.error.message) {
          errorMessage = `${errorMessage} Details: ${error.error.message}`;
        }
      }
      
      // Log the error to console
      console.error('API Error:', error);
      
      // Return an observable with a user-facing error message
      return throwError(() => new Error(errorMessage));
    })
  );
};