import {User} from "./user.model";

// models/materialAssignment.model.ts
export interface MaterialAssignment {
    id: string;
    idMat: number;
    idTech: number;
    quantity: number;
    date: Date;
    author: User;
    comment?: string;
    type: 'attribution' | 'reprise';
}
