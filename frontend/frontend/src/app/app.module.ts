import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { FormsModule } from '@angular/forms'; // Import FormsModule for two-way binding (ngModel)
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component'; 
import { SalesComponent } from './sales/sales.component'; 
import { routes } from './app.routes';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { RefundComponent } from './refund/refund.component';
import { PaymentPopupComponent } from './payment-popup/payment-popup.component';
import { ReceiptComponent } from './receipt/receipt.component';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SalesComponent,
    HeaderComponent,
    RefundComponent,
    PaymentPopupComponent,
    ReceiptComponent
],
  imports: [
    BrowserModule,
    CommonModule, 
    FormsModule,   
    HttpClientModule,
    RouterModule.forRoot(routes),
    FooterComponent,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}