import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {DepotService} from '../../../services/depot.service';
import {AuthService} from '../../../services/auth.service';
import {VehiculeService} from '../../../services/vehicule.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {User} from '../../../models/user.model';
import {Vehicule} from '../../../models/vehicule.model';
import {MaterialModule} from "../../../modules/material.module";
import {CommonModule, NgFor} from "@angular/common";
import {DepotContextService} from '../../../services/depotContexteService';

@Component({
    selector: 'app-vehicule-attribution',
    standalone: true,
    imports: [MaterialModule, NgFor, CommonModule],
    templateUrl: './vehicule-attribution.component.html',
    styleUrls: ['./vehicule-attribution.component.scss']
})
export class VehiculeAttributionComponent implements OnInit {
    depotId = signal<number | null>(null);
    private depotService = inject(DepotService);
    technicians = computed(() => this.depotService.resources().technicians);
    vehicules = computed(() => this.depotService.resources().vehicules);
    private vehiculeService = inject(VehiculeService);
    private auth = inject(AuthService);
    private snackBar = inject(MatSnackBar);
    private depotContext = inject(DepotContextService);

    ngOnInit(): void {
        const contextId = this.depotContext.idDep();
        const userIdDep = this.auth.user()?.idDep;

        const idDepToUse = contextId ?? userIdDep;
        if (idDepToUse) {
            this.depotId.set(idDepToUse);
            this.depotService.getDepotResources(idDepToUse);
        } else {
            console.warn('❗ Aucun idDep trouvé pour charger les ressources');
        }
    }

    // ✅ Attribuer un véhicule
    attribuerVehicule(vehicule: Vehicule, tech: User) {
        const currentUser = this.auth.user();
        this.vehiculeService.assignVehicule({
            _id: vehicule._id,
            idTec: tech.idUser!,
            idDep: null,  // on n'a pas besoin de préciser ici, le backend mettra `idDep = null`
            createdBy: currentUser!.idUser

        }).subscribe({
            next: () => {
                this.snackBar.open('✅ Véhicule attribué', 'Fermer', {duration: 3000});
                this.refreshData();
            },
            error: err => {
                console.error('❌ Erreur attribution', err);
                this.snackBar.open('❌ Erreur attribution', 'Fermer', {duration: 3000});
            }
        });
    }

    // ♻️ Rétracter un véhicule
    reprendreVehicule(vehicule: Vehicule) {
        const idDep = this.depotId();
        const currentUser = this.auth.user();
        if (!idDep) return;

        this.vehiculeService.assignVehicule({
            _id: vehicule._id,
            idTec: null,
            idDep: idDep,
            createdBy: currentUser!.idUser
        }).subscribe({
            next: () => {
                this.snackBar.open('♻️ Véhicule repris', 'Fermer', {duration: 3000});
                this.refreshData();
            },
            error: err => {
                console.error('❌ Erreur reprise', err);
                this.snackBar.open('❌ Erreur reprise', 'Fermer', {duration: 3000});
            }
        });
    }

    // Vérifie si le technicien a un véhicule
    hasVehicule(tech: User): Vehicule | null {
        return this.vehicules().find(v => v.idTec === tech.idUser) || null;
    }

    // Nom du technicien assigné
    getNomTechnicien(idTec: number | null): string {
        const tech = this.technicians().find(t => t.idUser === idTec);
        return tech ? `${tech.prename} ${tech.name}` : 'Non attribué';
    }

    getVehiculesDisponibles(): Vehicule[] {
        return this.vehicules().filter(v => !v.idTec);
    }

    vehiculeAffecte(tech: User): Vehicule | null {
        return this.vehicules().find(v => v.idTec === tech.idUser) || null;
    }

    private refreshData() {
        const id = this.depotId();
        if (id) this.depotService.getDepotResources(id);
    }
}
