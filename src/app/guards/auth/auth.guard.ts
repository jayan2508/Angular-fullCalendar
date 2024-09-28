import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../../services/auth/auth.service'; // Adjust the import path as necessary
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userService = inject(UserService);

  return userService.isLoggedIn().pipe(
    map((isLoggedIn) => {
      if (isLoggedIn) {
        router.navigate(['/homepage']);
        return false;
      } else {
        return true;
      }
    })
  );
};
