import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UserService} from '../../../services/user.service';
import {VehiculeService} from '../../../services/vehicule.service';
import {MaterialService} from '../../../services/material.service';
import {AttributionService} from '../../../services/attribution.service';
import {DepotService} from '../../../services/depot.service';
import {User} from '../../../models/user.model';
import {ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';
import {DepotContextService} from "../../../services/depotContexteService";
import {MaterialModule} from "../../../modules/material.module";

@Component({
    selector: 'app-admin-depot',
    standalone: true,
    imports: [
        MaterialModule,
        CommonModule,
        RouterOutlet,
        ReactiveFormsModule,
        RouterLink,
        RouterLinkActive
    ],
    templateUrl: './admin-depot-layout.component.html',
    styleUrls: ['./admin-depot-layout.component.css']
})
export class AdminDepotLayoutComponent implements OnInit {
    readonly techniciens = signal<User[]>([]);
    depotId = signal<number | null>(null);
    private userService = inject(UserService);
    private vehiculeService = inject(VehiculeService);
    readonly vehicules = this.vehiculeService.vehicules;
    private materialService = inject(MaterialService);
    private attributionService = inject(AttributionService);
    private depotService = inject(DepotService);

    constructor(
        private route: ActivatedRoute,
        private depotContext: DepotContextService) {
        this.loadData();
    }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            const id = parseInt(params['idDep'], 10);
            if (!isNaN(id)) {
                this.depotId.set(id);
                this.depotContext.setDepot(id);
            }
        });
    }

    loadData() {
        this.userService.loadUsers();
        this.vehiculeService.loadVehicules();
        this.materialService.getAllMaterials();

        this.depotService.getMyDepot().subscribe(depot => {
            if (!depot?.idDep) return;

            const idDep = depot.idDep;
            this.depotId.set(idDep);

            const techs = this.userService.users().filter(u => u.idDep === idDep && u.role === 'technicien');
            this.techniciens.set(techs);

            this.depotService.getDepotResources(idDep);
            this.attributionService.fetchHistory(idDep.toString());
        });
    }

    /*
    openAttributionDialog(technicien: any) {
        this.dialog.open(AttributionDialogComponent, {
            data: {technicien}
        });
    }

    getResourceLabel(resourceType: string): string {
        switch (resourceType) {
            case 'material':
                return 'Matériel';
            case 'consumable':
                return 'Consommable';
            case 'vehicule':
                return 'Véhicule';
            default:
                return resourceType;
        }
    }

    getActionLabel(action: string): string {
        return action === 'assign' ? 'Attribué' : 'Retiré';
    }

     */
}
