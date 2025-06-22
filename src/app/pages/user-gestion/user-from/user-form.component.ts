import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import { MaterialModule } from '../../../modules/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { AddressSuggestion, AddressService } from '../../../services/address.service';
import { DepotService } from '../../../services/depot.service';
import { VehiculeService } from '../../../services/vehicule.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html'
})
export class UserFormComponent implements OnInit {

  form: FormGroup;
  filteredStreets!: Observable<AddressSuggestion[]>;

  private addressService = inject(AddressService);
  private depotService = inject(DepotService);
  private vehiculeService = inject(VehiculeService);
  private userService = inject(UserService);

  readonly users = this.userService.users;
  readonly vehicules = this.vehiculeService.vehicules;
  readonly depots = this.depotService.depots;

  constructor(
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      idDep: ['', [Validators.required]],
      numSec: ['', [Validators.required]],
      numSiret: ['', [Validators.pattern(/^[0-9]{14}$/)]],
      name: ['', [Validators.required]],
      address: [''],
      city: [''],
      postaleCode: [''],
      role: [''],
      email: '',
      phone: ['', [Validators.pattern(/^\+33|0[1-9]\d{8}$/)]],
      status: ['salarié', Validators.required],
      idVeh: [''],
      prename: ['', Validators.required],
    });

    this.form.get('email')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => this.checkDuplicateField('email'));

    this.form.get('numSec')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => this.checkDuplicateField('numSec'));

    this.form.get('phone')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => this.checkDuplicateField('phone'));

    this.form.get('numSiret')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => this.checkDuplicateField('numSiret'));


    this.users = this.userService.users;
    this.vehicules = this.vehiculeService.vehicules;
    this.depots = this.depotService.depots;
  }

  ngOnInit(): void {
    this.userService.loadUsers();
    this.vehiculeService.loadVehicules();
    this.depotService.fetchDepots();

    this.form.get('status')?.valueChanges.subscribe(status => {
      const siretControl = this.form.get('numSiret');

      if (status === 'auto-entrepreneur') {
        siretControl?.setValidators([
          Validators.required,
          Validators.pattern(/^[0-9]{14}$/)
        ]);
      } else {
        siretControl?.clearValidators();
        siretControl?.setValue('');
      }

      siretControl?.updateValueAndValidity();
    });

    const addressControl = this.form.get('address');
    if (addressControl) {
      this.filteredStreets = addressControl?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(value => this.addressService.searchStreet(value || ''))
      ) ?? of([]);
    }
  }

  getVehiculePlateByTechnicien(idTec: number): string {
    return this.vehicules().find(v => v.idTec === idTec)?.registrationPlate ?? 'Aucun';
  }

  setAddressFields(suggestion: AddressSuggestion) {
    this.form.patchValue({
      address: suggestion.label,
      city: suggestion.city,
      postaleCode: suggestion.postaleCode
    });
  }

  get isAutoEntrepreneur(): boolean {
    return this.form.get('status')?.value === 'auto-entrepreneur';
  }

  submit() {
    if (this.form.invalid) return;

    const formValue = this.form.value;

    const conflicts = this.userService.checkDuplicateUser({
      numSec: formValue.numSec,
      email: formValue.email,
      phone: formValue.phone,
      numSiret: formValue.numSiret
    });

    if (conflicts.length) {
      const message = conflicts.map(c => `⛔ ${c} déjà utilisé.`).join('\n');
      this.snackBar.open(message, 'Fermer', { duration: 5000 });
      return;
    }

    this.userService.addUser(formValue);
    this.snackBar.open('✅ Utilisateur ajouté avec succès', 'Fermer', { duration: 3000 });
    console.log(formValue);
  }
  hasDuplicate(field: keyof User): boolean {
    return this.userService.checkDuplicateUser({ [field]: this.form.get(field)?.value }).length > 0;
  }
  checkDuplicateField(field: 'email' | 'phone' | 'numSec' | 'numSiret') {
    const value = this.form.get(field)?.value;
    if (!value) return;

    this.userService.checkUniqueUser({ [field]: value }).subscribe({
      next: () => {
        this.form.get(field)?.setErrors(null); // ✅ pas de doublon
      },
      error: (fields) => {
        if (fields.includes(field)) {
          this.form.get(field)?.setErrors({ duplicate: true }); // ⛔ doublon
        }
      }
    });
  }


}
