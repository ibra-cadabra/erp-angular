import { Routes } from '@angular/router';
import { authGuard, authorizeRoles } from './pages/features/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard.component';

export const appRoutes: Routes = [
    // 🔐 Authentification
    { path: 'login', component: LoginComponent },
    { path: 'unauthorized', component: UnauthorizedComponent },

    // 🧭 Redirection par défaut
    { path: '', redirectTo: '/login', pathMatch: 'full' },

    // 📊 Dashboard général (Admin & Dirigeant)
    {
        path: 'admin-dashboard',
        component: AdminDashboardComponent,
        canActivate: [authGuard, authorizeRoles('administrateur', 'dirigeant')]
    },

    {
        path: 'admin-attributions',
        loadComponent: () =>
            import('./pages/admin/admin-attribution-history/admin-attribution-history.component')
                .then(m => m.AdminAttributionHistoryComponent),
        canActivate: [authGuard, authorizeRoles('administrateur', 'dirigeant')]
    },

    // 🏢 Gestion dépôt (accessible aux admins, dirigeants, gérants)
    {
        path: 'admin-depot',
        loadComponent: () =>
            import('./pages/depot-gestion/admin-depot-layout/admin-depot-layout.component')
                .then(m => m.AdminDepotLayoutComponent),
        canActivate: [authGuard, authorizeRoles('administrateur', 'dirigeant', 'gerant')],
        children: [
            { path: '', redirectTo: 'depotDashboard', pathMatch: 'full' },
            {
                path: 'depotDashboard',
                loadComponent: () =>
                    import('./pages/depot-gestion/depot-dashboard/depot-dashboard.component')
                        .then(m => m.DepotDashboardComponent),
                canActivate: [authGuard, authorizeRoles('administrateur', 'dirigeant', 'gerant')]
            },
            {
                path: 'vehicules',
                loadComponent: () =>
                    import('./pages/depot-gestion/vehicule-attribution/vehicule-attribution.component')
                        .then(m => m.VehiculeAttributionComponent),
                canActivate: [authGuard, authorizeRoles('administrateur', 'dirigeant', 'gerant')]
            },
            {
                path: 'stock',
                loadComponent: () =>
                    import('./pages/depot-gestion/depot-stock/depot-stock')
                        .then(m => m.DepotStock),
                canActivate: [authGuard, authorizeRoles('administrateur', 'dirigeant', 'gerant')]
            },
            {
                path: 'technicians',
                loadComponent: () =>
                    import('./pages/depot-gestion/depot-technicians/depot-technicians')
                        .then(m => m.DepotTechnicians),
                canActivate: [authGuard, authorizeRoles('administrateur', 'dirigeant', 'gerant')]
            },

        ]
    },

    // 👷 Dépôt Manager dédié (par exemple pour assigner ressources)
    {
        path: 'depot/:idDep/manager',
        loadComponent: () =>
            import('./pages/depot-gestion/depot-manager/depot-manager.component')
                .then(m => m.DepotManagerComponent),
        canActivate: [authGuard, authorizeRoles('administrateur')]
    },

    // 🗂️ Liste des dépôts
    {
        path: 'list-depot',
        loadComponent: () =>
            import('./pages/depot-gestion/depot-list/depot-list.component')
                .then(m => m.DepotListComponent),
        canActivate: [authGuard, authorizeRoles('administrateur', 'dirigeant')]
    },

    // 🚐 Véhicules
    {
        path: 'vehicules',
        loadComponent: () =>
            import('./pages/vehicule-gestion/vehicule-list/vehicule-list.component')
                .then(m => m.VehiculeListComponent),
        canActivate: [authGuard]
    },
    {
        path: 'vehicules/add',
        loadComponent: () =>
            import('./pages/vehicule-gestion/vehicule-form/vehicule-form.component')
                .then(m => m.VehiculeFormComponent),
        canActivate: [authGuard, authorizeRoles('administrateur')]
    },

    // 🛠️ Matériels
    {
        path: 'materials',
        loadComponent: () =>
            import('./pages/material-gestion/material-list/material-list.component')
                .then(m => m.MaterialListComponent),
        canActivate: [authGuard]
    },
    {
        path: 'materials/add',
        loadComponent: () =>
            import('./pages/material-gestion/add-material/add-material.component')
                .then(m => m.AddMaterialComponent),
        canActivate: [authGuard, authorizeRoles('administrateur')]
    },
    {
        path: 'matManager',
        loadComponent: () =>
            import('./pages/material-gestion/material-manager/material-manager.component')
                .then(m => m.MaterialManagerComponent),
        canActivate: [authGuard]
    },

    // 🧰 Consommables
    {
        path: 'consumables',
        loadComponent: () =>
            import('./pages/consumable-gestion/consumables/consumables.component')
                .then(m => m.ConsumablesComponent),
        canActivate: [authGuard]
    },

    // 👤 Utilisateurs
    {
        path: 'users',
        loadComponent: () =>
            import('./pages/user-gestion/user-list/user-list.component')
                .then(m => m.UserListComponent),
        canActivate: [authGuard, authorizeRoles('administrateur', 'dirigeant')]
    },
    {
        path: 'users/edit/:idUser',
        loadComponent: () =>
            import('./pages/user-gestion/user-from/user-form.component')
                .then(m => m.UserFormComponent),
        canActivate: [authGuard, authorizeRoles('administrateur')]
    },
    {
        path: 'users/:idUser',
        loadComponent: () =>
            import('./pages/user-gestion/user-profil/user-profil.component')
                .then(m => m.UserProfilComponent),
        canActivate: [authGuard]
    },

    // ➕ Formulaire création utilisateur
    {
        path: 'user-form',
        loadComponent: () =>
            import('./pages/user-gestion/user-from/user-form.component')
                .then(m => m.UserFormComponent),
        canActivate: [authGuard, authorizeRoles('administrateur')]
    },
    {
        path: 'user-credentials',
        loadComponent: () =>
            import('./pages/user-gestion/user-credentials/user-credentials.component')
                .then(m => m.UserCredentialsComponent),
        canActivate: [authGuard, authorizeRoles('administrateur')]
    },

    // 🚨 Page inconnue
    { path: '**', redirectTo: '/login' }
];
