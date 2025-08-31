import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, NavbarComponent, RouterLink],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {
  constructor(private authService: AuthService, private router: Router) {}

  email: string = '';
  password: string = '';
  errorMessage: string = '';
  showPassword: boolean = false;

  login(email: string, password: string) {
    this.errorMessage = '';
    if (email == '' || password == '') {
      this.errorMessage = 'Add meg az összes adatot!';
      return;
    }

    this.authService.login(email, password).subscribe({
      next: async (response: boolean) => {
        if (!response) {
          this.errorMessage = 'Hiba!';
          return;
        }
        this.router.navigate(['/']);
      },
      error: (error: any) => {
        this.errorMessage = error.error.message;
      },
    });
  }
}
