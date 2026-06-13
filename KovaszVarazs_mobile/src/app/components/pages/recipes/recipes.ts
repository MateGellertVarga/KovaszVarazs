import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonMenuButton,
  IonTitle,
  IonIcon,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.html',
  imports: [
    IonIcon,
    IonTitle,
    IonHeader,
    IonToolbar,
    IonButton,
    IonButtons,
    IonMenuButton,
  ],
})
export class Recipes {
  constructor() {}

  editingRecipe: any = null;

  newRecipe() {
    this.editingRecipe = {
      name: '',
    };
  }

  editRecipe(recipe: any) {
    this.editingRecipe = recipe;
  }
}
