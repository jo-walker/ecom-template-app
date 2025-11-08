import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component'; 
import { SalesComponent } from './sales/sales.component';
export const routes: Routes = [
  { path: 'login', component: LoginComponent }, 
  { path: 'sales', component: SalesComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Redirect to login by default
];
