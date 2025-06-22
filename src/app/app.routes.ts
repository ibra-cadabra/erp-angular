import { Routes } from '@angular/router';
<<<<<<< HEAD
import { authGuard } from './pages/tools/features/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard.component';

export const appRoutes: Routes = [
  // 🔐 Authentification
  { path: 'login', component: LoginComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },

  // 🧭 Redirection racine
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // 📊 Dashboard principal (Admin ou Dirigeant)
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent
    //canActivate: [authGuard]
  },

  // 🏢 Administration dépôt
  {
    path: 'admin-depot',
    loadComponent: () => import('./pages/depot-gestion/admin-depot-layout/admin-depot-layout.component')
      .then(m => m.AdminDepotLayoutComponent),
    //canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/depot-gestion/dashboard/depot-dashboard/depot-dashboard.component')
          .then(m => m.DepotDashboardComponent)
      },
      {
        path: 'vehicules',
        loadComponent: () => import('./pages/depot-gestion/vehicule-attribution/vehicule-attribution.component')
          .then(m => m.VehiculeAttributionComponent)
      }
    ]
  },

  // 👷 Dépôt manager
  {
    path: 'depot/:idDep/manager',
    loadComponent: () => import('./pages/depot-gestion/depot-manager/depot-manager.component')
      .then(m => m.DepotManagerComponent)
    //canActivate: [authGuard]
  },

  // 🗂️ Dépôts - Liste
  {
    path: 'list-depot',
    loadComponent: () => import('./pages/depot-gestion/depot-list/depot-list.component')
      .then(m => m.DepotListComponent)
    //canActivate: [authGuard]
  },

  // 🚐 Véhicules
  {
    path: 'vehicules',
    loadComponent: () => import('./pages/vehicule-gestion/vehicule-list/vehicule-list.component')
      .then(m => m.VehiculeListComponent)
    //canActivate: [authGuard]
  },
  {
    path: 'vehicules/add',
    loadComponent: () => import('./pages/vehicule-gestion/vehicule-form/vehicule-form.component')
      .then(m => m.VehiculeFormComponent)
    //canActivate: [authGuard]
  },

  // 🛠️ Matériaux
  {
    path: 'materials',
    loadComponent: () => import('./pages/material-gestion/material-list/material-list.component')
      .then(m => m.MaterialListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'materials/add',
    loadComponent: () => import('./pages/material-gestion/add-material/add-material.component')
      .then(m => m.AddMaterialComponent),
    canActivate: [authGuard]
  },
  {
    path: 'matManager',
    loadComponent: () => import('./pages/material-gestion/material-manager/material-manager.component')
      .then(m => m.MaterialManagerComponent),
    canActivate: [authGuard]
  },

  // 🧰 Consommables
  {
    path: 'consumables',
    loadComponent: () => import('./pages/consumable-gestion/consumables/consumables.component')
      .then(m => m.ConsumablesComponent),
    canActivate: [authGuard]
  },

  // 👤 Utilisateurs
  {
    path: 'users',
    loadComponent: () => import('./pages/user-gestion/user-list/user-list.component')
      .then(m => m.UserListComponent)
    //canActivate: [authGuard]
  },
  {
    path: 'users/:idUser',
    loadComponent: () => import('./pages/user-gestion/user-profil/user-profil.component')
      .then(m => m.UserProfilComponent)
    //canActivate: [authGuard]
  },
  {
    path: 'user-form',
    loadComponent: () => import('./pages/user-gestion/user-from/user-form.component')
      .then(m => m.UserFormComponent)
    //canActivate: [authGuard]
  },
  {
    path: 'user-credentials',
    loadComponent: () => import('./pages/user-gestion/user-credentials/user-credentials.component')
      .then(m => m.UserCredentialsComponent)
    //canActivate: [authGuard]
  },

  // 🛠️ Outils divers
  {
    path: 'tools',
    loadComponent: () => import('./pages/tools/tools.component')
      .then(m => m.ToolsComponent)
    //canActivate: [authGuard]
  },

  // 🚨 Catch-all
  { path: '**', redirectTo: '/login' }
];
=======

export const routes: Routes = [];
>>>>>>> cfbf496feea744ab545827c6d2b9b8d63c253874
