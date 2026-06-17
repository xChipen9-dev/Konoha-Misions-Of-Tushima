import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  async canActivate(): Promise<boolean> {

    if (!this.auth.currentToken) {
      await this.auth.initSession();
    }

    if (this.auth.isLogged) return true;

    await this.router.navigateByUrl('/auth', { replaceUrl: true });
    return false;
  }
}
