import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserModel } from 'src/models/userModel';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.html',
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    RouterModule,
  ],
})
export class Registration {
  constructor(private authservice: AuthService, private router: Router) {}

  newUser: UserModel = {
    name: '',
    email: '',
    phone_number: '',
    password: '',
    role: 'admin',
  };
  passwordAgain: string = '';
  errorMessage: string = '';

  register() {
    if (this.validation()) {
      this.authservice.register(this.newUser).subscribe({
        next: () => {
          this.router.navigate(['/tabs/login']);
        },
        error: (error) => {
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
