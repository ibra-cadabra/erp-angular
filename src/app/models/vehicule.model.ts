export interface Vehicule {
  _id: string;
  idVeh: number;
  idTec: number;
  idDep: number; // ID of the depot to which the vehicle is assigned
  brand: string;
  model: string;
  status : 'depot' | 'technician';
  registrationPlate: string;
  buyState?: string;
  nowState?: String;
  description?: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
