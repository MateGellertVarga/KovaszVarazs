import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-password-reset-page',
  imports: [NavbarComponent, FormsModule, RouterLink],
  templateUrl: './password-reset-page.component.html',
})
export class PasswordResetPageComponent implements OnInit {
  email: string = '';
  token: string = '';

  newPassword: string = '';
  newPasswordAgain: string = '';
  showPassword: boolean = false;
  showPasswordAgain: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.email = params['email'] || '';
      this.token = params['token'] || '';
    });
  }

  save() {
    if (!this.email || !this.token) {
      this.errorMessage = 'Érvénytelen visszaállítási link!';
      return;
    }

    if (this.validation()) {
      this.authService
        .resetPassword(this.email, this.token, this.newPassword)
        .subscribe({
          next: (res: any) => {
            this.successMessage = res.message || 'Jelszó sikeresen módosítva!';
          },
          error: (error: any) => {
            this.errorMessage =
              error.error?.message || 'Hiba történt a jelszó módosításakor.';
          },
        });
    }
  }

  validation() {
    this.errorMessage = '';
    const passwordRegex = /\d/;

    if (!this.newPassword.trim()) {
      this.errorMessage += 'Jelszó kötelező!\n';
    } else if (this.newPassword.length < 6) {
      this.errorMessage +=
        'A jelszónak legalább 6 karakter hosszúnak kell lennie!\n';
    } else if (!passwordRegex.test(this.newPassword)) {
      this.errorMessage +=
        'A jelszónak tartalmaznia kell legalább egy számot!\n';
    }

    if (!this.newPasswordAgain.trim()) {
      this.errorMessage += 'Jelszó újra megadása kötelező!\n';
    } else if (this.newPassword !== this.newPasswordAgain) {
      this.errorMessage += 'A két jelszó nem egyezik!\n';
    }

    return !this.errorMessage;
  }
}
