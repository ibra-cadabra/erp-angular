export interface Depot {
  _id?: string;
  idDep: number;
  idUser: number;
  name: string;
  city: string;
  postalCode: string;
  address: string;
  phone: string;
  email: string;
  location: string;
  createdAt?: Date;
  updatedAt?: Date;
  managedBy?: string;
}
