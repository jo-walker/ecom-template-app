import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentService } from '../../services/payment.service'; // Adjust the path as necessary

@Component({
  selector: 'app-receipt',
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.css']
})
export class ReceiptComponent implements OnInit {
  transactionData: any;
  receiptDate: Date | null = null;

  constructor(private router: Router, private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.transactionData = this.paymentService.getTransactionData();
    console.log('Transaction Data:', this.transactionData);

    if (this.transactionData) {
      // Assign the date only if transactionData exists
      this.receiptDate = this.transactionData.date || new Date(); // Fallback to current date if date is not provided
      console.log('Receipt Date:', this.receiptDate);
    } else {
      alert('No transaction data found. Redirecting back to sales.');
      this.router.navigate(['/sales']);
    }

    // Clear transaction data after displaying the receipt
    this.paymentService.clearTransactionData();
  }

  // Method to print the receipt
  printReceipt() {
    window.print();
  }

  // Method to email receipt
  emailReceipt() {
    console.log('Email receipt:', this.transactionData);
  }
}
