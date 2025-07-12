// depot-assignment.component.ts
import { Component, computed, OnInit, signal, Signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../modules/material.module';
import { MaterialService } from '../../../services/material.service';
import { Material } from '../../../models/material';
import { AttributionService } from '../../../services/attribution.service';
import { DepotService } from '../../../services/depot.service';
import { Depot } from '../../../models/depot.model';
import { ActivatedRoute } from '@angular/router';
import {UserService} from "../../../services/user.service";
import {User} from "../../../models/user.model";

@Component({
  selector: 'app-depot-assignment',
  standalone: true,
  templateUrl: './depot-assignment.component.html',
  styleUrls: ['./depot-assignment.component.css'],
  imports: [CommonModule, ReactiveFormsModule, MaterialModule]
})
export class DepotAssignmentComponent implements OnInit {
  materials: Signal<Material[]>;
  depots!: Signal<Depot[]>;
  // Nom du dépôt sélectionné
  selectedDepotName = computed(() => {
    const id = this.selectedDepotId();
    const depots = this.depots();
    const depot = depots.find(d => d.idDep === id);
    return depot ? depot.name : 'Dépôt inconnu';
  });
  users!: Signal<User[]>;
  selectedDepotId = signal<number | null>(null);
  form: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private depotService: DepotService,
    private materialService: MaterialService,
    private userService: UserService,
    private attributionService: AttributionService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder) {
      this.form = this.fb.group({
        technicianId: [null, Validators.required],
        materialId: [null, Validators.required],
        quantity: [1, [Validators.required, Validators.min(1)]]
      });
      this.materials = this.materialService.materialsDepot;
    }

  ngOnInit() {
    const idFromRoute = this.route.snapshot.paramMap.get('idDep');
    if (idFromRoute) {
      this.selectedDepotId.set(+idFromRoute); // Convertit en number et stocke dans signal
      this.materialService.getMaterialsByDepot(+idFromRoute); // Charge les matériaux du dépôt
    }

    this.depotService.fetchDepots();
    this.depots = this.depotService.depots;

    this.userService.getTechnicians();
    this.users = computed(() => this.userService.technicians().filter(tech => tech.idDep === this.selectedDepotId() || tech.idDep === null));
  }


  submit(type: 'attribution' | 'reprise') {
    if (this.form.invalid) return;

    const { technicianId, materialId, quantity } = this.form.value;

    this.attributionService.assignResource({
      technicianId: technicianId!,
      quantity: quantity!,
      resourceType: 'materiel',
      resourceId: '',
      depotId: 0,
      createdBy: 0,
      action: 'attribution'
    }).subscribe(() => {
      this.snackBar.open(`${type === 'attribution' ? 'Attribué' : 'Repris'} avec succès`, 'Fermer', { duration: 2000 });
      this.form.reset();
      this.materialService.getMaterialsByDepot(this.selectedDepotId()!);
      this.materials = this.materialService.materialsDepot;
      this.form.markAsPristine();
      this.form.markAsUntouched();
    });
  }
}
