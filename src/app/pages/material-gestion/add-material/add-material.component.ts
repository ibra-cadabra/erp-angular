import {Component, OnInit, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MaterialService} from '../../../services/material.service';
import {MaterialModule} from '../../../modules/material.module';
import {CommonModule, NgFor, NgIf} from '@angular/common';
import {User} from '../../../models/user.model';
import {UserService} from '../../../services/user.service';

@Component({
    selector: 'app-add-work-material',
    standalone: true,
    imports: [MaterialModule,
        NgFor, NgIf,
        CommonModule, ReactiveFormsModule],
    templateUrl: './add-material.component.html',
})
export class AddMaterialComponent implements OnInit {
    form!: FormGroup;
    loading = signal(false);
    technicians: User[] = [];
    dynamicLabel = 'Numéro de série';
    showQuantity = false;
    materialId: string | null = null;

    constructor(
        private technicianService: UserService,
        private fb: FormBuilder,
        private snackBar: MatSnackBar,
        private route: ActivatedRoute,
        private materialService: MaterialService,
        private router: Router
    ) {
    }

    ngOnInit(): void {
        this.form = this.fb.group({
            name: ['', Validators.required],
            serialNumber: ['', Validators.required],
            category: [''],
            quantity: [0],
            condition: ['neuf'],
            assignedTo: ['']
        });
        // Charge la liste des techniciens
        this.technicians = this.technicianService.users();

        this.materialId = this.route.snapshot.paramMap.get('id');
        if (this.materialId) {
            this.loadMaterial(this.materialId);
        }
    }

    onCategoryChange(): void {
        const category = this.form.get('category')?.value;

        // Réinitialiser les deux champs
        this.form.get('serialNumber')?.clearValidators();
        this.form.get('quantity')?.clearValidators();
        this.form.get('serialNumber')?.setValue('');
        this.form.get('quantity')?.setValue('');
        this.showQuantity = false;

        if (category === 'véhicule') {
            this.dynamicLabel = 'Plaque d\'immatriculation';
            this.form.get('serialNumber')?.setValidators([Validators.required]);
        } else if (category === 'outillage' || category === 'sécurité') {
            this.dynamicLabel = 'Quantité';
            this.showQuantity = true;
            this.form.get('quantity')?.setValidators([Validators.required, Validators.min(1)]);
        } else {
            this.dynamicLabel = 'Numéro de série';
        }

        this.form.get('serialNumber')?.updateValueAndValidity();
        this.form.get('quantity')?.updateValueAndValidity();
    }

    loadMaterial(id: string) {
        this.materialService.getById(id).subscribe({
            next: (material) => {
                this.form.patchValue(material);
            },
            error: () => {
                this.snackBar.open("Erreur lors du chargement du matériel.", 'Fermer', {duration: 3000});
                this.router.navigate(['/materials']);
            }
        });
    }

    onSubmit(): void {
        if (this.form.invalid) return;
        const payload = {...this.form.value};


        if (this.showQuantity) {
            delete payload.serialNumber;
        } else {
            delete payload.quantity;
        }

    }

}
