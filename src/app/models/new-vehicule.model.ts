export interface NewVehicule {
    registrationPlate: string;   // 🚘 Plaque d'immatriculation (ex: AB-123-CD)
    brand: string;               // 🏷️ Marque du véhicule
    model: string;               // 📦 Modèle du véhicule
    status: string;               // 📦 Statut du véhicule
    buyState: string;            // 🔧 État d’achat (neuf, bon, maintenance)
    description?: string;        // 📝 Description optionnelle
    idDep: number | null;        // 🏢 Dépôt assigné (si statut = dépôt)
    idTec: number | null;        // 👷 Technicien assigné (si statut = technician)
}
