// path: frontend/src/services/payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private baseUrl = 'http://localhost:3000/api'; // backend API

  constructor(private http: HttpClient) {}

  // Function to process payment
  processPayment(paymentData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/checkout`, paymentData);
  }
}