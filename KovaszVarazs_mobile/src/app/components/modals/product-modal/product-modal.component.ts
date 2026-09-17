import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from 'src/app/services/data.service';
import { ModalNavbarService } from 'src/app/services/modal-navbar.service';
import { ProductModel } from 'src/models/productModel';
import { RecipeModel } from 'src/models/recipeModel';

@Component({
  selector: 'app-product-modal',
  templateUrl: './product-modal.component.html',
  imports: [FormsModule],
})
export class ProductModalComponent implements OnInit {
  @Input() product: ProductModel | null = null;
  @Output() canceled = new EventEmitter<void>();
  @Output() saved = new EventEmitter<ProductModel>();

  recipes: RecipeModel[] = [];
  scrollY: number = 0;
  viewportHeight: number = 0;
  selectedFile: File | null = null;
  errorMessage: string = '';

  constructor(
    private dataService: DataService,
    private modalnavbarService: ModalNavbarService
  ) {}

  ngOnInit() {
    this.viewportHeight = window.innerHeight;
    this.scrollY = window.scrollY || window.pageYOffset;
    this.initProductFormValues();
    this.dataService.getRecipes().subscribe({
      next: (data) => {
        this.recipes = data;
      },
      error: (err) => {
        console.error('Hiba a receptek betöltésekor:', err);
      },
    });
  }

  private initProductFormValues() {
    if (
      this.product &&
      this.product.recipes &&
      this.product.recipes.length > 0
    ) {
      const firstRecipe = this.product.recipes[0];
      this.product.recipe_id = firstRecipe.id;
      this.product.dough_weight = firstRecipe.pivot.quantity;
    }
  }

  scrollIntoView(event: FocusEvent) {
    const target = event.target as HTMLElement;
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }

  cancel() {
    this.modalnavbarService.closeModal();
    this.canceled.emit();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  save() {
    if (this.product && this.checkRequiredFields()) {
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

      const saveObservable =
        this.product.id !== 0
          ? this.dataService.updateProduct(this.product.id, formData)
          : this.dataService.addProduct(formData);

      saveObservable.subscribe({
        next: (product: ProductModel) => {
          this.saved.emit(product);
          this.modalnavbarService.closeModal();
        },
        error: (error: any) => {
          this.errorMessage = error.error?.message ?? error.message;
        },
      });
    }
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
    return !this.errorMessage;
  }
}
