import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MaterialMovement } from '../models/materialMovement.model';
import { MaterialService } from './material.service';

@Injectable({ providedIn: 'root' })
export class MaterialMovementService {
  private apiUrl = 'http://localhost:3000/matMovements';

  // ✅ Signal qui contient la liste des mouvements
  private _movements = signal<MaterialMovement[]>([]);
  readonly movements = this._movements.asReadonly();

  constructor(
    private http: HttpClient,
    private materialService: MaterialService
  ) {}

  getMovements(): void {

  }

  logMovement(movement: Omit<MaterialMovement, 'idMatMov'>): void {
    this.http.post<MaterialMovement>(this.apiUrl, movement).subscribe({
      next: () => {
        // ✅ Met à jour le stock du matériel
        const delta = movement.type === 'entrée' ? movement.quantity : -movement.quantity;
        this.materialService.updateQuantity(movement.materialName, delta);

        // ✅ Recharge les mouvements
        this.getMovements();
      }
    });
  }
}
