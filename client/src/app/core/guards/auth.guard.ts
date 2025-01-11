import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild } from '@angular/router';
import { Observable, map, take, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.checkAuth(route, state);
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.checkAuth(route, state);
  }

  private checkAuth(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // Check if route should be hidden for authenticated users
    const hideForAuthenticated = route.data?.['hideForAuthenticated'];

    return this.authService.authState$.pipe(
      take(1),
      map(authState => {
        const isAuthenticated = authState.isAuthenticated;
        const isLoading = authState.loading;

        // If still loading, allow navigation (will be handled by app initialization)
        if (isLoading) {
          return true;
        }

        // If route should be hidden for authenticated users (like login/register)
        if (hideForAuthenticated && isAuthenticated) {
          this.router.navigate(['/']);
          return false;
        }

        // If route requires authentication
        const requiresAuth = route.data?.['requiresAuth'] !== false;

        if (requiresAuth && !isAuthenticated) {
          this.router.navigate(['/auth/login'], {
            queryParams: { returnUrl: state.url }
          });
          return false;
        }

        return true;
      })
    );
  }
}
