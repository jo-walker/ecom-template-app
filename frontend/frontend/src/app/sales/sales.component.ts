import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service'; 
import { ProductService } from '../../services/product.service';
import { PaymentService } from '../../services/payment.service'; 
import { Router } from '@angular/router';
import { ViewEncapsulation } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

// Define the interface for description data
interface DescriptionData {
  color: string;
  kind: string;
  catName: string;
  StyleName: string;
  Description: string;
  weight: string;
  sex: string;
}

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css'],
  encapsulation: ViewEncapsulation.None // This disables style encapsulation
})

export class SalesComponent {
  error: string | null = null;
  username: string = 'User' || ''; // Default to empty string if username is not available
  Barcode: string = '';
  Name: string = '';
  Price: number = 0;  
  Description: string = '';
  Picture: string = '';
  RelatedItems: any[] = []; // For related products
  productPictures: any[] = []; // For product pictures
  SalesTicket: string = ''; // Will store all items in the cart
  Subtotal: number = 0;
  Tax: number = 0;
  Total: number = 0;
  totalItems: number = 0;
  cart: any[] = []; // Array to hold cart items
  color: string = '';
  kind: string = '';
  StyleName: string = '';
  weight: string = '';
  sex: string = '';
  totalGridItems = 9; // Total number of grid items, including placeholders

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private paymentService: PaymentService,
    private router: Router,
    private cdr: ChangeDetectorRef //to trigger change detection 
  ) {
    this.username = this.authService.getUsername(); // Assuming AuthService has a method to get the username
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']); // Redirect to login after logout
  }
    // Function to calculate empty grids
    get emptyGrids() {
      return Array(this.totalGridItems - this.RelatedItems.length).fill(0);
    }
    scan() {
      if (this.Barcode) {
        this.productService.getProductByBarcode(this.Barcode).subscribe(
          (response) => { 
            if (response) {
              const product = response.product;
    
              // Handle linked_pictures (array of images)
              // this.productPictures = response.linked_pictures || []; // This should be the array of image URLs
              this.productPictures = ["https://cashmerecasa.com/wp-content/uploads/2024/08/Untitled-design-2.png"];

              // Handle description
              if (product.description) {
                try {
                  const descriptionData: DescriptionData = JSON.parse(product.description);
                  this.Description = descriptionData.Description || 'No description available';
                  this.color = descriptionData.color;
                  this.kind = descriptionData.kind;
                  this.StyleName = descriptionData.StyleName;
                  this.weight = descriptionData.weight;
                  this.sex = descriptionData.sex;
                  this.Name = descriptionData.StyleName || 'No Name';
                  this.RelatedItems = product.relatedItems || [];
                  this.cdr.detectChanges(); // Trigger change detection
                } catch (error) {
                  this.error = 'Invalid description format!';
                  this.Description = 'No description available';
                }
              } else {
                this.Description = 'No description available';
              }
    
              // Handle selling price
              if (product.selling_price) {
                try {
                  const priceData = JSON.parse(product.selling_price);
                  this.Price = parseFloat(priceData.sellsPrice) || 0;
                } catch (error) {
                  this.error = 'Invalid price format';
                  this.Price = 0;
                }
              }
              
              this.RelatedItems = product.relatedItems || [];
              this.error = null;
            } else {
              this.error = 'Product not found!';
            }
          },
          (error) => {
            this.error = 'Error fetching product details';
          }
        );
      }
    }
    
  
  addToCart() {
    if (this.Name && this.Price) {
      this.cart.push({
        name: this.Name,
        price: this.Price,
        sku: this.Barcode,
      });
      this.updateSalesInfo();
      this.clearInputFields();
    } else {
      this.error = 'No product to add!';
    }
  }
  
  // Updates the sales ticket, subtotal, tax, and total
  updateSalesInfo() {
    // Update the sales ticket (join all product names and prices)
    this.SalesTicket = this.cart
      .map(item => `${item.name} - ${item.price.toFixed(2)}`)
      .join('\n');
  
    // Update subtotal
    this.Subtotal = this.cart.reduce((sum, item) => sum + item.price, 0);
  
    // Update tax (Ontario 13% tax)
    this.Tax = this.Subtotal * 0.13;
  
    // Update total (Subtotal + Tax)
    this.Total = this.Subtotal + this.Tax;
  
    // Update the total number of items sold
    this.totalItems = this.cart.length;
  }  

  // Simulate the payment process
  pay() {
    const paymentData = {
      subtotal: this.Subtotal,
      tax: this.Tax,
      total: this.Total,
      items: this.cart,
    };

    this.paymentService.processPayment(paymentData).subscribe(
      (response) => {
        alert('Payment completed!');
        this.resetCart(); // Reset the cart after payment
      },
      (error) => {
        this.error = 'Payment failed';
      }
    );
  }

  // Clears the input fields after adding to cart
  clearInputFields() {
    this.Barcode = '';
    this.Description = '';
    this.Picture = '';
    this.RelatedItems = [];
  }

  // Resets the cart and all the totals
  resetCart() {
    this.cart = [];
    this.SalesTicket = '';
    this.Subtotal = 0;
    this.Tax = 0;
    this.Total = 0;
    this.totalItems = 0;
  }

  cancel() {
    this.resetCart();
  }
  removeItem(index: number) {
    this.cart.splice(index, 1); // Remove the item at the specified index
    this.updateSalesInfo(); // Update the sales info after removal
  }
  clearScannedItem() {
    this.Barcode = '';
    this.Name = '';
    this.Price = 0; // Assuming it's numeric
    this.Description = '';
  }
   
}