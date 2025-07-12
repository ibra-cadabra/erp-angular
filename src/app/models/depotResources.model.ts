import { Consumable } from "./consumable.model";
import { Vehicule } from "./vehicule.model";
import { User } from "./user.model";
import { Attribution } from "./attribution.model";
import {Material} from "./material";

export interface DepotResources {
  attributions: Attribution[];
  materials: Material[];
  consumables: Consumable[];
  vehicules: Vehicule[];
  technicians: User[];
}
