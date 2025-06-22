import { Component, OnInit, signal } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { VehiculeService } from '../../../services/vehicule.service';
import { CommonModule } from '@angular/common';
import { Vehicule } from '../../../models/vehicule.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../../modules/material.module';
import { utilityVehicleBrandsAndModels } from '../../tools/features/vehicule_utils';
import { of, timer, switchMap, map } from 'rxjs';
import { Depot } from '../../../models/depot.model';
import { DepotService } from '../../../services/depot.service';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-vehicule-form',
  templateUrl: './vehicule-form.component.html',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
})
export class VehiculeFormComponent implements OnInit {
  vehiculeForm: FormGroup;
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
    this.technicians.set(this.userService.users());
    this.depots.set(this.depotService.depots());

    this.vehiculeForm = this.fb.group({
      registrationPlate: this.fb.control(
        '',
        {
          validators: [Validators.required, Validators.pattern(/^[a-zA-Z]{2}-\d{3}-[a-zA-Z]{2}$/)],
          asyncValidators: [this.registrationPlateValidator()],
          updateOn: 'blur'
        }
      ),
      brand: ['', Validators.required],
      model: ['', Validators.required],
      description: [''],
      createdAt: [new Date()],
      status: ['depot'],
      idDep: '',
      buyState: ['Bon'],
      assignedTo: [''],
    });
  }

  ngOnInit(): void {}

  registrationPlateValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return of(null);
      return timer(300).pipe(
        switchMap(() => this.vehiculeService.checkRegistrationPlateExists(control.value)),
        map(exists => (exists ? { registrationExists: true } : null))
      );
    };
  }

  submit() {
    if (this.vehiculeForm.invalid) {
      this.vehiculeForm.markAllAsTouched(); // Affiche les erreurs si on soumet un formulaire invalide
      return;
    }

    const formValue = this.vehiculeForm.value;

    const vehiculeToCreate: Vehicule = {
      idVeh:0,
      registrationPlate: formValue.registrationPlate!,
      brand: formValue.brand ?? '',
      model: formValue.model ?? '',
      idDep: formValue.idDep!,
      buyState: formValue.state!,
      description: formValue.description ?? '',
      assignedTo: formValue.assignedTo!,
      createdAt: new Date(),
      ...formValue
    };

    this.vehiculeService.addVehicule(vehiculeToCreate);
    this.snackBar.open('Véhicule enregistré avec succès 🚗', 'Fermer', {
      duration: 3000,
      verticalPosition: 'top'
    });
    this.resetForm();
  }

  getTechnicianWithoutVehicule(): User | undefined {
    return this.technicians().find(tec => !tec.idVeh);
  }
  

  onBrandChange(brand: string) {
    this.availableModels = utilityVehicleBrandsAndModels[brand] || [];
    this.vehiculeForm.get('model')?.reset();
  }

  resetForm() {
    this.vehiculeForm.reset({ status: 'garage', state: 'bon' });
  }
}
