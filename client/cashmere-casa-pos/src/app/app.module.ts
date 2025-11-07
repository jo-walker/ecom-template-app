// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';

// Import standalone components
import { SalesComponent } from './components/sales/sales.component';
import { CartComponent } from './components/cart/cart.component';
import { LoginComponent } from './components/login/login.component';

// Routes
import { routes } from './app.routes';

// Services
import { SalesService } from './services/auth.service';

// Interceptor
import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    // Import standalone components
    SalesComponent,
    CartComponent,
    LoginComponent,
  ],
  providers: [  {    provide: HTTP_INTERCEPTORS,    useClass: AuthInterceptor,    multi: true,  },],
  bootstrap: [LoginComponent],  // Bootstrap the main component
})
export class AppModule {}
