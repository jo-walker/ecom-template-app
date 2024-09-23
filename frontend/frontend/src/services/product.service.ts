// src/app/services/product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private baseUrl = 'http://localhost:3000/api'; // Your backend API

  constructor(private http: HttpClient) {}

  // Get product details by Barcode
  getProductByBarcode(barcode: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/products/${barcode}`);
  }
}