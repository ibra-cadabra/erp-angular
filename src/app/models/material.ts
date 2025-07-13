import {MaterialMovement} from "./materialMovement.model";

export interface Material {
    _id?: string;
    idMat: number;
    idDep?: number;
    idTec?: number;
    name: string;
    category: 'outillage' | 'sécurité' | 'autre';
    quantity?: number;
    createdAt: Date;
    deletedAt?: Date;
    state: 'neuf' | 'bon' | 'endommagé';
    description?: string;
    hist_movements: MaterialMovement[];
}
