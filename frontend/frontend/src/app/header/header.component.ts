import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service'; // Adjust the path as necessary
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  username: string = 'User';

  constructor(private authService: AuthService, private router: Router) {
    this.username = this.authService.getUsername(); // Fetch the logged-in username
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']); // Navigate to login after logout
  }
}