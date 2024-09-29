// path: frontend/src/services/payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private baseUrl = 'http://localhost:3000/api'; // backend API
  private transactionData: any = null;

  constructor(private http: HttpClient) {}

  // Function to process payment
  processPayment(paymentData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/checkout`, paymentData);
  }
  recordTransaction(transactionData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/transactions`, transactionData);
  }  
    // Store transaction data temporarily
    setTransactionData(data: any): void {
      this.transactionData = data;
    }
  
    // Retrieve the stored transaction data
    getTransactionData(): any {
      return this.transactionData;
    }
  
    // Clear the stored transaction data (optional)
    clearTransactionData(): void {
      this.transactionData = null;
    }
}