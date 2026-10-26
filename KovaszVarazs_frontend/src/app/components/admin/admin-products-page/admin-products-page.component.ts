import { Component, OnInit } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeHu from '@angular/common/locales/hu';
import { NavbarComponent } from '../../navbar/navbar.component';
import { AdminPageHeaderComponent } from '../admin-page-header/admin-page-header.component';
import { AdminProductModalComponent } from '../admin-product-modal/admin-product-modal.component';
import { DataService } from '../../../services/data.service';
import { ConfirmService } from '../../../services/confirm.service';
import {
  PRODUCT_CATEGORIES,
  ProductModel,
} from '../../../../models/productModel';

@Component({
  selector: 'app-admin-products-page',
  imports: [
    NavbarComponent,
    CommonModule,
    AdminPageHeaderComponent,
    AdminProductModalComponent,
  ],
  templateUrl: './admin-products-page.component.html',
})
export class AdminProductsPageComponent implements OnInit {
  constructor(
    private dataService: DataService,
    private confirmService: ConfirmService,
  ) {
    registerLocaleData(localeHu);
  }

  isLoading: boolean = true;
  products: ProductModel[] = [];
  editingProduct: ProductModel | null = null;

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading = true;
    this.dataService.getProducts().subscribe({
      next: (result: ProductModel[]) => {
        this.products = result;
        this.sortProducts();
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  // Aktívak elöl, azon belül kategória, majd név szerint.
  sortProducts() {
    const categoryIndex = (category: string) => {
      const index = PRODUCT_CATEGORIES.indexOf(category);
      return index === -1 ? 99 : index;
    };
    this.products.sort((a, b) => {
      if (a.is_used !== b.is_used) {
        return a.is_used ? -1 : 1;
      }
      const categoryDiff = categoryIndex(a.category) - categoryIndex(b.category);
      if (categoryDiff !== 0) return categoryDiff;
      return a.name.localeCompare(b.name);
    });
  }

  newProduct() {
    this.editingProduct = {
      id: 0,
      name: '',
      price: 0,
      image_url: '',
      category: '',
      is_used: true,
      allergens: '',
      description: '',
    };
  }

  modifyProduct(product: ProductModel) {
    this.editingProduct = { ...product };
  }

  saveProduct(product: ProductModel) {
    const index = this.products.findIndex((p) => p.id === product.id);
    if (index !== -1) {
      this.products[index] = product;
    } else {
      this.products.push(product);
    }
    this.sortProducts();
    this.editingProduct = null;
  }

  async deleteProduct(product: ProductModel) {
    const confirmed = await this.confirmService.ask({
      title: 'Törlés',
      message: 'Biztosan törölni szeretnéd a terméket?',
      confirmLabel: 'Törlés',
    });
    if (!confirmed) return;

    this.dataService.deleteProduct(product.id).subscribe({
      next: () => {
        this.products = this.products.filter((p) => p.id !== product.id);
      },
      error: (err) => {
        console.error('Hiba a termék törlésekor:', err);
      },
    });
  }
}
