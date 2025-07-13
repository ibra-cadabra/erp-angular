import {Component, effect} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {UserService} from '../../../services/user.service';
import {DepotService} from '../../../services/depot.service';
import {VehiculeService} from '../../../services/vehicule.service';
import {MaterialService} from '../../../services/material.service';
import {ChartConfiguration} from 'chart.js';
import {MaterialModule} from '../../../modules/material.module';
import {CommonModule} from '@angular/common';
import {NgChartsModule} from 'ng2-charts';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [MaterialModule, RouterModule, NgChartsModule, CommonModule],
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent {
    totalUsers = 0;
    totalDepots = 0;
    totalMaterials = 0;
    totalVehicules = 0;

    chartData: ChartConfiguration<'bar'>['data'] = {
        labels: [],
        datasets: [{data: [], label: 'Quantité attribuée'}],
    };

    constructor(
        private userService: UserService,
        private depotService: DepotService,
        private vehiculeService: VehiculeService,
        private materialService: MaterialService,
        private router: Router
    ) {
        // 📦 Initialisation des données
        this.userService.loadUsers();
        this.depotService.fetchDepots();
        this.vehiculeService.loadVehicules();
        this.materialService.getAllMaterials();

        // 🟡 Réaction aux changements (signaux)
        effect(() => {
            this.totalUsers = this.userService.users().length;
            this.totalDepots = this.depotService.depots().length;
            this.totalVehicules = this.vehiculeService.vehicules().length;

            const materials = this.materialService.materials();
            this.totalMaterials = materials.length;

            // 📊 Préparer top 5 pour le graphique
            const top5 = [...materials]
                .filter(m => (m.quantity ?? 0) > 0)
                .sort((a, b) => (b.quantity ?? 0) - (a.quantity ?? 0))
                .slice(0, 5);

            this.chartData.labels = top5.map(m => m.name);
            this.chartData.datasets[0].data = top5.map(m => m.quantity ?? 0);
        });
    }

    // 📍 Naviguer vers l'historique (optionnel si on préfère méthode plutôt que routerLink)
    goToAttributions() {
        this.router.navigate(['/admin-attributions']);
    }
}
