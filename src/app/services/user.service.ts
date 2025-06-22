import { Injectable, computed, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../models/user.model';
import { catchError, of, tap, throwError } from 'rxjs';
import { environment } from '../environment/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrl = `${environment.apiUrl}/users`;
  private _users = signal<User[]>([]);
  readonly users = this._users.asReadonly();
  readonly usersWithCredentials = computed(() => this._users().filter(u => !!u.username));
  private _loaded = signal(false);

  private _technicians = signal<User[]>([]);
  readonly technicians = this._technicians.asReadonly();

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  // 🧠 CHARGEMENT DE BASE
  loadUsers() {
    if (this._loaded()) return;
    this.http.get<User[]>(this.baseUrl).subscribe({
      next: users => {
        this._users.set(users);
        this._technicians.set(users.filter(u => u.role === 'technicien'));
        this._loaded.set(true);
        console.log('✅ Utilisateurs chargés ' + this.users()[0].username);
      },
      error: err => {
        console.error('❌ Erreur chargement utilisateurs :', err);
        this.snackBar.open('❌ Erreur chargement utilisateurs.', 'Fermer', { duration: 3000 });
      }
    });
  }
  loadUsersIfEmpty() {
    if (this._users().length === 0) this.loadUsers();
  }

  // ➕ AJOUT
  addUser(changes: Partial<User>) {
    this.http.post<User>(this.baseUrl, changes).subscribe({
      next: newUser => {
        this._users.update(users => [...users, newUser]);
        this.snackBar.open('✅ Utilisateur ajouté.', 'Fermer', { duration: 3000 });
      },
      error: err => {
        this.handleError(err, 'ajout utilisateur');
      }
    });
  }

  // ✏️ MODIFICATION
  updateUser(idUser: number, changes: Partial<User>) {
    this.http.put<User>(`${this.baseUrl}/${idUser}`, changes).subscribe({
      next: updated => {
        this._users.update(users => users.map(u => u.idUser === idUser ? updated : u));
        this.snackBar.open('✅ Utilisateur mis à jour.', 'Fermer', { duration: 3000 });
      },
      error: err => {
        console.error('❌ Erreur update utilisateur :', err);
        this.snackBar.open('❌ Échec de la mise à jour.', 'Fermer', { duration: 3000 });
      }
    });
  }

  // 🗑️ SUPPRESSION
  removeUser(idUser: number) {
    this.http.delete(`${this.baseUrl}/${idUser}`).subscribe({
      next: () => {
        this._users.update(users => users.filter(u => u.idUser !== idUser));
        this.snackBar.open('🗑️ Utilisateur supprimé.', 'Fermer', { duration: 3000 });
      },
      error: err => {
        console.error('❌ Erreur suppression utilisateur :', err);
        this.snackBar.open('❌ Échec de la suppression.', 'Fermer', { duration: 3000 });
      }
    });
  }

  // 🔍 CHECKS
  checkDuplicateUser(fields: Partial<Pick<User, 'numSec' | 'email' | 'phone' | 'numSiret'>>): string[] {
    const existing = this.users().find(u =>
      (fields.numSec && u.numSec === fields.numSec) ||
      (fields.email && u.email === fields.email) ||
      (fields.phone && u.phone === fields.phone) ||
      (fields.numSiret && u.numSiret === fields.numSiret)
    );
    if (!existing) return [];

    const errors: string[] = [];
    if (fields.numSec && existing.numSec === fields.numSec) errors.push('numSec');
    if (fields.email && existing.email === fields.email) errors.push('email');
    if (fields.phone && existing.phone === fields.phone) errors.push('phone');
    if (fields.numSiret && existing.numSiret === fields.numSiret) errors.push('numSiret');
    return errors;
  }

  checkUniqueUser(fields: Partial<Pick<User, 'numSec' | 'email' | 'phone' | 'numSiret'>>) {
    const params = new HttpParams({ fromObject: fields as any });
    return this.http.get(`${this.baseUrl}/check-unique`, { params }).pipe(
      catchError(err => {
        if (err.status === 409) return throwError(() => err.error.fields);
        return throwError(() => ['unknown']);
      })
    );
  }

  // 🧑‍🔧 TECHNICIENS
  getTechnicians() {
    return of(this.users().filter(u => u.role === 'technicien'));
  }

  getTechniciansObservable() {
    return of(this.technicians());
  }

  // ✅ GET FROM SIGNAL
  getUserFromSignal(idUser: number): User | undefined {
    return this.users().find(u => u.idUser === idUser);
  }

  // ✅ API DIRECTE
  getUserById(idUser: number) {
    return this.http.get<User>(`${this.baseUrl}/${idUser}`);
  }

  // ✅ MIXTE SIGNAL OU API
  getUserOrFetch(idUser: number) {
    const local = this.getUserFromSignal(idUser);
    return local ? of(local) : this.getUserById(idUser);
  }

  // 🔐 DONNER ACCÈS
  giveAccess(idUser: number, credentials: { username: string, password: string }) {
    return this.http.post(`${this.baseUrl}/${idUser}/credentials`, credentials).pipe(
      tap(() => {
        this.snackBar.open('✅ Accès utilisateur créé', 'Fermer', { duration: 3000 });
        this.loadUsers(); // 🔁 recharge automatiquement
      }),
      catchError(err => {
        const message = err.status === 409
          ? '⛔ Nom d\'utilisateur déjà pris'
          : '❌ Échec création accès';
        this.snackBar.open(message, 'Fermer', { duration: 3000 });
        return throwError(() => err);
      })
    );
  }

  refreshUser(idUser: number) {
    this.http.get<User>(`${this.baseUrl}/${idUser}`).subscribe({
      next: updated => {
        this._users.update(users =>
          users.map(u => u.idUser === idUser ? updated : u)
        );
      },
      error: err => {
        console.error('❌ Erreur actualisation utilisateur :', err);
        this.snackBar.open('❌ Impossible d\'actualiser l\'utilisateur', 'Fermer', { duration: 3000 });
      }
    });
  }


  private handleError(err: any, context = '') {
    if (err.status === 409 && Array.isArray(err.error?.fields)) {
      const messages = err.error.fields
        .map((field: string) => `⛔ ${this.translateField(field)} déjà utilisé.`)
        .join('\n');
      this.snackBar.open(messages, 'Fermer', { duration: 5000 });
    } else if (err.status === 409) {
      this.snackBar.open('⛔ Conflit : Données déjà existantes.', 'Fermer', { duration: 4000 });
    } else if (err.status === 400) {
      this.snackBar.open('⛔ Requête invalide.', 'Fermer', { duration: 4000 });
    } else {
      this.snackBar.open(`❌ Erreur ${context ? 'lors du ' + context : 'inconnue'}.`, 'Fermer', { duration: 3000 });
    }
  }

  private translateField(field: string): string {
    switch (field) {
      case 'numSec': return 'Numéro de sécurité sociale';
      case 'email': return 'Adresse email';
      case 'phone': return 'Numéro de téléphone';
      case 'numSiret': return 'Numéro SIRET';
      default: return field;
    }
  }

  assignDepot(idUser: number, idDep: number) {
    return this.http.post(`${this.baseUrl}/assign`, { idUser, idDep });
  }

  removeDepot(idUser: number) {
    return this.http.put(`${this.baseUrl}/remove-depot/${idUser}`, {});
  }

}
