// refund.component.ts

import { Component } from '@angular/core';
import { PaymentService } from '../../services/payment.service';
import { Router } from '@angular/router';
import { Transaction, Item } from '../models/transactions.model'; // Adjust path based on your directory structure

@Component({
  selector: 'app-refund',
  templateUrl: './refund.component.html',
  styleUrls: ['./refund.component.css']
})
export class RefundComponent {
  username: string = 'User';
  TransactionID: string = '';
  refundCart: Item[] = [];
  RefundSubtotal: number = 0;
  RefundTax: number = 0;
  RefundTotal: number = 0;

  constructor(private paymentService: PaymentService, private router: Router) {}

  scanRefund() {
    if (this.TransactionID) {
      this.paymentService.getTransactionById(this.TransactionID).subscribe(
        (transaction: Transaction) => {
          if (transaction) {
            this.processTransactionData(transaction);
          } else {
            alert('Transaction not found. Please check the Transaction ID.');
          }
        },
        (error: any) => {
          console.error('Error fetching transaction for refund', error);
          alert('Error fetching transaction. Please try again.');
        }        
      );
    }
  }

  processTransactionData(transaction: Transaction) {
    this.refundCart = transaction.items.map((item: Item) => ({
      name: item.name,
      price: item.price,
      sku: item.sku
    }));
    this.updateRefundInfo();
  }

  updateRefundInfo() {
    this.RefundSubtotal = this.refundCart.reduce((sum, item) => sum + item.price, 0);
    this.RefundTax = this.RefundSubtotal * 0.13;
    this.RefundTotal = this.RefundSubtotal + this.RefundTax;
  }

  processRefund() {
    console.log('Processing refund for:', this.refundCart);
    this.resetRefundCart();
  }

  cancelRefund() {
    this.resetRefundCart();
  }

  clearRefundInputFields() {
    this.TransactionID = '';
  }

  resetRefundCart() {
    this.refundCart = [];
    this.RefundSubtotal = 0;
    this.RefundTax = 0;
    this.RefundTotal = 0;
  }

  removeRefundItem(index: number) {
    this.refundCart.splice(index, 1);
    this.updateRefundInfo();
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
