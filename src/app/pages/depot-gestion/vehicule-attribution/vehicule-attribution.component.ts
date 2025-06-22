import { Component, effect, inject, signal } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../../../services/user.service';
import { VehiculeService } from '../../../services/vehicule.service';
import { Vehicule } from '../../../models/vehicule.model';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-vehicule-attribution',
  standalone: true,
  imports: [
    CommonModule,
    NgFor,
    NgIf,
    MatSnackBarModule,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './vehicule-attribution.component.html',
  styleUrls: ['./vehicule-attribution.component.css']
})
export class VehiculeAttributionComponent {
  technicians = signal<User[]>([]);
  selectedTechnician = signal<User | null>(null);

  private vehiculeService = inject(VehiculeService);
  readonly vehicules = this.vehiculeService.vehicules;

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {
    this.userService.loadUsers();
    this.loadData();
    effect(() => this.selectedTechnician());
  }

  loadData() {
    this.userService.getTechniciansObservable().subscribe(data => this.technicians.set(data));
    this.vehiculeService.loadVehicules();
  }

  selectTechnician(technician: User) {
    this.selectedTechnician.set(technician);
  }

  clearSelection() {
    this.selectedTechnician.set(null);
  }

  getNomTec(idTec: number | null): string | null {
    if (!idTec) return null;
    const t = this.technicians().find(t => t.idUser === idTec);
    return t ? `${t.prename} ${t.name}` : null;
  }

  isVehiculeAssignedTo(vehicule: Vehicule): boolean {
    return this.selectedTechnician()?.idUser === vehicule.idTec;
  }

  attribuer(vehicule: Vehicule) {
    const idVeh = Number(vehicule.idVeh);
    const idTec = this.selectedTechnician()?.idUser;

    if (!idTec) {
      this.snackBar.open('❌ Aucun technicien sélectionné.', 'Fermer', { duration: 3000 });
      return;
    }

    this.vehiculeService.assignVehicule({ idVeh, idTec }).subscribe({
      next: () => {
        this.snackBar.open('✅ Véhicule attribué', 'Fermer', { duration: 3000 });
        this.loadData();
      },
      error: () => {
        this.snackBar.open('❌ Erreur attribution', 'Fermer', { duration: 3000 });
      }
    });
  }

  reprendre(vehicule: Vehicule) {
    const idVeh = Number(vehicule.idVeh);
    const idTec = null;

    this.vehiculeService.assignVehicule({ idVeh, idTec }).subscribe({
      next: () => {
        this.snackBar.open('♻️ Véhicule repris', 'Fermer', { duration: 3000 });
        this.loadData();
      },
      error: () => {
        this.snackBar.open('❌ Erreur reprise', 'Fermer', { duration: 3000 });
      }
    });
  }
}
