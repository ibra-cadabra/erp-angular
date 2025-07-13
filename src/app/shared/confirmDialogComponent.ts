// ✅ ConfirmDialogComponent : composant de confirmation réutilisable

import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CommonModule} from '@angular/common';
import {MaterialModule} from "../modules/material.module";

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [CommonModule, MaterialModule],
    template: `
        <h2 mat-dialog-title>{{ data.title }}</h2>
        <mat-dialog-content>{{ data.message }}</mat-dialog-content>
        <mat-dialog-actions align="end">
            <button mat-button mat-dialog-close>{{ data.cancelText || 'Annuler' }}</button>
            <button mat-raised-button color="warn" [mat-dialog-close]="true">
                {{ data.confirmText || 'Supprimer' }}
            </button>
        </mat-dialog-actions>
    `
})
export class ConfirmDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<ConfirmDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: {
            title?: string,
            message?: string,
            confirmText?: string,
            cancelText?: string
        }
    ) {
    }
}
