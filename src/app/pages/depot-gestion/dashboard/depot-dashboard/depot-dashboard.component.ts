import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { AttributionService } from '../../../../services/attribution.service';
import { DepotService } from '../../../../services/depot.service';
import { MaterialService } from '../../../../services/material.service';
import { UserService } from '../../../../services/user.service';
import { VehiculeService } from '../../../../services/vehicule.service';
import { AttributionDialogComponent } from '../../../tools/features/attribution-dialog/attribution-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { User } from '../../../../models/user.model';

@Component({
  selector: 'app-depot-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './depot-dashboard.component.html',
  styleUrls: ['./depot-dashboard.component.css']
})
export class DepotDashboardComponent {
  private depotService = inject(DepotService);
  private materialService = inject(MaterialService);
  private vehiculeService = inject(VehiculeService);
  private dialog = inject(MatDialog);

  attributionService = inject(AttributionService);
  userService = inject(UserService);

  depotId = signal<number | null>(null);
  selectedTechId = signal<number | null>(null);
  selectedDate = signal<string | null>(null);

  techniciens = this.depotService.resources().technicians;
  readonly vehicules = this.vehiculeService.vehicules;
  readonly materiels = this.materialService.materials;

  readonly filteredHistory = computed(() => {
    return this.attributionService.history().filter(entry => {
      const matchTech = !this.selectedTechId() || entry.technicianId === this.selectedTechId();
      const matchDate = !this.selectedDate() || new Date(entry.date).toISOString().startsWith(this.selectedDate() as string);
      return matchTech && matchDate;
    });
  });

  constructor() {
    this.depotService.getMyDepot().subscribe(depot => {
      if (depot?.idDep) {
        this.depotId.set(depot.idDep);
        this.attributionService.fetchHistory(String(depot.idDep));
      }
    });
  }

  openAttributionDialog(tech: User) {
    this.dialog.open(AttributionDialogComponent, {
      width: '600px',
      data: {
        technicien: tech,
        idDepot: this.depotId()
      },
      disableClose: true,
      autoFocus: false
    });
  }

  onSelectTech(id: number | null) {
    this.selectedTechId.set(id);
  }
  onDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedDate.set(input.value);
  }
  
  get vehiculesAuDepot(): number {
    const id = this.depotId();
    return this.vehicules().filter(v => v.idDep === id).length;
  }

  get materielsAuDepot(): number {
    const id = this.depotId();
    return this.materiels().filter(m => m.idDep === id).length;
  }

  get techniciensCount(): number {
    return this.techniciens.length;
  }
}
