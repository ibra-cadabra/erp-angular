export interface MaterialMovement {
    _id?: string;

    materialId: number;
    author: any;
    materialName: string;
    type: 'entrée' | 'sortie' | 'modification';
    quantity: number;
    date: Date;
}
