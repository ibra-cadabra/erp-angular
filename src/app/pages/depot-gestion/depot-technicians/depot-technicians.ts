// ✅ depot-technician.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DepotService } from '../../../services/depot.service';
import { MaterialModule } from '../../../modules/material.module';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import {User} from "../../../models/user.model";

@Component({
  selector: 'app-depot-technician',
  standalone: true,
  imports: [CommonModule, MaterialModule, MatCardModule, MatListModule],
  templateUrl: './depot-technicians.html',
  styleUrls: ['./depot-technicians.scss']
})
export class DepotTechnicians implements OnInit {
  private depotService = inject(DepotService);
  readonly technicians: User[] = this.depotService.resources().technicians;

  ngOnInit(): void {
    const currentDepot = this.depotService.getMyDepot();
    if (!this.technicians.length) {
      currentDepot.subscribe(dep => dep && this.depotService.getDepotResources(dep.idDep));
    }
  }
}
