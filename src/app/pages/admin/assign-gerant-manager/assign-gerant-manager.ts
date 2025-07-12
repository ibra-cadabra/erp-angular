import { DepotService } from "../../../services/depot.service";
import { UserService } from "../../../services/user.service";
import {User} from "../../../models/user.model";
import {Depot} from "../../../models/depot.model";
import {Component, OnInit, Signal} from "@angular/core";
import {CommonModule} from "@angular/common";
import {MaterialModule} from "../../../modules/material.module";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-assign-gerant-manager',
  templateUrl: './assign-gerant-manager.component.html',
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule]
})
export class AssignDepotManagerComponent implements OnInit {
  depots! : Signal<Depot[]>;
  availableGerants: User[] = [];
  selectedDepot: Depot | null = null;
  selectedGerant: User | null = null;
  currentGerant: User | null = null;

  constructor(
    private depotService: DepotService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.depotService.fetchDepots();
    this.userService.loadUsers();

    this.depots = this.depotService.depots;
    this.userService.users().filter(u => u.role === 'gerant')
      .forEach(g => this.availableGerants.push(g));
  }

  loadCurrentGerant() {
    if (!this.selectedDepot) return;
    this.currentGerant = this.userService.users().find(u => u.role === 'gerant' && u.idDep === this.selectedDepot!.idDep) ?? null;
  }

  assignGerant() {
    if (!this.selectedDepot || !this.selectedGerant) return;
    this.userService.assignDepot(this.selectedGerant.idUser!, this.selectedDepot.idDep).subscribe(() => {
      this.loadCurrentGerant();
    });
  }

  removeGerant() {
    if (!this.currentGerant) return;
    this.userService.removeDepot(this.currentGerant.idUser!).subscribe(() => {
      this.currentGerant = null;
    });
  }
}
