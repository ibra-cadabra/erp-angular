// attribution-dialog.component.ts
import {Component, Inject, OnInit, signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MaterialModule} from '../../../modules/material.module';
import {CommonModule, NgFor} from '@angular/common';
import {AttributionPayload, AttributionService, ResourceType} from '../../../services/attribution.service';
import {firstValueFrom} from 'rxjs';
import {User} from '../../../models/user.model';
import {Depot} from "../../../models/depot.model";
import {AuthService} from "../../../services/auth.service";

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
    depot: Depot | null | undefined;
    depotId = signal<number | null>(null);

    tecData!: User;

    constructor(protected dialogRef: MatDialogRef<AttributionDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any,
                private fb: FormBuilder,
                private authService: AuthService,
                private attributionService: AttributionService,
                private snackBar: MatSnackBar
    ) {
        const t = this.data.technician;
        console.log(t);
    }

    get materialsArray(): FormArray {
        return this.form.get('materials') as FormArray;
    }

    get consumablesArray(): FormArray {
        return this.form.get('consumables') as FormArray;
    }

    ngOnInit(): void {
        this.tecData = this.data.technician;
        this.depotMaterials = this.data.depotMaterials ?? [];
        this.depotConsumables = this.data.depotConsumables ?? [];

        console.log('🧪 Matériels dans la modale :', this.depotMaterials);
        console.log('🧪 Consommables dans la modale :', this.depotConsumables);

        this.form = this.fb.group({
            materials: this.fb.array([]),
            consumables: this.fb.array([])
        });

        this.depotMaterials.forEach(() => {
            (this.form.get('materials') as FormArray).push(this.fb.group({quantity: [0]}));
        });

        this.depotConsumables.forEach(() => {
            (this.form.get('consumables') as FormArray).push(this.fb.group({quantity: [0]}));
        });
    }

    submit(action: 'assign' | 'retrieve') {
        if (this.form.invalid) return;
        const backendAction = action === 'assign' ? 'attribution' : 'reprise';

        // Fonction utilitaire pour construire les payloads de manière sécurisée
        const buildPayloads = (resources: any[], controls: any[], resourceType: string) => {
            const arr: AttributionPayload[] = [];
            const currentUser = this.authService.getCurrentUser();
            const userId = currentUser?.idUser;


            for (let i = 0; i < controls.length; i++) {
                const resource = resources[i];
                const quantity = controls[i].get('quantity')?.value;

                if (resource && quantity > 0) {
                    arr.push({
                        resourceType: resourceType as ResourceType, // ✅ correction ici
                        resourceId: resource._id,
                        technicianId: this.tecData.idUser!,
                        quantity,
                        depotId: this.tecData.idDep!,
                        createdBy: userId!,
                        action: backendAction
                    });
                }
            }
            return arr;
        };

        const payloads = [
            ...buildPayloads(this.depotMaterials, this.materialsArray.controls, 'materiel'),
            ...buildPayloads(this.depotConsumables, this.consumablesArray.controls, 'consommable')
        ];

        if (payloads.length === 0) {
            this.snackBar.open('Aucune quantité sélectionnée.', 'Fermer', {duration: 3000});
            return;
        }

        const serviceCalls = payloads.map(payload =>
            action === 'assign'
                ? this.attributionService.assignResource(payload)
                : this.attributionService.retrieveResource(payload)
        );

        console.log('Payloads envoyés au backend:', payloads);

        Promise.all(serviceCalls.map(obs => firstValueFrom(obs)))
            .then(() => {
                this.snackBar.open(
                    action === 'assign' ? 'Attribution réussie.' : 'Matériel repris.',
                    'Fermer',
                    {duration: 3000}
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
