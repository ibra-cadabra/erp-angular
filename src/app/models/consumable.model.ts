export interface Consumable {
    _id?: string;
    idCons: number;
    idDep: number;
    name: string;
    quantity: number;
    description: String;
    unitPrice?: Number,
    location?: String, // depot or vehicle ID
    stockAlert?: Number,
    createdAt?: Date,
    minThreshold?: Number,
    idTec: number, // ID of the depot or technician
}
