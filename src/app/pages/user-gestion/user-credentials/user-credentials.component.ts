import {Component, Inject, inject} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {CommonModule} from '@angular/common';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {UserService} from '../../../services/user.service';

@Component({
    selector: 'app-user-credentials',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatInputModule,
        MatButtonModule,
        MatSnackBarModule
    ],
    templateUrl: './user-credentials.component.html'
})
export class UserCredentialsComponent {
    form: FormGroup;
    private fb = inject(FormBuilder);
    private userService = inject(UserService);
    private snackBar = inject(MatSnackBar);
    private dialogRef = inject(MatDialogRef<UserCredentialsComponent>);

    constructor(@Inject(MAT_DIALOG_DATA) public data: { idUser: number }) {
        this.form = this.fb.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
    }

    submit() {
        if (this.form.invalid) return;

        const {username, password} = this.form.value;

        this.userService.giveAccess(this.data.idUser, {username, password}).subscribe({
            next: () => {
                this.snackBar.open('✅ Accès créé avec succès', 'Fermer', {duration: 3000});
                this.dialogRef.close(true);
            },
            error: err => {
                const msg =
                    err.status === 409
                        ? '⛔ Nom d’utilisateur déjà pris'
                        : '❌ Erreur lors de la création des accès';
                this.snackBar.open(msg, 'Fermer', {duration: 3000});
            }
        });
    }

    cancel() {
        this.dialogRef.close();
    }
}
