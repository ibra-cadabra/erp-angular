export interface ConsuMovement {
  idCons: number;
  consumableName: string;
  type: 'ajout' | 'suppression' | 'modification';
  quantity: number;
  date: Date;
}
