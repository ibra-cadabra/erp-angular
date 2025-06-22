import { CommonModule } from '@angular/common';
import { Component, OnInit, Signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from '../../../modules/material.module';
import { Material } from '../../../models/material';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialService } from '../../../services/material.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-depot',
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './add-depot.component.html',
  styleUrls: ['./add-depot.component.css']
})
export class AddDepotComponent implements OnInit {

  depotId!: number;

  readonly materials : Signal<Material[]>;
  editForm: FormGroup;
  selectedMaterial: Material | null = null;

  constructor(
    private snackBar: MatSnackBar,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private materialService: MaterialService
  ) {
    this.materials = this.materialService.materialsDepot;
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
    });
  }
  ngOnInit(): void {
    // Récupérer l'ID du dépôt depuis les paramètres de la route
    this.depotId = +this.route.snapshot.params['idDep'];
    this.materialService.getMaterialsByDepot(this.depotId);

  }

  submitEdit() {
    if (this.editForm.invalid || !this.selectedMaterial) return;

    const updatedMaterial = {
      ...this.selectedMaterial,
      ...this.editForm.value
    };

    this.materialService.updateMaterialById(updatedMaterial.idMat, updatedMaterial).subscribe({
      next: () => {
        this.snackBar.open('Matériel mis à jour ✅', 'Fermer', { duration: 3000 });
        //this.selectedMaterial = null;
        this.editForm.reset();
        this.editForm.markAsPristine();
        this.editForm.markAsUntouched();
      },
      error: err => {
        console.error('Erreur lors de la mise à jour du matériel', err);
        this.snackBar.open('Erreur de mise à jour ❌', 'Fermer', { duration: 3000 });
      }
    });
  }

    cancelEdit() {
    this.selectedMaterial = null;
    this.editForm.reset();
  }

}
