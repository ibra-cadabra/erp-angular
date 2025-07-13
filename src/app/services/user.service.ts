// ✅ Fichier : user.service.ts
// Service Angular pour la gestion des utilisateurs dans l'application ERP

import {Injectable, signal} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';
import {User} from '../models/user.model';
import {catchError, of, tap, throwError} from 'rxjs';
import {environment} from '../environment/environment';
import {Router} from '@angular/router';

@Injectable({providedIn: 'root'})
export class UserService {
    private baseUrl = `${environment.apiUrl}/users`;

    // 📦 Signaux pour stocker localement les utilisateurs
    private _users = signal<User[]>([]);
    readonly users = this._users.asReadonly();

    private _technicians = signal<User[]>([]);
    readonly technicians = this._technicians.asReadonly();

    private _loaded = signal(false);

    constructor(
        private http: HttpClient,
        private router: Router,
        private snackBar: MatSnackBar
    ) {
    }

    /**
     * 📥 Charge tous les utilisateurs s'ils ne sont pas encore chargés
     */
    loadUsers() {
        if (this._loaded()) {
            console.log('✅ Utilisateurs déjà chargés, chargement ignoré.');
            return;
        }

        console.log('📡 Requête pour charger les utilisateurs...');

        this.http.get<User[]>(this.baseUrl).subscribe({
            next: users => {
                console.log('✅ Utilisateurs récupérés depuis le backend :', users);

                this._users.set(users);
                const techs = users.filter(u => u.role === 'technicien');
                this._technicians.set(techs);

                console.log(`👷 Techniciens extraits : ${techs.length}`, techs);

                this._loaded.set(true);
            },
            error: err => {
                console.error('❌ Erreur lors du chargement des utilisateurs :', err);
                this.snackBar.open('Erreur chargement utilisateurs', 'Fermer', {duration: 3000});
            }
        });
    }

    /**
     * 🚀 Recharge si vide (utile au démarrage ou navigation entre pages)
     */
    loadUsersIfEmpty() {
        const count = this._users().length;
        console.log(`🔍 Vérification des utilisateurs déjà chargés (actuellement ${count})`);

        if (count === 0) {
            this.loadUsers();
        } else {
            console.log('✅ Données utilisateurs déjà présentes, aucun appel requis.');
        }
    }


    /**
     * ➕ Ajouter un nouvel utilisateur
     */
    addUser(changes: Partial<User>) {
        this.http.post<User>(this.baseUrl, changes).subscribe({
            next: newUser => {
                this._users.update(users => [...users, newUser]);
                this.router.navigate(['/users']);
                this.snackBar.open('Utilisateur ajouté', 'Fermer', {duration: 3000});
            },
            error: err => this.handleError(err, 'ajout utilisateur')
        });
    }

    /**
     * ✏️ Modifier un utilisateur existant
     */
    updateUser(idUser: number, changes: Partial<User>) {
        this.http.put<User>(`${this.baseUrl}/${idUser}`, changes).subscribe({
            next: updated => {
                this._users.update(users => users.map(u => u.idUser === idUser ? updated : u));
                this.snackBar.open('Utilisateur mis à jour', 'Fermer', {duration: 3000});
            },
            error: err => this.handleError(err, 'mise à jour')
        });
    }

    /**
     * 🗑️ Supprimer un utilisateur
     */
    removeUser(idUser: number) {
        this.http.delete(`${this.baseUrl}/${idUser}`).subscribe({
            next: () => {
                this._users.update(users => users.filter(u => u.idUser !== idUser));
                this.snackBar.open('Utilisateur supprimé', 'Fermer', {duration: 3000});
            },
            error: err => this.handleError(err, 'suppression')
        });
    }

    /**
     * 🔍 Rechercher les champs en double (côté client)
     */
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

    /**
     * ✅ Vérification côté serveur pour les champs uniques
     */
    checkUniqueUser(fields: Partial<Pick<User, 'numSec' | 'email' | 'phone' | 'numSiret'>>) {
        const params = new HttpParams({fromObject: fields as any});
        return this.http.get(`${this.baseUrl}/check-unique`, {params}).pipe(
            catchError(err => {
                if (err.status === 409) return throwError(() => err.error.fields);
                return throwError(() => ['unknown']);
            })
        );
    }

    /**
     * 🔧 Obtenir les techniciens depuis le signal
     */
    getTechnicians() {
        return of(this.users().filter(u => u.role === 'technicien'));
    }

    getTechniciansObservable() {
        return of(this.technicians());
    }

    /**
     * 🧑‍💼 Accès direct à un utilisateur via le signal
     */
    getUserFromSignal(idUser: number): User | undefined {
        return this.users().find(u => u.idUser === idUser);
    }

    /**
     * 🧾 API directe pour obtenir un utilisateur par ID
     */
    getUserById(idUser: number) {
        return this.http.get<User>(`${this.baseUrl}/${idUser}`);
    }

    /**
     * 🔀 Récupère localement ou via API
     */
    getUserOrFetch(idUser: number) {
        const local = this.getUserFromSignal(idUser);
        return local ? of(local) : this.getUserById(idUser);
    }

    /**
     * 🔐 Donne accès à un utilisateur (username + password)
     */
    giveAccess(idUser: number, credentials: { username: string, password: string }) {
        return this.http.post(`${this.baseUrl}/${idUser}/credentials`, credentials).pipe(
            tap(() => {
                this.snackBar.open('Accès créé', 'Fermer', {duration: 3000});
                this.loadUsers();
            }),
            catchError(err => {
                const message = err.status === 409 ? 'Nom d’utilisateur déjà pris' : 'Erreur création accès';
                this.snackBar.open(message, 'Fermer', {duration: 3000});
                return throwError(() => err);
            })
        );
    }

    /**
     * 🔁 Actualiser les données d'un utilisateur
     */
    refreshUser(idUser: number) {
        this.http.get<User>(`${this.baseUrl}/${idUser}`).subscribe({
            next: updated => {
                this._users.update(users => users.map(u => u.idUser === idUser ? updated : u));
            },
            error: err => {
                console.error('Erreur actualisation utilisateur :', err);
                this.snackBar.open('Impossible d’actualiser l’utilisateur', 'Fermer', {duration: 3000});
            }
        });
    }

    /**
     * 🏢 Attribution et retrait de dépôt pour un utilisateur
     */
    assignDepot(idUser: number, idDep: number) {
        return this.http.post(`${this.baseUrl}/assign`, {idUser, idDep});
    }

    removeDepot(idUser: number) {
        return this.http.put(`${this.baseUrl}/remove-depot/${idUser}`, {});
    }

    /**
     * 🛠️ Gestion d’erreur centralisée
     */
    private handleError(err: any, context = '') {
        if (err.status === 409 && Array.isArray(err.error?.fields)) {
            const messages = err.error.fields
                .map((field: string) => `Champ ${field} déjà utilisé.`)
                .join('\n');
            this.snackBar.open(messages, 'Fermer', {duration: 4000});
        } else {
            this.snackBar.open(`Erreur lors du ${context}`, 'Fermer', {duration: 3000});
        }
    }
}
