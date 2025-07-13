import {Component, computed, effect, inject, OnInit, signal, ViewChild} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {DepotService} from '../../../services/depot.service';
import {UserService} from '../../../services/user.service';
import {AttributionHistory, AttributionService} from '../../../services/attribution.service';
import {MaterialService} from '../../../services/material.service';
import {VehiculeService} from '../../../services/vehicule.service';
import {ConsumableService} from '../../../services/consumable.service';
import {toSignal} from '@angular/core/rxjs-interop';
import {MaterialModule} from "../../../modules/material.module";

@Component({
    selector: 'app-admin-attribution-history',
    standalone: true,
    templateUrl: './admin-attribution-history.component.html',
    styleUrls: ['./admin-attribution-history.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MaterialModule,
        MatTableModule,
        MatPaginatorModule
    ]
})
export class AdminAttributionHistoryComponent implements OnInit {
    // 📊 Filtres réactifs
    depotCtrl = new FormControl<number | null>(null);
    authorCtrl = new FormControl<number | null>(null);
    dateCtrl = new FormControl<string>('');
    // 🔁 Signaux liés aux filtres
    depotSignal = toSignal(this.depotCtrl.valueChanges, {initialValue: null});
    authorSignal = toSignal(this.authorCtrl.valueChanges, {initialValue: null});
    dateSignal = toSignal(this.dateCtrl.valueChanges, {initialValue: ''});
    // ✅ Liste filtrée automatiquement
    filteredHistory = computed(() => {
        const depotId = this.depotSignal();
        const authorId = this.authorSignal();
        const dateStr = this.dateSignal()?.trim();

        return this.history().filter(h => {
            const matchDepot = !depotId || h.depotId === depotId;
            const matchAuthor = !authorId || h.createdBy === authorId;
            const matchDate = !dateStr || h.date.toString().startsWith(dateStr);
            return matchDepot && matchAuthor && matchDate;
        });
    });
    // 📊 Table Angular Material
    dataSource = signal(new MatTableDataSource<AttributionHistory>([]));
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    // 🧱 Colonnes affichées
    readonly displayedColumns = ['date', 'type', 'nom', 'qte', 'tech', 'auteur', 'action', 'depot'];
    protected userService = inject(UserService);
    getUsers = this.userService.users;
    // 🧩 Injection des services
    private attributionService = inject(AttributionService);
    // 📥 Chargement
    loading = this.attributionService.loading;
    // 📜 Données d’historique des attributions (signal)
    history = this.attributionService.history;
    private depotService = inject(DepotService);
    // 🔁 Getters pour les filtres
    getDepots = this.depotService.depots;
    private materialService = inject(MaterialService);
    private vehiculeService = inject(VehiculeService);
    private consumableService = inject(ConsumableService);

    constructor() {
        // ⛓️ Synchronisation signal -> dataSource
        effect(() => {
            const rows = this.filteredHistory();
            const source = this.dataSource();
            source.data = rows;
        });
    }

    ngOnInit(): void {
        this.depotService.loadDepotsIfEmpty();
        this.userService.loadUsers();
        this.materialService.getAllMaterials();
        this.vehiculeService.loadVehicules();
        this.consumableService.loadConsumables();
        this.attributionService.fetchGlobalHistory();


    }

    // 📦 Pagination activée après le rendu
    ngAfterViewInit(): void {
        this.dataSource().paginator = this.paginator;
    }

    // ↩️ Réinitialise les filtres
    resetFilters() {
        this.depotCtrl.setValue(null);
        this.authorCtrl.setValue(null);
        this.dateCtrl.setValue('');
    }

    // 📋 Affiche le nom de la ressource en fonction du type
    getResourceName(h: AttributionHistory): string {
        if (h.resourceType === 'vehicule') {
            return this.vehiculeService.vehicules().find(v => v._id === h.resourceId)?.brand ?? '(véhicule inconnu)';
        }
        if (h.resourceType === 'materiel') {
            return this.materialService.materials().find(m => m._id === h.resourceId)?.name ?? '(matériel inconnu)';
        }
        if (h.resourceType === 'consommable') {
            return this.consumableService.consumables().find(c => c._id === h.resourceId)?.name ?? '(consommable inconnu)';
        }
        return '(inconnu)';
    }

    // 📤 Export CSV avec noms complets
    exportCSV() {
        const rows: Record<string, string | number>[] = this.filteredHistory().map(h => {
            const author = this.userService.getUserFromSignal(h.createdBy);
            const tech = this.userService.getUserFromSignal(h.technicianId);
            return {
                'Date': new Date(h.date).toLocaleString(),
                'Type': h.resourceType,
                'Nom ressource': this.getResourceName(h),
                'Quantité': h.quantity ?? '',
                'Technicien': tech ? `${tech.prename} ${tech.name}` : h.technicianId,
                'Auteur': author ? `${author.prename} ${author.name}` : h.createdBy,
                'Dépôt': h.depotId,
                'Action': h.action
            };
        });

        const headers = [
            'Date', 'Type', 'Nom ressource', 'Quantité', 'Technicien', 'Auteur', 'Dépôt', 'Action'
        ] as const;

        const csv = [
            headers.join(';'),
            ...rows.map(row =>
                headers.map(key => `"${row[key]}"`).join(';')
            )
        ].join('\n');

        const blob = new Blob([csv], {type: 'text/csv'});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'historique-attributions.csv';
        link.click();
    }
}
