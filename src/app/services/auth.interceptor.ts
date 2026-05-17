import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { catchError, throwError, switchMap, timeout } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getAccessToken();

  // Skip adding token for public endpoints (both via gateway and direct)
  const skipTokenEndpoints = [
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    '/auth/oauth2',
    'localhost:8081/auth/login',
    'localhost:8081/auth/register',
    'localhost:8081/auth/refresh',
  ];

  const shouldSkipToken = skipTokenEndpoints.some((endpoint) =>
    req.url.includes(endpoint)
  );

  let authReq = req;
  if (token && !shouldSkipToken) {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
    // Also send X-Auth-User so backend microservices get the email
    // even when the API gateway doesn't inject it (e.g. dev proxy)
    const user = authService.getCurrentUser();
    if (user?.email) {
      headers['X-Auth-User'] = user.email;
      headers['loggedInUser'] = user.email;
    }
    authReq = req.clone({ setHeaders: headers });
  }

  return next(authReq).pipe(
    timeout(30000), // 30 second timeout for all requests
    catchError((error: HttpErrorResponse | any) => {
      // Handle timeout error
      if (error.name === 'TimeoutError') {
        console.error('[AuthInterceptor] Request timed out');
        return throwError(() => new Error('Request timed out. Please check your connection.'));
      }

      if (error.status === 401 && !shouldSkipToken) {
        console.warn('[AuthInterceptor] 401 Unauthorized - Attempting token refresh');
        return authService.refresh().pipe(
          switchMap((response) => {
            console.log('[AuthInterceptor] Token refreshed successfully');
            authService.saveTokens(response);
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${response.accessToken}`,
              },
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            console.error('[AuthInterceptor] Token refresh failed, redirecting to login');
            authService.clearTokens();
            router.navigate(['/login'], { 
              queryParams: { returnUrl: router.url } 
            });
            return throwError(() => refreshError);
          })
        );
      }

      if (error.status === 403) {
        console.warn('[AuthInterceptor] 403 Forbidden');
      }

      return throwError(() => error);
    })
  );
};
