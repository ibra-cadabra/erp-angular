// ✅ depot-dashboard.component.ts : Composant Angular principal de gestion du dépôt

import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatTableDataSource } from '@angular/material/table';
import { DepotService } from '../../../services/depot.service';
import {
    AttributionService,
    AttributionHistory,
    CurrentAttribution,
    AttributionPayload
} from '../../../services/attribution.service';
import { UserService } from '../../../services/user.service';
import { DepotContextService } from '../../../services/depotContexteService';
import { AttributionDialogComponent } from '../attribution-dialog/attribution-dialog.component';
import { User } from '../../../models/user.model';
import { Depot } from '../../../models/depot.model';
import { MaterialModule } from '../../../modules/material.module';
import {MatSnackBar} from "@angular/material/snack-bar";
import {AuthService} from "../../../services/auth.service";
import {AlertService} from "../../../services/alert.service";

@Component({
    selector: 'app-depot-dashboard',
    standalone: true,
    imports: [CommonModule, MaterialModule, FormsModule, MatButton],
    templateUrl: './depot-dashboard.component.html',
    styleUrls: ['./depot-dashboard.component.scss']
})
export class DepotDashboardComponent implements OnInit {
    protected depotService = inject(DepotService);
    protected attributionService = inject(AttributionService);
    protected userService = inject(UserService);
    private depotContext = inject(DepotContextService);
    private dialog = inject(MatDialog);
    private snackBar = inject(MatSnackBar);
    private auth = inject(AuthService);
    alertService = inject(AlertService);

    dataSource = new MatTableDataSource<AttributionHistory>();

    depotId = signal<number | null>(null);
    selectedTechId = signal<number | null>(null);
    selectedDate = signal<string | null>(null);

    readonly techniciens = computed(() => this.depotService.resources().technicians);
    readonly materiels = computed(() => this.depotService.resources().materials);
    readonly consumables = computed(() => this.depotService.resources().consumables);
    readonly vehicules = computed(() => this.depotService.resources().vehicules);

    readonly filteredHistory = computed(() => {
        return this.attributionService.history().filter(entry => {
            const matchTech = !this.selectedTechId() || entry.technicianId === this.selectedTechId();
            const matchDate = !this.selectedDate() || new Date(entry.date).toISOString().startsWith(this.selectedDate()!);
            return matchTech && matchDate;
        });
    });

    readonly ressourcesAttribuees = computed(() =>
        this.attributionService.currentAttributions().filter(attr =>
            !this.selectedTechId() || attr.technicianId === this.selectedTechId()
        )
    );

    depot: Depot | null = null;

    constructor() {
        const id = this.depotContext.idDep();
        this.depot = this.depotService.depots().find(d => d.idDep === id) || null;

        if (this.depot?.idDep) {
            this.depotId.set(this.depot.idDep);
            this.depotService.getDepotResources(this.depot.idDep);
            this.attributionService.fetchHistory(String(this.depot.idDep));
            this.attributionService.fetchCurrentAttributions(this.depot.idDep);

            // 🌀 Met à jour automatiquement le tableau selon les filtres
            effect(() => {
                const data = this.attributionService.history().filter(entry => {
                    const matchTech = !this.selectedTechId() || entry.technicianId === this.selectedTechId();
                    const matchDate = !this.selectedDate() || new Date(entry.date).toISOString().startsWith(this.selectedDate()!);
                    return matchTech && matchDate;
                });
                this.dataSource.data = data;
            });
        }
    }

    ngOnInit(): void {
        this.alertService.fetchLowStockConsumables();
    }
    alerts = computed(() => this.alertService.lowStockConsumables());

    onSelectTech(id: number | null) {
        this.selectedTechId.set(id);
    }

    onDateChange(event: Event) {
        const input = event.target as HTMLInputElement;
        this.selectedDate.set(input.value);
    }

    openAttributionDialog(tech: User) {
        const idDep = this.depotId();
        if (!idDep) return;

        this.depotService.getDepotResources$(idDep).subscribe(resources => {
            const dialogRef = this.dialog.open(AttributionDialogComponent, {
                width: '600px',
                data: {
                    technician: tech,
                    depotMaterials: resources.materials,
                    depotTechnicians: resources.technicians,
                    depotConsumables: resources.consumables
                },
                disableClose: true,
                autoFocus: false
            });

            dialogRef.afterClosed().subscribe(result => {
                if (result === true && this.depotId()) {
                    this.attributionService.fetchHistory(String(this.depotId()));
                    this.attributionService.fetchCurrentAttributions(this.depotId()!);
                    this.depotService.getDepotResources(idDep);
                }
            });
        });
    }

    getResourceLabel(row: any): string {
        const res = this.depotService.resources();

        if (row.resourceType === 'vehicule') {
            const veh = res.vehicules.find(v => v._id === row.resourceId);
            return veh ? `🚗 ${veh.registrationPlate}` : '🚗 Inconnu';
        }
        if (row.resourceType === 'materiel') {
            const mat = res.materials.find(m => m._id === row.resourceId);
            return mat ? `🛠️ ${mat.name}` : '🛠️ Inconnu';
        }
        if (row.resourceType === 'consommable') {
            const cons = res.consumables.find(c => c._id === row.resourceId);
            return cons ? `📦 ${cons.name}` : '📦 Inconnu';
        }

        return '❓ Inconnu';
    }

    retirerRessource(res: CurrentAttribution) {
        const payload: AttributionPayload = {
            resourceType: res.resourceType,
            resourceId: res.resourceId.toString(),
            technicianId: res.technicianId,
            depotId: this.depotId()!,
            createdBy: this.auth.getCurrentUser()?.idUser ?? 0,
            quantity: res.quantity ?? 1,
            action: 'reprise' as const
        };

        if (confirm('❓ Confirmer la reprise de cette ressource ?')) {
            this.attributionService.retrieveResource(payload).subscribe({
                next: () => {
                    this.attributionService.fetchCurrentAttributions(this.depotId()!);
                    this.attributionService.fetchHistory(this.depotId()!);
                },
                error: (err) => console.error('Erreur reprise :', err)
            });
        }
    }

    trackById(index: number, item: any): any {
        return item?.idUser || item?._id || index;
    }


}
