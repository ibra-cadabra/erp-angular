import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProductsComponent } from './pages/products/products.component';
import { StockComponent } from './pages/stock/stock.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'produits', component: ProductsComponent },
  { path: 'stock', component: StockComponent },
];
