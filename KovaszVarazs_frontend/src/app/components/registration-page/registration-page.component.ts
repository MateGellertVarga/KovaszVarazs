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
  constructor(private authservice: AuthService, private router: Router) {}

  newUser: UserModel = {
    name: '',
    email: '',
    phone_number: '',
    password: '',
    role: 'user',
  };
  passwordAgain: string = '';
  errorMessage: string = '';
  showPassword: boolean = false;
  showPasswordAgain: boolean = false;

  register() {
    if (this.validation()) {
      this.authservice.register(this.newUser).subscribe({
        next: () => {
          this.router.navigate(['/login']);
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
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/~`\\|-])[A-Za-z\d!@#$%^&*()_+={}\[\]:;"'<>,.?/~`\\|-]{8,}$/;

    if (!this.newUser!.name.trim()) {
      this.errorMessage += 'Név kötelező!\n';
    }
    if (!this.newUser!.email.trim()) {
      this.errorMessage += 'Email cím kötelező!\n';
    }
    if (!emailRegex.test(this.newUser!.email)) {
      this.errorMessage += 'Email cím formátuma nem megfelelő!\n';
    }
    if (!this.newUser!.phone_number.trim()) {
      this.errorMessage += 'Telefonszám kötelező!\n';
    } else if (!phoneRegex.test(this.newUser!.phone_number)) {
      this.errorMessage += 'Telefonszám formátuma nem megfelelő!\n';
    }
    if (!this.newUser!.password!.trim()) {
      this.errorMessage += 'Jelszó kötelező!\n';
    } else if (this.newUser.password!.length < 8) {
      this.errorMessage +=
        'Jelszónak legalább 8 karakter hosszúnak kell lennie!\n';
    } else if (!passwordRegex.test(this.newUser!.password!)) {
      this.errorMessage +=
        'Jelszónak tartalmaznia kell legalább egy kisbetűt, egy nagybetűt, egy számot és egy speciális karaktert!\n';
    }
    if (!this.passwordAgain.trim()) {
      this.errorMessage += 'Jelszó újra kötelező!\n';
    }
    if (this.newUser!.password !== this.passwordAgain) {
      this.errorMessage += 'Jelszó nem egyezik!\n';
    }

    return !this.errorMessage;
  }
}
