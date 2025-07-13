// depot-list.component.ts
import {Component, inject, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {Router, RouterLink} from '@angular/router';

import {DepotService} from '../../../services/depot.service';
import {UserService} from '../../../services/user.service';
import {EditDepotDialogComponent} from '../dialog/edit-depot-dialog/edit-depot-dialog.component';
import {DeleteDepotDialogComponent} from '../dialog/delete-depot-dialog/delete-depot-dialog.component';
import {Depot} from '../../../models/depot.model';
import {MaterialModule} from "../../../modules/material.module";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-depot-list',
  templateUrl: './depot-list.component.html',
  standalone: true,
  imports: [MaterialModule, RouterLink, CommonModule],
  styleUrls: ['./depot-list.component.scss']
})
export class DepotListComponent implements OnInit {
  private depotService = inject(DepotService);
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  dataSource = new MatTableDataSource<Depot>([]);
  displayedColumns: string[] = ['name', 'manager', 'stock', 'actions'];

  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.depotService.fetchDepots();
    this.depotService.resources(); // charge les ressources si déjà disponibles

    // Mise à jour de la dataSource dès que les dépôts sont prêts
    this.dataSource.data = this.depotService.depots();
    this.dataSource.sort = this.sort;
  }

  // 🔍 Filtrage du tableau selon l’input utilisateur
  applyFilter(event: Event): void {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  // 👤 Récupère le nom du gérant associé au dépôt
  getManagerName(managerId?: number): string | null {
    if (!managerId) return null;
    const user = this.userService.getUserFromSignal(managerId);
    return user ? `${user.name} ${user.prename}` : null;
  }

  // 📦 Calcule le total des ressources associées à un dépôt
  getResourceCount(idDep: number): number {
    const r = this.depotService.resources();
    return r.materials.filter(m => m.idDep === idDep).length +
        r.consumables.filter(c => c.idDep === idDep).length +
        r.vehicules.filter(v => v.idDep === idDep).length;
  }

  // 🛠️ Ouvre la modale d’édition
  editDepot(depot: Depot): void {
    const dialogRef = this.dialog.open(EditDepotDialogComponent, {
      data: { idDep: depot.idDep, name: depot.name }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.depotService.fetchDepots();
    });
  }

  // 🗑️ Ouvre la modale de suppression
  deleteDepot(depot: Depot): void {
    const dialogRef = this.dialog.open(DeleteDepotDialogComponent, {
      data: { idDep: depot.idDep }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.depotService.fetchDepots();
    });
  }

  // 📜 Redirige vers la page d’historique
  openHistory(depot: Depot): void {
    this.router.navigate(['/admin-attributions'], {
      queryParams: { idDep: depot.idDep }
    }).then();
  }
}
