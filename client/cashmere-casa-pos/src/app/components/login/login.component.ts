// src/app/components/sales/sales.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Required for *ngFor
import { HttpClientModule } from '@angular/common/http';
import { SalesService } from '../../services/auth.service';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, HttpClientModule], // Ensure CommonModule is imported
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css'],
})
export class SalesComponent {
  cart: any[] = [];
  total = 0;

  constructor(private salesService: SalesService) {}

  addItem(sku: string) {
    this.salesService.getProductBySKU(sku).subscribe(
      (item) => {
        this.cart.push(item);
        this.total += item.price;
      },
      (error) => {
        console.error('Error fetching product by SKU:', error);
      }
    );
  }

  checkout() {
    this.salesService.checkout(this.cart).subscribe(
      (response) => {
        alert('Checkout complete!');
      },
      (error) => {
        console.error('Error during checkout:', error);
      }
    );
  }
}