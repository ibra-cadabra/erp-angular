# 📦 ERP de Gestion de Stock - FX Network

Un ERP moderne pour la gestion des ressources, des techniciens, du matériel et des dépôts, développé avec **Angular**, *
*Node.js** et **MongoDB**.

## 🚀 Fonctionnalités principales

- 🔐 Authentification avec rôles : dirigeant, administrateur, gérant, technicien
- 👷 Gestion des utilisateurs : ajout, suppression, assignation de dépôts/véhicules
- 🏢 Dépôts : création, suppression, affectation de gérant
- 🚗 Véhicules : stock, attribution, reprise
- 🧰 Matériel & consommables : attribution, reprise, gestion de stock
- 📊 Dashboard administrateur & dépôt avec statistiques et historique
- 📁 Export Excel, animations, responsive design mobile & desktop

## 🧪 Stack technique

- **Frontend** : Angular 17+ avec Angular Material, Signals, Standalone Components
- **Backend** : Node.js, Express, Mongoose (MongoDB)
- **Base de données** : MongoDB
- **Authentification** : JWT + Bcrypt
- **Style** : Angular Material + CSS responsive
- **Export** : fichiers Excel (.xlsx)

## 🛠️ Installation locale

```bash
# 1. Clone le dépôt
git clone https://github.com/ibra-cadabra/erp-angular.git
cd erp-angular

# 2. Installation côté Angular
cd frontend
npm install
ng serve

# 3. Installation côté Node.js
cd ../backend
npm install
npm run dev

| Module / Tâche                  | Description                                                           |
| ------------------------------- | --------------------------------------------------------------------- |
| ✅ Backend Express/Mongoose      | Produits, Dépôts, Consommables, Véhicules, Attributions, Utilisateurs |
| ✅ Authentification              | Login, AuthGuard, redirection selon rôle, création d’identifiants     |
| ✅ Angular (standalone)          | Composants : consommables, matériels, véhicules, utilisateurs         |
| ✅ AttributionService            | Affectation, reprise, historique global, signaux, filtrage dynamique  |
| ✅ Historique (admin)            | Filtres par dépôt, auteur, date + export CSV, pagination              |
| ✅ Gestion dynamique du stock    | Mise à jour en temps réel lors des attributions/reprises              |
| ✅ Création d’utilisateurs       | Formulaire enrichi, rôle, type, accès à l’app                         |
| ✅ Séparation matériel/véhicules | Collections dédiées, logique d'affectation spécifique                 |
| ✅ UI avec signaux               | Tous les services Angular réactifs avec signaux                       |
| ✅ Gestion des consommables      | Formulaire, filtrage, ajout, suppression, modification                |

| Module / Tâche                           | Description                                                               |
| ---------------------------------------- | ------------------------------------------------------------------------- |
| 🔒 Expiration de session + refresh token | Ajouter sécurité renforcée, déconnexion automatique                       |
| 📁 Gestion des documents                 | Upload CACES, carte BTP, attestations, CV, etc. (avec dates d’expiration) |
| 🔍 Filtres avancés sur historique        | Plage de dates, mot-clé, type ressource                                   |
| 📲 Amélioration mobile / PWA             | Interface responsive, mode hors-ligne pour techniciens                    |
| 🧾 Export PDF                            | Historique d’attribution, profil technicien, état du stock                |

| Module / Tâche             | Description                                                  |
| -------------------------- | ------------------------------------------------------------ |
| 🧩 RH                      | Suivi technicien : heures, absences, formations              |
| 🔔 Alertes / Notifications | Documents expirés, ressources manquantes, seuils de stock    |
| 🛠️ Maintenance matériels  | Déclarations de pannes, remarques, historique de réparations |
| 📦 Suivi inventaire avancé | États de stock par dépôt, seuils critiques, prévision        |
| 📊 Dashboard dirigeant     | Graphiques : dépenses, affectations, consommations           |

| Module / Tâche     | Description                                                       |
| ------------------ | ----------------------------------------------------------------- |
| 🐳 Dockerisation   | Dockerfile + docker-compose pour backend + MongoDB                |
| 🚀 CI/CD           | GitHub Actions : build, test, déploiement                         |
| 🧾 Logging backend | Intégration de Winston ou Morgan                                  |
| 🌐 Monitoring      | Logs serveur, suivi erreurs, uptime (ex: via LogRocket ou Sentry) |
