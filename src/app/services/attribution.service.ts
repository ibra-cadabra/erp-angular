// attribution.service.ts
import {Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, tap} from 'rxjs/operators';
import {Observable, throwError} from 'rxjs';
import {environment} from '../environment/environment';

/** 🔢 Type de ressource attribuable */
export type ResourceType = 'materiel' | 'consommable' | 'vehicule';

/** 📦 Données utilisées lors de l'attribution ou de la reprise */
export interface AttributionPayload {
    resourceType: ResourceType;
    resourceId: string;
    technicianId: number;
    quantity?: number;
    depotId: number;
    createdBy: number | undefined;
    comment?: string;
    action: 'attribution' | 'reprise';
}

/** 📜 Représente une ligne d’historique d’attribution */
export interface AttributionHistory {
    _id: string;
    resourceType: ResourceType;
    resourceId: string;
    technicianId: number;
    depotId: number;
    quantity?: number;
    action: 'attribution' | 'reprise';
    createdBy: number;
    comment?: string;
    date: Date;
}

/** ✅ Attribution actuellement active (non reprise) */
export interface CurrentAttribution {
    idAttri: number;
    resourceType: ResourceType;
    resourceId: string;
    technicianId: number;
    depotId: number;
    createdBy: number;
    date: Date;
    action: 'attribution' | 'reprise';
    quantity?: number;
    assignedTo?: number;
    comment?: string;
}

@Injectable({providedIn: 'root'})
export class AttributionService {
    // ⚙️ États internes gérés par signaux
    loading = signal(false);
    readonly error = signal<string | null>(null);
    history = signal<AttributionHistory[]>([]);
    currentAttributions = signal<CurrentAttribution[]>([]);
    private readonly apiUrl = `${environment.apiUrl}/attributions`;

    constructor(private http: HttpClient) {
    }

    /** ➕ Attribuer une ressource (matériel, consommable ou véhicule) */
    assignResource(payload: AttributionPayload): Observable<any> {
        return this.http.post(`${this.apiUrl}/assign`, payload).pipe(
            catchError(err => throwError(() => err))
        );
    }

    /** ➖ Reprendre une ressource déjà attribuée */
    retrieveResource(payload: AttributionPayload): Observable<any> {
        return this.http.post(`${this.apiUrl}/retrieve`, payload).pipe(
            catchError(err => throwError(() => err))
        );
    }

    /** 📜 Charger l’historique spécifique à un dépôt */
    fetchHistory(depotId: number | string): void {
        this.loading.set(true);
        this.error.set(null);
        this.http.get<AttributionHistory[]>(`${this.apiUrl}/history/${depotId}`).pipe(
            tap(data => {
                this.history.set(data);
                this.loading.set(false);
            }),
            catchError(err => {
                this.error.set(err?.error?.message || 'Erreur chargement historique');
                this.loading.set(false);
                return throwError(() => err);
            })
        ).subscribe();
    }

    /** 🔁 Charger les attributions encore actives dans un dépôt */
    fetchCurrentAttributions(depotId: number): void {
        this.loading.set(true);
        this.error.set(null);
        this.http.get<CurrentAttribution[]>(`${this.apiUrl}/depot/${depotId}`).pipe(
            tap(data => {
                this.currentAttributions.set(data);
                this.loading.set(false);
            }),
            catchError(err => {
                this.error.set(err?.error?.message || 'Erreur chargement attributions actives');
                this.loading.set(false);
                return throwError(() => err);
            })
        ).subscribe();
    }

    /** 🌍 Charger l’historique global de toutes les attributions (pour l’admin uniquement) */
    fetchGlobalHistory(): void {
        this.loading.set(true);
        this.http.get<AttributionHistory[]>(`${this.apiUrl}/history/all`).pipe(
            tap(data => this.history.set(data)),
            catchError(err => {
                console.error('❌ Erreur chargement historique global', err);
                this.error.set('Erreur chargement historique global');
                return throwError(() => err);
            })
        ).subscribe({complete: () => this.loading.set(false)});
    }
}
