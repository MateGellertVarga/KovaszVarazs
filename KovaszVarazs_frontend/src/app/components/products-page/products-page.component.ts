import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ProductModel } from '../../../models/productModel';
import { DataService } from '../../services/data.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-products-page',
  imports: [NavbarComponent, CommonModule],
  templateUrl: './products-page.component.html',
  styleUrl: './products-page.component.css',
})
export class ProductsPageComponent implements OnInit {
  constructor(private dataService: DataService) {}

  isLoading: boolean = true;
  products: ProductModel[] = [];
  editingProduct: ProductModel | null = null;
  categoryOrder = ['Kenyerek', 'Édes kalácsok', 'Sós kalácsok', 'Egyéb'];

  ngOnInit(): void {
    this.isLoading = true;
    this.dataService.getProducts().subscribe({
      next: (result: ProductModel[]) => {
        this.products = result;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.log(err);
        this.isLoading = false;
      },
    });
  }

  get groupedProducts() {
    const available = this.products.filter((p) => p.is_used);

    const sorted = [...available].sort((a, b) => {
      const idxA = this.categoryOrder.indexOf(a.category ?? '');
      const idxB = this.categoryOrder.indexOf(b.category ?? '');
      if (idxA !== idxB) return idxA - idxB;
      return a.name.localeCompare(b.name);
    });

    const groups: { [category: string]: ProductModel[] } = {};
    for (const cat of this.categoryOrder) groups[cat] = [];
    for (const prod of sorted) {
      const cat = this.categoryOrder.includes(prod.category)
        ? prod.category
        : 'Egyéb';
      groups[cat].push(prod);
    }
    return groups;
  }
}
