import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component'; 
import { SalesComponent } from './sales/sales.component';
import { ReceiptComponent } from './receipt/receipt.component';   
export const routes: Routes = [
  { path: 'login', component: LoginComponent }, 
  { path: 'sales', component: SalesComponent },
  { path: 'receipt', component: ReceiptComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Redirect to login by default
];
