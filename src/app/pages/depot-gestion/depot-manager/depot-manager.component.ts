// depot-manager.component.ts
import { CommonModule } from "@angular/common";
import { Component, effect, inject, OnInit, Signal, signal, ViewChild } from "@angular/core";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { ReactiveFormsModule } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { Consumable } from "../../../models/consumable.model";
import { Material } from "../../../models/material";
import { Vehicule } from "../../../models/vehicule.model";
import { ConsumableService } from "../../../services/consumable.service";
import { MaterialService } from "../../../services/material.service";
import { VehiculeService } from "../../../services/vehicule.service";
import { AttributionDialogComponent } from "../attribution-dialog/attribution-dialog.component";
import { ActivatedRoute } from "@angular/router";
import { DepotService } from "../../../services/depot.service";
import { Depot } from "../../../models/depot.model";
import { User } from "../../../models/user.model";
import { UserService } from "../../../services/user.service";

@Component({
  selector: 'app-depot-manager',
  standalone: true,
  imports: [CommonModule,
    MatTableModule,
    ReactiveFormsModule, MatDialogModule, MatIconModule],
  templateUrl: './depot-manager.component.html',
})
export class DepotManagerComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private depotService = inject(DepotService);
  resources = this.depotService.resources;

  depot!: Depot | null;

  readonly technicians: Signal<User[]> = signal([]);
  readonly vehicules: Signal<Vehicule[]> = signal([]);
  readonly materials: Signal<Material[]> = signal([]);
  readonly consumables: Signal<Consumable[]> = signal([]);

  displayedColumns: string[] = ['name', 'prename', 'vehicule', 'materials', 'consumables', 'actions'];
  dataSource: any;

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private userService: UserService,
    private vehService: VehiculeService,
    private matService: MaterialService,
    private consoService: ConsumableService
  )
  {

    this.dataSource = new MatTableDataSource<User>;

    this.technicians = this.userService.technicians;
    this.vehicules = this.vehService.vehicules;
    this.materials = this.matService.materials;
    this.consumables = this.consoService.consumables;

    effect(() => {
      if (this.resources()?.consumables) {
        this.dataSource.data = this.resources()?.technicians;
      }
    });
  }

  ngOnInit(): void {
    this.loadAll();
    this.depotService.fetchDepots();

    const idDepot = +this.route.snapshot.paramMap.get('idDep')!;
    this.depot = this.depotService.getDepotById(idDepot);
    this.depotService.getDepotResources(idDepot);

    //console.log('Data: ' + this.resources()?.consumables().length);
    this.dataSource.filterPredicate = (data: User, filter: string): boolean => {
      const search = filter.trim().toLowerCase();
      return (
        ((data.name || '').toLowerCase().includes(search)) ||
        ((data.prename || '').toLowerCase().includes(search)) ||
        ((data.email || '').toLowerCase().includes(search)) ||
        (data.phone ? data.phone.toString().includes(search) : false)
      );
    };
  }
  loadAll() {
    this.userService.loadUsers();
    this.vehService.loadVehicules();
    this.matService.getAllMaterials();
    this.consoService.loadConsumables();
  }
  getVehicule(tecId: number): Vehicule | undefined {
    return this.vehicules().find(v => v.idTec === tecId);
  }
  getMaterials(tecId: number): Material[] {
    return this.depotMaterials.filter(m => m.idTec === tecId);
  }

  getConsumables(tecId: number): Consumable[] {
    return this.depotConsumables.filter(c => c.idTec === tecId);
  }
  getMaterialQuantity(tecId: number): number {
    return this.depotMaterials
      .filter(m => m.idTec === tecId)
      .reduce((sum, m) => sum + (m.quantity || 0), 0);
  }

  getConsumableQuantity(tecId: number): number {
    return this.depotConsumables
      .filter(c => c.idTec === tecId)
      .reduce((sum, c) => sum + (c.quantity || 0), 0);
  }

  openAttributionDialog(technicien: User) {
    this.dialog.open(AttributionDialogComponent, {
      width: '500px',
      data: {
        technician: technicien,
        depotMaterials: this.depotMaterials,
        depotConsumables: this.depotConsumables
      }
    }).afterClosed().subscribe(result => {
      if (result === true) {
        // Recharger les ressources du dépôt
        if (this.depot?.idDep) {
          this.depotService.getDepotResources(this.depot.idDep);
        }
      }
    });

  }

  get depotConsumables(): Consumable[] {
    if (!this.depot) return [];
    return (this.resources()?.consumables ?? []).filter(c => c.idDep === this.depot?.idDep);
  }

  get depotMaterials(): Material[] {
    if (!this.depot) return [];
    return (this.resources()?.materials ?? []).filter(m => m.idDep === this.depot?.idDep);
  }

  get depotVehicules(): Vehicule[] {
    if (!this.depot) return [];
    return (this.resources()?.vehicules ?? []).filter(v => v.idDep === this.depot?.idDep);
  }

  get depotTechnicians(): User[] {
    if (!this.depot) return [];
    return (this.resources()?.technicians ?? []).filter(t => t.idDep === this.depot?.idDep);
  }

}
