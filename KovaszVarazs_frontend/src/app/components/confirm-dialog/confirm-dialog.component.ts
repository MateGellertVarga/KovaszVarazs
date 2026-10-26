import { Component, HostListener } from '@angular/core';
import { ConfirmService } from '../../services/confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  constructor(public confirmService: ConfirmService) {}

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.confirmService.request) this.confirmService.close(false);
  }
}
