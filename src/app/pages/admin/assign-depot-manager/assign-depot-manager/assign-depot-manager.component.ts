// ✅ assign-depot-manager.component.ts
import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Depot} from '../../../../models/depot.model';
import {User} from '../../../../models/user.model';
import {DepotService} from '../../../../services/depot.service';
import {UserService} from '../../../../services/user.service';
import {MaterialModule} from "../../../../modules/material.module";

@Component({
    selector: 'app-assign-depot-manager',
    standalone: true,
    imports: [CommonModule, FormsModule, MaterialModule],
    templateUrl: './assign-depot-manager.component.html'
})
export class AssignDepotManagerComponent implements OnInit {
    selectedDepot = signal<Depot | null>(null);
    selectedGerant = signal<User | null>(null);
    readonly availableGerants = computed(() =>
        this.users().filter(u => u.role === 'gerant' && !u.idDep)
    );
    readonly currentGerant = computed(() => {
        const dep = this.selectedDepot();
        return dep ? this.users().find(u => u.role === 'gerant' && u.idDep === dep.idDep) ?? null : null;
    });
    private userService = inject(UserService);
    readonly users = this.userService.users;

    //selectedDepotId = signal<number | null>(null);
    //selectedGerantId = signal<number | null>(null);
    private depotService = inject(DepotService);
    readonly depots = this.depotService.depots;

    constructor() {
    }

    ngOnInit() {
        this.depotService.loadDepotsIfEmpty();
        this.userService.loadUsersIfEmpty?.();
    }

    assignGerant() {
        const gerant = this.selectedGerant();
        const depot = this.selectedDepot();
        if (!gerant || !depot) return;

        this.userService.assignDepot(gerant.idUser!, depot.idDep).subscribe(() => {
            this.selectedGerant.set(null);
        });
    }

    removeGerant() {
        const gerant = this.currentGerant();
        if (!gerant) return;
        this.userService.removeDepot(gerant.idUser!).subscribe();
    }

    // 👇 méthode appelée quand un dépôt est sélectionné
    onDepotChange(idDep: number) {
        const depot = this.depots().find(d => d.idDep === idDep) ?? null;
        this.selectedDepot.set(depot);
        this.selectedGerant.set(null);
    }

    // 👇 méthode appelée quand un gérant est sélectionné
    onGerantChange(idUser: number) {
        const gerant = this.users().find(u => u.idUser === idUser) ?? null;
        this.selectedGerant.set(gerant);
    }
}
