export interface StockMovement {
  idStockMov: number;
  author: string;
  type: 'entrée' | 'sortie';
  obj_id: string;
  quantity: number;
  technician_id?: string;
  date: Date;
  description?: string;
}
