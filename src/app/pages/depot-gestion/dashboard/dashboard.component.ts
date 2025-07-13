// dashboard.component.ts
import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {ChartConfiguration, ChartOptions} from 'chart.js';
import {MaterialModule} from '../../../modules/material.module';
import {ConsumableService} from '../../../services/consumable.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MaterialModule
    ],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    // Graphique : options et données
    barChartOptions: ChartOptions<'bar'> = {
        responsive: true,
        plugins: {
            legend: {display: false},
            title: {display: true, text: 'Derniers mouvements (quantité)'}
        }
    };
    barChartData: ChartConfiguration<'bar'>['data'] = {
        labels: [],
        datasets: [
            {
                data: [],
                label: 'Quantité',
                backgroundColor: '#3f51b5'
            }
        ]
    };
    // Options du graphique en ligne
    lineChartOptions: ChartOptions<'line'> = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Évolution des quantités des derniers mouvements'
            }
        }
    };
    // Données du graphique en ligne
    lineChartData: ChartConfiguration<'line'>['data'] = {
        labels: [],
        datasets: [
            {
                data: [],
                label: 'Quantité',
                borderColor: '#3f51b5',
                backgroundColor: 'rgba(63, 81, 181, 0.3)',
                tension: 0.4,
                fill: true
            }
        ]
    };
    private consumableService = inject(ConsumableService);
    // Récupère le nombre total de consommables
    readonly consumableCount: number = this.consumableService.consumableCount();
    // Signaux pour les consommables et mouvements
    readonly consumables = this.consumableService.consumables;

    constructor() {
    }

    ngOnInit(): void {
    }
}
