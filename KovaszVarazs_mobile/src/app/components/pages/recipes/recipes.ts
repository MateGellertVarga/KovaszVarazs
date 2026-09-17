import { ChangeDetectorRef, Component } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { RecipeModel } from 'src/models/recipeModel';
import { ProductModel } from 'src/models/productModel';
import { ModalNavbarService } from 'src/app/services/modal-navbar.service';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonButton,
  IonIcon,
  IonContent,
  IonList,
  IonItem,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonMenuButton,
  AlertController,
} from '@ionic/angular/standalone';
import { RecipeModalComponent } from '../../modals/recipe-modal/recipe-modal.component';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.html',
  imports: [
    IonCardContent,
    IonCardSubtitle,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonItem,
    IonList,
    IonContent,
    IonIcon,
    IonButton,
    IonTitle,
    IonButtons,
    IonToolbar,
    IonHeader,
    RecipeModalComponent,
    IonMenuButton,
  ],
})
export class Recipes {
  recipes: RecipeModel[] = [];
  products: ProductModel[] = [];
  editingRecipe: RecipeModel | null = null;
  isProcessing: boolean = false;

  constructor(
    private dataService: DataService,
    private modalNavbarService: ModalNavbarService,
    private changeDetectorRef: ChangeDetectorRef,
    private alertController: AlertController
  ) {}

  ionViewWillEnter() {
    this.dataService
      .getRecipes()
      .subscribe(
        (data) =>
          (this.recipes = data.sort((a, b) => a.name.localeCompare(b.name)))
      );
    this.dataService
      .getProducts()
      .subscribe(
        (data) =>
          (this.products = data.sort((a, b) => a.name.localeCompare(b.name)))
      );
  }

  newRecipe() {
    this.editingRecipe = {
      id: 0,
      name: '',
      total_dough_amount: 0,
      ingredients: [],
      products: [],
    };
    this.modalNavbarService.openModal();
  }

  modifyRecipe(recipe: RecipeModel) {
    this.editingRecipe = JSON.parse(JSON.stringify(recipe));
    this.modalNavbarService.openModal();
  }

  saveRecipe(recipe: RecipeModel) {
    if (this.isProcessing) return;
    this.isProcessing = true;
    if (this.editingRecipe) {
      const index = this.recipes.findIndex(
        (r) => r.id === this.editingRecipe!.id
      );
      if (index !== -1) {
        this.recipes[index] = recipe;
      } else {
        this.recipes.push(recipe);
      }
      this.editingRecipe = null;
      this.modalNavbarService.closeModal();
    }
    this.isProcessing = false;
  }

  async deleteRecipe(recipe: RecipeModel) {
    const alert = await this.alertController.create({
      header: 'Törlés',
      message: 'Biztosan törölni szeretnéd a receptet?',
      buttons: [
        {
          text: 'Mégse',
          role: 'cancel',
        },
        {
          text: 'Törlés',
          role: 'confirm',
        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    if (role === 'confirm') {
      this.dataService.deleteRecipe(recipe.id).subscribe({
        next: () => {
          const index = this.recipes.findIndex((r) => r.id === recipe.id);
          if (index !== -1) {
            this.recipes.splice(index, 1);
            this.changeDetectorRef.detectChanges();
          }
        },
        error: (err) => {
          console.error('Törlés sikertelen:', err);
        },
      });
    }
  }
}
