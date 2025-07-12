import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Vehicule } from '../models/vehicule.model';
import { environment } from '../environment/environment';
import {map, Observable, tap} from 'rxjs';
import {NewVehicule} from "../models/new-vehicule.model";

@Injectable({ providedIn: 'root' })
export class VehiculeService {
  private readonly apiUrl = `${environment.apiUrl}/vehicules`;

  // ✅ Signal contenant tous les véhicules (liste globale)
  private _vehicules = signal<Vehicule[]>([]);
  readonly vehicules = this._vehicules.asReadonly();

  // 🚧 Signal de véhicules du dépôt (non utilisé ici, à activer si besoin)
  constructor(private http: HttpClient) {}

  // 🔄 Charger tous les véhicules depuis l’API
  loadVehicules() {
    this.http.get<Vehicule[]>(this.apiUrl).subscribe(v => this._vehicules.set(v));
    console.log('✅ Véhicules chargés :', this._vehicules());
  }

// ➕ Ajouter un vehicular et retourner l'observable (bonne pratique Angular)
  addVehicule(vehicule: NewVehicule): Observable<Vehicule> {
    return this.http.post<Vehicule>(this.apiUrl, vehicule).pipe(
        tap(() => this.loadVehicules())
    );
  }

  // ❌ Supprimer un véhicule par ID
  deleteVehicule(idVeh: number) {
    this.http.delete(`${this.apiUrl}/${idVeh}`).subscribe({
      next: () => {
        this._vehicules.update(v => v.filter(veh => veh.idVeh !== idVeh));
        this.loadVehicules();
        console.log('✅ Véhicule supprimé');
      },
      error: err => console.error('❌ Erreur suppression véhicule', err)
    });
  }

  // ✏️ Mettre à jour un véhicule existant
 /*
  updateVehicule(idVeh: number, changes: Partial<Vehicule>) {
    this.http.put<Vehicule>(`${this.apiUrl}/${idVeh}`, changes).subscribe({
      next: updated => {
        this._vehicules.update(v =>
            v.map(veh => veh.idVeh === idVeh ? updated : veh)
        );
        this.loadVehicules();
        console.log('✅ Véhicule mis à jour :', updated);
      },
      error: err => console.error('❌ Erreur update véhicule', err)
    });
  }
*/
  // 🔍 Vérifie si une plaque d’immatriculation existe déjà
  checkRegistrationPlateExists(registrationPlate: string) {
    const plate = registrationPlate.toUpperCase();
    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/exists/${plate}`).pipe(
        map(res => res.exists) // ✅ Corrige ici
    );
  }

  // 🚗 Attribuer ou retirer un véhicule
  //
  // Si idTec ≠ null → le véhicule est affecté à un technicien
  // Si idTec = null → le véhicule retourne au dépôt (idDep doit être fourni)
  // 🚗 Attribuer ou retirer un véhicule
  assignVehicule(data: {
    _id: string; // obligatoire pour historique (MongoDB _id du véhicule)
    idTec: number | null;
    idDep: number | null;
    createdBy: number;
  }) {
    return this.http.post(`${this.apiUrl}/assign`, data).pipe(
        tap(() => this.loadVehicules())
    );
  }


}
