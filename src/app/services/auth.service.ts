// auth.service.ts
import {Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {JwtHelperService} from '@auth0/angular-jwt';
import {tap} from 'rxjs';
import {environment} from '../environment/environment';
import {User} from '../models/user.model';
import {UserService} from './user.service';

@Injectable({providedIn: 'root'})
export class AuthService {
    // Stockage du token JWT
    token = signal<string | null>(null);
    decodedToken: any = null;
    private apiUrl = `${environment.apiUrl}/auth`;
    private jwtHelper = new JwtHelperService();
    // Signal pour l'utilisateur connecté (lecture seule)
    private _user = signal<User | null>(null);
    readonly user = this._user.asReadonly(); // pour le binding dans les composants

    constructor(
        private http: HttpClient,
        private userService: UserService,
        private router: Router
    ) {
        this.loadToken(); // charge le token à l'ouverture de l'app
    }

    /**
     * 🔐 Connexion de l'utilisateur
     */
    login(credentials: { username: string; password: string }) {
        return this.http
            .post<{ accessToken: string; refreshToken: string }>(
                `${this.apiUrl}/login`,
                credentials
            )
            .pipe(
                tap(({accessToken, refreshToken}) => {
                    this.decodeToken(accessToken); // décode et stocke
                    this.storeRefreshToken(refreshToken); // stocke le refresh token
                })
            );
    }

    /**
     * 🔍 Décode le token JWT et extrait l'utilisateur
     */
    decodeToken(token: string) {
        this.token.set(token);
        this.decodedToken = this.jwtHelper.decodeToken(token);
        localStorage.setItem('accessToken', token);

        const user = this.decodedToken?.user;
        if (user) this._user.set(user);
    }

    /**
     * 🔄 Recharge le token depuis localStorage si non expiré
     */
    loadToken() {
        const token = localStorage.getItem('accessToken');
        if (token && !this.jwtHelper.isTokenExpired(token)) {
            this.decodeToken(token);
        }
    }

    /**
     * 🚦 Redirige l'utilisateur selon son rôle
     */
    redirectBasedOnRole(): void {
        const user = this._user() || this.decodedToken?.user;
        if (!user) {
            this.router.navigateByUrl('/unauthorized').then(r => console.log(r));
            return;
        }

        switch (user.role) {
            case 'gerant':
                this.router.navigate(['/admin-depot'], {
                    queryParams: {idDep: user.idDep}
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

    /**
     * ❌ Déconnexion complète
     */
    logout() {
        this.token.set(null);
        this._user.set(null);
        this.decodedToken = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        this.router.navigate(['/login']);
    }

    /**
     * ✅ Vérifie si l'utilisateur est connecté (token non expiré)
     */
    isLoggedIn(): boolean {
        const token = localStorage.getItem('accessToken');
        return !!token && !this.jwtHelper.isTokenExpired(token);
    }

    /**
     * ✅ Vérifie si l'utilisateur est connecté à partir du signal interne
     */
    isLogged(): boolean {
        return this._user() !== null;
    }

    /**
     * 👤 Retourne l'utilisateur courant (depuis le signal ou le token décodé)
     */
    getCurrentUser(): User | null {
        return this._user() || this.decodedToken?.user || null;
    }

    /**
     * 🔐 Vérifie un mot de passe (utile avant suppression ou action sensible)
     */
    verifyPassword(password: string) {
        return this.http.post<boolean>(`${this.apiUrl}/verify-password`, {password});
    }

    /**
     * 🔄 Rafraîchit le token JWT à partir du refreshToken
     */
    refreshAccessToken() {
        const refreshToken = localStorage.getItem('refreshToken');
        return this.http.post<{ accessToken: string }>(`${this.apiUrl}/refresh`, {refreshToken});
    }

    // auth.service.ts
    getCurrentRole(): string | null {
        return this.getCurrentUser()?.role || null;
    }

    isAdminOrDirigeant(): boolean {
        const role = this.getCurrentRole();
        return role === 'administrateur' || role === 'dirigeant';
    }

    /**
     * 💾 Stocke le refreshToken
     */
    private storeRefreshToken(refreshToken: string) {
        localStorage.setItem('refreshToken', refreshToken);
    }

}
