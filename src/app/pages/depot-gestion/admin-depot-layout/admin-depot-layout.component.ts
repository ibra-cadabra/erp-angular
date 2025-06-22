import { Component, inject, signal } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';

import { UserService } from '../../../services/user.service';
import { VehiculeService } from '../../../services/vehicule.service';
import { MaterialService } from '../../../services/material.service';
import { AttributionService } from '../../../services/attribution.service';
import { DepotService } from '../../../services/depot.service';

import { AttributionDialogComponent } from '../../tools/features/attribution-dialog/attribution-dialog.component';
import { User } from '../../../models/user.model';
import { RouterOutlet } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-depot',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTableModule
  ],
  templateUrl: './admin-depot-layout.component.html',
  styleUrls: ['./admin-depot-layout.component.css']
})
export class AdminDepotLayoutComponent {
  private userService = inject(UserService);
  private vehiculeService = inject(VehiculeService);
  private materialService = inject(MaterialService);
  private attributionService = inject(AttributionService);
  private depotService = inject(DepotService);
  private dialog = inject(MatDialog);

  readonly techniciens = signal<User[]>([]);
  readonly vehicules = this.vehiculeService.vehicules;
  readonly materiels = this.materialService.materials;
  readonly history = this.attributionService.history;
  readonly loading = this.attributionService.loading;
  readonly depotId = signal<number | null>(null);

  constructor() {
    this.loadData();
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

  openAttributionDialog(technicien: any) {
    this.dialog.open(AttributionDialogComponent, {
      data: { technicien }
    });
  }

  getResourceLabel(resourceType: string): string {
    switch (resourceType) {
      case 'material': return 'Matériel';
      case 'consumable': return 'Consommable';
      case 'vehicule': return 'Véhicule';
      default: return resourceType;
    }
  }

  getActionLabel(action: string): string {
    return action === 'assign' ? 'Attribué' : 'Retiré';
  }
}
