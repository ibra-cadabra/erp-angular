export interface User {
  _id?: string;
  idUser?: number;
  idDep?: number;
  idVeh?: number;
  name: string;
  prename: string;
  phone: number;
  city: string;
  postaleCode: number;
  address: string;
  numSec: number;
  numSiret?: number;
  email?: string;
  role: UserRole;
  status?: 'salarié' | 'auto-entrepreneur';
  username?: string;
  password?: string;
  createdAt?: Date;
}
export enum UserRole {
  Technicien = 'technicien',
  Dirigeant = 'dirigeant',
  Administrateur = 'administrateur',
  Gerant = 'gerant'
}
