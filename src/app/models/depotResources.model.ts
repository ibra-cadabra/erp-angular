import { Consumable } from "./consumable.model";
import { Vehicule } from "./vehicule.model";
import { User } from "./user.model";
import { Material } from "../models/material.js";
import { Attribution } from "./attribution.model";

export interface DepotResources {
  attributions: Attribution[];
  materials: Material[];
  consumables: Consumable[];
  vehicules: Vehicule[];
  technicians: User[];
}
