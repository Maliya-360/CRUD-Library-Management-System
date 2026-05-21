import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const memberGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.getCurrentUser();

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  if (user?.memberType !== 'Admin') {
    return true;
  }

  return router.createUrlTree(['/admin-dashboard']);
};
