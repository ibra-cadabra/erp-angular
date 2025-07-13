// delete-depot-dialog
import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../../../services/auth.service';
import {DepotService} from '../../../../services/depot.service';
import {MaterialModule} from '../../../../modules/material.module';
import {CommonModule} from '@angular/common';

@Component({
    selector: 'app-delete-depot-dialog',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MaterialModule],
    templateUrl: './delete-depot-dialog.component.html'
})
export class DeleteDepotDialogComponent {

    form: FormGroup;
    error = '';

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<DeleteDepotDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { idDep: number },
        private auth: AuthService,
        private depotService: DepotService
    ) {
        this.form = this.fb.group({
            password: ['', Validators.required]
        });
    }

    confirm() {
        const password = this.form.value.password;
        this.auth.verifyPassword(password).subscribe({
            next: () => {
                this.depotService.deleteDepot(this.data.idDep.toString()).subscribe(() => {
                    this.dialogRef.close(true);
                });
            },
            error: () => {
                this.error = '⛔ Mot de passe incorrect';
            }
        });
    }
}
