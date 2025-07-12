// depotContexteService.ts ou auth.service.ts
import { inject, Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class DepotContextService {
    private auth = inject(AuthService);

    private _idDep = signal<number | null>(null);
    readonly idDep = this._idDep.asReadonly();

    constructor() {
        const userId = this.auth.user(); // 🆔 ID de l’utilisateur connecté (ex: 12)
        console.log('🔐 Utilisateur connecté ID:', userId);

        const user = this.auth.getCurrentUser();
        console.log('🔍 Utilisateur trouvé dans userService :', user);
    }
    setDepot(id: number) {
        this._idDep.set(id);
    }

}
