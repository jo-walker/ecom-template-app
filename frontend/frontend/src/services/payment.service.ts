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

  // Function to record the transaction in the backend
  recordTransaction(transactionData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/transactions`, transactionData);
  }

  // Store transaction data temporarily and add a date if not present
  setTransactionData(data: any): void {
    this.transactionData = {
      ...data,
      date: data.date || new Date(), // Add the current date if not provided
    };
  }

  // Retrieve the stored transaction data
  getTransactionData(): any {
    return this.transactionData;
  }

  // Fetch transaction details by ID
  getTransactionById(transactionId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/transactions/${transactionId}`);
  }

  // Clear the stored transaction data (optional)
  clearTransactionData(): void {
    this.transactionData = null;
  }
}
