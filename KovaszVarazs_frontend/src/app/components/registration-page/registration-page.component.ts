import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { UserModel } from '../../../models/userModel';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registration-page',
  imports: [NavbarComponent, FormsModule, RouterLink],
  templateUrl: './registration-page.component.html',
  styleUrl: './registration-page.component.css',
})
export class RegistrationPageComponent {
  constructor(
    private authservice: AuthService,
    private router: Router,
  ) {}

  newUser: UserModel = {
    name: '',
    email: '',
    phone_number: '',
    password: '',
    role: 'user',
    is_active: true,
  };

  lastName: string = '';
  firstName: string = '';
  passwordAgain: string = '';
  errorMessage: string = '';
  showPassword: boolean = false;
  showPasswordAgain: boolean = false;
  isRegisteredSuccessfully = false;
  successMessage = '';

  register() {
    if (this.validation()) {
      this.authservice.register(this.newUser).subscribe({
        next: (res: any) => {
          this.isRegisteredSuccessfully = true;
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
    const phoneRegex =
      /^\+?\d{1,3}?[-.\s]?\(?\d{1,4}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
    const passwordRegex = /\d/;

    if (!this.lastName.trim() || !this.firstName.trim()) {
      this.errorMessage += 'Vezetéknév és keresztnév megadása is kötelező!\n';
    } else {
      this.newUser.name = `${this.lastName.trim()} ${this.firstName.trim()}`;

      if (this.newUser.name.length < 5) {
        this.errorMessage += 'A megadott név túl rövid!\n';
      }
    }

    if (!this.newUser!.email.trim()) {
      this.errorMessage += 'Email cím kötelező!\n';
    } else if (!emailRegex.test(this.newUser!.email)) {
      this.errorMessage += 'Email cím formátuma nem megfelelő!\n';
    }

    if (!this.newUser!.phone_number.trim()) {
      this.errorMessage += 'Telefonszám kötelező!\n';
    } else if (!phoneRegex.test(this.newUser!.phone_number)) {
      this.errorMessage += 'Telefonszám formátuma nem megfelelő!\n';
    }

    if (!this.newUser!.password!.trim()) {
      this.errorMessage += 'Jelszó kötelező!\n';
    } else if (this.newUser.password!.length < 6) {
      this.errorMessage +=
        'Jelszónak legalább 6 karakter hosszúnak kell lennie!\n';
    } else if (!passwordRegex.test(this.newUser!.password!)) {
      this.errorMessage += 'Jelszónak tartalmaznia kell legalább egy számot!\n';
    }

    if (!this.passwordAgain.trim()) {
      this.errorMessage += 'Jelszó újra kötelező!\n';
    } else if (this.newUser!.password !== this.passwordAgain) {
      this.errorMessage += 'Jelszó nem egyezik!\n';
    }

    return !this.errorMessage;
  }
}
