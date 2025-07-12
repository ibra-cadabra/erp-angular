// consommables service
import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Consumable } from '../models/consumable.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../environment/environment';
import {AuthService} from "./auth.service";

@Injectable({ providedIn: 'root' })
export class ConsumableService {
  private _consumables = signal<Consumable[]>([]);
  readonly consumables = this._consumables.asReadonly();
  readonly consumableCount = computed(() => this._consumables().length);

  private readonly apiUrl = `${environment.apiUrl}/consumables`;

  constructor(private http: HttpClient,
              private authService: AuthService,
              private snackBar: MatSnackBar) {}

  loadConsumables() {
    this.http.get<Consumable[]>(this.apiUrl).subscribe({
      next: data => {
        console.log('📦 Consommables récupérés :', data);
        this._consumables.set(data);
      },
      error: err => console.error('Erreur lors du chargement des consommables', err)
    });
  }
  addConsumable(consumable: Partial<Consumable>) {
    const user = this.authService.getCurrentUser();
    if (!user) {
      console.error('❌ Utilisateur non connecté');
      return;
    }

    const createdBy = user.idUser;

    const exists = this._consumables().some(
        c => c.name.trim().toLowerCase() === consumable.name?.trim().toLowerCase()
            && c.idDep === consumable.idDep
    );

    if (exists) {
      console.warn('⛔ Le consommable existe déjà :', consumable.name);
      return;
    }

    const payload = { ...consumable, createdBy };

    this.http.post<Consumable>(this.apiUrl, payload).subscribe({
      next: (newItem) => {
        this._consumables.update(consumables => [...consumables, newItem]);
        console.log('✅ Consommable ajouté :', newItem);
      },
      error: err => console.error('Erreur lors de l’ajout', err)
    });
  }
  deleteConsumable(idCons: number) {
    this.http.delete(`${this.apiUrl}/${idCons}`).subscribe({
      next: () => {
        this._consumables.update(consumables => consumables.filter(c => c.idCons !== idCons));
        console.log('✅ Consommable supprimé');
      },
      error: err => console.error('Erreur suppression consommable', err)
    });
  }
  updateConsumable(idCons: number, changes: Partial<Consumable>) {
    this.http.put<Consumable>(`${this.apiUrl}/${idCons}`, changes).subscribe({
      next: updated => {
        this._consumables.update(consumables =>
          consumables.map(c => c.idCons === idCons ? updated : c)
        );
        console.log('✅ Consommable mis à jour :', updated);
        this.snackBar.open('✅ Consommable mis à jour.', 'Fermer', { duration: 3000 });
      },
      error: err => console.error('Erreur update consommable', err)
    });
  }
}
