import {Material} from "./material";

export interface Habilitation {
    _id?: string;
    name: string;
    date_expiration: Date;
}

export interface Document {
    _id?: string;

    name: string;
    url: string;
    date_upload: Date;
}

export interface Salary {
    _id?: string;

    idSal: number;
    name: string;
    prename: string;
    type: string;
    active: boolean;
    createdAt: Date;
    deletedAt?: Date;
    updatedAt?: Date;
    username?: string;
    password?: string;
    email?: string;
    phone?: string;
    habilitations?: Habilitation[];
    documents?: Document[];
    materials_attributes?: Material[];
}
