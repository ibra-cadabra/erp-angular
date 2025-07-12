// ✅ Fichier : user-form.component.ts
// Composant pour l'ajout ET la modification d'utilisateur (technicien ou autre)

import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { MaterialModule } from '../../../modules/material.module';
import { Observable, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { AddressSuggestion, AddressService } from '../../../services/address.service';
import { DepotService } from '../../../services/depot.service';
import { VehiculeService } from '../../../services/vehicule.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatDialog} from "@angular/material/dialog";
import {ConfirmDialogComponent} from "../../../shared/confirmDialogComponent";

@Component({
  selector: 'app-user-form',
  standalone: true,
    imports: [CommonModule, MaterialModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  form: FormGroup;
  filteredStreets!: Observable<AddressSuggestion[]>;

  private addressService = inject(AddressService);
  private depotService = inject(DepotService);
  private vehiculeService = inject(VehiculeService);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  readonly users = this.userService.users;
  readonly vehicules = this.vehiculeService.vehicules;
  readonly depots = this.depotService.depots;

  constructor(private fb: FormBuilder) {
    // 📋 Initialisation du formulaire
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
      phone: ['', [Validators.pattern(/^(\+33|0)[1-9]\d{8}$/)]],
      status: ['salarié', Validators.required],
      idVeh: [''],
      prename: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.userService.loadUsers();
    this.vehiculeService.loadVehicules();
    this.depotService.fetchDepots();

    // 🔁 Écoute du changement de statut pour affichage dynamique du champ SIRET
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

    // 🌍 Autocomplétion d'adresse via API Adresse.gouv
    const addressControl = this.form.get('address');
    if (addressControl) {
      this.filteredStreets = addressControl.valueChanges.pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap(value => this.addressService.searchStreet(value || ''))
      );
    }

    // ✏️ Mode édition : si un idUser est présent dans l'URL, on pré-remplit le formulaire
    const idUser = this.route.snapshot.paramMap.get('idUser');
    if (idUser) {
      const id = +idUser;
      this.userService.getUserById(id).subscribe(user => {
        if (user) {
          this.form.patchValue(user);
          console.log('✏️ Mode édition utilisateur chargé :', user);
        }
      });
    }
  }

  // ✅ Détection du statut auto-entrepreneur (pour champ conditionnel)
  get isAutoEntrepreneur(): boolean {
    return this.form.get('status')?.value === 'auto-entrepreneur';
  }

  // ✅ Savoir si on est en mode édition (formulaire d'édition)
  get isEditMode(): boolean {
    return this.route.snapshot.paramMap.has('idUser');
  }

  // 🌍 Lors de la sélection d'une suggestion d'adresse, on remplit les champs associés
  setAddressFields(suggestion: AddressSuggestion) {
    this.form.patchValue({
      address: suggestion.label,
      city: suggestion.city,
      postaleCode: suggestion.postaleCode
    });
  }

  // ✅ Soumission du formulaire : ajout ou mise à jour
  submit() {
    if (this.form.invalid) return;

    const formValue = this.form.value;
    const idUser = this.route.snapshot.paramMap.get('idUser');
    const currentId = idUser ? +idUser : null;

    // ✅ Vérifie les doublons localement, en ignorant l'utilisateur courant
    const conflicts = this.userService.users().filter(u =>
            u.idUser !== currentId && (
                (formValue.numSec && u.numSec === formValue.numSec) ||
                (formValue.email && u.email === formValue.email) ||
                (formValue.phone && u.phone === formValue.phone) ||
                (formValue.numSiret && u.numSiret === formValue.numSiret)
            )
    );

    if (conflicts.length > 0) {
      const fields = [];
      if (conflicts.some(u => u.numSec === formValue.numSec)) fields.push('numSec');
      if (conflicts.some(u => u.email === formValue.email)) fields.push('email');
      if (conflicts.some(u => u.phone === formValue.phone)) fields.push('phone');
      if (conflicts.some(u => u.numSiret === formValue.numSiret)) fields.push('numSiret');

      const message = fields.map(c => `⛔ ${c} déjà utilisé.`).join('\n');
      this.snackBar.open(message, 'Fermer', { duration: 5000 });
      return;
    }

    if (idUser) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Confirmation',
          message: 'Souhaitez-vous vraiment mettre à jour cet utilisateur ?',
          confirmText: 'Oui, mettre à jour',
          cancelText: 'Annuler'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === true) {
          this.userService.updateUser(+idUser, formValue);
          this.snackBar.open(`✅ Utilisateur mis à jour`, 'Fermer', { duration: 3000 });
          this.router.navigate(['/users']);
        }
      });
    } else {
      this.userService.addUser(formValue);
      this.snackBar.open(`✅ Utilisateur ajouté`, 'Fermer', { duration: 3000 });
      this.router.navigate(['/users']);
    }


    this.form.reset();
  }
}
