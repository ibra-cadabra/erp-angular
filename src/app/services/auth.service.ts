import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { tap } from 'rxjs';
import { environment } from '../environment/environment';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private jwtHelper = new JwtHelperService();

  private _user = signal<User | null>(null);
  readonly user = this._user.asReadonly();

  token = signal<string | null>(null);
  decodedToken: any = null;

  constructor(private http: HttpClient, private router: Router) {
    this.loadToken();
  }

  login(credentials: { username: string; password: string }) {
    return this.http.post<{ accessToken: string; refreshToken: string }>(`${this.apiUrl}/login`, credentials).pipe(
      tap(({ accessToken, refreshToken }) => {
        this.decodeToken(accessToken);
        this.storeRefreshToken(refreshToken);
        this.redirectBasedOnRole();
      })
    );
  }

  decodeToken(token: string) {
    this.token.set(token);
    this.decodedToken = this.jwtHelper.decodeToken(token);
    localStorage.setItem('accessToken', token);

    const user = this.decodedToken?.user;
    if (user) this._user.set(user);
  }

  storeRefreshToken(refreshToken: string) {
    localStorage.setItem('refreshToken', refreshToken);
  }

  loadToken() {
    const token = localStorage.getItem('accessToken');
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      this.decodeToken(token);
    }
  }

  redirectBasedOnRole(): void {
    const user = this._user() || this.decodedToken?.user;
    if (!user) {
      this.router.navigateByUrl('/unauthorized');
      return;
    }

    switch (user.role) {
      case 'gerant':
        this.router.navigate(['/admin-depot'], {
          queryParams: { idDep: user.idDep }
        });
        break;
      case 'administrateur':
      case 'dirigeant':
        this.router.navigate(['/admin-dashboard']);
        break;
      default:
        this.router.navigate(['/unauthorized']);
    }
  }

  logout() {
    this.token.set(null);
    this._user.set(null);
    this.decodedToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('accessToken');
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }

  get currentUser() {
    return this.decodedToken?.user ?? null;
  }
  verifyPassword(password: string) {
    return this.http.post<boolean>(`${this.apiUrl}/verify-password`, { password });
  }
  refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<{ accessToken: string }>(`${this.apiUrl}/refresh`, { refreshToken });
  }


}
