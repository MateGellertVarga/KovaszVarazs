import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { CostModel } from '../../../../models/statisticsModel';
import { AdminModalComponent } from '../admin-modal/admin-modal.component';

@Component({
  selector: 'app-admin-cost-modal',
  imports: [FormsModule, AdminModalComponent],
  templateUrl: './admin-cost-modal.component.html',
})
export class AdminCostModalComponent {
  @Input() cost: CostModel | null = null;
  @Input({ required: true }) month!: Date;
  @Output() canceled = new EventEmitter<void>();
  @Output() saved = new EventEmitter<CostModel>();

  constructor(private dataService: DataService) {}

  isSaving: boolean = false;
  errorMessage: string = '';

  save() {
    if (!this.cost || !this.checkRequiredFields()) return;
    this.cost.month = this.formatMonthToDateString(this.month);

    this.isSaving = true;
    const saveObservable =
      this.cost.id != 0
        ? this.dataService.updateCost(this.cost.id, this.cost)
        : this.dataService.addCost(this.cost);
    saveObservable.subscribe({
      next: (cost: CostModel) => {
        this.isSaving = false;
        this.saved.emit(cost);
      },
      error: (error: any) => {
        this.isSaving = false;
        this.errorMessage = error.error?.message ?? error.message;
      },
    });
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
    this.errorMessage = this.errorMessage.trim();
    return !this.errorMessage;
  }

  formatMonthToDateString(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}-01`;
  }
}
