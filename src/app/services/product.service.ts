import { Injectable, Signal, signal } from '@angular/core';

export interface Product {
  id: number;
  name: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private _products = signal<Product[]>([]);
  private _nextId = signal(1);

  get products(): Signal<Product[]> {
    return this._products;
  }

  addProduct(product: Omit<Product, 'id'>) {
    const newProduct: Product = { ...product, id: this._nextId() };
    this._products.update(p => [...p, newProduct]);
    this._nextId.update(id => id + 1);
  }

  deleteProduct(id: number) {
    this._products.update(p => p.filter(prod => prod.id !== id));
  }
}
