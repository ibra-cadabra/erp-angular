// consommable ts
import { Component, signal, effect, OnInit, ViewChild, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Consumable } from '../../../models/consumable.model';
import { ConsumableService } from '../../../services/consumable.service';
import { MaterialModule } from '../../../modules/material.module';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { map, Observable, startWith } from 'rxjs';
import { ConfirmDialog } from '../../tools/features/confirmDialog';
import { Depot } from '../../../models/depot.model';
import { DepotService } from '../../../services/depot.service';

@Component({
  selector: 'app-consumables',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule, FormsModule, MaterialModule],
  templateUrl: './consumables.component.html',
  styleUrls: ['./consumables.component.css']
})
export class ConsumablesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  form: FormGroup;
  editingId = signal<number | null>(null);
  names: string[];

  readonly depots: Signal<Depot[]>;
  readonly consumables : Signal<Consumable[]>;
  filteredNames: Observable<string[]>;

  dataSource = new MatTableDataSource<Consumable>([]);
  displayedColumns = ['name', 'stock', 'idDep', 'actions'];

  constructor(
    private dialog: MatDialog,
    private depotService:  DepotService,
    private consumableService: ConsumableService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder )
    {
      this.consumables = this.consumableService.consumables;
      this.depots = this.depotService.depots;
      this.names = this.consumableService.consumables().map(consumable => consumable.name);
      this.form = this.fb.group({
        name: ['', Validators.required],
        unitPrice: '',
        idDep: ['', [Validators.required]],
        quantity: ['', [Validators.required, Validators.min(1)]],
      });
      this.filteredNames = this.form.get('name')!.valueChanges.pipe(
        startWith(''),
        map(value => this._filter(value || ''))
      );
      effect(() => {
        const list = this.consumables();
        this.dataSource.data = list;
        this.names = list.map(c => c.name);
        if (this.dataSource.paginator) {
          this.dataSource.paginator.firstPage(); // revient à la première page si nécessaire
        }
      });
  }
  ngOnInit(): void {
    this.depotService.fetchDepots();
    this.consumableService.loadConsumables();
    this.dataSource.filterPredicate = (data: Consumable, filter: string): boolean => {
      const search = filter.trim().toLowerCase();
      return (
        ((data.name || '').toLowerCase().includes(search)) ||
        ((data.quantity || '').toString().includes(search)));
    };
  }
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.names
      .filter((name): name is string => typeof name === 'string')
      .filter(name => name.toLowerCase().includes(filterValue));
  }
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = value;
  }
  submit() {
    if (this.form.invalid) return;
    const formValue = this.form.value;
    const editing = this.editingId();

    if (editing !== null) {
      this.consumableService.updateConsumable(editing, formValue);
      this.snackBar.open('Consommable mis à jour ✅', 'Fermer', { duration: 3000 });
    } else {
      this.consumableService.addConsumable(formValue);
      this.snackBar.open('Consommable ajouté ✅', 'Fermer', { duration: 3000 });
    }
    this.form.reset();
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.editingId.set(null);
  }
  edit(consumable: Consumable) {
    console.log(consumable);
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
        this.snackBar.open('Consommable supprimé 🗑️', 'Fermer', { duration: 3000 });
      }
    });
  }
}
