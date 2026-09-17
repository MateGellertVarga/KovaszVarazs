import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password-page',
  imports: [NavbarComponent, FormsModule, RouterLink],
  templateUrl: './forgot-password-page.component.html',
})
export class ForgotPasswordPageComponent {
  email: string = '';
  errorMessage: string = '';
  emailSent: boolean = false;
  successMessage: string = '';

  constructor(private authService: AuthService) {}

  sendEmail(email: string) {
    if (this.validation()) {
      this.authService.sendPasswordResetEmail(email).subscribe({
        next: (res: any) => {
          this.emailSent = true;
          this.successMessage = res.message;
        },
        error: (error: any) => {
          this.errorMessage = error.error.message;
        },
      });
    }
  }

  validation() {
    this.errorMessage = '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.email.trim()) {
      this.errorMessage += 'Email kötelező!\n';
    } else if (!emailRegex.test(this.email)) {
      this.errorMessage += 'Nem megfelelő email cím!\n';
    }
    return !this.errorMessage;
  }
}
