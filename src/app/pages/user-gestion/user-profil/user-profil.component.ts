import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { UserCredentialsComponent } from '../user-credentials/user-credentials.component'; // adapte le chemin

@Component({
  selector: 'app-user-profil',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './user-profil.component.html'
})
export class UserProfilComponent {
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);  // ✅ MatDialog injecté
  private userService = inject(UserService);

  user: User | undefined;

  constructor() {
    const idUser = Number(this.route.snapshot.paramMap.get('idUser'));
    this.userService.getUserOrFetch(idUser).subscribe(user => this.user = user);
  }

  giveAccess() {
    if (!this.user) return;

    this.dialog.open(UserCredentialsComponent, {
      width: '400px',
      data: { idUser: this.user.idUser } // ✅ on passe l'idUser à la modale
    });
  }
}
