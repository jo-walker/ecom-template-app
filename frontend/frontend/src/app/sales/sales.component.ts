import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service'; 
import { ProductService } from '../../services/product.service';
import { PaymentService } from '../../services/payment.service'; 
import { Router } from '@angular/router';
import { ViewEncapsulation } from '@angular/core';

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
  SalesTicket: string = ''; // Will store all items in the cart
  Subtotal: number = 0;
  Tax: number = 0;
  Total: number = 0;
  totalItems: number = 0;
  cart: any[] = []; // Array to hold cart items

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private paymentService: PaymentService,
    private router: Router
  ) {
    this.username = this.authService.getUsername(); // Assuming AuthService has a method to get the username
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']); // Redirect to login after logout
  }
  scan() {
    if (this.Barcode) {
      this.productService.getProductByBarcode(this.Barcode).subscribe(
        (response) => {  // change `product` to `response` for clarity
          if (response) {
            const product = response.product;  // access the product inside the response
            console.log('Product found:', product);
  
            // Log the description before parsing
            console.log('Raw product description:', product.description);
            
            // Parse the description field if it's a valid JSON string
            if (product.description) {
              try {
                const descriptionData: DescriptionData = JSON.parse(product.description);
                console.log('Parsed description data:', descriptionData); // Log parsed data
                
                if (descriptionData) {
                  this.Description = descriptionData.Description; // Access 'Description' from parsed JSON
                  this.Name = descriptionData.StyleName || 'No Name'; // Example for name
                } else {
                  this.Description = 'No description available'; // Fallback
                }
              } catch (error) {
                console.error('Error parsing description:', error);
                this.error = 'Invalid description format!';
                this.Description = 'No description available';
              }
            }
  
            // Log the selling price before parsing
            console.log('Raw product selling_price:', product.selling_price);
            
            // Parse the selling price field and extract sellsPrice
            if (product.selling_price) {
              try {
                const priceData = JSON.parse(product.selling_price);
                console.log('Parsed price data:', priceData);
                
                // Assign the parsed sellsPrice to Price
                if (priceData.sellsPrice) {
                  this.Price = parseFloat(priceData.sellsPrice); // Parse and assign sellsPrice
                } else {
                  this.Price = 0; // Fallback in case sellsPrice is missing
                }
              } catch (e) {
                console.error('Error parsing price:', e);
                this.error = 'Invalid price format';
              }
            }
  
            // Log picture and related items
            console.log('Product picture:', product.picture);
            console.log('Related items:', product.relatedItems);
  
            // Update picture and related items
            this.Picture = product.picture || 'default-image-url.jpg';
            this.RelatedItems = product.relatedItems || [];
  
            // Add the product to the cart and update the sales info
            this.cart.push({
              name: this.Name,
              price: this.Price,  // Ensure it's stored as a float number
              sku: product.SKU,
            });
            this.updateSalesInfo();
            this.clearInputFields(); // Clear input fields after scan
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
}