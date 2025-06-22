// vehicule.service.ts
import { Injectable, signal, computed, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Vehicule } from '../models/vehicule.model'; // Make sure this path is correct
import { environment } from '../environment/environment';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VehiculeService {
  private readonly apiUrl = `${environment.apiUrl}/vehicules`;
  // ✅ Signal qui contient la liste des véhicules
  private _vehicules = signal<Vehicule[]>([]);
  readonly vehicules = this._vehicules.asReadonly();
  
  private _vehiculesDep = signal<Vehicule[]>([]);
  readonly vehiculesDep = this._vehiculesDep.asReadonly();

  constructor(private http: HttpClient) { }
  loadVehicules() {
    this.http.get<Vehicule[]>(this.apiUrl).subscribe(v => this._vehicules.set(v));
    console.log('✅ Véhicules chargés :', this._vehicules());
  }
  getVehiculesByDepot(idDep: number): Signal<Vehicule[]> {
    return computed(() =>
      this.vehicules().filter(v => v.idDep === idDep)
    );
  }
  addVehicule(vehicule: Omit<Vehicule, 'id'>) {
    this.http.post<Vehicule>(this.apiUrl, vehicule).subscribe(() => this.loadVehicules());
  }
  deleteVehicule(idVeh: number) {
    this.http.delete(`${this.apiUrl}/${idVeh}`).subscribe({
      next: () => {
        this._vehicules.update(vehicules => vehicules.filter(v => v.idVeh !== idVeh));
        this.loadVehicules();
        console.log('✅ Véhicule supprimé');
      },
      error: err => console.error('Erreur suppression véhicule', err)
    });
  }
  updateVehicule(idVeh: number, changes: Partial<Vehicule>) {
    this.http.put<Vehicule>(`${this.apiUrl}/${idVeh}`, changes).subscribe({
      next: updated => {
        this._vehicules.update(vehicules =>
          vehicules.map(v => v.idVeh === idVeh ? updated : v)
        );
        this.loadVehicules();
        console.log('✅ Véhicule mis à jour :', updated);
      },
      error: err => console.error('Erreur update véhicule', err)
    });
  }
  checkRegistrationPlateExists(registrationPlate: string) {
    return this.http.get<boolean>(`${this.apiUrl}/exists/${registrationPlate}`);
  }
  assignVehicule({ idVeh, idTec }: { idVeh: number; idTec: number | null }) {
    return this.http.put(`${this.apiUrl}/assign`, { idVeh, idTec }).pipe(
      tap(() => this.loadVehicules())
    );
  }
  
}
