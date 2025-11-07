import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Add CommonModule for *ngFor
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { SalesService } from './sales.service'; // Import the service

// Define CartItem model (can be moved to its own file)
interface CartItem {
  sku: string;
  description: string;
  price: number;
}

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, HttpClientModule], // Include HttpClientModule directly in the imports array
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css']
})
export class SalesComponent {
  cart: CartItem[] = [];
  total = 0;

  constructor(private salesService: SalesService) {} // Inject the SalesService

  addItem(sku: string) {
    this.salesService.getProductBySKU(sku).subscribe((item) => {
      this.cart.push(item);
      this.total += item.price;
    }, (error) => {
      console.error('Error fetching product by SKU:', error);
    });
  }

  checkout() {
    this.salesService.checkout(this.cart).subscribe((response) => {
      alert('Checkout complete!');
    }, (error) => {
      console.error('Error during checkout:', error);
    });
  }
}