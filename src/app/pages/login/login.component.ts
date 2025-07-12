// login.component.ts
import {Component} from '@angular/core';
import {FormBuilder, Validators, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CommonModule} from '@angular/common';
import {MaterialModule} from '../../modules/material.module';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        MaterialModule,
        ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
    form: FormGroup;
    isLoading = false;
    error!: Error;
    loginError: any;

    constructor(
        private fb: FormBuilder,
        private auth: AuthService,
        private snackBar: MatSnackBar
    ) {
        this.form = this.fb.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
    }

    submit() {
        if (this.form.invalid || this.isLoading) return;

        this.isLoading = true;
        const credentials = this.form.value;

        this.auth.login(credentials).subscribe({
            next: () => {
                this.snackBar.open('✅ Connexion réussie', 'Fermer', {duration: 3000});
                this.isLoading = false;

                // 👇 Redirection centralisée ici
                this.auth.redirectBasedOnRole();
            },
            error: (err) => {
                this.snackBar.open(err.error?.message || '⛔ Identifiants incorrects', 'Fermer', {
                    duration: 3000
                });
                this.isLoading = false;
            }
        });
    }
}
