import { Component, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { VehiculeService } from '../../../services/vehicule.service';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../../modules/material.module';
import { utilityVehicleBrandsAndModels } from '../../features/vehicule_utils';
import { of, map } from 'rxjs';
import { Depot } from '../../../models/depot.model';
import { DepotService } from '../../../services/depot.service';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { catchError } from 'rxjs/operators';
import { NewVehicule } from '../../../models/new-vehicule.model';

@Component({
  selector: 'app-vehicule-form',
  standalone: true,
  templateUrl: './vehicule-form.component.html',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
})
export class VehiculeFormComponent implements OnInit {
  vehiculeForm: FormGroup;
  loading = false;

  readonly depots = signal<Depot[]>([]);
  readonly technicians = signal<User[]>([]);
  brands = Object.keys(utilityVehicleBrandsAndModels);
  availableModels: string[] = [];

  constructor(
      private snackBar: MatSnackBar,
      private fb: FormBuilder,
      private vehiculeService: VehiculeService,
      private userService: UserService,
      private depotService: DepotService
  ) {
    // 🧩 Initialisation du formulaire
    this.vehiculeForm = this.fb.group({
      registrationPlate: ['', {
        validators: [
          Validators.required,
          Validators.pattern(/^[A-Z]{2}-\d{3}-[A-Z]{2}$/)
        ],
        asyncValidators: [this.registrationExistsValidator()],
        updateOn: 'blur'
      }],
      brand: [''],
      model: [''],
      buyState: ['bon'],
      description: [''],
      status: ['depot', Validators.required],
      idDep: [null],
      idTec: [null]
    });

    // 🔁 Chargement des ressources
    this.technicians.set(this.userService.users());
    this.depots.set(this.depotService.depots());
  }

  ngOnInit() {}

  // ✅ Conversion de la plaque en majuscules
  onPlateInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
    this.vehiculeForm.get('registrationPlate')?.setValue(input.value, { emitEvent: false });
  }

  // ✅ Validateur asynchrone pour l’immatriculation unique
  registrationExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      const plate = (control.value || '').toUpperCase();

      if (!plate || control.pristine) {
        return of(null); // 🟢 Pas de vérif inutile
      }

      return this.vehiculeService.checkRegistrationPlateExists(plate).pipe(
          map(exists => (exists ? { registrationExists: true } : null)),
          catchError(() => of(null)) // 🔁 Tolère les erreurs réseau
      );
    };
  }

  // ✅ Soumission du formulaire

  submit() {
    if (this.vehiculeForm.invalid) return;

    this.loading = true;
    const formValue = this.vehiculeForm.value;

    const newVehicule: NewVehicule = {
      registrationPlate: formValue.registrationPlate,
      brand: formValue.brand,
      model: formValue.model,
      buyState: formValue.buyState,
      description: formValue.description,
      idDep: formValue.status === 'depot' ? formValue.idDep : null,
      idTec: formValue.status === 'technician' ? formValue.idTec : null,
      status: formValue.status
    };

    this.vehiculeService.addVehicule(newVehicule).subscribe({
      next: () => {
        this.snackBar.open('✅ Véhicule ajouté avec succès', 'Fermer', { duration: 3000 });
        this.vehiculeForm.get('registrationPlate')?.markAsPristine();
        this.vehiculeForm.get('registrationPlate')?.updateValueAndValidity();
        this.vehiculeForm.get('status')?.setValue('depot');
        this.loading = false;
        this.vehiculeForm.reset({ status: 'depot', state: 'bon' });

      },
      error: () => {
        this.snackBar.open('❌ Erreur lors de l\'ajout du véhicule', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  // 🔁 Mise à jour des modèles selon la marque
  onBrandChange(brand: string) {
    this.availableModels = utilityVehicleBrandsAndModels[brand] || [];
    this.vehiculeForm.get('model')?.reset();
  }
}
