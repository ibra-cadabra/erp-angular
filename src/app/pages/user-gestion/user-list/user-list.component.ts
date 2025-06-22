// userListComponent.ts
import { MaterialModule } from './../../../modules/material.module';
import { Component, inject } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { DepotService } from '../../../services/depot.service';
import { VehiculeService } from '../../../services/vehicule.service';
import { NgFor, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-list',
  imports: [NgFor, NgIf, RouterModule, MaterialModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent {
  private userService = inject(UserService);
  private depotService = inject(DepotService);
  private vehiculeService = inject(VehiculeService);

  readonly users = this.userService.users;
  readonly depots = this.depotService.depots;
  readonly vehicules = this.vehiculeService.vehicules;

  constructor() {
    this.userService.loadUsers();
    this.depotService.fetchDepots();
    this.vehiculeService.loadVehicules();
  }

  getDepotName(idDep?: number): string {
    if (!idDep) return '-';
    const depot = this.depots().find(d => d.idDep === idDep);
    return depot ? depot.name : 'Dépôt inconnu';
  }

  getVehiculeName(idVeh?: number): string {
    if (!idVeh) return '-';
    const veh = this.vehicules().find(v => v.idVeh === idVeh);
    return veh ? veh.registrationPlate : 'Véhicule inconnu';
  }
  removeUser(idUser: number) {
    if (confirm('Supprimer cet utilisateur ?')) {
      this.userService.removeUser(idUser);
    }
  }

}
