import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { ProductModel } from '../../../../models/productModel';
import { RecipeModel } from '../../../../models/recipeModel';
import { AdminModalComponent } from '../admin-modal/admin-modal.component';

@Component({
  selector: 'app-admin-recipe-modal',
  imports: [FormsModule, AdminModalComponent],
  templateUrl: './admin-recipe-modal.component.html',
})
export class AdminRecipeModalComponent {
  @Input({ required: true }) recipe!: RecipeModel;
  @Input() products: ProductModel[] = [];
  @Output() canceled = new EventEmitter<void>();
  @Output() saved = new EventEmitter<RecipeModel>();

  constructor(private dataService: DataService) {}

  isSaving: boolean = false;
  errorMessage: string = '';

  addIngredient() {
    this.recipe.ingredients.push({ name: '', amount: 0 });
  }

  removeIngredient(index: number) {
    this.recipe.ingredients.splice(index, 1);
  }

  getCalculatedTotal(): number {
    return this.recipe.ingredients.reduce(
      (sum, ing) => sum + Number(ing.amount || 0),
      0,
    );
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
    this.recipe.total_dough_amount = this.getCalculatedTotal();
    if (!this.checkRequiredFields()) return;

    this.isSaving = true;
    const saveObservable =
      this.recipe.id === 0
        ? this.dataService.addRecipe(this.recipe)
        : this.dataService.updateRecipe(this.recipe.id, this.recipe);
    saveObservable.subscribe({
      next: (recipe: RecipeModel) => {
        this.isSaving = false;
        this.saved.emit(recipe);
      },
      error: (err: any) => {
        this.isSaving = false;
        this.errorMessage = err.error?.message ?? err.message;
      },
    });
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
      if (ing.amount == null || ing.amount <= 0) {
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
      if (!prod.product_id) {
        this.errorMessage = 'A termék kiválasztása kötelező.';
        return false;
      }
      if (prod.quantity == null || prod.quantity <= 0) {
        this.errorMessage =
          'A termék mennyisége kötelező és pozitív kell legyen.';
        return false;
      }
    }
    return true;
  }
}
