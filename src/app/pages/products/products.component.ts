import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from 'src/app/services/product.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
})
export class ProductsComponent {
  products = this.productService.products;

  newProduct: Omit<Product, 'id'> = {
    name: '',
    quantity: 0,
  };

  constructor(private productService: ProductService) {}

  addProduct() {
    if (!this.newProduct.name) return;
    this.productService.addProduct(this.newProduct);
    this.newProduct = { name: '', quantity: 0 };
  }

  deleteProduct(id: number) {
    this.productService.deleteProduct(id);
  }

  updateProduct(id: number, name: string, quantity: number) {
    this.productService.updateProduct(id, { name, quantity });
  }
}
