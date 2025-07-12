// ✅ Fichier : user-profil.component.ts
// Composant Angular standalone pour afficher le profil complet d'un utilisateur avec ses affectations, rôle, statut, etc.

import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../modules/material.module';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../services/user.service';
import { VehiculeService } from '../../../services/vehicule.service';
import { DepotService } from '../../../services/depot.service';
import { User } from '../../../models/user.model';
import { UserCredentialsComponent } from '../user-credentials/user-credentials.component';

@Component({
  selector: 'app-user-profil',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule],
  templateUrl: './user-profil.component.html',
  styleUrls: ['./user-profil.component.css']
})
export class UserProfilComponent implements OnInit {
  // 📦 Injections de services
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private userService = inject(UserService);
  private vehiculeService = inject(VehiculeService);
  private depotService = inject(DepotService);

  user: User | null = null;
  vehiculeName: string = 'Aucun';
  depotName: string = 'Non assigné';

  ngOnInit(): void {
    const idUser = Number(this.route.snapshot.paramMap.get('idUser'));
    this.user = this.userService.getUserFromSignal(idUser) ?? null;

    if (!this.user) {
      this.snackBar.open("Utilisateur introuvable.", 'Fermer', { duration: 3000 });
      this.router.navigate(['/users']);
      return;
    }

    // 🔄 Remplir les données associées
    const veh = this.vehiculeService.vehicules().find(v => v.idTec === this.user?.idUser);
    this.vehiculeName = veh ? `${veh.brand} - ${veh.registrationPlate}` : 'Aucun';

    const dep = this.depotService.getDepotById(this.user?.idDep ?? -1);
    this.depotName = dep ? dep.name : 'Non assigné';
  }

  // ✏️ Navigation vers le formulaire de modification
  editUser() {
    if (!this.user) return;
    this.router.navigate(['/user-form'], { queryParams: { idUser: this.user.idUser } });
  }

  // 🔐 Ouvre la modale pour attribuer un username/password
  setAccess() {
    if (!this.user) return;

    this.dialog.open(UserCredentialsComponent, {
      data: { idUser: this.user.idUser },
      width: '400px'
    }).afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Accès mis à jour', 'Fermer', { duration: 3000 });
        this.userService.refreshUser(this.user!.idUser);
      }
    });
  }

  getVehicule(): string {
    return this.vehiculeService.vehicules().find(v => v.idTec === this.user?.idUser)?.registrationPlate ?? 'Aucun';
  }

  getDepot(): string {
    return this.depotService.getDepotById(this.user?.idDep ?? -1)?.name ?? 'Non assigné';
  }

}
