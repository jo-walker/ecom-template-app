import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// CartItem model
interface CartItem {
  sku: string;
  description: string;
  price: number;
}

@Injectable({
  providedIn: 'root',
})
export class SalesService {
  private apiUrl = 'http://localhost:3000/api'; // URL of your backend API

  constructor(private http: HttpClient) {}

  // Fetch product by SKU
  getProductBySKU(sku: string): Observable<CartItem> {
    return this.http.get<CartItem>(`${this.apiUrl}/products/barcode/${sku}`);
  }

  // Add product to cart
  addItemToCart(cartItem: CartItem): Observable<any> {
    return this.http.post(`${this.apiUrl}/cart/add`, cartItem);
  }

  // Checkout the cart
  checkout(cart: CartItem[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/checkout`, { items: cart });
  }
}