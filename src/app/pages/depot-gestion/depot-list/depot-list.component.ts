// depot-list.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { DepotService } from '../../../services/depot.service';
import { DeleteDepotDialogComponent } from '../dialog/delete-depot-dialog/delete-depot-dialog.component';
import { EditDepotDialogComponent } from '../dialog/edit-depot-dialog/edit-depot-dialog.component';

@Component({
  selector: 'app-depot-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule, // (facultatif pour les info-bulles)
    RouterModule
],
  templateUrl: './depot-list.component.html',
  styleUrls: ['./depot-list.component.css']
})
export class DepotListComponent {
  private depotService = inject(DepotService);
  private dialog = inject(MatDialog);

  readonly depots = this.depotService.depots;
  readonly displayedColumns = ['name', 'actions'];

  constructor() {
    this.loadDepots();
  }

  loadDepots() {
    this.depotService.loadDepotsIfEmpty();
  }

  editDepot(depot: { idDep: number; name: string }) {
    const dialogRef = this.dialog.open(EditDepotDialogComponent, {
      data: { idDep: depot.idDep, name: depot.name }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadDepots();
    });
  }

  deleteDepot(depot: { idDep: number }) {
    const dialogRef = this.dialog.open(DeleteDepotDialogComponent, {
      data: { idDep: depot.idDep }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadDepots();
    });
  }
}
