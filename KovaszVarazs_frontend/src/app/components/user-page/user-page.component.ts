import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { UserModel } from '../../../models/userModel';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-page',
  imports: [NavbarComponent, FormsModule],
  templateUrl: './user-page.component.html',
  styleUrl: './user-page.component.css',
})
export class UserPageComponent implements OnInit {
  constructor(public authservice: AuthService, private router: Router) {}

  user: UserModel | null = null;
  passwordAgain: string = '';
  errorMessage: string = '';
  showPassword: boolean = false;
  showPasswordAgain: boolean = false;

  ngOnInit() {
    this.user = { ...this.authservice.loggedInUser } as UserModel;
    this.user.password = '';
    this.passwordAgain = '';
  }

  save() {
    if (this.validation()) {
      const hasPwd =
        !!this.user!.password?.trim() || !!this.passwordAgain.trim();
      const payload: any = { ...this.user };
      if (!hasPwd) delete payload.password;
      this.authservice.updateUserData(payload).subscribe({
        next: () => this.router.navigate(['/home']),
        error: (error: any) => {
          this.errorMessage = error?.error?.message ?? 'Hiba történt.';
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

    if (!this.user!.name.trim()) {
      this.errorMessage += 'Név kötelező!\n';
    } else if (this.user!.name.trim().length < 3) {
      this.errorMessage += 'Név túl rövid!\n';
    }
    if (!this.user!.email.trim()) {
      this.errorMessage += 'Email cím kötelező!\n';
    } else if (!emailRegex.test(this.user!.email)) {
      this.errorMessage += 'Email cím formátuma nem megfelelő!\n';
    }
    if (!this.user!.phone_number.trim()) {
      this.errorMessage += 'Telefonszám kötelező!\n';
    } else if (!phoneRegex.test(this.user!.phone_number)) {
      this.errorMessage += 'Telefonszám formátuma nem megfelelő!\n';
    }
    if (!!this.user!.password?.trim() || !!this.passwordAgain.trim()) {
      if (!this.user!.password!.trim()) {
        this.errorMessage += 'Jelszó kötelező!\n';
      } else if (this.user!.password!.length < 8) {
        this.errorMessage +=
          'Jelszónak legalább 8 karakter hosszúnak kell lennie!\n';
      } else if (!passwordRegex.test(this.user!.password!)) {
        this.errorMessage +=
          'Jelszónak tartalmaznia kell legalább egy kisbetűt, egy nagybetűt, egy számot és egy speciális karaktert!\n';
      }
      if (!this.passwordAgain.trim()) {
        this.errorMessage += 'Jelszó újra kötelező!\n';
      }
      if (this.user!.password !== this.passwordAgain) {
        this.errorMessage += 'Jelszó nem egyezik!\n';
      }
    }

    return !this.errorMessage;
  }
}
