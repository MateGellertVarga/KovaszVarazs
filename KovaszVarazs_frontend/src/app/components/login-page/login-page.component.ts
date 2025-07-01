import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  imports: [],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {
  constructor(private authService: AuthService, private router: Router) {}

  email: string = '';
  password: string = '';
  errorMessage: string = '';

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
        await this.authService.storeUserData(this.authService.loggedInUser!);
        if (this.authService.loggedInUser!.role === 'admin') {
          this.router.navigate(['/']);
        } else {
          this.errorMessage = 'Nincs jogosultságod belépni!';
        }
      },
      error: (error:any) => {
        this.errorMessage = error.error.message;
      },
    });
  }
}
