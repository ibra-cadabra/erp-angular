// depot.service.ts
import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Depot} from '../models/depot.model';
import {environment} from '../environment/environment';
import {DepotResources} from '../models/depotResources.model';
import {AuthService} from './auth.service';
import {UserService} from './user.service';
import {Observable, of} from 'rxjs';

@Injectable({providedIn: 'root'})
export class DepotService {
    private baseUrl = `${environment.apiUrl}/depots`;

    private _depots = signal<Depot[]>([]);
    readonly depots = this._depots.asReadonly();
    private _resources = signal<DepotResources>({
        materials: [],
        consumables: [],
        technicians: [],
        vehicules: [],
        attributions: []
    });
    readonly resources = this._resources.asReadonly();
    private auth = inject(AuthService);
    private userService = inject(UserService);

    constructor(private http: HttpClient) {
    }

    // 🔄 Récupérer tous les dépôts
    fetchDepots() {
        this.http.get<Depot[]>(this.baseUrl).subscribe({
            next: data => {
                console.log('📦 Dépôts récupérés :', data);
                this._depots.set(data);
            },
            error: err => console.error('Erreur lors du chargement des dépôts', err)
        });
    }

    // ✅ Ne recharge les dépôts que s’ils sont absents
    loadDepotsIfEmpty() {
        if (this._depots().length === 0) this.fetchDepots();
    }

    // ➕ Créer un dépôt
    createDepot(depot: Partial<Depot>) {
        return this.http.post<Depot>(this.baseUrl, depot);
    }

    // ❌ Supprimer un dépôt
    deleteDepot(id: string) {
        return this.http.delete(`${this.baseUrl}/${id}`);
    }

    // 🔁 Modifier un dépôt
    updateDepot(id: number, changes: Partial<Depot>) {
        return this.http.put(`${this.baseUrl}/${id}`, changes);
    }

    // 📦 Charger les ressources du dépôt
    getDepotResources(id: number) {
        this.http.get<DepotResources>(`${this.baseUrl}/${id}/resources`).subscribe({
            next: data => {
                console.log('✅ Ressources reçues du backend :', data);
                this._resources.set(data);
                console.log('✅ Ressources reçues :', this._resources());

            },
            error: err => console.error('❌ Erreur de chargement des ressources dépôt', err)
        });
    }


    // 🔄 Version observable de getDepotResources (sans effet de bord)
    getDepotResources$(id: number): Observable<DepotResources> {
        return this.http.get<DepotResources>(`${this.baseUrl}/${id}/resources`);
    }

    // 🔍 Trouver un dépôt par ID
    getDepotById(id: number): Depot | null {
        return this._depots().find(d => d.idDep === id) || null;
    }

    // 👤 Obtenir le dépôt du gérant connecté
    getMyDepot() {
        const idUser = this.auth.user();
        if (!idUser) return of(null);

        const gerant = this.userService.users().find(u => u.idUser === +idUser);
        if (!gerant?.idDep) return of(null);

        const depot = this.getDepotById(gerant.idDep);
        return of(depot);
    }
}
