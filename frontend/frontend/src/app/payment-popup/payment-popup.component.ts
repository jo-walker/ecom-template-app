import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PaymentService } from '../../services/payment.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-popup',
  templateUrl: './payment-popup.component.html',
  styleUrls: ['./payment-popup.component.css']
})
export class PaymentPopupComponent {
  paymentType: string = 'credit'; // Default to credit card
  cashReceived: number = 0; // Amount received for cash payments
  change: number = 0; // Change to return for cash payments

  constructor(
    public dialogRef: MatDialogRef<PaymentPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private paymentService: PaymentService, // Inject PaymentService
    private router: Router
  ) {}

  // Calculate the change if the payment type is cash
  calculateChange() {
    if (this.cashReceived >= this.data.totalAmount) {
      this.change = this.cashReceived - this.data.totalAmount;
    } else {
      this.change = 0; // No change if cash received is less than total amount
    }
  }

  // Close the popup
  onClose(): void {
    this.dialogRef.close();
  }

  // Confirm payment and return the payment details
  onConfirmPayment(): void {
    console.log("Subtotal:", this.data.subtotal);  // Log subtotal
    console.log("Tax:", this.data.tax);  // Log tax
    console.log("Items in the cart:", this.data.items);  // Log items to verify they're passed correctly
    if (this.paymentType === 'cash' && this.cashReceived < this.data.totalAmount) {
      alert('Insufficient cash received!');
    } else {
      // Ensure that all data is passed and valid
      if (!this.data.items || this.data.items.length === 0) {
        alert('No items in the cart!');
        return;
      }
      // Prepare the transaction data
      const transactionData = {
        items: this.data.items, 
        subtotal: this.data.subtotal,
        tax: this.data.tax,
        total: this.data.totalAmount,
        payment_method: this.paymentType,
        cash_received: this.cashReceived,
        change: this.change,
        transactionId: null // Add transactionId property initially, it will be updated later

      };
      // Log transactionData for debugging
      console.log('Sending transaction data:', transactionData);

      // Call the backend to record the transaction
      this.paymentService.recordTransaction(transactionData).subscribe(response => {
        this.dialogRef.close({ paymentType: this.paymentType, cashReceived: this.cashReceived, change: this.change });
        console.log('Transaction recorded successfully:', response);

          // Ensure the transaction ID is included in the response
          if (response && response.transactionId) {
            // Store the transaction ID in the transaction data
            transactionData.transactionId = response.transactionId;
          }
          
      // Store the transaction data in the PaymentService
      this.paymentService.setTransactionData(transactionData);

      // Navigate to the receipt page
      this.router.navigate(['/receipt']);
      }, error => {
        console.error('Error recording transaction:', error);
      });
    }
  }
  
}