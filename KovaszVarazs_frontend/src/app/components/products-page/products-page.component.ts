import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ProductModel } from '../../../models/productModel';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-products-page',
  imports: [],
  templateUrl: './products-page.component.html',
  styleUrl: './products-page.component.css',
})
export class ProductsPageComponent implements OnInit {
  constructor(private dataService: DataService) {}

  isLoading: boolean = true;
  products: ProductModel[] = [];
  editingProduct: ProductModel | null = null;

  ngOnInit(): void {
    this.isLoading = true;
    this.dataService.getProducts().subscribe({
      next: (result: ProductModel[]) => {
        this.products = result;
        this.isLoading = false;
        console.log(this.products);
      },
      error: (err: any) => {
        console.log(err);
        this.isLoading = false;
      },
    });
  }
}
