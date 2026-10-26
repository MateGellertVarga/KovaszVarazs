import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import {
  PRODUCT_CATEGORIES,
  ProductModel,
} from '../../../../models/productModel';
import { RecipeModel } from '../../../../models/recipeModel';
import { AdminModalComponent } from '../admin-modal/admin-modal.component';

@Component({
  selector: 'app-admin-product-modal',
  imports: [FormsModule, AdminModalComponent],
  templateUrl: './admin-product-modal.component.html',
})
export class AdminProductModalComponent implements OnInit {
  @Input() product: ProductModel | null = null;
  @Output() canceled = new EventEmitter<void>();
  @Output() saved = new EventEmitter<ProductModel>();

  constructor(private dataService: DataService) {}

  categories = PRODUCT_CATEGORIES;
  recipes: RecipeModel[] = [];
  selectedFile: File | null = null;
  isSaving: boolean = false;
  errorMessage: string = '';

  ngOnInit() {
    this.initProductFormValues();
    this.dataService.getRecipes().subscribe({
      next: (data) => {
        this.recipes = data.sort((a, b) => a.name.localeCompare(b.name));
      },
      error: (err) => {
        console.error('Hiba a receptek betöltésekor:', err);
      },
    });
  }

  private initProductFormValues() {
    if (this.product?.recipes && this.product.recipes.length > 0) {
      const firstRecipe = this.product.recipes[0];
      this.product.recipe_id = firstRecipe.id;
      this.product.dough_weight = firstRecipe.pivot.quantity;
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.length ? input.files[0] : null;
  }

  save() {
    if (!this.product || !this.checkRequiredFields()) return;

    const formData = new FormData();
    formData.append('name', this.product.name);
    formData.append('price', this.product.price.toString());
    formData.append('category', this.product.category ?? '');
    formData.append('is_used', this.product.is_used ? '1' : '0');
    formData.append('allergens', this.product.allergens ?? '');
    formData.append('description', this.product.description ?? '');

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    let recipeSync: Array<{ recipe_id: number; quantity: number }> = [];
    if (this.product.recipe_id && this.product.dough_weight) {
      recipeSync = [
        {
          recipe_id: this.product.recipe_id,
          quantity: this.product.dough_weight,
        },
      ];
    }
    formData.append('recipes', JSON.stringify(recipeSync));

    if (this.product.id !== 0) {
      formData.append('_method', 'PUT');
    }

    this.isSaving = true;
    const saveObservable =
      this.product.id !== 0
        ? this.dataService.updateProduct(this.product.id, formData)
        : this.dataService.addProduct(formData);

    saveObservable.subscribe({
      next: (product: ProductModel) => {
        this.isSaving = false;
        this.saved.emit(product);
      },
      error: (error: any) => {
        this.isSaving = false;
        this.errorMessage = error.error?.message ?? error.message;
      },
    });
  }

  checkRequiredFields(): boolean {
    this.errorMessage = '';
    if (!this.product?.name) {
      this.errorMessage = 'Név kötelező!\n';
    }
    if (!this.product?.price) {
      this.errorMessage += 'Egységár kötelező!\n';
    }
    if (this.product && this.product.price <= 0) {
      this.errorMessage += 'Egységár nagyobb mint 0 kell legyen!\n';
    }
    this.errorMessage = this.errorMessage.trim();
    return !this.errorMessage;
  }
}
