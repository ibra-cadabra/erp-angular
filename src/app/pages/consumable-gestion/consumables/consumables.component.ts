// consumables.component.ts
import {Component, effect, OnInit, signal, Signal, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from "@angular/material/dialog";
import {MatSort} from "@angular/material/sort";
import {MatPaginator} from "@angular/material/paginator";
import {MatTableDataSource} from "@angular/material/table";
import {map, Observable, startWith} from 'rxjs';

import {Consumable} from '../../../models/consumable.model';
import {Depot} from '../../../models/depot.model';

import {ConsumableService} from '../../../services/consumable.service';
import {DepotService} from '../../../services/depot.service';
import {AuthService} from "../../../services/auth.service";

import {MaterialModule} from '../../../modules/material.module';
import {ConfirmDialog} from '../../features/confirmDialog';

@Component({
    selector: 'app-consumables',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, MaterialModule],
    templateUrl: './consumables.component.html',
    styleUrls: ['./consumables.component.scss']
})
export class ConsumablesComponent implements OnInit {
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    // Formulaire de création/modification
    form: FormGroup;

    // Liste des noms pour l'autocomplete
    names: string[] = [];

    // Filtres dynamiques
    filteredNames!: Observable<string[]>;

    // Signaux
    readonly consumables: Signal<Consumable[]>;
    readonly depots: Signal<Depot[]>;

    // DataSource pour le tableau
    dataSource = new MatTableDataSource<Consumable>([]);
    displayedColumns = ['name', 'stock', 'idDep', 'actions'];

    // Pour savoir si on est en mode édition
    editingId = signal<number | null>(null);

    constructor(
        private fb: FormBuilder,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private depotService: DepotService,
        private consumableService: ConsumableService,
        private authService: AuthService
    ) {
        this.consumables = this.consumableService.consumables;
        this.depots = this.depotService.depots;

        this.form = this.fb.group({
            name: ['', Validators.required],
            quantity: ['', [Validators.required, Validators.min(1)]],
            unitPrice: '',
            idDep: ['', Validators.required]
        });

        // AutoComplete dynamique sur le champ "name"
        this.filteredNames = this.form.get('name')!.valueChanges.pipe(
            startWith(''),
            map(value => this._filter(typeof value === 'string' ? value : ''))
        );

        // Met à jour la table dès que les données changent
        effect(() => {
            const list = this.consumables();
            this.dataSource.data = list;
            this.names = list.map(c => c.name || '').filter(n => !!n); // sécurité
        });
    }

    ngOnInit(): void {
        this.depotService.fetchDepots();
        this.consumableService.loadConsumables();

        this.dataSource.filterPredicate = (data: Consumable, filter: string) => {
            const search = filter.toLowerCase().trim();
            return (
                (data.name?.toLowerCase().includes(search)) ||
                (data.quantity?.toString().includes(search))
            );
        };
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    applyFilter(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.dataSource.filter = value.trim().toLowerCase();
    }

    getDepotName(idDep: number): string {
        const depot = this.depots()?.find(d => d.idDep === idDep);
        return depot?.name || 'Inconnu';
    }

    submit() {
        if (this.form.invalid) return;

        const editing = this.editingId();
        const formValue = this.form.value;

        if (editing !== null) {
            this.consumableService.updateConsumable(editing, formValue);
            this.snackBar.open('Consommable mis à jour ✅', 'Fermer', {duration: 3000});
        } else {
            const currentUser = this.authService.getCurrentUser();
            const payload = {
                ...formValue,
                createdBy: currentUser?.idUser ?? 0
            };
            this.consumableService.addConsumable(payload);
            this.snackBar.open('Consommable ajouté ✅', 'Fermer', {duration: 3000});
        }

        this.form.reset();
        this.form.markAsPristine();
        this.form.markAsUntouched();
        this.editingId.set(null);
    }

    edit(consumable: Consumable) {
        this.form.patchValue(consumable);
        this.editingId.set(consumable.idCons);
    }

    cancelEdit() {
        this.form.reset();
        this.editingId.set(null);
    }

    removeConsumable(id: number) {
        const dialogRef = this.dialog.open(ConfirmDialog);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.consumableService.deleteConsumable(id);
                this.snackBar.open('Consommable supprimé 🗑️', 'Fermer', {duration: 3000});
            }
        });
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.names.filter(name => name.toLowerCase().includes(filterValue));
    }
}
