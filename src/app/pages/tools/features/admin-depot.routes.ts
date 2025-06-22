import { Routes } from '@angular/router';
import { AdminDepotLayoutComponent } from '../../depot-gestion/admin-depot-layout/admin-depot-layout.component';
import { VehiculeAttributionComponent } from '../../depot-gestion/vehicule-attribution/vehicule-attribution.component';

export const adminDepotRoutes: Routes = [
  {
    path: 'admin-depot',
    component: AdminDepotLayoutComponent,
    children: [
      { path: 'vehicules', component: VehiculeAttributionComponent },
      // 🔁 Ajoute d'autres routes ici si besoin
    ]
  }
];
