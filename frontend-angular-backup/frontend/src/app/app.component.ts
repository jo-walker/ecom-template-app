import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],  // Fix here: styleUrls should be plural
})
export class AppComponent {
  constructor(public authService: AuthService) {}  // Use 'public' to bind it to the template

  title = 'frontend';

  login() {
    // Logic added later
  }

  logout() {
    this.authService.logout();  // Call the logout method in the AuthService
  }
}