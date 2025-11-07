// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { SalesComponent } from './components/sales/sales.component';
import { CartComponent } from './components/cart/cart.component';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [
  { path: 'sales', component: SalesComponent },
  { path: 'cart', component: CartComponent },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];