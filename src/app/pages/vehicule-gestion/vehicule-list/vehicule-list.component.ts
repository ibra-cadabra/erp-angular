import { RouterModule } from '@angular/router';
import { Component, inject, OnInit, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { VehiculeService } from '../../../services/vehicule.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialog } from '../../tools/features/confirmDialog';
import { DepotService } from '../../../services/depot.service';
import { Depot } from '../../../models/depot.model';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
@Component({
  selector: 'app-vehicule-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatTableModule, MatIconModule, MatButtonModule],
  templateUrl: './vehicule-list.component.html',
})
export class VehiculeListComponent implements OnInit {
  private vehiculeService = inject(VehiculeService);
  private userService = inject(UserService);
  private depotService = inject(DepotService );

  depots: Signal<Depot[]> = this.depotService.depots;
  vehicules = this.vehiculeService.vehicules;
  users: Signal<User[]> = this.userService.users;

  displayedColumns = ['registrationPlate', 'brand', 'model', 'status','idDep', 'assignedTo', 'actions'];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
  }

  ngOnInit(): void {
    this.vehiculeService.loadVehicules();
    this.userService.loadUsers();
    this.userService.technicians();
  }

  getTechnicianNameByVehicule(idVeh: number): string {
    return this.users().find(t => t.idUser === idVeh)?.name ?? '';
  }

  getDepotNameByVehicule(idVeh: number): string {
    return this.depots().find(d => d.idDep === idVeh)?.name ?? '';
  }

  removeVehicule(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialog);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.vehiculeService.deleteVehicule(id);
        this.snackBar.open('Véhicule supprimé 🗑️', 'Fermer', { duration: 3000 });
      }
    });
  }
}
