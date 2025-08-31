import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password-page',
  imports: [NavbarComponent, FormsModule, RouterLink],
  templateUrl: './forgot-password-page.component.html',
  styleUrl: './forgot-password-page.component.css',
})
export class ForgotPasswordPageComponent {
  email: string = '';
  errorMessage: string = '';

  sendEmail(email: string) {
    if (this.validation()) {
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
