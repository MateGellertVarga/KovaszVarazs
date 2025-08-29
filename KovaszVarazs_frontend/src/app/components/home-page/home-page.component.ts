import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-page',
  imports: [NavbarComponent, RouterLink],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent {}
