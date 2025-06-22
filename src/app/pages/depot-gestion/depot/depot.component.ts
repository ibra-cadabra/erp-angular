import { Component, effect, OnInit, Signal, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MaterialService } from '../../../services/material.service';
import { MatTableDataSource } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../modules/material.module';
import { Material } from '../../../models/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'app-depot',
  standalone: true,
  templateUrl: './depot.component.html',
  styleUrls: ['./depot.component.css'],
  imports: [RouterModule, CommonModule, ReactiveFormsModule, MaterialModule]
})
export class DepotComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  names: string[] = [];
  filteredNames: Observable<string[]>;
  depotId!: number;
  editingId = signal<number | null>(null);

  editForm: FormGroup;
  selectedMaterial: Material | null = null;

  readonly materials : Signal<Material[]>;
  dataSource = new MatTableDataSource<Material>([]);
  displayedColumns = ['name', 'category', 'quantity', 'actions'];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private materialService: MaterialService
  ) {
    this.materials = this.materialService.materialsDepot;

    this.editForm = this.fb.group({
      name: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
    });

    this.filteredNames = this.editForm.get('name')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || ''))
    );
    // Synchroniser automatiquement le tableau avec le signal
    effect(() => {
      const data = this.materials();
      this.dataSource.data = data;
      this.names = data.map(material => material.name);
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    });
  }
  ngOnInit(): void {
    this.depotId = +this.route.snapshot.paramMap.get('id')!;
    this.materialService.getMaterialsByDepot(this.depotId);
    this.dataSource.filterPredicate = (data: Material, filter: string): boolean => {
      const search = filter.trim().toLowerCase();
      return (
        ((data.name || '').toLowerCase().includes(search)) ||
        ((data.quantity || '').toString().includes(search))
      );
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
  editMaterial(material: Material) {
    this.selectedMaterial = material;
    this.editForm.patchValue(material);
    this.editingId.set(material.idMat);

  }
  cancelEdit() {
    this.selectedMaterial = null;
    this.editForm.reset();
    this.editingId.set(null);
  }
  submitEdit() {
    if (this.editForm.invalid || !this.selectedMaterial) return;

    const updatedMaterial = {
      ...this.selectedMaterial,
      ...this.editForm.value
    };

    this.materialService.updateMaterialById(updatedMaterial.idMat, updatedMaterial).subscribe({
      next: () => {
        this.snackBar.open('Matériel mis à jour ✅', 'Fermer', { duration: 3000 });
        //this.selectedMaterial = null;
        this.editForm.reset();
        this.editForm.markAsPristine();
        this.editForm.markAsUntouched();
        this.editingId.set(null);
      },
      error: err => {
        console.error('Erreur lors de la mise à jour du matériel', err);
        this.snackBar.open('Erreur de mise à jour ❌', 'Fermer', { duration: 3000 });
      }
    });
  }
}
