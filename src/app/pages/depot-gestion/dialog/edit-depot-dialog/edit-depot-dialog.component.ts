// ✅ EditDepotDialogComponent (src/app/pages/depot-gestion/edit-depot-dialog/edit-depot-dialog.component.ts)
import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MaterialModule} from '../../../../modules/material.module';
import {DepotService} from '../../../../services/depot.service';

@Component({
    selector: 'app-edit-depot-dialog',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MaterialModule],
    templateUrl: './edit-depot-dialog.component.html'
})
export class EditDepotDialogComponent {
    form: FormGroup;

    constructor(
        private fb: FormBuilder,
        private depotService: DepotService,
        public dialogRef: MatDialogRef<EditDepotDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { idDep: number, name: string }
    ) {
        this.form = this.fb.group({
            name: [data.name, Validators.required]
        });
    }

    save() {
        if (this.form.invalid) return;
        this.depotService.updateDepot(this.data.idDep, this.form.value).subscribe(() => {
            this.dialogRef.close(true);
        });
    }
} 