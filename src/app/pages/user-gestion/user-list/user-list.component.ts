// ✅ Fichier : user-list.component.ts
// Composant pour afficher la liste des utilisateurs avec actions (voir, modifier, supprimer)

import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../modules/material.module';
import { MatDialogModule } from '@angular/material/dialog';

import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import {ConfirmDialogComponent} from "../../../shared/confirmDialogComponent";
import {UserCredentialsComponent} from "../user-credentials/user-credentials.component";

@Component({
    selector: 'app-user-list',
    standalone: true,
    imports: [MaterialModule, CommonModule, MatDialogModule],
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
    private userService = inject(UserService);
    private dialog = inject(MatDialog);
    private snackBar = inject(MatSnackBar);
    private router = inject(Router);

    users = this.userService.users;
    search = signal('');

    // 🔍 Liste filtrée en fonction du terme recherché
    filteredUsers = computed(() => {
        const term = this.search().toLowerCase();
        return this.users().filter(u =>
            [u.name, u.prename, u.role].some(val => val?.toLowerCase().includes(term))
        );
    });

    ngOnInit() {
        console.log('📥 Initialisation user-list.component');
        this.userService.loadUsersIfEmpty();
    }

    /**
     * 🔎 Applique le filtre depuis le champ de recherche
     */
    applyFilter(event: Event) {
        const input = event.target as HTMLInputElement;
        this.search.set(input.value);
        console.log('🔍 Recherche utilisateur :', input.value);
    }

    /**
     * 👁️ Redirige vers la page de détails de l'utilisateur
     */
    view(user: User) {
        if (user.idUser) {
            this.router.navigate(['/users', user.idUser]);
        }
    }

    /**
     * ✏️ Redirige vers le formulaire de modification
     */
    edit(user: User) {
        if (user.idUser) {
            this.router.navigate(['/users/edit', user.idUser]);
        }
    }

    /**
     * 🗑️ Supprime un utilisateur après confirmation avec MatDialog
     */
    remove(user: User) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Confirmation',
                message: `Voulez-vous vraiment supprimer ${user.name} ${user.prename} ?`,
                confirmText: 'Supprimer',
                cancelText: 'Annuler'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === true) {
                this.userService.removeUser(user.idUser);
                this.snackBar.open(`✅ Utilisateur supprimé`, 'Fermer', { duration: 3000 });
                console.warn('🗑️ Supprimé :', user);
            }
        });
    }

    setAccess(user: User) {
        const dialogRef = this.dialog.open(UserCredentialsComponent, {
            width: '400px',
            data: { idUser: user.idUser }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.userService.refreshUser(user.idUser);
                this.snackBar.open('✅ Accès utilisateur créé', 'Fermer', { duration: 3000 });
            }
        });
    }
}
