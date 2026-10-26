import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../navbar/navbar.component';
import { AdminPageHeaderComponent } from '../admin-page-header/admin-page-header.component';
import { AdminRecipeModalComponent } from '../admin-recipe-modal/admin-recipe-modal.component';
import { DataService } from '../../../services/data.service';
import { ConfirmService } from '../../../services/confirm.service';
import { RecipeModel } from '../../../../models/recipeModel';
import { ProductModel } from '../../../../models/productModel';

@Component({
  selector: 'app-admin-recipes-page',
  imports: [
    NavbarComponent,
    AdminPageHeaderComponent,
    AdminRecipeModalComponent,
  ],
  templateUrl: './admin-recipes-page.component.html',
})
export class AdminRecipesPageComponent implements OnInit {
  constructor(
    private dataService: DataService,
    private confirmService: ConfirmService,
  ) {}

  isLoading: boolean = true;
  recipes: RecipeModel[] = [];
  products: ProductModel[] = [];
  editingRecipe: RecipeModel | null = null;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.dataService.getRecipes().subscribe({
      next: (data) => {
        this.recipes = data;
        this.sortRecipes();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Hiba a receptek betöltésekor:', err);
        this.isLoading = false;
      },
    });
    this.dataService.getProducts().subscribe({
      next: (data) => {
        this.products = data.sort((a, b) => a.name.localeCompare(b.name));
      },
      error: (err) => console.error('Hiba a termékek betöltésekor:', err),
    });
  }

  private sortRecipes() {
    this.recipes.sort((a, b) => a.name.localeCompare(b.name));
  }

  newRecipe() {
    this.editingRecipe = {
      id: 0,
      name: '',
      total_dough_amount: 0,
      ingredients: [],
      products: [],
    };
  }

  modifyRecipe(recipe: RecipeModel) {
    this.editingRecipe = JSON.parse(JSON.stringify(recipe));
  }

  saveRecipe(recipe: RecipeModel) {
    recipe.ingredients = recipe.ingredients ?? [];
    recipe.products = recipe.products ?? [];
    recipe.products.forEach((link) => {
      link.product_name ??= this.products.find(
        (p) => p.id === link.product_id,
      )?.name;
    });

    const index = this.recipes.findIndex((r) => r.id === recipe.id);
    if (index !== -1) {
      this.recipes[index] = recipe;
    } else {
      this.recipes.push(recipe);
    }
    this.sortRecipes();
    this.editingRecipe = null;
  }

  async deleteRecipe(recipe: RecipeModel) {
    const confirmed = await this.confirmService.ask({
      title: 'Törlés',
      message: 'Biztosan törölni szeretnéd a receptet?',
      confirmLabel: 'Törlés',
    });
    if (!confirmed) return;

    this.dataService.deleteRecipe(recipe.id).subscribe({
      next: () => {
        this.recipes = this.recipes.filter((r) => r.id !== recipe.id);
      },
      error: (err) => {
        console.error('Törlés sikertelen:', err);
      },
    });
  }
}
