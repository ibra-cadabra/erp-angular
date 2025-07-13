// File: src/app/services/material.service.ts
import {Material} from '../models/material';
import {computed, Injectable, Signal, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {environment} from '../../environments/environment';

@Injectable({providedIn: 'root'})
export class MaterialService {
    private _materials = signal<Material[]>([]);
    readonly materials = this._materials.asReadonly();

    private _materialsDepot = signal<Material[]>([]);
    readonly materialsDepot = this._materialsDepot.asReadonly();

    private readonly apiUrl = `${environment.apiUrl}/materials`;

    constructor(private http: HttpClient, private snackBar: MatSnackBar) {
        //this.getAllMaterials();
    }

    getAllMaterials() {
        this.http.get<Material[]>(this.apiUrl).subscribe({
            next: data => {
                console.log('Matériels récupérés :', data);
                this._materials.set(data);
            },
            error: err => {
                console.error('Erreur lors du chargement des matériels', err);
                this.snackBar.open('Erreur lors du chargement des matériels', 'Fermer', {duration: 3000});
            }
        });
    }

    getMaterialsByDepot(idDep: number): Signal<Material[]> {
        return computed(() =>
            this.materials().filter(v => v.idDep === idDep)
        );
    }

    getById(id: string): Observable<Material> {
        return this.http.get<Material>(`${this.apiUrl}/${id}`);
    }

    /*
      getMaterialsByDepot(depotId: number): Material[] {
        console.log(`Récupération des matériaux pour le dépôt ID: ${depotId}`);
        const materials: Material[] = [];
        console.log('depotId:', depotId);
        console.log('mat length:', this.materials().length);
        this.materials().forEach(material => {
          if(material.idDep === depotId) {
            console.log('Matériaux actuels:', material);
            materials.push(material);
          }
        });
        return materials;
      }
     */
    addMaterial(mat: Partial<Material>) {
        this.http.post<Material>(this.apiUrl, mat)
            .subscribe({
                next: newMat => this._materials.update(t => [newMat, ...t])
            });
        console.log('Matériel ajouté :', mat);
    }

    updateMaterialById(idMat: number, data: Partial<Material>) {
        return this.http.put<Material>(`${this.apiUrl}/by-idMat/${idMat}`, data).pipe(
            tap((updated) => {
                const updatedList = this._materials().map(m =>
                    m.idMat === updated.idMat ? updated : m
                );
                this._materials.set(updatedList);
                this.snackBar.open('✅ Matériel mis à jour.', 'Fermer', {duration: 3000});
            })
        );
    }

    updateQuantity(name: string, delta: number): void {
        const current = this._materials();
        const mat = current.find(m => m.name === name);
        if (!mat) return;

        const updated: Material = {
            ...mat,
            quantity: (mat.quantity ?? 0) + delta
        };

        this.http.put<Material>(`${this.apiUrl}/${mat.idMat}`, updated).subscribe({
            next: () => {
                this.getAllMaterials();
            },
            error: err => {
                console.error('Erreur lors de la mise à jour du matériel :', err);
            }
        });
    }

    delete(idMat: number) {
        this.http.delete(`${this.apiUrl}/by-idMat/${idMat}`).subscribe({
            next: () => {
                this._materials.update(mats => mats.filter(m => m.idMat !== idMat));
                this.getAllMaterials();
                this.snackBar.open('✅ Matériel supprimé.', 'Fermer', {duration: 3000});
            },
            error: err => {
                console.error('Erreur lors de la suppression du matériel :', err);
                this.snackBar.open('Erreur lors de la suppression du matériel', 'Fermer', {duration: 3000});
            }
        });
    }
}
