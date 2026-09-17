import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalNavbarService } from 'src/app/services/modal-navbar.service';
import { ProductModel } from 'src/models/productModel';
import { RecipeModel } from 'src/models/recipeModel';
import { IonIcon } from '@ionic/angular/standalone';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-recipe-modal',
  templateUrl: './recipe-modal.component.html',
  imports: [IonIcon, FormsModule],
})
export class RecipeModalComponent implements OnInit {
  @Input() recipe!: RecipeModel;
  @Input() products: ProductModel[] = [];
  @Output() canceled = new EventEmitter<void>();
  @Output() saved = new EventEmitter<RecipeModel>();

  isLoading: boolean = false;
  scrollY: number = 0;
  viewportHeight: number = 0;
  errorMessage: string = '';

  constructor(
    private modalnavbarService: ModalNavbarService,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.viewportHeight = window.innerHeight;
    this.scrollY = window.scrollY || window.pageYOffset;
    console.log(this.recipe);
  }

  addIngredient() {
    this.recipe.ingredients.push({ name: '', amount: 0 });
  }
  removeIngredient(index: number) {
    this.recipe.ingredients.splice(index, 1);
  }

  calculateTotal(): number {
    this.recipe.total_dough_amount = this.recipe.ingredients.reduce(
      (sum, ing) => sum + Number(ing.amount || 0),
      0
    );
    return this.recipe.total_dough_amount;
  }

  addProductLink() {
    this.recipe.products.push({
      product_id: null as any,
      quantity: null as any,
    });
  }
  removeProductLink(index: number) {
    this.recipe.products.splice(index, 1);
  }

  save() {
    this.errorMessage = '';
    if (this.checkRequiredFields()) {
      this.isLoading = true;
      const saveObservable =
        this.recipe.id === 0
          ? this.dataService.addRecipe(this.recipe)
          : this.dataService.updateRecipe(this.recipe.id, this.recipe);
      saveObservable.subscribe({
        next: (recipe: RecipeModel) => {
          this.isLoading = false;
          this.saved.emit(recipe);
          this.modalnavbarService.closeModal();
        },
        error: (err: any) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message ?? err.message;
          console.error('Hiba történt a mentés során:', err);
        },
      });
    }
  }

  cancel() {
    this.canceled.emit();
    this.modalnavbarService.closeModal();
  }

  checkRequiredFields(): boolean {
    if (!this.recipe.name || this.recipe.name.trim() === '') {
      this.errorMessage = 'A recept neve kötelező.';
      return false;
    }
    if (this.recipe.ingredients.length === 0) {
      this.errorMessage = 'Legalább egy hozzávalót meg kell adni.';
      return false;
    }
    for (const ing of this.recipe.ingredients) {
      if (!ing.name || ing.name.trim() === '') {
        this.errorMessage = 'A hozzávaló neve kötelező.';
        return false;
      }
      if (ing.amount === undefined || ing.amount <= 0) {
        this.errorMessage =
          'A hozzávaló mennyisége kötelező és pozitív kell legyen.';
        return false;
      }
    }
    if (this.recipe.products.length === 0) {
      this.errorMessage = 'Legalább egy terméket meg kell adni.';
      return false;
    }
    for (const prod of this.recipe.products) {
      if (!prod.product_id || prod.product_id === 0) {
        this.errorMessage = 'A termék kiválasztása kötelező.';
        return false;
      }
      if (prod.quantity === undefined || prod.quantity <= 0) {
        this.errorMessage =
          'A termék mennyisége kötelező és pozitív kell legyen.';
        return false;
      }
    }
    return true;
  }
}
