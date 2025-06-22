//atribution.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { environment } from '../environment/environment';
// Typages
export type ResourceType = 'material' | 'consumable' | 'vehicule';

export interface AttributionPayload {
  resourceType: ResourceType;
  resourceId: number;
  technicianId: number;
  quantity?: number; // facultatif pour les véhicules
  depotId: number;
  performedBy: number;
}

export interface AttributionResponse {
  success: boolean;
  updated: any; // tu peux créer une interface dédiée ici selon ton modèle
}

export interface AttributionHistory {
  _id: string;
  resourceType: ResourceType;
  resourceId: string;
  technicianId: number;
  depotId: number;
  quantity?: number;
  action: 'assign' | 'retrieve';
  performedBy: string;
  date: Date;
}

@Injectable({ providedIn: 'root' })
export class AttributionService {
  private readonly apiUrl = `${environment.apiUrl}/attributions`;

  // Signaux d'état
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly history = signal<AttributionHistory[]>([]);

  constructor(private http: HttpClient) {}

  assignMaterial(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/assign`, payload);
  }

  retrieveMaterial(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/retrieve`, payload);
  }

  getAttributionHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/history`);
  }

  fetchHistory(depotId: string) {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<AttributionHistory[]>(`${this.apiUrl}/history/${depotId}`).pipe(
      tap(data => {
        this.history.set(data);
        this.loading.set(false);
      }),
      catchError(err => {
        this.error.set(err?.error?.message || 'Erreur historique');
        this.loading.set(false);
        return throwError(() => err);
      })
    ).subscribe();
  }
}
