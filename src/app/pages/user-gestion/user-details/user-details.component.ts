import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../modules/material.module';
import { UserService } from '../../../services/user.service';
import { VehiculeService } from '../../../services/vehicule.service';
import { DepotService } from '../../../services/depot.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-user-details',
  standalone: true,
  templateUrl: './user-details.component.html',
  imports: [CommonModule, RouterModule, MaterialModule],
})
export class UserDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private vehiculeService = inject(VehiculeService);
  private depotService = inject(DepotService);
  private router = inject(Router);

  user: User | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.user = this.userService.users().find(u => u.idUser === id) || null;
  }

  getVehicule(): string {
    return this.vehiculeService.vehicules().find(v => v.idTec === this.user?.idUser)?.registrationPlate ?? 'Aucun';
  }

  getDepot(): string {
    return this.depotService.getDepotById(this.user?.idDep ?? -1)?.name ?? 'Non assigné';
  }

  editUser() {
    this.router.navigate(['/user-gestion/edit', this.user?.idUser]);
  }

  setAccess() {
    this.router.navigate(['/user-credentials'], {
      queryParams: { idUser: this.user?.idUser }
    });
  }
  
}
