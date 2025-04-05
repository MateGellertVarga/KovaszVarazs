import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { UserModel } from 'src/models/userModel';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
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
export class Login implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  email: string = 'admin@admin.com';
  password: string = 'admin';
  errorMessage: string = '';

  ngOnInit() {}

  login(email: string, password: string) {
    this.errorMessage = '';
    if (!email || !password) {
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
      error: (error) => {
        this.errorMessage = error.error.message;
      },
    });
  }
}
