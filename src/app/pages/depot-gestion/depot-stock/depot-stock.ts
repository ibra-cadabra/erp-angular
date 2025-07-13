// ✅ depot-stock.component.ts
import { Component, inject, OnInit, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DepotService } from '../../../services/depot.service';
import { MaterialModule } from '../../../modules/material.module';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-depot-stock',
  standalone: true,
  imports: [CommonModule, MaterialModule, MatCardModule, MatListModule],
  templateUrl: './depot-stock.html',
  styleUrls: ['./depot-stock.scss']
})
export class DepotStock implements OnInit {
  private depotService = inject(DepotService);
  readonly resources: Signal<any> = this.depotService.resources;

  ngOnInit(): void {
    // recharge les ressources si besoin
    const currentDepot = this.depotService.getMyDepot();
    if (!this.resources().materials.length) {
      currentDepot.subscribe(dep => dep && this.depotService.getDepotResources(dep.idDep));
    }
  }
}
