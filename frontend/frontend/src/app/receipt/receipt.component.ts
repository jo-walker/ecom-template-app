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

  constructor(private router: Router, private paymentService: PaymentService) {}

  ngOnInit(): void {
    // const navigation = this.router.getCurrentNavigation();
    // // Use bracket notation to avoid TypeScript error
    // this.transactionData = navigation?.extras?.state?.['transaction']; 
    // const navigation = this.router.getCurrentNavigation();
    // if (navigation && navigation.extras && navigation.extras.state) {
    //   this.transactionData = navigation.extras.state['transaction'];
    // } else {
    //   this.transactionData = null;
    // }
    this.transactionData = this.paymentService.getTransactionData();
    console.log('Transaction Data:', this.transactionData);

    if (!this.transactionData) {
      alert('No transaction data found. Redirecting back to sales.');
      this.router.navigate(['/sales']);
    }
      // clear transaction data after printing receipt
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
