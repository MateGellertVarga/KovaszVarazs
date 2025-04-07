import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from 'src/app/services/data.service';
import { ModalNavbarService } from 'src/app/services/modal-navbar.service';
import { ProductModel } from 'src/models/productModel';

@Component({
  selector: 'app-product-modal',
  templateUrl: './product-modal.component.html',
  imports: [FormsModule],
})
export class ProductModalComponent implements OnInit {
  @Input() product: ProductModel | null = null;
  @Output() canceled = new EventEmitter<void>();
  @Output() saved = new EventEmitter<ProductModel>();

  constructor(
    private dataService: DataService,
    private modalnavbarService: ModalNavbarService
  ) {}

  scrollY: number = 0;
  viewportHeight: number = 0;
  errorMessage: string = '';

  ngOnInit() {
    this.viewportHeight = window.innerHeight;
    this.scrollY = window.scrollY || window.pageYOffset;
  }

  cancel() {
    this.modalnavbarService.setEditingProduct(false);
    this.canceled.emit();
  }

  save() {
    if (this.product && this.checkRequiredFields()) {
      // this.dataService.addProduct(this.product).subscribe({
      //   next: (product: ProductModel) => {
      //     this.saved.emit(product);
      //   },
      //   error: (error:any) => {
      //     this.errorMessage = error.error?.message ?? error.message;
      //   },
      // });
      this.modalnavbarService.setEditingProduct(false);
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
      this.errorMessage += 'Egységár nagyobb 0!\n';
    }
    if (!this.product?.image_url) {
      this.errorMessage += 'Kép kötelező!';
    }
    return !this.errorMessage;
  }
}
