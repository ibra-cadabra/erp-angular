// depot-assignment.component.ts
import { Component, computed, OnInit, signal, Signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../modules/material.module';
import { MaterialService } from '../../../services/material.service';
import { TechnicianService } from '../../../services/technician.service';
import { Material } from '../../../models/material';
import { Technician } from '../../../models/technician.model';
import { AttributionService } from '../../../services/attribution.service';
import { DepotService } from '../../../services/depot.service';
import { Depot } from '../../../models/depot.model';
import { ActivatedRoute } from '@angular/router';

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
  technicians!: Signal<Technician[]>;
  selectedDepotId = signal<number | null>(null);
  form: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private depotService: DepotService,
    private materialService: MaterialService,
    private technicianService: TechnicianService,
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

    this.depotService.loadDepots();
    this.depots = this.depotService.depots;

    this.technicianService.loadTechnicians();
    this.technicians = computed(() => this.technicianService.technicians().filter(tech => tech.idDep === this.selectedDepotId() || tech.idDep === null));
  }


  submit(type: 'attribution' | 'reprise') {
    if (this.form.invalid) return;

    const { technicianId, materialId, quantity } = this.form.value;

    this.attributionService.create({
      idMat: materialId!,
      idTec: technicianId!,
      quantity: quantity!
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
