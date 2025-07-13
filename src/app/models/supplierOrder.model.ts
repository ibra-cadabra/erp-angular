export interface ProductOrder {
    _id?: string;
    name: string;
    quantity: number;
    price_unit: number;
}

export interface SupplierOrder {
    _id?: string;
    idSupOrd: number;
    supplier: string;
    order_date: Date;
    deliv_date: Date;
    status: 'en attente' | 'validée' | 'annulée';
    products: ProductOrder[];
    total_price: number;
}
