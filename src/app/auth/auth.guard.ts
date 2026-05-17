import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Preserve the full URL including query params
  return router.createUrlTree(['/login'], { 
    queryParams: { returnUrl: state.url } 
  });
};

export const publicOnlyGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    const returnUrl = route.queryParams['returnUrl'];
    if (returnUrl) {
      return router.createUrlTree([returnUrl]);
    } else if (authService.isAdmin()) {
      return router.createUrlTree(['/admin']);
    } else {
      return router.createUrlTree(['/app/dashboard']);
    }
  }

  return true;
};

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    return true;
  }

  return router.createUrlTree(['/app/dashboard']);
};

export const userOnlyGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    return router.createUrlTree(['/admin']);
  }

  return true;
};

export const premiumGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isPremium()) {
    return true;
  }

  return router.createUrlTree(['/app/subscription']);
};
