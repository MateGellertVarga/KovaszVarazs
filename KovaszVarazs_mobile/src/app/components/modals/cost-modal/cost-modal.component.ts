import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from 'src/app/services/data.service';
import { ModalNavbarService } from 'src/app/services/modal-navbar.service';
import { CostModel } from 'src/models/statisticsModel';

@Component({
  selector: 'app-cost-modal',
  templateUrl: './cost-modal.component.html',
  styleUrls: ['./cost-modal.component.scss'],
  imports: [FormsModule],
})
export class CostModalComponent implements OnInit {
  @Input() cost: CostModel | null = null;
  @Output() canceled = new EventEmitter<void>();
  @Output() saved = new EventEmitter<CostModel>();

  constructor(
    private dataService: DataService,
    private modalnavbarService: ModalNavbarService
  ) {}

  errorMessage: string = '';

  ngOnInit() {}

  cancel() {
    this.modalnavbarService.setEditingCost(false);
    this.canceled.emit();
  }

  save() {
    if (this.cost && this.checkRequiredFields()) {
      // this.dataService.addCost(this.cost).subscribe({
      //   next: (cost: CostModel) => {
      //     this.saved.emit(cost);
      //   },
      //   error: (error:any) => {
      //     this.errorMessage = error.error?.message ?? error.message;
      //   },
      // });
      this.modalnavbarService.setEditingCost(false);
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
}
