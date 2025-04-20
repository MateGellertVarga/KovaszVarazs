import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from 'src/app/services/data.service';
import { ModalNavbarService } from 'src/app/services/modal-navbar.service';
import { CostModel } from 'src/models/statisticsModel';

@Component({
  selector: 'app-cost-modal',
  templateUrl: './cost-modal.component.html',
  imports: [FormsModule],
})
export class CostModalComponent implements OnInit {
  @Input() cost: CostModel | null = null;
  @Input() month!: Date;
  @Output() canceled = new EventEmitter<void>();
  @Output() saved = new EventEmitter<CostModel>();

  constructor(
    private dataService: DataService,
    private modalnavbarService: ModalNavbarService
  ) {}

  scrollY: number = 0;
  viewportHeight: number = 0;
  errorMessage: string = '';

  ngOnInit() {
    this.scrollY = window.scrollY || window.pageYOffset;
    this.viewportHeight = window.innerHeight;
  }

  cancel() {
    this.modalnavbarService.closeModal();
    this.canceled.emit();
  }

  save() {
    if (this.cost && this.checkRequiredFields()) {
      this.cost.month = this.formatMonthToDateString(this.month);

      const saveObservable =
        this.cost.id != 0
          ? this.dataService.updateCost(this.cost.id, this.cost)
          : this.dataService.addCost(this.cost);
      saveObservable.subscribe({
        next: (cost: CostModel) => {
          this.saved.emit(cost);
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
    if (!this.cost?.name) {
      this.errorMessage = 'Név kötelező!\n';
    }
    if (!this.cost?.amount) {
      this.errorMessage += 'Összeg kötelező!\n';
    }
    if (this.cost?.amount && this.cost.amount <= 0) {
      this.errorMessage += 'Összeg nagyobb 0!';
    }
    return !this.errorMessage;
  }

  formatMonthToDateString(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}-01`;
  }
}
