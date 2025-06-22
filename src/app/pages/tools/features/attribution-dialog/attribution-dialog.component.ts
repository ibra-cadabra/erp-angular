import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../../../modules/material.module';
import { CommonModule, NgFor } from '@angular/common';
import { AttributionService } from '../../../../services/attribution.service';
import { firstValueFrom } from 'rxjs';
import { User } from '../../../../models/user.model';

@Component({
  selector: 'app-attribution-dialog',
  imports: [MaterialModule, ReactiveFormsModule, NgFor, CommonModule],
  templateUrl: './attribution-dialog.component.html',
  styleUrls: ['./attribution-dialog.component.css']
})
export class AttributionDialogComponent implements OnInit {

  form!: FormGroup;
  depotMaterials: any[] = [];
  depotConsumables: any[] = [];

  tecData!: User;

  constructor(
    private dialogRef: MatDialogRef<AttributionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private attributionService: AttributionService,
    private snackBar: MatSnackBar
  ) {
    const t = this.data.technician;
    console.log(t);
  }

  ngOnInit(): void {
    this.tecData = this.data.technician;
    this.depotMaterials = this.data.depotMaterials || [];
    this.depotConsumables = this.data.depotConsumables || [];
    console.log(this.tecData);

    this.form = this.fb.group({
      materials: this.fb.array([]),
      consumables: this.fb.array([])
    });

    this.depotMaterials.forEach(() => {
      (this.form.get('materials') as FormArray).push(
        this.fb.group({ quantity: [0] })
      );
    });

    this.depotConsumables.forEach(() => {
      (this.form.get('consumables') as FormArray).push(
        this.fb.group({ quantity: [0] })
      );
    });
  }

  get materialsArray(): FormArray {
    return this.form.get('materials') as FormArray;
  }

  get consumablesArray(): FormArray {
    return this.form.get('consumables') as FormArray;
  }

  submit(action: 'assign' | 'retrieve') {
    if (this.form.invalid) return;
    const backendAction = action === 'assign' ? 'assign' : 'retrieve';
  
    // Fonction utilitaire pour construire les payloads de manière sécurisée
    const buildPayloads = (resources: any[], controls: any[], resourceType: string) => {
      const arr: { resourceType: string; resourceId: any; technicianId: number; quantity: any; depotId: number | undefined; performedBy: string; action: string; }[] = [];
      if (!resources) {
        console.warn(`Resources undefined for type ${resourceType}`);
        return arr;
      }
      if (resources.length !== controls.length) {
        console.warn(`Mismatch length for ${resourceType}: resources=${resources.length}, controls=${controls.length}`);
      }
      for (let i = 0; i < controls.length; i++) {
        const resource = resources[i];
        if (!resource) {
          console.warn(`No resource found at index ${i} for type ${resourceType}`);
          continue;
        }
        const quantity = controls[i].get('quantity')?.value;
        if (quantity > 0) {
          arr.push({
            resourceType,
            resourceId: resource._id,
            technicianId: this.tecData.idUser!,
            quantity,
            depotId: this.tecData.idDep,
            performedBy: 'admin',
            action: backendAction
          });
        }
      }
      return arr;
    };
  
    const payloads = [
      ...buildPayloads(this.depotMaterials, this.materialsArray.controls, 'material'),
      ...buildPayloads(this.depotConsumables, this.consumablesArray.controls, 'consumable')
    ];
  
    if (payloads.length === 0) {
      this.snackBar.open('Aucune quantité sélectionnée.', 'Fermer', { duration: 3000 });
      return;
    }
  
    const serviceCalls = payloads.map(payload =>
      action === 'assign'
        ? this.attributionService.assignMaterial(payload)
        : this.attributionService.retrieveMaterial(payload)
    );

    console.log('Payloads envoyés au backend:', payloads);

    Promise.all(serviceCalls.map(obs => firstValueFrom(obs)))
      .then(() => {
        this.snackBar.open(
          action === 'assign' ? 'Attribution réussie.' : 'Matériel repris.',
          'Fermer',
          { duration: 3000 }
        );
        this.dialogRef.close(true);
      })
      .catch(err => {
        console.error('Erreur:', err);
        this.snackBar.open('Une erreur est survenue.', 'Fermer', {
          duration: 3000
        });
      });
  }
  
  hasQuantities(): boolean {
    return [...this.materialsArray.controls, ...this.consumablesArray.controls].some(ctrl =>
      ctrl.get('quantity')?.value > 0
    );
  }
  
}
