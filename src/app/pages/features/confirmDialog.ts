import {Component} from "@angular/core";
import {MaterialModule} from "../../modules/material.module";

@Component({
    selector: 'confirm-dialog',
    template: `
    <h1 mat-dialog-title>Supprimer</h1>
    <div mat-dialog-content>Confirmer la suppression ?</div>
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="true">Supprimer</button>
    </div>
  `,
    standalone: true,
    imports: [MaterialModule]
})
export class ConfirmDialog {
}

