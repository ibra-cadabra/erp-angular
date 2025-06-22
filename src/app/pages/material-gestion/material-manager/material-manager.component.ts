import { Component, OnInit, Signal, effect, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MaterialModule } from '../../../modules/material.module';
import { Material } from '../../../models/material';
import { MaterialService } from '../../../services/material.service';
import { MaterialMovement } from '../../../models/materialMovement.model';
import { MaterialMovementService } from '../../../services/materialMovement.service';
import { RouterModule } from '@angular/router';
import { Depot } from '../../../models/depot.model';
import { map, Observable, startWith } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialog } from '../../tools/features/confirmDialog';
import { DepotService } from '../../../services/depot.service';
import { Tool } from '../../../models/tool.model';
import { ToolService } from '../../../services/tool.service';

@Component({
  selector: 'app-material-manager',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './material-manager.component.html',
  styleUrls: ['./material-manager.component.css']
})
export class MaterialManagerComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  readonly materials: Signal<Material[]>;
  readonly movements: Signal<MaterialMovement[]>;

  readonly depots: Signal<Depot[]>;
  readonly tools: Signal<Tool[]>;


  filteredNames: Observable<string[]>;
  names: string[];

  materialForm: FormGroup;
  movementForm: FormGroup;

  displayedColumns = ['name', 'category', 'quantity', 'actions'];
  dataSource = new MatTableDataSource<Material>([]);

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private depotService: DepotService,
    private toolService: ToolService,
    private materialService: MaterialService,
    private movementService: MaterialMovementService  ) {
      this.depots = this.depotService.depots;
      this.tools = this.toolService.tools;
      this.materials = this.materialService.materials;
      this.materialForm = this.fb.group({
        name: ['', Validators.required],
        idDep: ['', Validators.required],
        quantity: [0, [Validators.required, Validators.min(0)]],
        idTec: [''],
        category: ['outillage', Validators.required],
        description: [''],
        state: ['neuf'],
        createdAt: [new Date()]
      });
      this.materialForm.get('name')!.valueChanges.subscribe(value => {
        // const exists = this.isExistingTool(value || '');
        // const fieldsToToggle = ['name', 'idDep', 'quantity'];
/*
        fieldsToToggle.forEach(field => {
          const control = this.materialForm.get(field);
          if (exists) {
            control?.disable();
          } else {
            control?.enable();
          }
        });
         */
      });
      this.movementForm = this.fb.group({
        materialName: ['', Validators.required],
        type: ['sortie', Validators.required],
        quantity: [1, [Validators.required, Validators.min(1)]]
      });
      this.names = this.materialService.materials().map(material => material.name);
      this.materials = this.materialService.materials;
      this.movements = this.movementService.movements;
      this.filteredNames = this.materialForm.get('name')!.valueChanges.pipe(
        startWith(''),
        map(value => this._filter(value || ''))
      );
      effect(() => {
        const list = this.materials();
        this.dataSource.data = list;
        this.names = list.map(m => m.name);
        if (this.dataSource.paginator) {
          this.dataSource.paginator.firstPage(); // revient à la première page si nécessaire
        }
      });
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
  ngOnInit(): void {
    this.toolService.loadTools;
    this.depotService.fetchDepots();
    this.materialService.getAllMaterials();
    this.movementService.getMovements();
    this.dataSource.filterPredicate = (data: Material, filter: string): boolean => {
        const search = filter.trim().toLowerCase();
        return (
          ((data.name || '').toLowerCase().includes(search)) ||
          ((data.description || '').toString().includes(search)) ||
          ((data.category || '').toString().includes(search)) ||
          ((data.quantity || '').toString().includes(search)));
      };
  }
  deleteMaterial(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { message: 'Confirmer la suppression de ce matériel ?' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.materialService.delete(id);
        this.snackBar.open('Matériel supprimé 🗑️', 'Fermer', { duration: 3000 });
      }
    });
  }
/*
  isExistingMaterial(name: string): boolean {
    return this.materials().some(mat => mat.name.toLowerCase() === name.toLowerCase());
  }
  isExistingTool(name: string): boolean {
    return this.tools().some(tool => tool.name.toLowerCase() === name.toLowerCase());
  }
 */
  submitMaterial() {
    if (this.materialForm.invalid) return;

    const formValue = this.materialForm.value;
    const existing = this.materials().find(m => m.name.toLowerCase() === formValue.name.toLowerCase() && m.idDep === formValue.idDep);

    if (existing) {
      if(confirm('Ce matériel existe déjà. Ajoutez quan même le matériel ?')) {

        //this.materialForm.reset();
      }
    } else {
      const newMaterial: Material = {
        idMat: 0, // Laissez l'ID à 0 pour que le backend le gère
        idDep: formValue.idDep || undefined,
        name: formValue.name,
        category: formValue.category,
        quantity: formValue.quantity,
        createdAt: new Date(),
        description: formValue.description,
        state: formValue.state,
        idTec: formValue.idTec,
        hist_movements: []
      };
      this.materialService.addMaterial(newMaterial);
    }

    this.materialForm.reset({
      category: 'outillage'
    });
  }
  submitMovement() {
    if (this.movementForm.invalid) return;

    const formValue = this.movementForm.value;
    const newMovement: Omit<MaterialMovement, 'idMatMov'> = {
      materialName: formValue.materialName,
      materialId: 0,
      author: null,
      type: formValue.type,
      quantity: formValue.quantity,
      date: new Date()
    };

    this.movementService.logMovement(newMovement);
    this.movementForm.reset({ type: 'sortie' });
  }
}
