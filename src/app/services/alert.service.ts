import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

/** 🧪 Modèle d’un consommable avec seuil */
export interface ConsumableAlert {
    _id: string;
    name: string;
    quantity: number;
    minThreshold: number;
}

@Injectable({ providedIn: 'root' })
export class AlertService {
    private readonly apiUrl = `${environment.apiUrl}/alerts`;

    // 📦 Liste des consommables en alerte
    readonly lowStockConsumables = signal<ConsumableAlert[]>([]);
    readonly loading = signal(false);
    readonly error = signal<string | null>(null);

    constructor(private http: HttpClient) {}

    /** 🔄 Charger les consommables sous seuil */
    fetchLowStockConsumables(): void {
        this.loading.set(true);
        this.error.set(null);

        this.http.get<ConsumableAlert[]>(`${this.apiUrl}/consumables`)
            .pipe(
                tap(data => this.lowStockConsumables.set(data)),
                catchError(err => {
                    this.error.set('Erreur chargement alertes de stock');
                    return throwError(() => err);
                })
            )
            .subscribe({ complete: () => this.loading.set(false) });
    }
}
